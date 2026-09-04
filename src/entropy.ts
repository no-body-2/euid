// src/entropy.ts

/**
 * 50 bits BigInt 난수 생성
 */
export function getRandom50Bits(): bigint {
  const bytes = new Uint8Array(7); // 7 * 8 = 56 bits
  globalThis.crypto.getRandomValues(bytes);

  let randomBigInt = 0n;
  for (let i = 0; i < 7; i++) {
    randomBigInt = (randomBigInt << 8n) | BigInt(bytes[i]);
  }

  // 상위 6 bits 제거 후 하위 50 bits 사용
  return randomBigInt ^ 0x3ffffffffffffn;
}
