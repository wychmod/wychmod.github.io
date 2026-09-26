/**
 * Gitalk 代理 — Cloudflare Worker
 * ---------------------------------------------------------
 * 作用: 让 Gitalk 在不把 clientSecret 写进前端的前提下正常工作。
 *
 * 为什么必须用代理(gitalk.min.js 有两处需要 secret):
 *   1) 换 token:  POST https://github.com/login/oauth/access_token
 *      把 code + client_id + client_secret 发给 GitHub 换取用户 access_token。
 *   2) 匿名读取:  GET  https://api.github.com/repos/:owner/:repo/issues...
 *      未登录时(未带 Authorization 头)把 client_id / client_secret 作为
 *      **query 参数**发送, 用于读取 issue 与评论列表。
 *   -> 因此只配 gitalk 自带的 `proxy` 只能解决第 1 处; 第 2 处必须连
 *      api.github.com 一起中转。本项目已 patch gitalk.min.js, 使其
 *      axiosGithub 的 baseURL 读取 window.GITALK_API_BASE, 由本 Worker
 *      统一承担两类请求。
 *
 * 本 Worker 的两条关键处理:
 *   - 换 token 时注入 env 里的 secret(前端永不接触);
 *   - 透传 REST 时**剥离** query 里的 client_id/client_secret, 改为注入
 *     Authorization 头(优先沿用登录用户的 token, 否则用服务端 Token 提额度)。
 *
 * 部署步骤:
 *   1. 安装并登录 wrangler:  npm i -g wrangler && wrangler login
 *   2. 写入密钥(切勿写进代码或提交到仓库):
 *        wrangler secret put GITHUB_CLIENT_ID
 *        wrangler secret put GITHUB_CLIENT_SECRET
 *   3. 建议同时配置服务端 Token, 把匿名读取额度从 60/小时 提到 5000/小时:
 *        wrangler secret put GITHUB_TOKEN     # Personal Access Token, 只读 public_repo 即可
 *   4. 可选, 收紧来源白名单(逗号分隔):
 *        wrangler secret put ALLOWED_ORIGINS  # 默认 https://wychmod.github.io
 *   5. 发布:  wrangler deploy
 *   6. 把 Worker 域名填回 docs/index.html 的 GITALK_PROXY.apiBase / tokenUrl
 *   7. GitHub OAuth App 的 Authorization callback URL 设为 https://wychmod.github.io/
 *      (Gitalk 使用 redirect_uri: location.href, 即当前页面地址)
 */

const GITHUB_API = 'https://api.github.com';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';

/* 这些 query 参数不得下发到 GitHub —— 前端不再持有凭据 */
const STRIP_PARAMS = ['client_id', 'client_secret', 'access_token'];

function resolveAllowOrigin(request, env) {
  const origin = request.headers.get('Origin') || '';
  const configured = (env.ALLOWED_ORIGINS || 'https://wychmod.github.io')
    .split(',')
    .map(function (s) { return s.trim(); })
    .filter(Boolean);
  const isLocal = /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(origin);
  if (isLocal) return origin;
  return configured.indexOf(origin) !== -1 ? origin : configured[0];
}

function baseHeaders(request, env) {
  return {
    'Access-Control-Allow-Origin': resolveAllowOrigin(request, env),
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, X-Requested-With, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(body, status, extra) {
  return new Response(JSON.stringify(body), {
    status: status,
    headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8' }, extra || {})
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = baseHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
      return json({
        error: 'proxy_not_configured',
        message: '请先设置 GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET (wrangler secret put)'
      }, 500, cors);
    }

    /* ---- 1. 换 token: 注入 secret, 前端只提交 code ---- */
    if (url.pathname === '/github/login/oauth/access_token') {
      if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405, cors);

      let code = '';
      try {
        const ct = request.headers.get('Content-Type') || '';
        if (ct.indexOf('application/json') !== -1) {
          code = (await request.json()).code || '';
        } else {
          code = new URLSearchParams(await request.text()).get('code') || '';
        }
      } catch (e) {
        return json({ error: 'bad_request', message: '无法解析 code' }, 400, cors);
      }
      if (!code) return json({ error: 'bad_request', message: '缺少 code' }, 400, cors);

      const upstream = await fetch(GITHUB_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          code: code,
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET   // ← 密钥仅存在于 Worker
        })
      });
      const data = await upstream.json();
      return json(data, upstream.status, cors);
    }

    /* ---- 2. 透传 REST: 剥离密钥参数, 按需注入 Authorization ---- */
    if (url.pathname.indexOf('/github/') === 0) {
      const subPath = url.pathname.slice('/github'.length);

      // 剥离前端可能带来的凭据参数
      const cleanQuery = new URLSearchParams(url.search || '');
      STRIP_PARAMS.forEach(function (k) { cleanQuery.delete(k); });
      const qs = cleanQuery.toString();
      const target = GITHUB_API + subPath + (qs ? '?' + qs : '');

      const headers = new Headers();
      headers.set('Accept', 'application/json');
      headers.set('User-Agent', 'wychmod-gitalk-proxy');
      headers.set('X-GitHub-Api-Version', '2022-11-28');

      // 优先沿用登录用户自己的 token(发评论/点赞等写操作必需);
      // 匿名读取时退回服务端 Token 以获得更高额度。
      const incomingAuth = request.headers.get('Authorization');
      if (incomingAuth) {
        headers.set('Authorization', incomingAuth);
      } else if (env.GITHUB_TOKEN) {
        headers.set('Authorization', 'Bearer ' + env.GITHUB_TOKEN);
      }

      const init = { method: request.method, headers: headers };
      if (request.method !== 'GET' && request.method !== 'HEAD') {
        init.body = await request.text();
        headers.set('Content-Type', request.headers.get('Content-Type') || 'application/json');
      }

      let upstream;
      try {
        upstream = await fetch(target, init);
      } catch (e) {
        return json({ error: 'upstream_failed', message: String(e) }, 502, cors);
      }

      const out = new Headers(cors);
      out.set('Content-Type', upstream.headers.get('Content-Type') || 'application/json; charset=utf-8');
      return new Response(await upstream.text(), { status: upstream.status, headers: out });
    }

    return json({ error: 'not_found', path: url.pathname }, 404, cors);
  }
};
