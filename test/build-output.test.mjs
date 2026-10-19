import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

test('Pages workflow builds the brief custom domain at the root path', async () => {
  const workflow = await readFile('.github/workflows/deploy.yml', 'utf8');
  assert.match(workflow, /SITE_URL=https:\/\/brief\.colemak\.cn/);
  assert.match(workflow, /BASE_PATH=\//);
  assert.doesNotMatch(workflow, /base_path="\/\$repository_name"/);
});

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

test('root and legacy redirects preserve the configured base path', async () => {
  const basePath = (process.env.BASE_PATH || '').replace(/\/$/, '');
  const chineseHome = `${basePath}/zh/`;
  const escaped = chineseHome.replaceAll('/', '\\/');
  const [root, legacyBlog] = await Promise.all([
    readFile('dist/index.html', 'utf8'),
    readFile('dist/blog/index.html', 'utf8'),
  ]);
  assert.match(root, new RegExp(escaped));
  assert.match(legacyBlog, new RegExp(escaped));
});

test('configured-site build emits root-path routes and a matching canonical URL', async () => {
  const siteUrl = process.env.SITE_URL || 'https://example.github.io';
  const [root, zhHome] = await Promise.all([
    readFile('dist/index.html', 'utf8'),
    readFile('dist/zh/index.html', 'utf8'),
  ]);
  assert.match(root, /\/zh\//);
  assert.doesNotMatch(root, /\/brief\//);
  assert.ok(zhHome.includes(`${siteUrl}/zh/`));
});
