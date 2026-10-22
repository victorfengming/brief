# Publish Draft Articles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish blog entries marked `draft: true` only in the GitHub Pages production build, controlled by `PUBLISH_DRAFTS=true`.

**Architecture:** A small server-side content-visibility module reads `process.env.PUBLISH_DRAFTS` once and exposes a collection predicate. Every blog route and list uses this predicate so route generation, translations, article lists, the home page, and the sitemap agree. The deploy workflow enables the variable; local builds keep it unset and retain draft exclusion.

**Tech Stack:** Astro 7, TypeScript, GitHub Actions, Node built-in test runner.

## Global Constraints

- GitHub Pages sets `PUBLISH_DRAFTS=true`.
- A build without `PUBLISH_DRAFTS=true` must continue to exclude `draft: true` content.
- `SITE_URL=https://colemak.cn` and `BASE_PATH=/` remain the production domain contract.
- Do not modify article frontmatter, DNS, GitHub Pages settings, or untracked `docs/` artifacts outside this plan/spec.
- Do not commit Superpowers-generated documents.

---

### Task 1: Add a single blog-visibility predicate and regression coverage

**Files:**
- Create: `src/config/content.ts`
- Modify: `test/build-output.test.mjs`

**Interfaces:**
- Consumes: `process.env.PUBLISH_DRAFTS` and Astro collection entry data with `draft: boolean`.
- Produces: `shouldPublishBlogEntry({ data: { draft } }): boolean` for all blog collection filters.

- [ ] **Step 1: Write the failing workflow and output assertions**

Add assertions to `test/build-output.test.mjs` that require the workflow to export the draft flag and, after a production build, require one merged draft route:

```js
assert.match(workflow, /PUBLISH_DRAFTS=true/);

test('production build emits published draft routes', async () => {
  await assert.doesNotReject(access('dist/zh/blog/config-sync-end-to-end-diagnosis/index.html'));
});
```

- [ ] **Step 2: Verify the test is red**

Run: `ASTRO_TELEMETRY_DISABLED=1 SITE_URL=https://colemak.cn BASE_PATH=/ PUBLISH_DRAFTS=true npm run build && npm test`

Expected: the new workflow assertion fails because the workflow does not yet set `PUBLISH_DRAFTS=true`; the draft route is absent because all routes still filter on `!data.draft`.

- [ ] **Step 3: Add the predicate**

Create `src/config/content.ts`:

```ts
type DraftableEntry = { data: { draft: boolean } };

const publishDrafts = process.env.PUBLISH_DRAFTS === 'true';

export const shouldPublishBlogEntry = (entry: DraftableEntry) =>
  publishDrafts || !entry.data.draft;
```

- [ ] **Step 4: Verify the predicate builds in isolation**

Run: `ASTRO_TELEMETRY_DISABLED=1 npm run check`

Expected: no TypeScript error for the new module.

### Task 2: Apply the predicate to every blog publication boundary

**Files:**
- Modify: `src/pages/[locale]/blog/[slug].astro`
- Modify: `src/pages/[locale]/blog/index.astro`
- Modify: `src/pages/[locale]/index.astro`
- Modify: `src/pages/blog/[slug].astro`

**Interfaces:**
- Consumes: `shouldPublishBlogEntry` from `src/config/content.ts`.
- Produces: matching visibility across static detail routes, legacy redirects, locale article lists, home-page cards, translation lookup, and sitemap-derived static output.

- [ ] **Step 1: Import and use the predicate in the localized detail page**

Replace both `({ data }) => !data.draft` callbacks in `src/pages/[locale]/blog/[slug].astro` with `shouldPublishBlogEntry`, and import it:

```ts
import { shouldPublishBlogEntry } from '../../../config/content';

const articles = await getCollection('blog', shouldPublishBlogEntry);
const translatedIds = new Set((await getCollection('blog', shouldPublishBlogEntry)).map((entry) => entry.id));
```

- [ ] **Step 2: Import and use the predicate in locale lists and home cards**

In each locale-scoped callback, preserve the locale condition while calling the predicate:

```ts
({ data }) => shouldPublishBlogEntry({ data }) && data.locale === locale
```

Apply this in `src/pages/[locale]/blog/index.astro` and `src/pages/[locale]/index.astro`.

- [ ] **Step 3: Import and use the predicate in legacy Chinese redirects**

In `src/pages/blog/[slug].astro`, retain the Chinese locale condition:

```ts
({ data }) => shouldPublishBlogEntry({ data }) && data.locale === 'zh'
```

- [ ] **Step 4: Run the focused production build test**

Run: `ASTRO_TELEMETRY_DISABLED=1 SITE_URL=https://colemak.cn BASE_PATH=/ PUBLISH_DRAFTS=true npm run build && npm test`

Expected: the draft-route assertion passes; `dist/zh/blog/config-sync-end-to-end-diagnosis/index.html` exists; existing root-path and canonical assertions still pass.

### Task 3: Enable the switch in GitHub Pages and verify both modes

**Files:**
- Modify: `.github/workflows/deploy.yml`
- Modify: `test/build-output.test.mjs`

**Interfaces:**
- Consumes: GitHub Actions environment exports.
- Produces: a production environment in which Astro receives `PUBLISH_DRAFTS=true`.

- [ ] **Step 1: Configure the deployment environment**

In the existing `Configure brief custom domain` step, append:

```bash
echo "PUBLISH_DRAFTS=true" >> "$GITHUB_ENV"
```

- [ ] **Step 2: Verify the default remains private**

Run: `ASTRO_TELEMETRY_DISABLED=1 npm run build && test ! -e dist/zh/blog/config-sync-end-to-end-diagnosis/index.html`

Expected: exit status 0; draft routes remain absent without the environment flag.

- [ ] **Step 3: Verify the production mode and full checks**

Run: `ASTRO_TELEMETRY_DISABLED=1 SITE_URL=https://colemak.cn BASE_PATH=/ PUBLISH_DRAFTS=true npm run build && SITE_URL=https://colemak.cn BASE_PATH=/ PUBLISH_DRAFTS=true npm test && ASTRO_TELEMETRY_DISABLED=1 npm run check && git diff --check`

Expected: all tests pass, Astro check reports no errors, and the Git diff has no whitespace errors.

- [ ] **Step 4: Commit only implementation files**

Run: `git add .github/workflows/deploy.yml test/build-output.test.mjs src/config/content.ts 'src/pages/[locale]/blog/[slug].astro' 'src/pages/[locale]/blog/index.astro' 'src/pages/[locale]/index.astro' 'src/pages/blog/[slug].astro' && git commit -m "feat: publish draft articles in Pages build"`

Expected: the commit contains no `docs/superpowers/` paths.
