import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { discoverPublishedArticles, validatePublishedArticlePdfs } from './lib/article-pdfs.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentRoot = path.join(projectRoot, 'src', 'content', 'blog');
const publicRoot = path.join(projectRoot, 'public');
const errors = await validatePublishedArticlePdfs({ contentRoot, publicRoot });

if (errors.length > 0) {
  console.error('Article PDF verification failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  const articles = await discoverPublishedArticles(contentRoot, publicRoot);
  console.log(`Verified ${articles.length} published article PDFs.`);
}
