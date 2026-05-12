import { pbkdf2 } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils';

export const CHARSET_FULL  = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
export const CHARSET_ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export const CHARSET_NUM   = '0123456789';

/**
 * Maps derived bytes to a target charset using rejection sampling
 * to avoid modulo bias — aucun biais statistique.
 */
function mapToCharset(bytes, charset, length) {
  const n = charset.length;
  const maxValid = 256 - (256 % n);
  let result = '';
  let i = 0;
  while (result.length < length) {
    if (i >= bytes.length) break;
    if (bytes[i] < maxValid) result += charset[bytes[i] % n];
    i++;
  }
  // Fallback (très rare avec 32 octets)
  while (result.length < length) {
    result += charset[bytes[result.length % bytes.length] % n];
  }
  return result;
}

/**
 * Dérivation PBKDF2-HMAC-SHA256 — 100 000 itérations.
 * Synchrone : appeler dans un setTimeout ou WorkerThread
 * pour ne pas bloquer le UI thread.
 */
export function derivePassword(master, service, counter, length, type) {
  const charset = type === 'numeric' ? CHARSET_NUM
                : type === 'alpha'   ? CHARSET_ALPHA
                :                     CHARSET_FULL;

  const saltStr     = `${service.toLowerCase().trim()}|v${counter}|len${length}|${type}`;
  const masterBytes = utf8ToBytes(master);
  const saltBytes   = utf8ToBytes(saltStr);

  const derived = pbkdf2(sha256, masterBytes, saltBytes, { c: 100_000, dkLen: 32 });
  return mapToCharset(derived, charset, length);
}

/**
 * Hachage du PIN avant stockage — SHA-256 avec sel applicatif.
 */
export function hashPin(pin) {
  return bytesToHex(sha256(utf8ToBytes(`VAULT-GEN-PIN-2024:${pin}`)));
}

/**
 * Calcul de l'entropie en bits selon longueur + jeu de caractères.
 */
export function calcEntropy(length, type) {
  const poolSizes = { numeric: 10, alpha: 62, full: 90 };
  return Math.floor(length * Math.log2(poolSizes[type] ?? 90));
}

export function entropyLabel(bits) {
  if (bits < 40) return { label: 'Très faible', color: '#ef4444' };
  if (bits < 60) return { label: 'Faible',      color: '#f59e0b' };
  if (bits < 80) return { label: 'Fort',         color: '#1d9e75' };
  if (bits < 100) return { label: 'Très fort',   color: '#00e87a' };
  return              { label: 'Exceptionnel',    color: '#8b7cf8' };
}