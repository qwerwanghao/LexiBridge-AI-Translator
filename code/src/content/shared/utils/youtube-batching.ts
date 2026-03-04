/**
 * 基于当前字幕片段和已翻译缓存，生成待批量翻译列表。
 */
export function buildBatchCandidates(
  segments: string[],
  translationCache: Map<string, string>,
): string[] {
  const unique = new Set<string>();

  for (const segment of segments) {
    const normalized = segment.trim();
    if (!normalized) {
      continue;
    }
    if (translationCache.has(normalized)) {
      continue;
    }
    unique.add(normalized);
  }

  return [...unique];
}

/**
 * 将批量翻译结果合并到本地字幕翻译缓存。
 */
export function mergeBatchTranslations(
  translationCache: Map<string, string>,
  requestedSegments: string[],
  translatedSegments: string[],
): void {
  requestedSegments.forEach((segment, index) => {
    const translated = translatedSegments[index]?.trim();
    if (translated) {
      translationCache.set(segment, translated);
    }
  });
}

/**
 * 若所有片段均已命中缓存，则拼接最终字幕译文。
 */
export function composeTranslatedSubtitle(
  segments: string[],
  translationCache: Map<string, string>,
): string {
  const translatedSegments: string[] = [];

  for (const segment of segments) {
    const normalized = segment.trim();
    if (!normalized) {
      continue;
    }

    const translated = translationCache.get(normalized);
    if (!translated) {
      return '';
    }

    translatedSegments.push(translated);
  }

  return translatedSegments.join(' ');
}

/**
 * 按可用翻译即时拼接字幕，未命中的片段回退为原文。
 */
export function composeTranslatedSubtitleProgressive(
  segments: string[],
  translationCache: Map<string, string>,
): { text: string; complete: boolean } {
  const merged: string[] = [];
  let complete = true;

  for (const segment of segments) {
    const normalized = segment.trim();
    if (!normalized) {
      continue;
    }

    const translated = translationCache.get(normalized);
    if (translated) {
      merged.push(translated);
      continue;
    }

    complete = false;
    merged.push(normalized);
  }

  return {
    text: merged.join(' '),
    complete,
  };
}
