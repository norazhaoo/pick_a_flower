import type { EncryptedMemoryPayload } from './crypto';

export function serializePayload(payload: EncryptedMemoryPayload): string {
  const json = JSON.stringify(payload);
  return encodeURIComponent(window.btoa(json));
}

export function deserializePayload(encoded: string): EncryptedMemoryPayload | null {
  try {
    const json = window.atob(decodeURIComponent(encoded));
    const payload = JSON.parse(json);
    
    // Basic validation
    if (
      payload.version === 1 &&
      payload.algorithm === 'AES-GCM' &&
      typeof payload.salt === 'string' &&
      typeof payload.iv === 'string' &&
      typeof payload.ciphertext === 'string'
    ) {
      return payload as EncryptedMemoryPayload;
    }
    return null;
  } catch (e) {
    console.error("Failed to deserialize payload", e);
    return null;
  }
}

