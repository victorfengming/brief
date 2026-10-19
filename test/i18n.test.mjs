import assert from 'node:assert/strict';
import test from 'node:test';

import {
  counterpartPath,
  contentKey,
  contentLocale,
  localizedPath,
  preferredLocale,
} from '../src/i18n.js';

test('uses an explicit saved locale before browser language', () => {
  assert.equal(preferredLocale('en', 'zh-CN'), 'en');
  assert.equal(preferredLocale('zh', 'en-US'), 'zh');
});

test('uses English only for an English browser language', () => {
  assert.equal(preferredLocale(null, 'en-GB'), 'en');
  assert.equal(preferredLocale(null, 'zh-CN'), 'zh');
  assert.equal(preferredLocale(null, undefined), 'zh');
});

test('builds locale-prefixed routes without duplicate slashes', () => {
  assert.equal(localizedPath('zh', ''), '/zh/');
  assert.equal(localizedPath('en', '/blog/'), '/en/blog/');
});

test('falls back to a localized index when no translated detail exists', () => {
  assert.equal(counterpartPath('en', 'blog', 'zh/mqtt', new Set(['en/mqtt'])), '/en/blog/mqtt/');
  assert.equal(counterpartPath('en', 'blog', 'zh/mqtt', new Set()), '/en/blog/');
});

test('separates locale and translation key from collection IDs', () => {
  assert.equal(contentLocale('en/mqtt-reconnect-demo'), 'en');
  assert.equal(contentKey('zh/mqtt-reconnect-demo'), 'mqtt-reconnect-demo');
});
