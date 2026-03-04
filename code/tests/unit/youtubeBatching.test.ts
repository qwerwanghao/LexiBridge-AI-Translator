import { describe, expect, it } from 'vitest';

import {
  buildBatchCandidates,
  composeTranslatedSubtitle,
  composeTranslatedSubtitleProgressive,
  mergeBatchTranslations,
} from '@/content/shared/utils/youtube-batching';

describe('youtube batching utils', () => {
  it('builds unique batch candidates and skips cached segments', () => {
    const cache = new Map<string, string>([['Hello', '你好']]);
    const segments = ['Hello', 'world', 'world', 'from', 'YouTube'];

    const candidates = buildBatchCandidates(segments, cache);

    expect(candidates).toEqual(['world', 'from', 'YouTube']);
  });

  it('merges batch translations into cache', () => {
    const cache = new Map<string, string>();
    mergeBatchTranslations(cache, ['A', 'B'], ['甲', '乙']);

    expect(cache.get('A')).toBe('甲');
    expect(cache.get('B')).toBe('乙');
  });

  it('composes subtitle text from translated segments', () => {
    const cache = new Map<string, string>([
      ['Hello', '你好'],
      ['world', '世界'],
    ]);

    const text = composeTranslatedSubtitle(['Hello', 'world'], cache);
    expect(text).toBe('你好 世界');
  });

  it('returns empty string if any segment is not translated yet', () => {
    const cache = new Map<string, string>([['Hello', '你好']]);

    const text = composeTranslatedSubtitle(['Hello', 'world'], cache);
    expect(text).toBe('');
  });

  it('composes progressive subtitle using original text for missing segments', () => {
    const cache = new Map<string, string>([['Hello', '你好']]);

    const result = composeTranslatedSubtitleProgressive(['Hello', 'world'], cache);
    expect(result).toEqual({
      text: '你好 world',
      complete: false,
    });
  });
});
