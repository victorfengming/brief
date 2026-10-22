# Mermaid Static SVG Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compile the device-shadow article's Mermaid diagrams into versioned static SVG assets before deployment.

**Architecture:** Mermaid sources live separately from the article. A local generator invokes a pinned Mermaid CLI release, stamps each SVG with a source hash, and a dependency-free build check rejects missing or stale outputs. The MDX article references only the generated SVG files.

**Tech Stack:** Node.js 22, Node test runner, Mermaid CLI 11.12.0, Astro MDX.

## Global Constraints

- Generated SVG files are committed; GitHub Pages never renders Mermaid at runtime.
- Deployment validates source-to-SVG hashes without installing Mermaid CLI.
- Existing unrelated files and PDF behavior remain unchanged.
- This plan document must not be committed.

---

### Task 1: Diagram asset contract

**Files:**
- Create: `scripts/lib/article-diagrams.mjs`
- Create: `test/article-diagrams.test.mjs`

**Interfaces:**
- Produces: `stampDiagramSvg(source, svg)` and `validateDiagramAssets({ projectRoot, manifestPath })`.

- [ ] Write tests proving missing, stale, and current SVG behavior.
- [ ] Run the focused test and confirm it fails because the module is absent.
- [ ] Implement source hashing, SVG stamping, and validation.
- [ ] Run the focused test and confirm it passes.

### Task 2: Local SVG generation

**Files:**
- Create: `diagrams/iot-device-shadow-control-solution/*.mmd`
- Create: `diagrams/manifest.json`
- Create: `scripts/generate-article-diagrams.mjs`
- Create: `scripts/check-article-diagrams.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: manifest entries with `source` and `output` paths.
- Produces: `npm run diagram:generate` and `npm run diagram:check`.

- [ ] Add three Mermaid source files and their manifest entries.
- [ ] Add a generator using pinned `@mermaid-js/mermaid-cli@11.12.0` through `npx`.
- [ ] Add a dependency-free checker and make `build` run it.
- [ ] Generate SVG files and confirm `diagram:check` passes.

### Task 3: Article integration and verification

**Files:**
- Modify: `src/content/blog/zh/iot-device-shadow-control-solution.mdx`
- Create: `public/images/articles/iot-device-shadow-control-solution/*.svg`

**Interfaces:**
- Consumes: the three generated public SVG URLs.
- Produces: static article figures usable by browsers and PDF generation.

- [ ] Replace Mermaid fences with semantic figures and descriptive alternative text.
- [ ] Run focused tests, the full test suite, Astro check, diagram check, PDF check, production build, and `git diff --check`.
- [ ] Inspect the final diff and keep unrelated work untouched.
