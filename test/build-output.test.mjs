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

test('legacy entry exists and links to the Chinese home page', async () => {
  const html = await readFile('dist/index.html', 'utf8');
  assert.match(html, /\/zh\//);
});
