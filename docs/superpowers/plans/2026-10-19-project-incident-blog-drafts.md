# Project Incident Blog Drafts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 28 private Chinese MDX blog drafts that capture reusable, sanitized lessons from past project incidents.

**Architecture:** Each incident is one independent content-collection entry in `src/content/blog/zh/`. All entries use the blog schema's required frontmatter, remain drafts, and contain only an abstract that is safe for public review.

**Tech Stack:** Astro 7, MDX Content Collections, TypeScript schema validation.

## Global Constraints

- Create content only under `src/content/blog/zh/`; do not change routing, site configuration, or existing articles.
- Every new entry must set `locale: zh`, `draft: true`, and `featured: false`.
- Do not include company names, environment names, vehicle identifiers, internal addresses, customer data, source paths, or unverified root-cause claims.
- Preserve all pre-existing tracked and untracked files.
- Do not commit this plan or the implementation without a separate user request.

---

### Task 1: Create the 16 first-batch incident drafts

**Files:**
- Create: `src/content/blog/zh/config-sync-end-to-end-diagnosis.mdx`
- Create: `src/content/blog/zh/local-mqtt-heartbeat-cloud-delivery-gap.mdx`
- Create: `src/content/blog/zh/http-502-remote-rescue-command.mdx`
- Create: `src/content/blog/zh/telemetry-and-control-channel-boundaries.mdx`
- Create: `src/content/blog/zh/rpc-client-is-not-service-capability.mdx`
- Create: `src/content/blog/zh/kubernetes-configmap-subpath-drift.mdx`
- Create: `src/content/blog/zh/ota-installation-conflict-and-disk-recovery.mdx`
- Create: `src/content/blog/zh/ctypes-config-reader-isolation.mdx`
- Create: `src/content/blog/zh/intermittent-config-read-evidence-diagnosis.mdx`
- Create: `src/content/blog/zh/semantic-git-feature-porting.mdx`
- Create: `src/content/blog/zh/stale-ack-state-machine.mdx`
- Create: `src/content/blog/zh/end-to-end-delivery-verification.mdx`
- Create: `src/content/blog/zh/hmi-current-order-null-semantics.mdx`
- Create: `src/content/blog/zh/json-large-integer-order-id.mdx`
- Create: `src/content/blog/zh/service-restart-cause-classification.mdx`
- Create: `src/content/blog/zh/vehicle-runtime-incident-diagnosis.mdx`

**Interfaces:**
- Consumes: the `blog` collection schema in `src/content.config.ts`.
- Produces: 16 valid Chinese draft entries discoverable by Astro's content loader but omitted from public output.

- [ ] **Step 1: Create each MDX file with valid frontmatter**

Use this exact shape, with a unique title, description, tag set, and filename for each topic:

```mdx
---
title: "脱敏后的文章标题"
locale: zh
description: "一句话概述文章讨论的场景和可复用方法。"
publishedAt: 2026-10-19
tags: ["工程实践", "故障排查"]
draft: true
featured: false
---

## 摘要

两到三句脱敏摘要，说明问题边界、常见误判及可复用的解决或验证方法。
```

- [ ] **Step 2: Check content metadata and public-safety boundaries**

Run: `rg -n '^(title|locale|description|publishedAt|tags|draft|featured):|^## 摘要' src/content/blog/zh/{config-sync-end-to-end-diagnosis,local-mqtt-heartbeat-cloud-delivery-gap,http-502-remote-rescue-command,telemetry-and-control-channel-boundaries,rpc-client-is-not-service-capability,kubernetes-configmap-subpath-drift,ota-installation-conflict-and-disk-recovery,ctypes-config-reader-isolation,intermittent-config-read-evidence-diagnosis,semantic-git-feature-porting,stale-ack-state-machine,end-to-end-delivery-verification,hmi-current-order-null-semantics,json-large-integer-order-id,service-restart-cause-classification,vehicle-runtime-incident-diagnosis}.mdx`

Expected: each file exposes all seven frontmatter keys and one `## 摘要` heading.

### Task 2: Create the 12 second-batch incident drafts

**Files:**
- Create: `src/content/blog/zh/hmi-start-success-but-vehicle-cannot-move.mdx`
- Create: `src/content/blog/zh/scheduler-off-and-local-order-boundary.mdx`
- Create: `src/content/blog/zh/cython-runtime-type-annotation-trap.mdx`
- Create: `src/content/blog/zh/source-artifact-process-verification.mdx`
- Create: `src/content/blog/zh/minimal-os-portal-feature-port.mdx`
- Create: `src/content/blog/zh/python-global-thread-test-isolation.mdx`
- Create: `src/content/blog/zh/git-semantic-equivalence-validation.mdx`
- Create: `src/content/blog/zh/kubernetes-old-image-new-migration-crashloop.mdx`
- Create: `src/content/blog/zh/configmap-subpath-freeze.mdx`
- Create: `src/content/blog/zh/migration-error-to-nil-panic.mdx`
- Create: `src/content/blog/zh/hmi-start-latency-cpu-contention.mdx`
- Create: `src/content/blog/zh/vehicle-command-hidden-preconditions.mdx`

**Interfaces:**
- Consumes: the same `blog` collection schema and public-safety constraints as Task 1.
- Produces: 12 additional private Chinese draft entries independent of the first batch.

- [ ] **Step 1: Create each MDX file using the Task 1 content shape**

Give every article a distinct, reader-facing title and a two-to-three sentence abstract. Avoid incident-specific identifiers and write statements of fact only where evidence was previously established.

- [ ] **Step 2: Check the second-batch article count and headings**

Run: `rg --files src/content/blog/zh | rg '/(hmi-start-success-but-vehicle-cannot-move|scheduler-off-and-local-order-boundary|cython-runtime-type-annotation-trap|source-artifact-process-verification|minimal-os-portal-feature-port|python-global-thread-test-isolation|git-semantic-equivalence-validation|kubernetes-old-image-new-migration-crashloop|configmap-subpath-freeze|migration-error-to-nil-panic|hmi-start-latency-cpu-contention|vehicle-command-hidden-preconditions)\.mdx$' | wc -l`

Expected: `12`.

### Task 3: Validate the complete content batch

**Files:**
- Verify: `src/content/blog/zh/*.mdx`
- Verify: `src/content.config.ts`

**Interfaces:**
- Consumes: all 28 new MDX entries.
- Produces: content that passes Astro collection validation without publishing any draft.

- [ ] **Step 1: Verify the new-draft count and draft flags**

Run: `rg -l '^draft: true$' src/content/blog/zh | wc -l`

Expected: the count increases by 28 from the pre-change baseline.

- [ ] **Step 2: Run static validation**

Run: `ASTRO_TELEMETRY_DISABLED=1 npm run check`

Expected: Astro and TypeScript report no content-schema errors.

- [ ] **Step 3: Run the production build**

Run: `ASTRO_TELEMETRY_DISABLED=1 npm run build`

Expected: build succeeds and excludes draft detail pages from the generated public site.

- [ ] **Step 4: Check the final diff**

Run: `git diff --check && git status --short`

Expected: no whitespace errors; only the intended 28 drafts and uncommitted Superpowers documents appear in addition to pre-existing workspace files.
