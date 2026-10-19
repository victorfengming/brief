import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

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
