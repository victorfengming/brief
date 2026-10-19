export const LOCALES = ['zh', 'en'];
export const DEFAULT_LOCALE = 'zh';

const interfaceCopy = {
  zh: {
    siteTitle: '自动驾驶云端软件工程师',
    navigation: [['首页', ''], ['项目', 'projects/'], ['文章', 'blog/'], ['实验室', 'lab/'], ['关于', 'about/'], ['联系', 'contact/']],
    homeLabel: '返回首页',
    openMenu: '打开导航',
    closeMenu: '关闭导航',
    menu: '菜单',
    primaryNavigation: '主导航',
    skipToContent: '跳转到正文',
    projects: '项目',
    writing: '文章',
    contact: '联系',
    readArticle: '阅读文章',
    readProject: '阅读案例',
    tableOfContents: '本文目录',
    backToBlog: '返回文章列表',
    backToProjects: '返回项目列表',
    language: '中文',
  },
  en: {
    siteTitle: 'Autonomous Driving Software Engineer',
    navigation: [['Home', ''], ['Projects', 'projects/'], ['Writing', 'blog/'], ['Lab', 'lab/'], ['About', 'about/'], ['Contact', 'contact/']],
    homeLabel: 'Back to home',
    openMenu: 'Open navigation',
    closeMenu: 'Close navigation',
    menu: 'Menu',
    primaryNavigation: 'Primary navigation',
    skipToContent: 'Skip to content',
    projects: 'Projects',
    writing: 'Writing',
    contact: 'Contact',
    readArticle: 'Read article',
    readProject: 'Read case study',
    tableOfContents: 'On this page',
    backToBlog: 'Back to writing',
    backToProjects: 'Back to projects',
    language: 'EN',
  },
};

export function isLocale(value) {
  return LOCALES.includes(value);
}

export function localeFromBrowserLanguage(browserLanguage) {
  return browserLanguage?.toLowerCase().startsWith('en') ? 'en' : DEFAULT_LOCALE;
}

export function preferredLocale(savedLocale, browserLanguage) {
  return isLocale(savedLocale) ? savedLocale : localeFromBrowserLanguage(browserLanguage);
}

export function localizedPath(locale, route = '') {
  const suffix = route.replace(/^\/+|\/+$/g, '');
  return `/${locale}/${suffix ? `${suffix}/` : ''}`;
}

export function contentLocale(id) {
  return id.split('/', 1)[0];
}

export function contentKey(id) {
  return id.split(/\/(.+)/)[1] ?? '';
}

export function counterpartPath(locale, type, id, translatedIds) {
  const key = contentKey(id);
  return translatedIds.has(`${locale}/${key}`) ? localizedPath(locale, `${type}/${key}`) : localizedPath(locale, type);
}

export function copy(locale) {
  return interfaceCopy[isLocale(locale) ? locale : DEFAULT_LOCALE];
}
