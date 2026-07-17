import crypto from 'crypto';
import { getAlfalahConfig } from '../config/alfalah.config';

/**
 * APG RequestHash: the request fields serialized as key=value&key=value...,
 * encrypted with AES-128-CBC (Key1 = key, Key2 = IV, PKCS7 padding), base64-encoded.
 * Verified live against the sandbox on 2026-07-12.
 */
export function generateRequestHash(mapString: string): string {
  const config = getAlfalahConfig();
  const cipher = crypto.createCipheriv(
    'aes-128-cbc',
    Buffer.from(config.key1, 'utf8'),
    Buffer.from(config.key2, 'utf8')
  );
  return Buffer.concat([cipher.update(mapString, 'utf8'), cipher.final()]).toString('base64');
}

/**
 * Serialize fields in insertion order — the same order they are POSTed in.
 */
export function buildMapString(fields: Record<string, string>): string {
  return Object.entries(fields)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
}
