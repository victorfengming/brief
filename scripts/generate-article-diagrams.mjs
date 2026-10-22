import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  stampDiagramSvg,
  validateDiagramManifestEntryPaths,
} from './lib/article-diagrams.mjs';

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const manifest = JSON.parse(
  await readFile(path.join(projectRoot, 'diagrams/manifest.json'), 'utf8'),
);

function renderDiagram(sourcePath, outputPath) {
  return new Promise((resolve, reject) => {
    const mermaidCli = path.join(
      projectRoot,
      'node_modules',
      '.bin',
      process.platform === 'win32' ? 'mmdc.cmd' : 'mmdc',
    );
    const child = spawn(
      mermaidCli,
      [
        '--input',
        sourcePath,
        '--output',
        outputPath,
        '--theme',
        'neutral',
        '--backgroundColor',
        'white',
        '--puppeteerConfigFile',
        path.join(projectRoot, 'scripts/mermaid-puppeteer-config.json'),
        '--quiet',
      ],
      { cwd: projectRoot, stdio: 'inherit' },
    );
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Mermaid CLI exited with code ${code}`));
    });
  });
}

for (const diagram of manifest.diagrams) {
  const { sourcePath, outputPath } = await validateDiagramManifestEntryPaths(
    projectRoot,
    diagram,
  );
  await mkdir(path.dirname(outputPath), { recursive: true });
  await renderDiagram(sourcePath, outputPath);

  const [source, svg] = await Promise.all([
    readFile(sourcePath, 'utf8'),
    readFile(outputPath, 'utf8'),
  ]);
  await writeFile(outputPath, stampDiagramSvg(source, svg));
  console.log(`Generated ${diagram.output}`);
}
