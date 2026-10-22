import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  stampDiagramSvg,
  validateDiagramAssets,
} from '../scripts/lib/article-diagrams.mjs';

const source = 'flowchart LR\n  A --> B\n';
const sourceHash =
  'sha256:4ef9c8168d16b7492b249ba343aff9d4e85d91924a61e505d063da2992bdc660';
const svg = '<svg xmlns="http://www.w3.org/2000/svg"><path /></svg>\n';

async function createFixture(t) {
  const projectRoot = await mkdtemp(path.join(tmpdir(), 'brief-diagrams-'));
  t.after(() => rm(projectRoot, { recursive: true, force: true }));
  await mkdir(path.join(projectRoot, 'diagrams'), { recursive: true });
  await mkdir(path.join(projectRoot, 'src', 'content', 'blog', 'zh'), {
    recursive: true,
  });
  await writeFile(path.join(projectRoot, 'diagrams', 'sample.mmd'), source);
  await writeFile(
    path.join(projectRoot, 'src', 'content', 'blog', 'zh', 'sample.mdx'),
    '<img src="/images/sample.svg" alt="Sample" />\n',
  );
  await writeFile(
    path.join(projectRoot, 'diagrams', 'manifest.json'),
    JSON.stringify({
      version: 1,
      diagrams: [
        {
          source: 'diagrams/sample.mmd',
          output: 'public/images/sample.svg',
          article: 'src/content/blog/zh/sample.mdx',
        },
      ],
    }),
  );
  return projectRoot;
}

test('stamps generated SVGs with the exact Mermaid source hash', () => {
  assert.equal(
    stampDiagramSvg(source, svg),
    `<!-- diagram-source-hash: ${sourceHash} -->\n${svg}`,
  );
});

test('reports a generated diagram that is missing', async (t) => {
  const projectRoot = await createFixture(t);

  assert.deepEqual(
    await validateDiagramAssets({
      projectRoot,
      manifestPath: 'diagrams/manifest.json',
    }),
    ['missing generated diagram: public/images/sample.svg'],
  );
});

test('reports a generated diagram whose source hash is stale', async (t) => {
  const projectRoot = await createFixture(t);
  await mkdir(path.join(projectRoot, 'public', 'images'), { recursive: true });
  await writeFile(
    path.join(projectRoot, 'public', 'images', 'sample.svg'),
    '<!-- diagram-source-hash: sha256:stale -->\n<svg />\n',
  );

  assert.deepEqual(
    await validateDiagramAssets({
      projectRoot,
      manifestPath: 'diagrams/manifest.json',
    }),
    ['stale generated diagram: public/images/sample.svg'],
  );
});

test('accepts a generated diagram stamped from the current source', async (t) => {
  const projectRoot = await createFixture(t);
  await mkdir(path.join(projectRoot, 'public', 'images'), { recursive: true });
  await writeFile(
    path.join(projectRoot, 'public', 'images', 'sample.svg'),
    stampDiagramSvg(source, svg),
  );

  assert.deepEqual(
    await validateDiagramAssets({
      projectRoot,
      manifestPath: 'diagrams/manifest.json',
    }),
    [],
  );
});

test('rejects a stamped output that is not a complete SVG document', async (t) => {
  const projectRoot = await createFixture(t);
  await mkdir(path.join(projectRoot, 'public', 'images'), { recursive: true });
  await writeFile(
    path.join(projectRoot, 'public', 'images', 'sample.svg'),
    `<!-- diagram-source-hash: ${sourceHash} -->\nnot an svg\n`,
  );

  assert.deepEqual(
    await validateDiagramAssets({
      projectRoot,
      manifestPath: 'diagrams/manifest.json',
    }),
    ['invalid generated SVG: public/images/sample.svg'],
  );
});

test('rejects a stamped SVG with mismatched XML tags', async (t) => {
  const projectRoot = await createFixture(t);
  await mkdir(path.join(projectRoot, 'public', 'images'), { recursive: true });
  await writeFile(
    path.join(projectRoot, 'public', 'images', 'sample.svg'),
    stampDiagramSvg(source, '<svg><g></svg>\n'),
  );

  assert.deepEqual(
    await validateDiagramAssets({
      projectRoot,
      manifestPath: 'diagrams/manifest.json',
    }),
    ['invalid generated SVG: public/images/sample.svg'],
  );
});

test('rejects multiple XML root elements after the SVG', async (t) => {
  const projectRoot = await createFixture(t);
  await mkdir(path.join(projectRoot, 'public', 'images'), { recursive: true });
  await writeFile(
    path.join(projectRoot, 'public', 'images', 'sample.svg'),
    stampDiagramSvg(source, '<svg></svg><svg></svg>\n'),
  );

  assert.deepEqual(
    await validateDiagramAssets({
      projectRoot,
      manifestPath: 'diagrams/manifest.json',
    }),
    ['invalid generated SVG: public/images/sample.svg'],
  );
});

test('rejects an article that does not reference its generated SVG', async (t) => {
  const projectRoot = await createFixture(t);
  await mkdir(path.join(projectRoot, 'public', 'images'), { recursive: true });
  await writeFile(
    path.join(projectRoot, 'public', 'images', 'sample.svg'),
    stampDiagramSvg(source, svg),
  );
  await writeFile(
    path.join(projectRoot, 'src', 'content', 'blog', 'zh', 'sample.mdx'),
    'No diagram here.\n',
  );

  assert.deepEqual(
    await validateDiagramAssets({
      projectRoot,
      manifestPath: 'diagrams/manifest.json',
    }),
    [
      'article src/content/blog/zh/sample.mdx does not reference /images/sample.svg',
    ],
  );
});

test('rejects manifest paths that escape their allowed directories', async (t) => {
  const projectRoot = await createFixture(t);
  const manifestPath = path.join(projectRoot, 'diagrams', 'manifest.json');
  await writeFile(
    manifestPath,
    JSON.stringify({
      version: 1,
      diagrams: [
        {
          source: '../outside.mmd',
          output: 'public/images/sample.svg',
          article: 'src/content/blog/zh/sample.mdx',
        },
      ],
    }),
  );

  await assert.rejects(
    validateDiagramAssets({
      projectRoot,
      manifestPath: 'diagrams/manifest.json',
    }),
    /diagram source must be a relative \.mmd path beneath diagrams\//,
  );
});

test('rejects a diagram source symlink that resolves outside its directory', async (t) => {
  const projectRoot = await createFixture(t);
  const outsideRoot = await mkdtemp(path.join(tmpdir(), 'brief-diagrams-outside-'));
  t.after(() => rm(outsideRoot, { recursive: true, force: true }));
  const outsideSource = path.join(outsideRoot, 'outside.mmd');
  await writeFile(outsideSource, source);
  await rm(path.join(projectRoot, 'diagrams', 'sample.mmd'));
  await symlink(outsideSource, path.join(projectRoot, 'diagrams', 'sample.mmd'));

  await assert.rejects(
    validateDiagramAssets({
      projectRoot,
      manifestPath: 'diagrams/manifest.json',
    }),
    /diagram source resolves outside diagrams\//,
  );
});

test('rejects an output directory symlink that resolves outside public images', async (t) => {
  const projectRoot = await createFixture(t);
  const outsideRoot = await mkdtemp(path.join(tmpdir(), 'brief-images-outside-'));
  t.after(() => rm(outsideRoot, { recursive: true, force: true }));
  await mkdir(path.join(projectRoot, 'public'), { recursive: true });
  await symlink(outsideRoot, path.join(projectRoot, 'public', 'images'));

  await assert.rejects(
    validateDiagramAssets({
      projectRoot,
      manifestPath: 'diagrams/manifest.json',
    }),
    /diagram output resolves outside public\/images\//,
  );
});
