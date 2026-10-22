# Bilingual Portfolio Site Design

## Goal

Provide complete Chinese and English versions of the portfolio, including all
site chrome, pages, published projects, and published articles. Visitors can
switch language with one control; their preference is retained in the browser.
The site must remain deployable as static files on GitHub Pages.

## Routing and language selection

- Publish canonical language routes below `/zh/` and `/en/` for every page.
  Examples: `/zh/blog/mqtt-reconnect-demo/` and
  `/en/blog/mqtt-reconnect-demo/`.
- Keep existing unprefixed routes as compatibility entry points that direct to
  the Chinese equivalent. The root entry point selects a language before it
  navigates:
  1. use the saved `localStorage` preference when it is `zh` or `en`;
  2. otherwise use the browser's first preferred language (`en*` selects
     English; all other values select Chinese);
  3. persist a choice only after the visitor explicitly uses the switcher.
- The header language control is a visible, keyboard-accessible `中文 / EN`
  link pair. It saves the chosen locale then navigates to the matching route.
- When the current article or project lacks a translation, the control points
  to that locale's collection index instead of producing a broken detail URL.

## Content model

- Store paired sources independently, with one file per locale:
  `src/content/blog/zh/<id>.mdx`, `src/content/blog/en/<id>.mdx`,
  `src/content/projects/zh/<id>.mdx`, and
  `src/content/projects/en/<id>.mdx`.
- A shared filename is the translation key. Both files carry localized title,
  summary/description, tags, body, and other display metadata. Shared fields
  such as order, published date, visibility, and technology stack remain equal
  unless a localized presentation requires otherwise.
- Move the existing published article and project into both locale directories,
  with complete English counterparts rather than mixed-language headings or
  paragraphs. Draft sources receive the same two-source structure so future
  publication does not require a content migration.
- Content collections validate a `locale` value and preserve the existing
  metadata constraints.

## Application structure

- Add a small i18n module containing UI copy, localized site metadata, route
  helpers, locale detection, and translation-key lookup. Components and pages
  consume this module rather than embedding display strings.
- Refactor page templates into locale-aware routes. List and detail queries
  filter collection entries by locale; detail pages resolve the same filename
  in the active collection directory.
- Pass locale and translation availability to cards, header, layout, and
  detail templates. The document `lang`, skip link, navigation labels,
  accessible names, footer, page title, meta description, and article table of
  contents all use the active locale.
- Make the language selector a progressive-enhancement control: localized
  static links work without JavaScript, while its browser event records the
  preference before navigation.

## Error handling and compatibility

- Route generation only includes published content. Missing locale content
  cannot create a detail-page route.
- Direct links to a valid localized route render without client-side language
  redirection; an explicit URL always wins over saved preference.
- The compatibility page preserves the existing route's purpose and sends
  visitors to Chinese, so pre-existing links remain useful.

## Validation

- Add focused automated checks for locale selection precedence, route building,
  and language-pair fallback behavior before implementing those helpers.
- Run the focused tests through a failing-then-passing cycle.
- Run `npm run check`, `npm run build`, and `git diff --check` after the UI and
  content migration. Inspect build output to confirm both locale page trees
  and the legacy compatibility routes exist.

## Scope boundaries

- This change does not add a server, cookies, user accounts, translation API,
  or automatic translation workflow.
- `localStorage` is per browser and origin. Private browsing, cleared storage,
  and a different device do not retain a manual preference.
