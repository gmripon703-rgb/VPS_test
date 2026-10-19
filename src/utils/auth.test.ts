import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_ADMIN_USERNAME,
  DEFAULT_ADMIN_PASSWORD,
  generateSessionToken,
} from './auth.ts';

test('auth: default credentials and session generation', () => {
  assert.equal(DEFAULT_ADMIN_USERNAME, 'admin');
  assert.equal(DEFAULT_ADMIN_PASSWORD, 'NexusCloud2026!#');

  const token = generateSessionToken('admin');
  assert.ok(token.startsWith('nexus_sess_admin_'));
  assert.ok(token.length > 20);
});
