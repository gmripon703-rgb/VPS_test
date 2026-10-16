import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateSSHKeyPair,
  formatOpenSSHPublicKey,
  formatOpenSSHPrivateKey,
  calculateFingerprint,
} from './sshCrypto.ts';

test('generateSSHKeyPair creates valid ED25519 keypair with OpenSSH headers', async () => {
  const key = await generateSSHKeyPair('ED25519', 'admin@nexus-cloud');
  assert.equal(key.type, 'ED25519');
  assert.ok(key.publicKey.startsWith('ssh-ed25519 '));
  assert.ok(key.publicKey.includes('admin@nexus-cloud'));
  assert.ok(key.privateKey.includes('-----BEGIN OPENSSH PRIVATE KEY-----'));
  assert.ok(key.privateKey.includes('-----END OPENSSH PRIVATE KEY-----'));
  assert.ok(key.fingerprint.startsWith('SHA256:'));
});

test('generateSSHKeyPair creates valid RSA_4096 keypair with RSA headers', async () => {
  const key = await generateSSHKeyPair('RSA_4096', 'root@render-node');
  assert.equal(key.type, 'RSA_4096');
  assert.ok(key.publicKey.startsWith('ssh-rsa '));
  assert.ok(key.privateKey.includes('-----BEGIN RSA PRIVATE KEY-----'));
  assert.ok(key.privateKey.includes('-----END RSA PRIVATE KEY-----'));
});

test('calculateFingerprint generates consistent SHA256 format', () => {
  const pub = 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGt7x32 test@domain';
  const fp = calculateFingerprint(pub);
  assert.ok(fp.startsWith('SHA256:'));
  assert.equal(fp.length > 15, true);
});
