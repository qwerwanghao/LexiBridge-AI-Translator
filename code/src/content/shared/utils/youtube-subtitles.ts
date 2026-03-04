interface SubtitleSnapshot {
  text: string;
  segments: string[];
}

const SUBTITLE_ROOT_SELECTORS = ['.ytp-caption-window-container', '.caption-window'];

const PRIMARY_SEGMENT_SELECTOR = '.ytp-caption-segment';
const FALLBACK_SEGMENT_SELECTOR = '.caption-visual-line';

/**
 * 定位 YouTube 当前页面可见字幕根节点。
 */
export function findSubtitleRoot(root: ParentNode): HTMLElement | null {
  for (const selector of SUBTITLE_ROOT_SELECTORS) {
    const container = root.querySelector<HTMLElement>(selector);
    if (container) {
      return container;
    }
  }

  return null;
}

/**
 * 从字幕根节点提取当前可见字幕文本。
 */
export function extractSubtitleSnapshot(root: ParentNode): SubtitleSnapshot | null {
  const container = findSubtitleRoot(root);
  if (!container) {
    return null;
  }

  const primarySegments = Array.from(
    container.querySelectorAll<HTMLElement>(PRIMARY_SEGMENT_SELECTOR),
  )
    .map((element) => element.textContent?.trim() ?? '')
    .filter(Boolean);

  const fallbackSegments = Array.from(
    container.querySelectorAll<HTMLElement>(FALLBACK_SEGMENT_SELECTOR),
  )
    .map((element) => element.textContent?.trim() ?? '')
    .filter(Boolean);

  const rawSegments = primarySegments.length ? primarySegments : fallbackSegments;
  const segments = normalizeSegments(rawSegments);

  if (!segments.length) {
    return null;
  }

  return {
    text: segments.join(' '),
    segments,
  };
}

function normalizeSegments(segments: string[]): string[] {
  const compacted = segments.filter((text, index, all) => index === 0 || text !== all[index - 1]);
  return collapseRepeatedSequence(compacted);
}

// Handles patterns like [A, B, A, B] caused by duplicated subtitle extraction.
function collapseRepeatedSequence(segments: string[]): string[] {
  if (segments.length < 2 || segments.length % 2 !== 0) {
    return segments;
  }

  const half = segments.length / 2;
  for (let index = 0; index < half; index += 1) {
    if (segments[index] !== segments[index + half]) {
      return segments;
    }
  }
  return segments.slice(0, half);
}
