# WebSocket 慢消费者问题复盘博客 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在当前 Astro 博客仓库中新增一篇详细、可独立阅读且彻底脱敏的中文 WebSocket 慢消费者事故复盘文章。

**Architecture:** 先从飞书原文、稳定分支最终代码和现有测试中建立可引用的事实表，再按“现象—证据—机制—修复—验证—边界”组织单篇 MDX。源码仓库保持只读，最终通过敏感信息扫描和 Astro 项目校验确认文章可安全构建。

**Tech Stack:** Astro、MDX、Python unittest、Node.js 测试、Astro check/build、ripgrep

## Global Constraints

- 正文只创建在 `src/content/blog/zh/`。
- frontmatter 必须包含 `title`、`locale`、`description`、`publishedAt`、`tags`、`draft` 和 `featured`。
- 文章使用 `draft: true`，不提交、不推送、不部署。
- 不修改 `/home/uisee/uisee_pro/cbv35stable`。
- 不公开车辆编号、项目代号、内部地址、账号口令、真实日志路径、分支名、提交编号、客户信息和精确事故日期。
- 结论必须区分现场直接证据、高可信机制推断和仍需现场验证的事项。
- Superpowers 设计与计划文档不提交 Git。

---

### Task 1: 建立源码与测试事实表

**Files:**
- Read: `/home/uisee/uisee_pro/cbv35stable/vehicle_backend/ws_service/sessions.py`
- Read: `/home/uisee/uisee_pro/cbv35stable/vehicle_backend/ws_service/message_handler.py`
- Read: `/home/uisee/uisee_pro/cbv35stable/vehicle_backend/ws_service/ws_qos.py`
- Read: `/home/uisee/uisee_pro/cbv35stable/vehicle_backend/tests/test_ws_service/test_ws_outbox.py`
- Read: `/home/uisee/uisee_pro/cbv35stable/vehicle_backend/tests/test_ws_service/test_ws_verify_cleanup.py`

**Interfaces:**
- Consumes: 飞书原文与已确认的文章设计。
- Produces: 关于生命周期清理、QoS 分类、软水位、发送顺序、断连行为和测试覆盖的事实清单。

- [x] **Step 1: 读取最终稳定分支代码**

仅从 Git 跟踪文件读取关键类和调用点，排除日志包、配置转储和其他未跟踪文件，确认 `WsOutbox.push()`、`WsOutbox.drain()`、`Session.flush_outbox()`、`Session.handleClose()` 与订阅注册的实际行为。

- [x] **Step 2: 读取相关单元测试**

逐项确认 latest-only 合并、FIFO 顺序、sendq 满载暂停、断连后拒绝 push、并发 close/push、鉴权失败后的清理和订阅判重是否有测试覆盖。

- [x] **Step 3: 运行聚焦测试**

Run:

```bash
cd /home/uisee/uisee_pro/cbv35stable/vehicle_backend
python3 -m unittest tests.test_ws_service.test_ws_verify_cleanup tests.test_ws_service.test_ws_outbox
```

Expected: 所有测试通过；如环境依赖阻止执行，只记录准确错误，不把历史结果冒充本次结果。

### Task 2: 撰写脱敏的中文 MDX 正文

**Files:**
- Create: `src/content/blog/zh/websocket-slow-consumer-backpressure.mdx`

**Interfaces:**
- Consumes: Task 1 的事实清单和设计规格中的文章结构。
- Produces: 可由 Astro 内容集合加载的中文事故复盘文章。

- [x] **Step 1: 写入 frontmatter**

使用以下元数据：

```yaml
title: "从界面卡顿到内存耗尽：WebSocket 慢消费者问题的排查与背压改造"
locale: zh
description: "从跨设备时间线、进程内存与订阅生命周期出发，复盘 WebSocket 慢消费者如何演化为队列膨胀，并说明分级 QoS、每连接 Outbox 与完整验证链路。"
publishedAt: 2026-10-22
tags: ["WebSocket", "性能诊断", "背压", "Python"]
draft: true
featured: false
```

- [x] **Step 2: 写入问题与证据链章节**

正文必须解释用户可见现象、证据等级、跨设备时钟偏差、同设备状态间隔比较、内存/cgroup/Swap/OOM 关联，以及为什么重复错误日志只能支持回调扇出而不能给出精确订阅数。

- [x] **Step 3: 写入根因机制章节**

用抽象对象链和伪代码解释断连清理缺口、单一会话令牌变化、重复订阅、直接写入无界发送队列和慢消费者之间的放大关系。

- [x] **Step 4: 写入修复设计章节**

解释每连接 Outbox、状态类 latest-only、事件类 FIFO、软水位、主线程发送、订阅建立临界区、初始快照、断连关闭和迟到生产者拒绝。

- [x] **Step 5: 写入验证、残余风险和排查清单**

同时覆盖单元测试、慢客户端压力测试、部署产物校验、运行时指标，以及 FIFO 无硬上限、按帧而非按字节限流、优先级饥饿和旧入口绕过 Outbox 等边界。

### Task 3: 脱敏审查与事实一致性检查

**Files:**
- Inspect: `src/content/blog/zh/websocket-slow-consumer-backpressure.mdx`

**Interfaces:**
- Consumes: Task 2 的 MDX 草稿。
- Produces: 不包含内部标识且结论强度准确的公开版本。

- [x] **Step 1: 扫描敏感模式**

Run:

```bash
rg -n '(uisee|/home/|10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|https?://|redis_password|mqtt\.password|secret|token|[0-9a-f]{8,40})' src/content/blog/zh/websocket-slow-consumer-backpressure.mdx
```

Expected: 只允许出现在通用技术解释中的 `token`；其余命中必须删除、泛化或确认不是敏感标识。

- [x] **Step 2: 检查证据等级措辞**

确认直接证据使用“日志显示/测试证明”，机制推断使用“高可信推断/与现象一致”，缺少部署验证的事项使用“尚需验证”，且没有“彻底解决所有风险”等过度结论。

- [x] **Step 3: 检查 MDX 与格式**

Run:

```bash
git diff --check -- src/content/blog/zh/websocket-slow-consumer-backpressure.mdx
```

Expected: 无空白错误。

### Task 4: 验证博客仓库

**Files:**
- Test: `src/content/blog/zh/websocket-slow-consumer-backpressure.mdx`

**Interfaces:**
- Consumes: Task 3 的公开版本。
- Produces: 内容集合、类型检查和静态构建验证结果。

- [x] **Step 1: 运行项目测试**

Run:

```bash
ASTRO_TELEMETRY_DISABLED=1 npm test
```

Expected: 全部测试通过。

- [x] **Step 2: 运行 Astro 检查**

Run:

```bash
ASTRO_TELEMETRY_DISABLED=1 npm run check
```

Expected: 0 errors；记录任何 warnings 或 hints。

- [x] **Step 3: 运行生产构建**

Run:

```bash
ASTRO_TELEMETRY_DISABLED=1 npm run build
```

Expected: 构建成功，且草稿策略按当前仓库配置执行。

- [x] **Step 4: 核对最终改动范围**

Run:

```bash
git status --short
git diff -- src/content/blog/zh/websocket-slow-consumer-backpressure.mdx
```

Expected: 只把目标博客、本地设计文档和本地计划文档识别为本任务产物；不改动用户已有的其他 tracked/untracked 文件。
