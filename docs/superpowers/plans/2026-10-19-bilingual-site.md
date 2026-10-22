# Bilingual Portfolio Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a fully static Chinese/English portfolio with localized page copy, independently authored paired MDX sources, and a remembered language preference.

**Architecture:** Locale-aware static routes under `/zh/` and `/en/` render a shared page/component set using a small, dependency-free i18n module. Paired MDX files use a locale directory plus a common basename as their translation key. The header's progressively enhanced language links update `localStorage`; a legacy route entry point selects the preferred locale on first visit.

**Tech Stack:** Astro 7, MDX, JavaScript ES modules, Node built-in test runner, static GitHub Pages output.

## Global Constraints

- Keep GitHub Pages deployment fully static; do not add a server, cookie, account, or translation service.
- Canonical localized URLs are `/zh/` and `/en/`; direct localized URLs always override browser preference.
- Use `localStorage` only after an explicit language switch; on first entry infer English only for browser languages beginning with `en`, otherwise Chinese.
- Keep language sources independently authored as `zh/<id>.mdx` and `en/<id>.mdx`; do not mix languages inside one MDX body.
- When a translated detail source is absent, link the language selector to that locale's collection list.
- Do not commit documents generated under `docs/superpowers/`.

---

## Planned file structure

- Create: `src/i18n.js` — locale constants, interface copy, route helpers, preference selection, content ID helpers, and language counterpart lookup.
- Create: `test/i18n.test.mjs` — Node-level behavioral tests for the pure i18n module.
- Modify: `src/content.config.ts` — validate locale-aware content metadata.
- Move/create: `src/content/{blog,projects}/{zh,en}/*.mdx` — paired localized sources.
- Create: `src/pages/[locale]/` route tree — localized pages and collection detail/list routes.
- Modify: `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/ArticleCard.astro`, and `src/components/ProjectCard.astro` — locale inputs and localized interface copy.
- Modify: `src/pages/index.astro`, `src/pages/blog/*`, `src/pages/projects/*`, `src/pages/about.astro`, `src/pages/lab.astro`, `src/pages/contact.astro` — compatibility entry pages that direct to Chinese routes.

### Task 1: Define and test locale primitives

**Files:**
- Create: `src/i18n.js`
- Create: `test/i18n.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces `LOCALES`, `DEFAULT_LOCALE`, `isLocale(value)`, `localeFromBrowserLanguage(value)`, `preferredLocale(savedLocale, browserLanguage)`, `localizedPath(locale, route)`, `contentLocale(id)`, `contentKey(id)`, `counterpartPath(locale, type, id, translatedIds)`, and `copy(locale)`.
- Later tasks consume these exports from Astro components and route modules.

- [ ] **Step 1: Write the failing tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  counterpartPath,
  localizedPath,
  preferredLocale,
} from '../src/i18n.js';

test('uses an explicit saved locale before browser language', () => {
  assert.equal(preferredLocale('en', 'zh-CN'), 'en');
  assert.equal(preferredLocale('zh', 'en-US'), 'zh');
});

test('uses English only for an English browser language', () => {
  assert.equal(preferredLocale(null, 'en-GB'), 'en');
  assert.equal(preferredLocale(null, 'zh-CN'), 'zh');
  assert.equal(preferredLocale(null, undefined), 'zh');
});

test('builds locale-prefixed routes without duplicate slashes', () => {
  assert.equal(localizedPath('zh', ''), '/zh/');
  assert.equal(localizedPath('en', '/blog/'), '/en/blog/');
});

test('falls back to a localized index when no translated detail exists', () => {
  assert.equal(counterpartPath('en', 'blog', 'zh/mqtt', new Set(['en/mqtt'])), '/en/blog/mqtt/');
  assert.equal(counterpartPath('en', 'blog', 'zh/mqtt', new Set()), '/en/blog/');
});
```

- [ ] **Step 2: Verify the tests fail for missing implementation**

Run: `node --test test/i18n.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/i18n.js`.

- [ ] **Step 3: Add the test script and minimal locale module**

```json
"test": "node --test"
```

```js
export const LOCALES = ['zh', 'en'];
export const DEFAULT_LOCALE = 'zh';

export function preferredLocale(savedLocale, browserLanguage) {
  if (LOCALES.includes(savedLocale)) return savedLocale;
  return browserLanguage?.toLowerCase().startsWith('en') ? 'en' : DEFAULT_LOCALE;
}

export function localizedPath(locale, route = '') {
  const suffix = route.replace(/^\/+|\/+$/g, '');
  return `/${locale}/${suffix ? `${suffix}/` : ''}`;
}
```

Implement the remaining declared exports using the same pure-data approach; `counterpartPath` must test for `${locale}/${contentKey(id)}` in `translatedIds` before returning a detail route.

- [ ] **Step 4: Verify the locale module passes its focused test suite**

Run: `npm test -- test/i18n.test.mjs`

Expected: PASS with four passing tests.

- [ ] **Step 5: Commit the implementation task**

```bash
git add package.json src/i18n.js test/i18n.test.mjs
git commit -m "feat: add locale helpers"
```

### Task 2: Migrate content into paired localized MDX sources

**Files:**
- Modify: `src/content.config.ts`
- Create: `src/content/blog/zh/mqtt-reconnect-demo.mdx`
- Create: `src/content/blog/en/mqtt-reconnect-demo.mdx`
- Create: `src/content/blog/zh/influxdb-draft.mdx`
- Create: `src/content/blog/en/influxdb-draft.mdx`
- Create: `src/content/projects/zh/vehicle-cloud-demo.mdx`
- Create: `src/content/projects/en/vehicle-cloud-demo.mdx`
- Create: `src/content/projects/zh/remote-rescue-draft.mdx`
- Create: `src/content/projects/en/remote-rescue-draft.mdx`
- Delete: the four former root-level MDX sources after their localized versions exist.

**Interfaces:**
- Consumes `LOCALES` semantics from Task 1.
- Produces collection IDs of the form `zh/<slug>` and `en/<slug>` and validated localized metadata for Task 3.

- [ ] **Step 1: Extend the failing test with source-ID expectations**

Append this test to `test/i18n.test.mjs`:

```js
import { contentKey, contentLocale } from '../src/i18n.js';

test('separates locale and translation key from collection IDs', () => {
  assert.equal(contentLocale('en/mqtt-reconnect-demo'), 'en');
  assert.equal(contentKey('zh/mqtt-reconnect-demo'), 'mqtt-reconnect-demo');
});
```

- [ ] **Step 2: Verify the new content-ID test fails**

Run: `node --test test/i18n.test.mjs`

Expected: FAIL because the two functions are not exported yet.

- [ ] **Step 3: Implement the helpers and content migration**

Add locale frontmatter validation to both Astro collections:

```ts
locale: z.enum(['zh', 'en']),
```

Add `contentLocale(id)` and `contentKey(id)` to `src/i18n.js` by splitting exactly once at `/`. Move each source into its locale folder and add `locale: zh` or `locale: en`. Write complete localized English titles, descriptions, headings, paragraphs, list items, image alt text, and source disclaimers for the published article and project. Preserve the factual scope and the draft status of current sources.

- [ ] **Step 4: Verify source metadata and content IDs**

Run: `npm test -- test/i18n.test.mjs && npm run check`

Expected: tests PASS; Astro check accepts all paired MDX frontmatter.

- [ ] **Step 5: Commit the content-model task**

```bash
git add src/content.config.ts src/content src/i18n.js test/i18n.test.mjs
git commit -m "feat: add bilingual content sources"
```

### Task 3: Add locale-aware layouts, components, and static routes

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/Header.astro`
- Modify: `src/components/ArticleCard.astro`
- Modify: `src/components/ProjectCard.astro`
- Create: `src/pages/[locale]/index.astro`
- Create: `src/pages/[locale]/about.astro`
- Create: `src/pages/[locale]/lab.astro`
- Create: `src/pages/[locale]/contact.astro`
- Create: `src/pages/[locale]/blog/index.astro`
- Create: `src/pages/[locale]/blog/[slug].astro`
- Create: `src/pages/[locale]/projects/index.astro`
- Create: `src/pages/[locale]/projects/[slug].astro`

**Interfaces:**
- Consumes `copy`, `isLocale`, `localizedPath`, `contentKey`, and `counterpartPath` from `src/i18n.js`.
- Consumes locale-filtered Astro content entries with IDs from Task 2.
- Produces full static route trees for both supported locales.

- [ ] **Step 1: Write a failing route-output assertion**

Create `test/build-output.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';

for (const output of [
  'dist/zh/index.html',
  'dist/en/index.html',
  'dist/zh/blog/mqtt-reconnect-demo/index.html',
  'dist/en/blog/mqtt-reconnect-demo/index.html',
]) {
  test(`build emits ${output}`, async () => {
    await assert.doesNotReject(access(output));
  });
}
```

- [ ] **Step 2: Verify the route-output test fails before routes exist**

Run: `rm -rf dist && npm run build && node --test test/build-output.test.mjs`

Expected: FAIL because the localized files are absent from `dist`.

- [ ] **Step 3: Implement localized rendering and the language selector**

Create the locale route tree by moving each current page's page-specific markup into its `[locale]` counterpart. In every localized route, use `getStaticPaths` to accept only `zh` and `en`; filter content by `data.locale === locale`; use `contentKey(entry.id)` as the displayed slug and generated detail parameter.

Change shared component inputs to include `locale`. Make `BaseLayout` render `<html lang={locale === 'zh' ? 'zh-CN' : 'en'}>` and derive title, meta description, skip link, footer, and header labels from `copy(locale)`. Make Header render ordinary localized links and a `中文 / EN` control whose click handler executes `localStorage.setItem('portfolio-locale', targetLocale)` without preventing navigation. Its counterpart URL must use `counterpartPath` for article/project details.

Use `<Content />` and `headings` from the locale-selected MDX entry. Localize table-of-contents labels, list back links, card labels, empty states, hero content, form/contact labels, ARIA labels, and image alt text. Keep technology terms such as `MQTT`, `Go`, and `Redis` unchanged.

- [ ] **Step 4: Verify static output and type safety**

Run: `npm run check && npm run build && node --test test/build-output.test.mjs`

Expected: Astro checks PASS; build PASS; all four localized output tests PASS.

- [ ] **Step 5: Commit the localized UI task**

```bash
git add src/layouts src/components 'src/pages/[locale]' test/build-output.test.mjs
git commit -m "feat: render bilingual portfolio routes"
```

### Task 4: Preserve legacy links and add first-visit locale selection

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/about.astro`
- Modify: `src/pages/lab.astro`
- Modify: `src/pages/contact.astro`
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/blog/[slug].astro`
- Modify: `src/pages/projects/index.astro`
- Modify: `src/pages/projects/[slug].astro`
- Modify: `test/build-output.test.mjs`

**Interfaces:**
- Consumes `preferredLocale` semantics from Task 1 in a minimal inline browser script.
- Produces compatibility documents that point existing URLs at Chinese content and retain a no-JavaScript fallback link.

- [ ] **Step 1: Add a failing legacy-route output expectation**

Append to `test/build-output.test.mjs`:

```js
test('legacy entry exists and links to the Chinese home page', async () => {
  const html = await readFile('dist/index.html', 'utf8');
  assert.match(html, /\/zh\//);
});
```

Also import `readFile` from `node:fs/promises`.

- [ ] **Step 2: Verify the legacy assertion fails**

Run: `npm run build && node --test test/build-output.test.mjs`

Expected: FAIL because the original root page does not yet contain the compatibility link.

- [ ] **Step 3: Replace old pages with compatibility documents**

For each unprefixed route, render a semantic short fallback message and link to its Chinese equivalent. On the root page only, add an inline client script that safely reads `localStorage.getItem('portfolio-locale')`, passes it and `navigator.language` to equivalent inline selection logic, and calls `location.replace('/<locale>/')`. Wrap storage access in `try/catch` so privacy settings still permit the Chinese fallback link. For non-root legacy detail routes, redirect to the exact Chinese matching localized route; use the localized index when no published Chinese detail exists.

- [ ] **Step 4: Verify compatibility and full build checks**

Run: `npm test && npm run check && npm run build && node --test test/build-output.test.mjs && git diff --check`

Expected: all unit tests PASS, Astro check PASS, production build PASS, expected static files exist, and no whitespace errors are reported.

- [ ] **Step 5: Commit the compatibility task**

```bash
git add src/pages test/build-output.test.mjs
git commit -m "feat: remember preferred portfolio language"
```

### Task 5: Manually verify browser behavior

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes the static output from Tasks 1–4.
- Produces confirmation that client-side preference behavior works under a local preview server.

- [ ] **Step 1: Start a local production preview**

Run: `npm run preview -- --host 127.0.0.1`

Expected: Astro reports a localhost preview URL.

- [ ] **Step 2: Verify first visit and saved-preference navigation**

In a browser, visit the unprefixed root after clearing site storage; verify Chinese fallback for a non-English browser language and English selection for an English browser language. Select `EN`, reload `/`, and verify it returns to `/en/`. Select `中文`, reload `/`, and verify it returns to `/zh/`.

- [ ] **Step 3: Verify article/project language pairing and direct URLs**

Open the Chinese MQTT article and vehicle-cloud project, select `EN`, and verify their English counterparts load with English content and table of contents. Paste `/zh/blog/mqtt-reconnect-demo/` after saving English; verify it remains Chinese because its explicit locale route wins.

- [ ] **Step 4: Stop the preview and record results**

Run: `npm run dev:stop`

Expected: preview process is no longer running. Record the completed manual checks in the final implementation handoff; do not create a generated execution document.
