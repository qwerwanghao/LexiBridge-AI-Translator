interface SubtitleSnapshot {
  text: string;
  segments: string[];
}

const SUBTITLE_ROOT_SELECTORS = ['.ytp-caption-window-container', '.caption-window'];

const SUBTITLE_SEGMENT_SELECTORS = [
  '.ytp-caption-segment',
  '.caption-visual-line .ytp-caption-segment',
];

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

  const segments = SUBTITLE_SEGMENT_SELECTORS.flatMap((selector) =>
    Array.from(container.querySelectorAll<HTMLElement>(selector)),
  )
    .map((element) => element.textContent?.trim() ?? '')
    .filter(Boolean)
    .filter((text, index, all) => all.indexOf(text) === index);

  if (!segments.length) {
    return null;
  }

  return {
    text: segments.join(' '),
    segments,
  };
}
