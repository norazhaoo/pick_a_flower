export const generateShareLink = (ciphertext: string): string => {
  // Get the full base URL including subdirectory (e.g. /pick_a_flower/)
  // window.location.origin only gives the domain
  const baseUrl = window.location.origin + window.location.pathname;
  
  // Encode the ciphertext to be URL safe
  const encoded = encodeURIComponent(ciphertext);
  return `${baseUrl}#m=${encoded}`;
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

