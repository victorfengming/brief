import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateDiagramAssets } from './lib/article-diagrams.mjs';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const manifestPath = 'diagrams/manifest.json';
const errors = await validateDiagramAssets({ projectRoot, manifestPath });

if (errors.length > 0) {
  console.error('Article diagram verification failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('Verified generated article diagrams.');
}
