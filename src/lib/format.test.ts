import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readTime, formatDate } from './format.ts';

test('readTime rounds words/200 with a 1 min floor', () => {
  assert.equal(readTime(''), '1 min');
  assert.equal(readTime('word '.repeat(50)), '1 min');
  assert.equal(readTime('word '.repeat(1200)), '6 min');
});

test('formatDate renders short month, day, year in UTC', () => {
  assert.equal(formatDate(new Date('2026-09-04')), 'Sep 4, 2026');
  assert.equal(formatDate(new Date('2026-06-30')), 'Jun 30, 2026');
});
