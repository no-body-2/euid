// src/fingerprint.ts

/**
 * Simple & Fast FNV-1a 32bit hash function
 */
function fnv1a32(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

// TODO 20 bit function write & learn about fnv1a32
