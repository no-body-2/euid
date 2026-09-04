// src/engine.ts

import { EMOJI_TABLE } from "./charset";
import { getRandom50Bits } from "./entropy";
import { getFingerprint20Bits } from "./fingerprint";

// Default Custom Epoch - 2026-01-01T00:00:00.000Z
export const DEFAULT_EPOCH = 1767225600000;

// Inner Status Variable
let lastTimestamp = -1;
let counter = 0;

/**
 * EUID bit packing and create core engine
 */
export function generateCoreEUID(options?: {
  epoch?: number;
  fingerprint?: number;
}): string {
  const epoch = options?.epoch ?? DEFAULT_EPOCH;
  const fingerprint = options?.fingerprint ?? getFingerprint20Bits();

  let now = Date.now() - epoch;
  if (now < 0) now = 0; // Before Epoch

  // 1. Increment Counter
  if (now === lastTimestamp) {
    counter = (counter + 1) & 0x3ff;
    if (counter === 0) {
      // 동일 ms 내 1024개 초과 시 다음 ms까지 대기
      while (Date.now() - epoch === lastTimestamp) {
        /* wait */
      }
      now = Date.now() - epoch;
    }
  } else {
    counter = 0;
    lastTimestamp = now;
  }

  // 2. 각 필드를 Bit 연산으로 120 bits BigInt 결합
  // [40b Timestamp] [Fingerprint 20b] [Counter 10b] [Random 50b]
  const tsBig = BigInt(now) & 0xffffffffffn;
  const fpBig = BigInt(fingerprint) & 0xfffffn;
  const counterBig = BigInt(counter) & 0x3ffn;
  const randBig = getRandom50Bits();

  const combined =
    (tsBig << 80n) | (fpBig << 60n) | (counterBig << 50n) | randBig;

  // 3. 120 Bits를 12개의 10bits 씩 나누어 이모지로 변환
  let result = "";
  for (let i = 11; i >= 0; i--) {
    const index = Number((combined >> BigInt(i * 10)) & 0x3ffn);
    result += EMOJI_TABLE[index];
  }

  return result;
}
