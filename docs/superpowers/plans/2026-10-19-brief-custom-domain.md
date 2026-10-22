# brief.colemak.cn Custom Domain Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `brief` GitHub Pages site for `https://brief.colemak.cn/` at the domain root rather than under `/brief/`.

**Architecture:** The Astro configuration already consumes `SITE_URL` and `BASE_PATH`. The Pages workflow becomes the single production source for those values: it provides the custom-domain URL and root base path. Tests inspect that workflow contract and the resulting static HTML.

**Tech Stack:** GitHub Actions, Astro 7, Node built-in test runner.

## Global Constraints

- Production values are exactly `SITE_URL=https://brief.colemak.cn` and `BASE_PATH=/`.
- Do not change DNS, GitHub Pages settings, `victorfengming.github.io`, route structure, or language selection.
- Do not commit generated Superpowers design or plan documents.

---

### Task 1: Lock the deployment workflow to the custom-domain contract

**Files:**
- Modify: `test/build-output.test.mjs:1-26`
- Modify: `.github/workflows/deploy.yml:16-29`
- Test: `test/build-output.test.mjs`

**Interfaces:**
- Consumes `.github/workflows/deploy.yml` as the deployed build environment contract.
- Produces workflow exports that Astro reads as `process.env.SITE_URL` and `process.env.BASE_PATH`.

- [ ] **Step 1: Write the failing workflow-contract test**

Add a test which reads `.github/workflows/deploy.yml` and asserts the exact production exports:

```js
test('Pages workflow builds the brief custom domain at the root path', async () => {
  const workflow = await readFile('.github/workflows/deploy.yml', 'utf8');
  assert.match(workflow, /SITE_URL=https:\/\/brief\.colemak\.cn/);
  assert.match(workflow, /BASE_PATH=\//);
  assert.doesNotMatch(workflow, /base_path="\/\$repository_name"/);
});
```

- [ ] **Step 2: Verify red**

Run `npm test`.

Expected: the workflow-contract test fails because the workflow still exports `https://${GITHUB_REPOSITORY_OWNER}.github.io` and `/$repository_name`.

- [ ] **Step 3: Implement the fixed deployment environment**

Replace the `Configure GitHub Pages URL` shell body with:

```yaml
        run: |
          echo "SITE_URL=https://brief.colemak.cn" >> "$GITHUB_ENV"
          echo "BASE_PATH=/" >> "$GITHUB_ENV"
```

Keep checkout, `withastro/action`, and deploy actions unchanged.

- [ ] **Step 4: Verify green**

Run `npm test`.

Expected: all tests pass.

### Task 2: Verify custom-domain static output

**Files:**
- Modify: `test/build-output.test.mjs:1-36`
- Test: `test/build-output.test.mjs`

**Interfaces:**
- Consumes a build run with `SITE_URL=https://brief.colemak.cn` and `BASE_PATH=/`.
- Produces assertions for root-path redirects and `zh` page canonical output.

- [ ] **Step 1: Write the custom-domain output assertion**

Add this test:

```js
test('custom-domain build emits root-path routes and a matching canonical URL', async () => {
  const [root, zhHome] = await Promise.all([
    readFile('dist/index.html', 'utf8'),
    readFile('dist/zh/index.html', 'utf8'),
  ]);
  assert.match(root, /\/zh\//);
  assert.doesNotMatch(root, /\/brief\//);
  assert.match(zhHome, /https:\/\/brief\.colemak\.cn\/zh\//);
});
```

- [ ] **Step 2: Run the custom-domain build and test**

Run `SITE_URL=https://brief.colemak.cn BASE_PATH=/ npm run build && SITE_URL=https://brief.colemak.cn BASE_PATH=/ npm test`.

Expected: all tests pass; the existing Astro environment interface already supports these values.

- [ ] **Step 3: Run the full validation**

Run `npm run build && npm test && npm run check && git diff --check`.

Expected: all commands pass with no Astro diagnostics or whitespace errors.

- [ ] **Step 4: Commit only the implementation**

Run `git add .github/workflows/deploy.yml test/build-output.test.mjs && git commit -m "fix: deploy brief custom domain at root"`.

Expected: the commit excludes `docs/superpowers/` and all other untracked files.
