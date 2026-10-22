import { createHash } from 'node:crypto';
import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';

import { XMLValidator } from 'fast-xml-parser';

const diagramSourceHash = (source) =>
  `sha256:${createHash('sha256').update(source).digest('hex')}`;

const resolveManifestPath = (
  projectRoot,
  relativePath,
  { label, prefix, extension },
) => {
  const normalized = relativePath.replaceAll('\\', '/');
  const expectedPrefix = `${prefix}/`;
  if (
    path.isAbsolute(relativePath) ||
    normalized !== relativePath ||
    !normalized.startsWith(expectedPrefix) ||
    path.posix.normalize(normalized) !== normalized ||
    path.posix.extname(normalized) !== extension
  ) {
    throw new Error(
      `${label} must be a relative ${extension} path beneath ${expectedPrefix}`,
    );
  }
  return path.resolve(projectRoot, normalized);
};

const isWithin = (parent, child) => {
  const relative = path.relative(parent, child);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
};

async function realpathWithMissingSuffix(targetPath) {
  let existingPath = targetPath;
  const missingParts = [];

  while (true) {
    try {
      const resolved = await realpath(existingPath);
      return path.join(resolved, ...missingParts.reverse());
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      const parent = path.dirname(existingPath);
      if (parent === existingPath) throw error;
      missingParts.push(path.basename(existingPath));
      existingPath = parent;
    }
  }
}

async function assertRealPathBoundary(projectRoot, targetPath, prefix, label) {
  const [realProjectRoot, realAllowedRoot, realTarget] = await Promise.all([
    realpath(projectRoot),
    realpathWithMissingSuffix(path.join(projectRoot, prefix)),
    realpathWithMissingSuffix(targetPath),
  ]);

  if (
    !isWithin(realProjectRoot, realAllowedRoot) ||
    !isWithin(realAllowedRoot, realTarget)
  ) {
    throw new Error(`${label} resolves outside ${prefix}/`);
  }
}

export const stampDiagramSvg = (source, svg) =>
  `<!-- diagram-source-hash: ${diagramSourceHash(source)} -->\n${svg}`;

export const resolveDiagramManifestEntry = (projectRoot, diagram) => ({
  sourcePath: resolveManifestPath(projectRoot, diagram.source, {
    label: 'diagram source',
    prefix: 'diagrams',
    extension: '.mmd',
  }),
  outputPath: resolveManifestPath(projectRoot, diagram.output, {
    label: 'diagram output',
    prefix: 'public/images',
    extension: '.svg',
  }),
  articlePath: resolveManifestPath(projectRoot, diagram.article, {
    label: 'diagram article',
    prefix: 'src/content/blog',
    extension: '.mdx',
  }),
});

export async function validateDiagramManifestEntryPaths(projectRoot, diagram) {
  const paths = resolveDiagramManifestEntry(projectRoot, diagram);
  await Promise.all([
    assertRealPathBoundary(
      projectRoot,
      paths.sourcePath,
      'diagrams',
      'diagram source',
    ),
    assertRealPathBoundary(
      projectRoot,
      paths.outputPath,
      'public/images',
      'diagram output',
    ),
    assertRealPathBoundary(
      projectRoot,
      paths.articlePath,
      'src/content/blog',
      'diagram article',
    ),
  ]);
  return paths;
}

export async function validateDiagramAssets({ projectRoot, manifestPath }) {
  const manifest = JSON.parse(
    await readFile(path.join(projectRoot, manifestPath), 'utf8'),
  );
  const errors = [];
  const articles = new Map();

  for (const diagram of manifest.diagrams) {
    const { sourcePath, outputPath, articlePath } =
      await validateDiagramManifestEntryPaths(projectRoot, diagram);
    const source = await readFile(sourcePath, 'utf8');
    let output;

    try {
      output = await readFile(outputPath, 'utf8');
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      errors.push(`missing generated diagram: ${diagram.output}`);
      continue;
    }

    const expectedStamp = `<!-- diagram-source-hash: ${diagramSourceHash(source)} -->`;
    if (!output.startsWith(expectedStamp)) {
      errors.push(`stale generated diagram: ${diagram.output}`);
    } else {
      const svgDocument = output.slice(expectedStamp.length).trim();
      if (
        !/^<svg(?:\s|>)/.test(svgDocument) ||
        XMLValidator.validate(svgDocument, {
          allowBooleanAttributes: true,
        }) !== true
      ) {
        errors.push(`invalid generated SVG: ${diagram.output}`);
      }
    }

    let article = articles.get(diagram.article);
    if (article === undefined) {
      article = await readFile(articlePath, 'utf8');
      articles.set(diagram.article, article);
      if (/^```mermaid\s*$/m.test(article)) {
        errors.push(`article still contains Mermaid code: ${diagram.article}`);
      }
    }
    const publicUrl = `/${diagram.output.slice('public/'.length)}`;
    if (!article.includes(`src="${publicUrl}"`)) {
      errors.push(
        `article ${diagram.article} does not reference ${publicUrl}`,
      );
    }
  }

  return errors;
}
