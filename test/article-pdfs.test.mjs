import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  discoverPublishedArticles,
  pdfUrlForArticle,
  validatePublishedArticlePdfs,
} from '../scripts/lib/article-pdfs.mjs';

const publishedSource = `---
title: "Published"
locale: zh
description: "Published article"
publishedAt: 2026-10-21
tags: ["Test"]
draft: false
---

Published body.
`;

const draftSource = publishedSource
  .replace('title: "Published"', 'title: "Draft"')
  .replace('draft: false', 'draft: true');

test('discovers only published articles as public PDF inputs', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'brief-pdf-discovery-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'zh'), { recursive: true });
  await writeFile(path.join(root, 'zh', 'published.mdx'), publishedSource);
  await writeFile(path.join(root, 'zh', 'draft.mdx'), draftSource);

  const articles = await discoverPublishedArticles(root);

  assert.deepEqual(
    articles.map(({ id, locale, slug }) => ({ id, locale, slug })),
    [{ id: 'zh/published', locale: 'zh', slug: 'published' }],
  );
  assert.equal(pdfUrlForArticle(articles[0]), '/downloads/articles/zh/published.pdf');
});

test('accepts PDFs whose manifest hash matches the published source', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'brief-pdf-valid-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const contentRoot = path.join(root, 'content');
  const publicRoot = path.join(root, 'public');
  await mkdir(path.join(contentRoot, 'zh'), { recursive: true });
  await mkdir(path.join(publicRoot, 'downloads', 'articles', 'zh'), { recursive: true });
  await writeFile(path.join(contentRoot, 'zh', 'published.mdx'), publishedSource);

  const [article] = await discoverPublishedArticles(contentRoot);
  await writeFile(
    path.join(publicRoot, 'downloads', 'articles', 'zh', 'published.pdf'),
    Buffer.alloc(1024, 1),
  );
  await writeFile(
    path.join(publicRoot, 'downloads', 'articles', 'manifest.json'),
    JSON.stringify({
      version: 1,
      articles: {
        [article.id]: {
          url: pdfUrlForArticle(article),
          sourceHash: article.sourceHash,
        },
      },
    }),
  );

  assert.deepEqual(await validatePublishedArticlePdfs({ contentRoot, publicRoot }), []);
});

test('rejects a stale PDF manifest after the article source changes', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'brief-pdf-stale-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const contentRoot = path.join(root, 'content');
  const publicRoot = path.join(root, 'public');
  await mkdir(path.join(contentRoot, 'zh'), { recursive: true });
  await mkdir(path.join(publicRoot, 'downloads', 'articles', 'zh'), { recursive: true });
  await writeFile(path.join(contentRoot, 'zh', 'published.mdx'), publishedSource);
  await writeFile(
    path.join(publicRoot, 'downloads', 'articles', 'zh', 'published.pdf'),
    Buffer.alloc(1024, 1),
  );
  await writeFile(
    path.join(publicRoot, 'downloads', 'articles', 'manifest.json'),
    JSON.stringify({
      version: 1,
      articles: {
        'zh/published': {
          url: '/downloads/articles/zh/published.pdf',
          sourceHash: 'sha256:stale',
        },
      },
    }),
  );

  const errors = await validatePublishedArticlePdfs({ contentRoot, publicRoot });

  assert.equal(errors.length, 1);
  assert.match(errors[0], /stale PDF.*zh\/published/);
});
