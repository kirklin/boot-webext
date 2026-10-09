const WORDS_PER_MINUTE = 200;

export interface ReadingStats {
  words: number;
  minutes: number;
}

/**
 * Counts words with `Intl.Segmenter`, which splits Chinese and Japanese text into words
 * as well as text that separates words with spaces.
 */
export function measureReading(text: string): ReadingStats {
  const segmenter = new Intl.Segmenter(undefined, { granularity: "word" });
  let words = 0;
  for (const segment of segmenter.segment(text)) {
    if (segment.isWordLike) {
      words++;
    }
  }
  return { words, minutes: Math.max(1, Math.ceil(words / WORDS_PER_MINUTE)) };
}
