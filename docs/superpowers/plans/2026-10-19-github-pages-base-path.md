# GitHub Pages Base Path Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve `/brief/` in root-language redirects and legacy-route fallbacks on GitHub Pages, while preserving root-path local development.

**Architecture:** GitHub Actions already supplies `BASE_PATH=/brief`; Astro exposes that as its base path. Page components already call `path()` from `src/config/site.ts`. The fix sends the root page and `LegacyFallback` through that helper; `localizedPath()` remains locale-only because its callers already wrap it with `path()`.

**Tech Stack:** Astro 7; Node built-in test runner; GitHub Pages Actions.

## Global Constraints

- Production project-site builds use `BASE_PATH=/brief`; local development without it uses `/`.
- Do not change URL structure, locale selection, content routes, or deployment workflow.
- Do not commit generated Superpowers design or plan documents.

---

### Task 1: Add a regression assertion for generated redirects

**Files:**
- Modify: `test/build-output.test.mjs:1-19`
- Test: `test/build-output.test.mjs`

**Interfaces:**
- Consumes generated `dist/index.html`, `dist/blog/index.html`, and optional `process.env.BASE_PATH`.
- Produces a test that detects a root redirect or legacy fallback which omits the configured base path.

- [ ] **Step 1: Write the failing test**

Add a test which derives its expected prefix from `BASE_PATH` and examines both redirect boundaries:

```js
const basePath = (process.env.BASE_PATH || '').replace(/\/$/, '');
const chineseHome = `${basePath}/zh/`;

test('root and legacy redirects preserve the configured base path', async () => {
  const [root, legacyBlog] = await Promise.all([
    readFile('dist/index.html', 'utf8'),
    readFile('dist/blog/index.html', 'utf8'),
  ]);
  const escaped = chineseHome.replaceAll('/', '\\/');
  assert.match(root, new RegExp(escaped));
  assert.match(legacyBlog, new RegExp(escaped));
});
```

- [ ] **Step 2: Verify red**

Run `BASE_PATH=/brief npm run build && BASE_PATH=/brief npm test`.

Expected: the new test fails because `dist/index.html` contains `/zh/` and `dist/blog/index.html` contains `/zh/blog/` without `/brief`.

### Task 2: Generate redirects through the established base-path helper

**Files:**
- Modify: `src/pages/index.astro:1-3`
- Modify: `src/components/LegacyFallback.astro:1-6`
- Test: `test/build-output.test.mjs`

**Interfaces:**
- Consumes `path(route?: string): string` from `src/config/site.ts` and `LegacyFallback`'s `href: string` prop.
- Produces root-page script variables `zhHome` and `localeBase`, plus fallback HTML using `targetHref`.

- [ ] **Step 1: Implement the root-page base-aware redirect**

Add this frontmatter to `src/pages/index.astro`:

```astro
---
import { path } from '../config/site';
const zhHome = path('zh/');
const localeBase = path('');
---
```

Use `zhHome` as the visible anchor target. Replace the inline redirect script with:

```astro
<script define:vars={{ zhHome, localeBase }}>
  try {
    const saved = localStorage.getItem('portfolio-locale');
    const locale = saved === 'en' || saved === 'zh'
      ? saved
      : (navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'zh');
    location.replace(`${localeBase}${locale}/`);
  } catch {
    location.replace(zhHome);
  }
</script>
```

- [ ] **Step 2: Implement the legacy-fallback base-aware target**

Change the frontmatter of `src/components/LegacyFallback.astro` to:

```astro
---
import { path } from '../config/site';
interface Props { href: string; }
const { href } = Astro.props;
const targetHref = path(href);
---
```

Use `targetHref` for both `meta http-equiv="refresh"` and the visible anchor.

- [ ] **Step 3: Verify green for the GitHub Pages target**

Run `BASE_PATH=/brief npm run build && BASE_PATH=/brief npm test`.

Expected: all tests pass and both generated redirect boundaries contain `/brief/zh/`.

- [ ] **Step 4: Verify root-path local behavior and type checking**

Run `npm run build && npm test && npm run check`.

Expected: all commands pass; default output still redirects to `/zh/`.

- [ ] **Step 5: Inspect the focused diff**

Run `git diff --check` followed by `git diff -- src/pages/index.astro src/components/LegacyFallback.astro test/build-output.test.mjs`.

Expected: no whitespace errors and no source changes outside the two redirect boundaries and their regression test.
