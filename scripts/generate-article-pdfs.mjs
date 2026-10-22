import { spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { access, mkdir, readdir, rename, rm, stat, writeFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright-core';

import { discoverPublishedArticles, pdfUrlForArticle } from './lib/article-pdfs.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentRoot = path.join(projectRoot, 'src', 'content', 'blog');
const publicRoot = path.join(projectRoot, 'public');
const tempRoot = path.join(projectRoot, 'tmp', 'pdfs');
const siteRoot = path.join(tempRoot, 'site');
const generatedRoot = path.join(tempRoot, 'generated');
const publicDownloadsRoot = path.join(publicRoot, 'downloads');
const publicArticlesRoot = path.join(publicDownloadsRoot, 'articles');
const nextArticlesRoot = path.join(publicDownloadsRoot, 'articles.next');
const previousArticlesRoot = path.join(publicDownloadsRoot, 'articles.previous');

const chromeCandidates = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

async function findChrome() {
  for (const candidate of chromeCandidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next known browser path.
    }
  }
  throw new Error('Chrome/Chromium was not found. Set CHROME_PATH to its executable.');
}

function runAstroBuild() {
  const astro = path.join(projectRoot, 'node_modules', '.bin', 'astro');
  return new Promise((resolve, reject) => {
    const child = spawn(astro, ['build', '--outDir', siteRoot], {
      cwd: projectRoot,
      env: {
        ...process.env,
        ASTRO_TELEMETRY_DISABLED: '1',
        BASE_PATH: '/',
        PUBLISH_DRAFTS: 'false',
        SITE_URL: 'http://127.0.0.1',
      },
      stdio: 'inherit',
    });
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Astro build exited with code ${code}`));
    });
  });
}

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function startStaticServer(root) {
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const relativePath = pathname.replace(/^\/+/, '');
      let filePath = path.resolve(root, relativePath);
      if (!filePath.startsWith(`${path.resolve(root)}${path.sep}`) && filePath !== path.resolve(root)) {
        response.writeHead(403).end('Forbidden');
        return;
      }
      if (pathname.endsWith('/')) filePath = path.join(filePath, 'index.html');
      const fileStat = await stat(filePath);
      if (!fileStat.isFile()) throw new Error('Not found');
      const extension = path.extname(filePath);
      response.writeHead(200, { 'Content-Type': mimeTypes[extension] ?? 'application/octet-stream' });
      createReadStream(filePath).pipe(response);
    } catch (error) {
      const status = error.code === 'ENOENT' || error.message === 'Not found' ? 404 : 400;
      response.writeHead(status).end(status === 404 ? 'Not found' : 'Bad request');
    }
  });

  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({
        origin: `http://127.0.0.1:${address.port}`,
        close: () => new Promise((done, fail) => server.close((error) => error ? fail(error) : done())),
      });
    });
  });
}

async function replacePublicArticles() {
  await mkdir(publicDownloadsRoot, { recursive: true });
  await rm(nextArticlesRoot, { recursive: true, force: true });
  await rm(previousArticlesRoot, { recursive: true, force: true });
  await rename(generatedRoot, nextArticlesRoot);

  try {
    await rename(publicArticlesRoot, previousArticlesRoot);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  try {
    await rename(nextArticlesRoot, publicArticlesRoot);
    await rm(previousArticlesRoot, { recursive: true, force: true });
  } catch (error) {
    try {
      await rename(previousArticlesRoot, publicArticlesRoot);
    } catch {
      // Keep the original replacement error when rollback is not possible.
    }
    throw error;
  }
}

const articles = await discoverPublishedArticles(contentRoot);
if (articles.length === 0) throw new Error('No published articles were found.');

let browser;
let staticServer;

try {
  await rm(siteRoot, { recursive: true, force: true });
  await rm(generatedRoot, { recursive: true, force: true });
  await mkdir(generatedRoot, { recursive: true });
  await runAstroBuild();

  const executablePath = await findChrome();
  staticServer = await startStaticServer(siteRoot);
  browser = await chromium.launch({ executablePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const manifest = { version: 1, articles: {} };

  for (const article of articles) {
    const route = `/${article.locale}/blog/${article.slug}/`;
    const response = await page.goto(`${staticServer.origin}${route}`, { waitUntil: 'networkidle' });
    if (!response?.ok()) throw new Error(`Failed to load ${route}: HTTP ${response?.status()}`);
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        [...document.images]
          .filter((image) => !image.complete)
          .map((image) => new Promise((resolve) => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
          })),
      );
    });

    const pdfPath = path.join(generatedRoot, article.locale, `${article.slug}.pdf`);
    await mkdir(path.dirname(pdfPath), { recursive: true });
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
      outline: true,
      displayHeaderFooter: true,
      headerTemplate: '<span></span>',
      footerTemplate: '<div style="width:100%;font-size:8px;color:#777;text-align:center"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
      margin: { bottom: '20mm', left: '16mm', right: '16mm', top: '18mm' },
    });
    manifest.articles[article.id] = {
      title: article.title,
      url: pdfUrlForArticle(article),
      sourceHash: article.sourceHash,
    };
    console.log(`Generated ${path.relative(projectRoot, pdfPath)}`);
  }

  await writeFile(
    path.join(generatedRoot, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  await replacePublicArticles();
} finally {
  if (browser) await browser.close();
  if (staticServer) await staticServer.close();
  await rm(siteRoot, { recursive: true, force: true });
}

const generatedFiles = await readdir(publicArticlesRoot, { recursive: true });
console.log(`Published ${articles.length} PDFs (${generatedFiles.length} files including manifest).`);
