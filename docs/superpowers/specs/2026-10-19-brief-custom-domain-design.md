# brief.colemak.cn 根路径部署设计

## 目标

让 `victorfengming/brief` 的 GitHub Pages 构建服务于 `https://brief.colemak.cn/`，所有站内链接、语言跳转和 canonical URL 都以根路径 `/` 为基准，不再生成 `/brief/` 前缀。

## 设计

- GitHub Pages 的自定义域名和 DNS 已由用户配置；代码仅适配构建环境。
- 将部署工作流的 `SITE_URL` 固定为 `https://brief.colemak.cn`，并将 `BASE_PATH` 固定为 `/`。不再根据仓库名推导项目路径。
- 保持 `astro.config.mjs` 通过环境变量接收站点 URL 与基路径的接口，避免在本地开发中写死生产域名。
- 现有根页和旧路由回退已调用共享 `path()` 辅助函数；`BASE_PATH=/` 时它们自然生成 `/zh/`，无需改动页面代码。

## 验证

- 使用 `SITE_URL=https://brief.colemak.cn BASE_PATH=/` 构建。
- 断言语言页的 canonical URL 为 `https://brief.colemak.cn/zh/`。
- 断言根页和旧路由回退包含 `/zh/`，且产物不包含 `/brief/`。
- 保留完整测试和 Astro 类型检查。

## 非目标

- 不修改 DNS、GitHub Pages 设置、`victorfengming.github.io` 仓库或其他自定义域名。
- 不改变内容路由或语言选择策略。
- 不提交本说明文件或其他 Superpowers 文档。
