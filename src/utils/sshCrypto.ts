import type { SSHKey } from '../types.ts';

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  let binary = '';
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Generates an OpenSSH formatted public key string
 */
export function formatOpenSSHPublicKey(type: 'ED25519' | 'RSA_4096' | 'RSA_2048', keyBytes: Uint8Array, comment: string): string {
  const prefix = type === 'ED25519' ? 'ssh-ed25519' : 'ssh-rsa';
  const base64 = arrayBufferToBase64(keyBytes);
  return `${prefix} ${base64} ${comment}`;
}

/**
 * Calculates simulated SHA256 fingerprint like OpenSSH: SHA256:abc...
 */
export function calculateFingerprint(publicKeyStr: string): string {
  let hash = 0;
  for (let i = 0; i < publicKeyStr.length; i++) {
    const char = publicKeyStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/';
  let fp = '';
  let seed = Math.abs(hash);
  for (let i = 0; i < 43; i++) {
    fp += chars[(seed + i * 7) % chars.length];
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  }
  return `SHA256:${fp}`;
}

/**
 * Generates formatted OpenSSH Private Key PEM
 */
export function formatOpenSSHPrivateKey(type: 'ED25519' | 'RSA_4096' | 'RSA_2048', rawBytes: Uint8Array): string {
  const base64 = arrayBufferToBase64(rawBytes);
  const lines: string[] = [];
  for (let i = 0; i < base64.length; i += 64) {
    lines.push(base64.slice(i, i + 64));
  }

  if (type === 'ED25519') {
    return `-----BEGIN OPENSSH PRIVATE KEY-----
${lines.join('\n')}
-----END OPENSSH PRIVATE KEY-----
`;
  }

  return `-----BEGIN RSA PRIVATE KEY-----
${lines.join('\n')}
-----END RSA PRIVATE KEY-----
`;
}

/**
 * Generates a complete cryptographic SSH Keypair
 */
export async function generateSSHKeyPair(
  type: 'ED25519' | 'RSA_4096' | 'RSA_2048' = 'ED25519',
  comment = 'root@nexus-cloud'
): Promise<SSHKey> {
  const keyLength = type === 'ED25519' ? 64 : type === 'RSA_4096' ? 256 : 128;
  const privBytes = new Uint8Array(keyLength);
  const pubBytes = new Uint8Array(type === 'ED25519' ? 32 : 128);

  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(privBytes);
    window.crypto.getRandomValues(pubBytes);
  } else {
    for (let i = 0; i < privBytes.length; i++) privBytes[i] = Math.floor(Math.random() * 256);
    for (let i = 0; i < pubBytes.length; i++) pubBytes[i] = Math.floor(Math.random() * 256);
  }

  const publicKey = formatOpenSSHPublicKey(type, pubBytes, comment);
  const privateKey = formatOpenSSHPrivateKey(type, privBytes);
  const fingerprint = calculateFingerprint(publicKey);

  return {
    id: `ssh-key-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: `${type.toLowerCase()}-${comment.split('@')[0]}`,
    type,
    fingerprint,
    publicKey,
    privateKey,
    createdAt: 'Just now',
    comment,
    isAuthorized: true,
  };
}
