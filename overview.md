# 项目 UI 重构概览

## 完成内容

- 参照 `DESIGN.md` 的 Notion 风格设计原则，对 Docsify 知识站点进行了整体视觉重构。
- 重写主站主题文件 `docs/assets/css/modern-theme.css`，覆盖全站导航、侧边栏、搜索、正文排版、代码块、表格、引用、封面页、TOC、分页、终端窗口、返回顶部与响应式表现。
- 重构 `docs/_coverpage.md`，改为深海军蓝 hero、紫色主 CTA、标签 chips、workspace mockup 和统计卡片组合。
- 新增 `docs/assets/css/tools-notion.css`，并批量接入 `docs/tools/*.html`，让独立工具页统一到同一套 Notion editorial 视觉系统。
- 微调 `docs/index.html`：恢复可缩放 viewport、更新 Docsify 站点名、搜索文案、目录标题、Mermaid 配色和页脚文字。
- 已启动本地静态预览服务：`http://localhost:8080/`，并额外打开了工具页：`http://localhost:8080/tools/index.html`。

## 关键设计决策

- 由旧版“科技蓝暗色霓虹感”切换为 `DESIGN.md` 指定的 Notion 式浅色 editorial 工作台。
- 保留深色只用于封面 hero 与命令行终端，强化层级，而不是全站铺满暗色。
- 主行动色统一为 Notion 紫；正文链接使用蓝色，避免 CTA 色和普通链接混用。
- 按钮采用 8px 圆角，卡片采用 12px 圆角，badge/chip 才使用 pill 圆角。
- 使用 pastel 色块作为功能卡片的视觉记忆点，减少泛 AI 蓝紫渐变感。
- 所有大规模修改以 CSS 覆盖和 Markdown/HTML 文案结构调整为主，保留现有 Docsify、终端、搜索、工具页功能。

## 后续建议

- 在浏览器里检查首页、正文长文档、工具页、移动端宽度下的实际观感。
- 如果要进一步“像素级”深化，可继续逐个工具页清理内联旧 CSS，而不是只通过共享 CSS 覆盖。
- Gitalk 样式目前仍保留原插件 CSS，可后续单独做评论区视觉统一。
