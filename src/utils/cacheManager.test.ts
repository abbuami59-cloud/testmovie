import test from 'node:test';
import assert from 'node:assert/strict';
import { formatSyncTime } from './cacheManager.ts';

test('formatSyncTime returns Just now for recent timestamps', () => {
  const now = Date.now();
  assert.equal(formatSyncTime(now - 10000), 'Just now');
});

test('formatSyncTime returns minutes ago', () => {
  const now = Date.now();
  assert.equal(formatSyncTime(now - 5 * 60 * 1000), '5m ago');
});

test('formatSyncTime returns hours ago', () => {
  const now = Date.now();
  assert.equal(formatSyncTime(now - 2 * 60 * 60 * 1000), '2h ago');
});
