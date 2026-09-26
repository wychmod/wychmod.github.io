# Gitalk 评论代理部署指南

> 目的：让评论区恢复工作，同时**前端不再持有 `clientSecret`**。
> 背景：原 `docs/index.html` 把 Gitalk 的 `clientSecret` 明文写在前端，且仓库公开，必须轮换。

---

## 一、为什么"配个 proxy 就完事"是不成立的

初看 Gitalk 有 `proxy` 配置项，直觉上换掉它即可。但实测（`grep` 反查 `gitalk.min.js`）发现它**两处**都需要 `clientSecret`：

| 场景 | 请求 | 是否需 secret |
|---|---|---|
| 登录换 token | `POST github.com/login/oauth/access_token` | ✅ `client_secret` 在 body |
| **匿名读取评论** | `GET api.github.com/repos/:owner/:repo/issues` | ✅ `client_id` + `client_secret` 作为 **query 参数** |
| 已登录后读写 | `GET/POST api.github.com/...` | ❌ 改用用户 `Authorization: token xxx` |

关键在第二行：Gitalk 未登录时会自己拼 query 带上 secret。而 `proxy` 配置项**只管第一处**。所以：

- 只配 `proxy` → 换 token 走了代理，但读评论列表仍会直连 `api.github.com` 并需要 secret。
- 结论：必须**连 `api.github.com` 一起中转**。

因此本项目对 `docs/assets/js/gitalk.min.js` 做了一处最小 patch：

```diff
- baseURL:"https://api.github.com"
+ baseURL:window.GITALK_API_BASE||"https://api.github.com"
```

这样 `index.html` 里设置 `window.GITALK_API_BASE` 就能把所有 REST 请求指向代理。**未设置时行为与原来完全一致**（回落到官方地址），属于无侵入改动。

---

## 二、部署 Worker

代理源码：`docs/_meta/gitalk-proxy-worker.js`

```bash
# 1. 安装并登录
npm i -g wrangler
wrangler login

# 2. 写入密钥（绝不进代码库）
wrangler secret put GITHUB_CLIENT_ID       # 4a657aa4ae6c0f1862a1
wrangler secret put GITHUB_CLIENT_SECRET   # 换成你在 GitHub 重新生成的新 secret

# 3. 强烈建议：服务端 Token，把匿名读取额度从 60/小时 提升到 5000/小时
#    只读权限即可，用于读取 issue 与评论
wrangler secret put GITHUB_TOKEN

# 4. 可选：收紧来源白名单（默认已是 https://wychmod.github.io）
wrangler secret put ALLOWED_ORIGINS

# 5. 发布
wrangler deploy
```

发布后会得到形如 `https://gitalk-proxy.<你的子域>.workers.dev` 的地址。

### 本地调试

Worker 对 `http://localhost:*` 与 `http://127.0.0.1:*` 已自动放行 CORS，可直接配合本地预览使用：

```bash
cd docs && python -m http.server 3000
```

---

## 三、填回前端配置

编辑 `docs/index.html`，填写两处地址：

```js
var GITALK_PROXY = {
  apiBase:  'https://gitalk-proxy.<你的子域>.workers.dev/github',
  tokenUrl: 'https://gitalk-proxy.<你的子域>.workers.dev/github/login/oauth/access_token'
};
```

> **留空是安全的**：未填写时 `gitalkConfig` 为 `null`，`bootstrap.js` 会静默跳过评论渲染，不产生任何控制台报错，知识库主体功能不受影响。

---

## 四、GitHub OAuth App 设置

到 GitHub → Settings → Developer settings → OAuth Apps → 对应应用：

- **Authorization callback URL** 设为 `https://wychmod.github.io/`

原因：Gitalk 用 `redirect_uri: location.href`（回跳当前页），而站点是 hash 路由，所以回调地址填根域名即可。

同时请在该页面**重新生成 client secret**，并把新值写入 `wrangler secret put GITHUB_CLIENT_SECRET`。旧 secret `94793d5b...` 即使已从仓库删除，仍可能存在于 Git 历史中，**必须作废**。

---

## 五、验证清单

部署并填好地址后，逐项确认：

- [ ] 文章页底部出现评论区，且不再有 `401 https://api.github.com/user` 报错
- [ ] 未登录状态能看到历史评论列表（走 Worker 的匿名读取 + 服务端 Token）
- [ ] 点击登录能跳转 GitHub 授权，回跳后显示头像
- [ ] 登录后能成功发表评论
- [ ] DevTools → Network 中**看不到** `client_secret` 出现在任何请求里
- [ ] 填入具体页面的 Worker 请求返回 200

---

## 六、安全提醒（务必执行）

1. **轮换 secret**：`94793d5bac0c884a8798ea941f7c5bc9fb004720` 曾长期明文提交在公开仓库，视为已泄露，必须作废。
2. **勿用 `cors-anywhere` 公共代理**：Gitalk 默认值 `https://cors-anywhere.herokuapp.com/...` 是第三方公共服务，会把你的 secret 送给陌生人，且该服务早已限流停用。
3. **`.dev.vars` 与 `wrangler.toml` 本地文件**如包含密钥，须加入 `.gitignore`（本项目已忽略 `.workbuddy/`，`_meta` 下的 Worker 源码本身不含任何密钥，可安全入库）。
