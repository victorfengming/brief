import assert from 'node:assert/strict';
import test from 'node:test';

import { shouldPublishBlogEntry } from '../src/config/content.ts';

const draftEntry = { data: { draft: true } };
const publishedEntry = { data: { draft: false } };

test('local development shows draft entries', () => {
  assert.equal(
    shouldPublishBlogEntry(draftEntry, {
      isDevelopment: true,
      publishDrafts: false,
    }),
    true,
  );
});

test('production hides draft entries by default', () => {
  assert.equal(
    shouldPublishBlogEntry(draftEntry, {
      isDevelopment: false,
      publishDrafts: false,
    }),
    false,
  );
});

test('production can explicitly include draft entries', () => {
  assert.equal(
    shouldPublishBlogEntry(draftEntry, {
      isDevelopment: false,
      publishDrafts: true,
    }),
    true,
  );
});

test('published entries remain visible in production', () => {
  assert.equal(
    shouldPublishBlogEntry(publishedEntry, {
      isDevelopment: false,
      publishDrafts: false,
    }),
    true,
  );
});
