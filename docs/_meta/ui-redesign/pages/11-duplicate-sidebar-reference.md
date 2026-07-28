# Image 11：重复侧边栏参考稿（不单独实施）

![Image 11 重复侧边栏参考图](../references/image-11.png)

> 状态：重复资产，不单独实施
> 对应提示词：P011
> 归并目标：全部实现要求并入 [Image 08：移动侧边栏与知识目录抽屉](08-mobile-sidebar.md)
> 内容真相来源：`image-08.png` 与 `image-11.png` 的文件哈希、参考图画面、`docs/_sidebar.md`、P008 规格文档
> 实现边界：本文不允许派生新的 DOM、CSS、JS、断点、组件或测试分支；它只负责记录重复资产并防止后续任务错位。

---

## 1. 资产结论

`docs/_meta/ui-redesign/references/image-11.png` 与 `docs/_meta/ui-redesign/references/image-08.png` 是同一张图。两者画面、尺寸和 SHA256 哈希一致：

```text
image-08.png SHA256 = 42217ED779ED8D8F32951B5FAECE54FE3DA669A5E208EBE0A5D933BF48E9BB24
image-11.png SHA256 = 42217ED779ED8D8F32951B5FAECE54FE3DA669A5E208EBE0A5D933BF48E9BB24
```

因此第 11 张不代表一个新的页面，也不代表工具首页。真正的工具首页参考图从 `image-12.png` 开始。第 11 张的存在只说明生成素材时出现了重复导出。

如果后续模型按“每张图都要做一个实现任务”机械执行，很容易造成两个问题：

1. 重复实现第二套移动侧边栏，导致样式、焦点、遮罩和 z-index 冲突。
2. 把第 12 张工具首页错认为第 11 张，造成工具页面提示词整体错位。

本文的任务就是阻止这两个问题。

---

## 2. Design Specification

### 2.1 Purpose Statement

这份文档服务于协作过程，而不是服务于运行时页面。它要明确告诉后续实现模型：第 11 张图已经由 P008 覆盖，不需要也不允许再次实现。

它的人文价值是维护秩序：当一个大型 UI 生成任务里出现重复资产时，最好的处理不是假装它是新需求，而是诚实标记，让实现队列保持清楚。

### 2.2 Aesthetic Direction

唯一方向：**Editorial / magazine，研究者数字书房里的任务校勘页**。

它延续首页设计系统，但不产生运行时视觉。这里的“设计”是任务设计：避免重复、避免冲突、避免错位。

### 2.3 Color Palette

如需渲染本文档本身，继承首页文档系统即可：

- 灰纸白 `#E9E5DC`
- 浅纸白 `#F2EEE5`
- 墨色正文 `#20211D`
- 次级文字 `#66685F`
- 旧金 `#C8A96B`
- 信号绿 `#24D18F`

但这些颜色不对应任何新增页面实现。

### 2.4 Typography

继承 UI 重设计规格文档的 Markdown 排版：

- 标题：中文衬线。
- 正文：中文无衬线。
- 哈希、路径、状态：等宽字体。

### 2.5 Layout Strategy

本文只作为元任务记录，不产出 UI 布局。所有布局策略继承 P008：

- 桌面固定侧边栏。
- 移动端知识目录抽屉。
- `_sidebar.md` 作为单一来源。
- 不创建第二套菜单数据。

---

## 3. 与 P008 的关系

P008 已完整覆盖以下内容：

- 顶部导航。
- 桌面侧边栏宽度、层级、当前项高亮。
- 移动端 `KNOWLEDGE INDEX` 抽屉。
- 抽屉搜索入口。
- 遮罩、滚动锁、焦点恢复。
- `Esc`、遮罩点击、关闭按钮、移动端链接导航关闭。
- 与终端和搜索浮层的 z-index 关系。
- `_sidebar.md` 单一来源。
- 9 大真实领域和 39 篇主线文档入口。

第 11 张不得新增以下内容：

- 新 CSS 文件。
- 新 JS 初始化逻辑。
- 新抽屉 DOM。
- 新移动断点。
- 新底部导航。
- 新菜单 JSON。
- 新测试清单。

如果后续实现模型发现 P008 不够详细，应直接补充 `08-mobile-sidebar.md`，不要在 P011 里开启第二套要求。

---

## 4. 处理规则

### 4.1 任务队列规则

执行队列应这样理解：

```text
P008：移动侧边栏与知识目录抽屉  → 可实施
P009：终端弹窗                  → 可实施
P010：404 页面                  → 可实施
P011：重复侧边栏参考稿          → 不单独实施
P012：工具首页                  → 可实施
```

P011 不消耗运行时实现名额，不产生代码变更。

### 4.2 交付清单规则

为了满足“一张图一份记录”，P011 必须保留为一个文档。但交付状态必须是：

```text
DUPLICATE / NO SEPARATE IMPLEMENTATION
```

不能把它标成“待实现”。

### 4.3 验收规则

P011 的验收不是截图，也不是浏览器回归。P011 的验收是证明：

1. `image-08.png` 与 `image-11.png` 确为同一张图。
2. P008 已覆盖该图的实现要求。
3. 没有因 P011 产生第二套侧边栏实现。
4. P012 之后的工具页面编号没有错位。

---

## 5. 验证方法

### 5.1 哈希验证

运行：

```powershell
Get-FileHash -LiteralPath `
  'docs/_meta/ui-redesign/references/image-08.png', `
  'docs/_meta/ui-redesign/references/image-11.png' `
  -Algorithm SHA256
```

预期：

```text
两者 SHA256 完全一致
```

### 5.2 视觉验证

人工查看两图：

- 都包含 `手机 390×844` 与 `桌面 1440×900`。
- 手机画面都是 `KNOWLEDGE INDEX` 抽屉。
- 桌面画面都是左侧目录 + `数据结构与算法` 正文。
- 当前项都是 `01.1.4 数据结构与算法`。
- 底部都是全站地图、工具、关于和更新时间。

### 5.3 代码差异验证

P011 不应造成运行时代码差异。若某次提交声称“实现 P011”，应检查：

```bash
git diff -- docs/index.html docs/assets/css/modern-theme.css docs/assets/css/studio-tokens.css docs/_sidebar.md
```

预期：

- 如果仅为了 P011 产生上述差异，应撤销或合并到 P008。
- P011 本身最多只修改本文档。

---

## 6. 可直接复制给实现模型的指令

请按以下规则处理 Image 11。

`docs/_meta/ui-redesign/references/image-11.png` 与 `docs/_meta/ui-redesign/references/image-08.png` 是完全相同的重复资产。第 11 张不对应新的页面，不对应新的侧边栏实现，也不对应工具首页。所有运行时实现要求已经归入 `docs/_meta/ui-redesign/pages/08-mobile-sidebar.md`。

你必须：

1. 不为 Image 11 新增任何 DOM、CSS、JS、组件、断点或测试分支。
2. 不创建第二套移动侧边栏。
3. 不创建第二份菜单数据。
4. 不修改 `docs/_sidebar.md`，除非是在执行 P008 时发现真实链接错误。
5. 不把 Image 12 的工具首页错配到 P011。
6. 如果需要实现侧边栏，请回到 P008 执行。
7. 如果需要验证 P011，只需确认 image-08 与 image-11 哈希一致，并确认没有重复实现。

验收口径：

```text
P011 = DUPLICATE / NO SEPARATE IMPLEMENTATION
```

完成 P011 时不需要浏览器截图。真正需要截图验收的是 P008 的侧边栏任务。
