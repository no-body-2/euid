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

/**
 * Create 20 bit Process/ENV Fingerprint Hash
 */
export function getFingerprint20Bits(customSeed?: string): number {
  let envStr = customSeed || "";

  if (!envStr) {
    if (typeof process !== "undefined" && process.pid) {
      envStr += `node_${process.pid}_${process.arch}}`;
    } else if (typeof location !== "undefined") {
      envStr = `browser_${location.host}_${navigator.userAgent}`;
    } else {
      envStr += `random_${Math.random()}`;
    }
  }

  const hash32 = fnv1a32(envStr);

  // Return 0 ~ 0xFFFFF
  return hash32 & 0xfffff;
}
