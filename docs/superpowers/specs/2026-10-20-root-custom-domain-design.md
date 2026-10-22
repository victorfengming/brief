# `colemak.cn` 根域部署设计

## 目标

让 `victorfengming/brief` 的 GitHub Pages 生产构建服务于
`https://colemak.cn/`，替代现有的 `https://brief.colemak.cn/`。

## 设计

- 保持 GitHub Pages 以根路径部署：`BASE_PATH=/` 不变。
- 在部署工作流中将 `SITE_URL` 设置为 `https://colemak.cn`。Astro 已从该
  环境变量生成 canonical URL 和 sitemap，不需要改动应用路由或组件。
- 更新构建契约测试，使其要求工作流使用根域名；构建产物继续验证根路径
  路由及由 `SITE_URL` 派生的 canonical URL。
- 不修改文章中的历史域名示例，不修改 DNS、GitHub Pages 的 Custom domain
  设置，也不触碰未跟踪的本地 `docs/` 文件。

## 验证

- 使用 `SITE_URL=https://colemak.cn BASE_PATH=/` 运行生产构建和测试。
- 运行 `npm run check` 进行 Astro 类型与内容检查。
- 运行 `git diff --check`，确认改动无空白错误。
