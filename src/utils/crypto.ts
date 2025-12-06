import CryptoJS from 'crypto-js';

export const encryptMemory = (text: string, key: string): string => {
  if (!text || !key) return '';
  return CryptoJS.AES.encrypt(text, key).toString();
};

export const decryptMemory = (ciphertext: string, key: string): string | null => {
  if (!ciphertext || !key) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText || null;
  } catch (e) {
    console.error("Decryption failed", e);
    return null;
  }
};

