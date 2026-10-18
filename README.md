# 自动驾驶云端工程师个人技术主页

基于 Astro 的静态技术主页，包含首页、关于、项目、文章、实验室和联系页面。产品方案见 [`autonomous-engineer-portfolio-plan.md`](./autonomous-engineer-portfolio-plan.md)。当前公开案例和文章均标明为演示内容，不代表真实工作成果。

## 环境与命令

建议使用 Node.js 24（当前 Astro 7 要求 Node.js 22.22 或更新版本）。

```bash
npm ci
npm run dev      # 本地开发，默认 http://localhost:4321
npm run dev:status  # 查看已有开发服务器
npm run dev:stop    # 停止已有开发服务器
npm run dev:restart # 替换已有开发服务器并重新启动
npm run check    # Astro + TypeScript 检查
npm run build    # 静态输出到 dist/
npm run preview  # 预览构建结果
```

如果启动时出现 `Another astro dev server is already running`，先运行 `npm run dev:status`。需要关闭旧实例时运行 `npm run dev:stop`；需要直接重启时运行 `npm run dev:restart`。不要同时启动两个普通的 `npm run dev` 实例。

项目使用 Astro、TypeScript、MDX Content Collections、Tailwind CSS 4，并预装 React 集成供后续需要客户端交互的模块使用。首期页面保持静态，不发送访客数据。

## 填写个人资料

- 在 `src/config/site.ts` 修改姓名、头衔、介绍、城市、邮箱、GitHub 地址和技能。未填写时，联系页面不会生成无效的邮箱或 GitHub 链接。
- 如需简历下载，将 PDF 放到 `public/`，然后把 `resumePdf` 设为文件路径，例如 `resume.pdf`。未配置时下载按钮不显示。
- 修改 `public/favicon.svg`、首页示意图和页面文案时，请使用自己拥有权利的素材。
- 真实任职、项目责任和结果必须经过脱敏审核后再发布。不要提交密钥、内部地址、VIN 或公司内部架构。

## 发布项目与文章

项目文件位于 `src/content/projects/`，文章位于 `src/content/blog/`；均支持 `.md` 和 `.mdx`。文件名决定详情页路径，例如 `src/content/blog/example.mdx` 对应 `/blog/example/`。Frontmatter 由 `src/content.config.ts` 校验。

项目必填字段：`title`、`summary`、`order`、`techStack`。文章必填字段：`title`、`description`、`publishedAt`、`tags`。两者都支持 `draft`、`featured` 和可选的 `cover`。

1. 新建 `.mdx` 文件，先设置 `draft: true`。
2. 按项目模板写明背景、职责、架构、挑战、方案、结果和复盘；文章写明实验环境、方法、结果及边界。
3. 本地运行 `npm run check && npm run build`，检查内容、链接及移动端排版。
4. 完成内容审核后设为 `draft: false`。构建会自动生成详情页并放入列表；草稿不会生成公开页面，也不会进入 sitemap。

当前公开的项目和文章只是通用演示。其他候选主题保留为草稿。

## GitHub Pages 部署

仓库已配置 `.github/workflows/deploy.yml`。推送到 GitHub 的 `main` 分支后，在 **Settings → Pages** 中选择 **GitHub Actions** 作为 Source。工作流会自动识别 `<用户名>.github.io` 仓库与普通项目仓库的路径差异，构建并部署 `dist/`。请将 `package-lock.json` 一并提交。

```bash
git remote add origin https://github.com/<用户名>/<仓库名>.git
git push -u origin main
```

尚未配置 GitHub 远程地址，也尚未上传本站点。请先补齐并审核真实资料，再按需提交修改和推送；推送后站点会公开。

## 后续方向

优先补齐经过审核的项目案例、实验记录和原创文章，再逐步加入标签筛选、搜索、RSS 或视觉特效。旧版静态单页模板保存在 `legacy-static/` 供参考。
