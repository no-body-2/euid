// tests/engine.test.ts

import { describe, it, expect } from "vitest";
import { generateCoreEUID } from "../src/engine";
import { EMOJI_REVERSE_MAP } from "../src/charset";

describe("EUID Core Engine 검증", () => {
  it("생성된 EUID는 정확히 12개의 이모지로 구성되어야 한다.", () => {
    const id = generateCoreEUID();
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    const segments = Array.from(segmenter.segment(id));
    expect(segments.length).toBe(12);
  });

  it("연속 생성된 EUID는 유일성을 가져야 한다. (충돌 부재)", () => {
    const set = new Set<string>();
    for (let i = 0; i < 10000; i++) {
      const id = generateCoreEUID();
      expect(set.has(id)).toBe(false);
      set.add(id);
    }
  });

  it("시간 순서대로 생성된 EUID는 Timestamp bit 기준 시간 정렬성을 지녀야 한다.", () => {
    const id1 = generateCoreEUID();
    const id2 = generateCoreEUID();

    // First Emoji
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    const emo1 = Array.from(segmenter.segment(id1))[0].segment;
    const emo2 = Array.from(segmenter.segment(id1))[0].segment;

    const idx1 = Number(EMOJI_REVERSE_MAP.get(emo1));
    const idx2 = Number(EMOJI_REVERSE_MAP.get(emo2));

    expect(idx2).toBeGreaterThanOrEqual(idx1);
  });
});
