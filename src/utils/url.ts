export const generateShareLink = (ciphertext: string): string => {
  const baseUrl = window.location.origin;
  // We use hash so the data isn't sent to the server (if any) and it looks cleaner
  // Encode the ciphertext to be URL safe
  const encoded = encodeURIComponent(ciphertext);
  return `${baseUrl}/#m=${encoded}`;
};

export const getMemoryFromUrl = (): string | null => {
  const hash = window.location.hash;
  if (!hash) return null;
  
  const params = new URLSearchParams(hash.substring(1)); // remove #
  const encryptedMemory = params.get('m');
  
  if (encryptedMemory) {
    return decodeURIComponent(encryptedMemory);
  }
  return null;
};

