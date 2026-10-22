import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const frontmatterValue = (source, key) => {
  const match = source.match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm'));
  return match?.[1].replace(/^['"]|['"]$/g, '');
};

const sourceHash = async (source, publicRoot) => {
  const hash = createHash('sha256').update(source);
  const svgUrls = [
    ...source.matchAll(/\bsrc=["'](\/images\/[^"']+\.svg)["']/g),
  ].map((match) => match[1]);

  for (const url of svgUrls) {
    if (!publicRoot) {
      throw new Error(`publicRoot is required to hash article asset ${url}`);
    }
    const assetPath = path.resolve(publicRoot, url.replace(/^\//, ''));
    const resolvedPublicRoot = path.resolve(publicRoot);
    if (!assetPath.startsWith(`${resolvedPublicRoot}${path.sep}`)) {
      throw new Error(`article asset escapes public root: ${url}`);
    }
    hash.update('\0').update(url).update('\0').update(await readFile(assetPath));
  }

  return `sha256:${hash.digest('hex')}`;
};

export const pdfUrlForArticle = ({ locale, slug }) =>
  `/downloads/articles/${locale}/${slug}.pdf`;

export async function discoverPublishedArticles(contentRoot, publicRoot) {
  const localeEntries = await readdir(contentRoot, { withFileTypes: true });
  const articles = [];

  for (const localeEntry of localeEntries) {
    if (!localeEntry.isDirectory()) continue;
    const locale = localeEntry.name;
    const localeRoot = path.join(contentRoot, locale);
    const files = await readdir(localeRoot, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || !/\.mdx?$/.test(file.name)) continue;
      const sourcePath = path.join(localeRoot, file.name);
      const source = await readFile(sourcePath, 'utf8');
      if (frontmatterValue(source, 'draft') !== 'false') continue;

      const slug = file.name.replace(/\.mdx?$/, '');
      const declaredLocale = frontmatterValue(source, 'locale');
      if (declaredLocale !== locale) {
        throw new Error(
          `article locale mismatch for ${sourcePath}: expected ${locale}, got ${declaredLocale}`,
        );
      }

      articles.push({
        id: `${locale}/${slug}`,
        locale,
        slug,
        sourceHash: await sourceHash(source, publicRoot),
        sourcePath,
        title: frontmatterValue(source, 'title') ?? slug,
      });
    }
  }

  return articles.sort((left, right) => left.id.localeCompare(right.id));
}

export async function validatePublishedArticlePdfs({ contentRoot, publicRoot }) {
  let articles;
  try {
    articles = await discoverPublishedArticles(contentRoot, publicRoot);
  } catch (error) {
    return [error.message];
  }
  const manifestPath = path.join(
    publicRoot,
    'downloads',
    'articles',
    'manifest.json',
  );
  let manifest;

  try {
    manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  } catch (error) {
    return [`missing or invalid PDF manifest: ${error.message}`];
  }

  const errors = [];
  const entries = manifest.articles ?? {};

  for (const article of articles) {
    const entry = entries[article.id];
    if (!entry) {
      errors.push(`missing PDF manifest entry for ${article.id}`);
      continue;
    }

    const expectedUrl = pdfUrlForArticle(article);
    if (entry.url !== expectedUrl) {
      errors.push(`incorrect PDF URL for ${article.id}: expected ${expectedUrl}`);
    }
    if (entry.sourceHash !== article.sourceHash) {
      errors.push(`stale PDF for ${article.id}: source hash does not match`);
    }

    const pdfPath = path.join(publicRoot, entry.url.replace(/^\//, ''));
    try {
      const pdfStat = await stat(pdfPath);
      if (!pdfStat.isFile() || pdfStat.size < 512) {
        errors.push(`invalid PDF file for ${article.id}: ${pdfPath}`);
      }
    } catch {
      errors.push(`missing PDF file for ${article.id}: ${pdfPath}`);
    }
  }

  const publishedIds = new Set(articles.map((article) => article.id));
  for (const id of Object.keys(entries)) {
    if (!publishedIds.has(id)) {
      errors.push(`public PDF manifest contains unpublished article ${id}`);
    }
  }

  return errors;
}
