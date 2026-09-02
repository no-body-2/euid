// scripts/generate-charset.ts

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

function main() {
  console.log("1024개 Emoji 추출 중...");
  const table = generateEmojiTableBase1024();

  const fileContent = `// ⚠️ 이 파일은 시스템에 의해 자동 생성된 정적 매핑 테이블입니다.
    // 절대 직접 수정하지 마십시오.
    
    /** 1024 Emoji Static Table (Base1024 / 10bits) */
    export const EMOJI_TABLE: readonly string[] = Object.freeze(${JSON.stringify(table, null, 2)});

    /** Emoji -> 10bit Integer Reverse Mapping */
    export const EMOJI_REVERSE_MAP: ReadonlyMap<string, number> = new Map(EMOJI_TABLE.map((emoji, index) => [emoji, index]));
    `;

  const outputPath = resolve(process.cwd(), "src/charset.ts");
  writeFileSync(outputPath, fileContent, "utf-8");
  console.log("성공적으로 생성 완료하였습니다.");
}

/**
 * Emoji 3중 검증 로직
 */
export function isSafeEmoji(emoji: string): boolean {
  // 1. Intl.Segmenter 기준 Grapheme Cluster가 1개인지 검증
  const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
  const segments = Array.from(segmenter.segment(emoji));
  if (segments.length !== 1) return false;

  // 2. JavaScript String Iterator 기준 Code Point 1개인지 검증
  const codePoints = Array.from(emoji);
  if (codePoints.length !== 1) return false;

  // 3. UTF-16 surrogate pair 길이가 2인지 검증
  if (emoji.length !== 2) return false;

  // 4. 정규식을 통해 금지된 유니코드(변형 선택자, ZWJ, 피부색 modifier) 여부 검사
  const codePoint = emoji.codePointAt(0) ?? 0;
  if (codePoint >= 0x1f3fb && codePoint <= 0x1f3ff) return false; // 피부색 Modifier 제외

  const forbidden = /[\uFE00-\uFE0F\u200D]/u;
  if (forbidden.test(emoji)) return false;

  return true;
}

/**
 * Create Base1024 Emoji Table
 */
export function generateEmojiTableBase1024(): string[] {
  const table: string[] = [];

  // 안전한 단일 이모지 탐색
  const ranges: [number, number][] = [
    [0x1f300, 0x1f5ff], // 기타 기호 | Miscellaneous Symbols and Pictographs
    [0x1f600, 0x1f64f], // 감정 표현 | Emoticons
    [0x1f680, 0x1f6ff], // 교통 및 지도 | Transport and Map Symbols
    [0x1f900, 0x1f9ff], // 추가 기호 | Supplemental Symbols and Pictographs
    [0x1fa70, 0x1faff], // 기호 및 그림 확장-A | Symbols and Pictographs Extended-A
  ];

  for (const [start, end] of ranges) {
    for (let cp = start; cp <= end; cp++) {
      const emoji = String.fromCodePoint(cp);
      if (isSafeEmoji(emoji)) {
        table.push(emoji);
        if (table.length === 1024) {
          return table;
        }
      }
    }
  }

  if (table.length < 1024) {
    throw new Error(
      `최소 이모지 개수가 충족되지 않았습니다. (현재: ${table.length}개 / 필요 수: ${1024 - table.length}개)`,
    );
  }

  return table;
}

main();
