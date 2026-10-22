# GitHub Pages 草稿发布开关设计

## 目标

让 GitHub Pages 生产构建公开所有标记为 `draft: true` 的文章，同时保留
非生产环境默认不公开草稿的能力。

## 设计

- 新增 `PUBLISH_DRAFTS` 环境变量；仅当其值为 `true` 时，草稿视为可发布。
- 在博客详情静态路由、博客列表、首页文章列表和旧中文路由中使用同一个
  草稿可见性判断，确保每篇公开草稿既有页面也能在列表中出现。
- GitHub Pages 工作流固定设置 `PUBLISH_DRAFTS=true`，使 `main` 已合入的
  29 篇中文草稿进入生产产物和 sitemap。
- 未设置该变量的本地构建仍保持现有行为：只生成 `draft: false` 内容。

## 验证

- 添加覆盖默认隐藏与 `PUBLISH_DRAFTS=true` 公开草稿的构建测试。
- 使用生产环境变量运行构建和测试，确认草稿的静态 HTML 已生成。
- 运行 `npm run check` 与 `git diff --check`。
