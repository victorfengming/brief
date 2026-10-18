# 自动驾驶云端工程师个人技术主页 — 产品与实施方案

> 文档版本：v1.0  
> 日期：2026-10-18  
> 用途：作为 Codex 的项目上下文与开发实施依据  
> 项目类型：长期维护的个人技术品牌网站（H5 / Responsive Portfolio）

## 0. Codex 阅读说明

本文件同时是产品需求（PRD）、视觉规范、信息架构及首期实施任务书。

**请 Codex 按如下原则执行：**

1. 优先实现可运行、可持续维护的 MVP，不要一次性堆叠 3D、后端 CMS、AI 助手等复杂功能。
2. 开发前检查当前仓库结构，若已存在可用工程，优先复用而非覆盖。
3. 默认技术栈为 Astro + TypeScript + React Islands + Tailwind CSS + MDX；若仓库现有技术栈不同，先分析迁移成本。
4. 内容以静态文件管理，首期不引入数据库。
5. 所有个人信息、公司敏感数据、具体业务指标应使用占位符或脱敏示例；不得虚构真实成果。
6. 每完成一个阶段，运行项目已有的 lint、类型检查、构建；记录测试结果及待办事项。
7. 确保桌面与移动端都能访问，尊重 `prefers-reduced-motion`，优先考虑页面性能、可访问性、SEO。

---

## 1. 项目定位

### 1.1 网站定位

打造一个集 **个人介绍 + 工程项目 + 技术博客 + 可复现实验 + 联系方式** 于一体的长期个人品牌网站，而不仅仅是一份求职简历。

品牌关键词：
- Autonomous Driving（自动驾驶）
- Cloud Backend（云端后端）
- Distributed Systems（分布式系统）
- Reliability Engineering（可靠性工程）

首页示例文案：

- Eyebrow：`AUTONOMOUS DRIVING SOFTWARE ENGINEER`
- 英文主标题：`Engineering the connection between vehicles and the cloud.`
- 中文介绍：`专注自动驾驶云端系统、分布式通信与可靠性工程，探索从车辆数据到云端智能的工程实践。`
- 按钮：`探索项目`、`阅读技术文章`

身份信息（姓名、工作年限、GitHub、邮箱、头像等）全部在单独配置文件中管理，初始使用占位符。

### 1.2 目标读者

- 软件工程师、架构师及技术社区读者；
- 关注自动驾驶、车云系统的同行；
- 招聘者与技术面试官；
- 潜在开源协作者。

### 1.3 成功标准

- 首页快速说明个人定位及核心技术方向；
- 项目内容有可阅读的架构、问题、解决方案和结果；
- 新增文章无需改页面代码；
- 移动端阅读清晰、加载快速；
- 代码结构简单、部署和维护成本低。

---

## 2. 视觉方案

**最终选用建议：自动驾驶 × 高级极简工程师融合风格。**

- 首页：汽车、轨迹、雷达/点云等少量自动驾驶元素，强调行业识别度；
- 内页：专业的排版、可读性强的项目卡片与技术文章；
- 局部：Terminal、系统状态、数据流、架构可视化等工程特色；
- 不使用大量炫光或影响阅读的持续动画。

### 2.1 Design Tokens

| 用途 | 颜色 | 说明 |
|---|---|---|
| 页面背景 | `#080D16` | 深海军蓝黑 |
| 卡片/面板 | `#142337` | 深蓝色 |
| 强调色 | `#21D4D9` | 科技青 |
| 辅助强调 | `#478BFA` | 数据蓝 |
| 主文字 | `#F2F6FC` | 近白 |
| 次文字 | `#91A7C3` | 蓝灰 |

字体建议：英文 `Inter` 或 `Geist`，中文 `Noto Sans SC` / 思源黑体；代码字体 `JetBrains Mono`。

设计规范：
- 首期以深色模式为主，浅色模式放到后续阶段；
- 统一页面最大宽度、字号体系、间距与边角半径；
- 控件保留明显 hover、focus、active 状态；
- 所有交互键盘可操作；
- 3D 内容必须有静态退化展示。

### 2.2 首页布局

1. **顶部导航**：Logo/个人标识；Home、Projects、Blog、Lab、About、Contact。
2. **Hero**：身份标签、主标题、简短介绍、主要 CTA；右侧或下方车辆视觉（首期静态图）。
3. **能力标签**：Go、MQTT、Redis、Kubernetes、InfluxDB、Python 等。
4. **精选项目**：3 个项目卡片，重点展示工程挑战与成果。
5. **最新文章**：最近发布的 3–5 篇文章。
6. **个人简介**：背景、专业方向与近期关注领域。
7. **页脚**：GitHub、Email、RSS（如已实现）、版权说明。

首屏不依赖 3D 才能正常浏览，避免出现空白画面。

---

## 3. 站点信息架构

```text
/
├── about/                       关于我：经历、专业方向、职业路线
├── projects/                    项目索引
│   ├── remote-rescue/           远程脱困云端协同
│   ├── vehicle-cloud-messaging/ 车云消息链路
│   └── telemetry-storage/       时序数据存储与性能实践
├── blog/                        文章索引、标签、全文文章
│   ├── distributed-systems/
│   ├── autonomous-driving/
│   ├── golang/
│   └── ai-infrastructure/
├── lab/                         可复现工程实验
└── contact/                     联系方式、简历链接
```

> 注：博客分类建议通过标签和筛选实现，不要求分类必须采用上面的固定 URL 层级；实际路由以框架实现为准。

### 3.1 页面要求

| 页面 | 核心内容 | MVP |
|---|---|---|
| Home | 身份定位、项目、文章入口 | 是 |
| About | 个人简介、经历、技能、方向 | 是 |
| Projects Index | 项目列表、技术标签、摘要 | 是 |
| Project Detail | 技术案例长文、架构图、成果 | 是 |
| Blog Index | 文章列表、标签、摘要和日期 | 是 |
| Blog Detail | Markdown/MDX 正文、代码高亮、目录 | 是 |
| Lab | Demo/实验入口及说明 | 简版 |
| Contact | Email、GitHub、简历 PDF 链接 | 是 |
| Search / RSS | 全文检索、订阅 | 后续 |
| i18n | 中英文切换 | 后续 |

---

## 4. 内容规划

### 4.1 项目展示模板

每个工程项目使用统一结构：

1. `Background`：业务场景及待解决问题；
2. `Responsibility`：个人职责及具体贡献；
3. `Architecture`：系统架构图、数据流、时序图/状态机；
4. `Challenges`：性能、一致性、恢复能力、复杂状态等难点；
5. `Solution`：技术方案与取舍；
6. `Results`：测试数据、效果和边界说明；
7. `Lessons`：复盘、后续优化方向。

### 4.2 首批项目主题

**项目 A：Remote Rescue Platform（远程脱困与云端协同控制）**
- 背景：车辆受阻时，云端与人工辅助绕行流程；
- 技术关键词：Go、Protobuf、MQTT/EMQX、Redis、InfluxDB、Web Console；
- 展示方向：事件驱动、工单状态机、多次脱困、异常恢复、数据流；
- 图示：脱敏架构图 + 状态机图 + 简化数据流图。

**项目 B：Vehicle–Cloud Messaging（车云消息链路）**
- 技术关键词：MQTT、EMQX、Go、Protobuf/JSON；
- 展示方向：消息订阅转发、连接稳定性、重连机制、背压/故障处理。

**项目 C：Telemetry Storage & Playback（车辆时序数据存储及回放）**
- 技术关键词：InfluxDB、批量写入、Retention Policy、查询优化；
- 展示方向：时序数据架构、压力测试方法、保留策略、查询延迟。

以上仅代表拟展示主题，正式发布的内容、贡献和数值需逐项确认，并符合公司保密规则。

### 4.3 首批博客候选

1. `MQTT 断线重连：为什么 socket.close() 还不够？`
2. `InfluxDB 在车辆实时数据链路中的写入与查询实践`
3. `远程脱困系统的事件驱动工单状态机设计`
4. `Go 服务中的 Redis Lua 原子操作与队列设计`
5. `Kubernetes 中环境变量与服务部署问题排查`

**内容发布要求：** 所有文章初期标记为 `draft: true`，完成审核后再公开；博客日期、标签、封面、摘要在 Frontmatter 中统一管理。

### 4.4 Lab 实验室候选

- MQTT / TCP 断线重连抓包实验；
- Redis Lua 原子操作示例；
- InfluxDB Benchmark（用模拟数据）；
- Go 并发消息通信小工具；
- 车辆状态模拟可视化（仅使用演示数据）。

Projects 回答“解决了什么工程问题”，Lab 回答“别人如何复现一个技术实验”。

---

## 5. 技术架构

### 5.1 推荐技术栈

| 模块 | 选型 | 备注 |
|---|---|---|
| 主框架 | Astro | 以静态内容为核心 |
| 语言 | TypeScript | 页面/组件/内容模型 |
| 动态模块 | React Islands | 只对必要组件做客户端加载 |
| 样式 | Tailwind CSS | 配合统一 Design Tokens |
| 文章 | MDX + Astro Content Collections | Git 管理内容，无 CMS |
| 代码高亮 | Astro/Shiki 生态 | 避免客户端整库加载 |
| 图表/架构 | Mermaid，必要时 D2 静态图 | 复杂图优先预渲染 |
| 动效 | CSS + Motion（按需） | 避免无意义动效 |
| 3D（后续） | Three.js / React Three Fiber | 惰性加载、可降级 |
| 部署 | Cloudflare Pages 或 Vercel | 以静态构建方案优先 |
| CI | GitHub Actions 或平台自带流水线 | 自动检查和部署 |

### 5.2 建议目录

```text
engineering-portfolio/
├── public/
│   ├── images/
│   ├── models/
│   └── resume.pdf
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── home/
│   │   ├── projects/
│   │   ├── blog/
│   │   └── three/
│   ├── content/
│   │   ├── blog/
│   │   ├── projects/
│   │   └── lab/
│   ├── layouts/
│   ├── pages/
│   ├── styles/
│   ├── config/
│   │   └── site.ts
│   └── content.config.ts
├── astro.config.mjs
├── package.json
└── README.md
```

目录按实际 Astro 版本约定调整。建议通过 `src/config/site.ts` 管理个人名称、职位、介绍、社交链接和站点域名。

### 5.3 建议内容模型

博客 Frontmatter 示例：

```yaml
---
title: "MQTT 断线重连：为什么 socket.close() 还不够？"
description: "基于模拟环境讨论 TCP 连接关闭与重连行为。"
publishedAt: 2026-10-18
tags: [mqtt, tcp, golang]
draft: true
featured: false
---
```

项目 Frontmatter 建议字段：`title`、`summary`、`order`、`techStack`、`featured`、`draft`、`cover`（可选），正文存放技术详情。

### 5.4 非功能要求

- 响应式：移动、平板、桌面三种主要布局；
- 可访问性：语义化 HTML、键盘导航、焦点态、文字对比度、图片 alt；
- 性能：控制图片体积，首页首屏资源尽量轻，3D 延迟加载；
- SEO：独立页面 title/description、Open Graph、sitemap、canonical；
- 内容：未发布草稿不进入生成页面、索引与站点地图；
- 维护：可在 Git 中直接编辑 Markdown，不依赖数据库或在线后台；
- 安全：不提交密钥，不暴露内部 IP、车辆 VIN、公司私有数据、内部架构细节；
- 兼容：优先使用稳定浏览器特性，移动端提供非 3D 后备图。

---

## 6. 分阶段开发计划

### Phase 1：MVP（先完成）

- [ ] 检查已有仓库，确认初始化或增量开发方式
- [ ] 初始化 Astro + TypeScript + Tailwind + MDX（按现有版本的官方方式）
- [ ] 实现全站布局、导航、页脚与移动端菜单
- [ ] 实现深色设计系统及基础排版
- [ ] 实现首页 Hero，首期使用静态车辆示意图（可用安全的占位资产）
- [ ] 实现 About、Projects、Blog、Lab、Contact 页面
- [ ] 项目和文章采用 Content Collections + MDX
- [ ] 为每个项目提供内容模板，支持架构图片与代码/图表
- [ ] 内容列表支持按发布时间排序，过滤草稿
- [ ] 实现 SEO 元数据、sitemap、404 页
- [ ] 校验响应式布局、键盘导航、`prefers-reduced-motion`
- [ ] 本地执行 lint/类型检查/build 并修复问题
- [ ] 提供 README，写明安装、开发、构建及文章发布方法

**MVP 验收条件：**
1. `npm install` 与 `npm run dev` 能正常启动（或项目定义的包管理器等效命令）；
2. 主要页面及至少 1 篇公开示例文章 / 1 个公开示例项目可访问；
3. 新增一个 Markdown/MDX 文件即可产生新的详情页和索引条目；
4. 手机端无明显横向溢出；
5. 编译构建成功，导航无死链；
6. 不出现未经授权的公司素材或自称真实的演示指标。

### Phase 2：视觉增强

- [ ] 首页引入可选车辆 3D 模型（确保使用许可）
- [ ] 道路轨迹/雷达点云背景动效
- [ ] 项目技术架构可视化及轻量交互
- [ ] 主题切换（按实际需要）
- [ ] 代码复制、文章目录、阅读进度、搜索
- [ ] 进行资源压缩、性能及可访问性评估

### Phase 3：品牌长期建设

- [ ] Lab 互动实验与开源仓库链接
- [ ] 技术专题与系列文章
- [ ] RSS、订阅与站点统计（尊重隐私）
- [ ] 中英双语（必要时）
- [ ] 自动部署及定期检查链接可用性

---

## 7. 开源案例与灵感链接

以下仅作为风格和交互参考，**不要直接复制受版权保护的页面素材或代码**；复用源码前核对仓库 LICENSE。

- Bruno Simon 3D 互动主页：https://bruno-simon.com/
- Brittany Chiang 极简开发者主页：https://brittanychiang.com/
- Brittany Chiang 历史版本源码：https://github.com/bchiang7/v4
- Sat Naing Terminal Portfolio：https://terminal.satnaing.dev/
- Terminal Portfolio 源码：https://github.com/satnaing/terminal-portfolio
- Astro 官方文档：https://docs.astro.build/
- Astro Content Collections：https://docs.astro.build/en/guides/content-collections/
- Tailwind CSS：https://tailwindcss.com/

---

## 8. 内容资产及待确认项

使用占位符，不阻塞 MVP 开发：

- `[YOUR_NAME]`：个人显示名；
- `[YOUR_TITLE]`：中英文职业头衔；
- `[YOUR_GITHUB_URL]`、`[YOUR_EMAIL]`：外部链接；
- `[YOUR_DOMAIN]`：生产域名；
- `[YOUR_RESUME_PDF]`：简历文件（未提供前按钮可隐藏）；
- 头像及车辆视觉资产：需要确认来源和使用许可；
- 工作经历、项目成果：待用户逐项脱敏审核；
- 实际性能数值：不通过本文推断，不填充未经验证的数字。

## 9. 可直接交给 Codex 的执行指令

将以下文本粘贴至 Codex，或者在工作目录打开此 Markdown 后引用该文件：

> 请阅读 `autonomous-engineer-portfolio-plan.md`，这是我的自动驾驶云端软件工程师个人技术网站实施方案。请先检查当前项目状态，并按文档的 Phase 1 落地一个能运行、可继续维护的 MVP。默认采用 Astro + TypeScript + Tailwind CSS + MDX，优先保持静态输出；根据框架最新 API 实现内容集合。页面包括 Home、About、Projects、Blog、Lab、Contact 与详情页。深色科技风格，首页汽车主题先用安全的占位图，不引入重型 3D。所有个人资料和公司数据都使用占位符或脱敏示例。每完成主要任务请运行类型检查、构建并修正报错，最后向我报告实现内容、运行命令、待填充配置和下一阶段建议。若仓库已有代码，先分析并尽量复用，不要直接覆盖。

---

**实施原则：先建设高质量项目内容和技术文章，再迭代视觉特效。**
