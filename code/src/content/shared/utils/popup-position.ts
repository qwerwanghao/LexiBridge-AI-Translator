interface SelectionRect {
  left: number;
  top: number;
  bottom: number;
}

interface PopupSize {
  width: number;
  height: number;
}

interface ViewportSize {
  width: number;
  height: number;
}

interface PopupPosition {
  x: number;
  y: number;
}

const VIEWPORT_PADDING = 8;

/**
 * 计算翻译卡片坐标，优先显示在选区下方，空间不足时切到上方，并始终限制在视口内。
 */
export function computePopupPosition(
  rect: SelectionRect,
  popupSize: PopupSize,
  viewport: ViewportSize,
): PopupPosition {
  const maxX = Math.max(VIEWPORT_PADDING, viewport.width - popupSize.width - VIEWPORT_PADDING);
  const x = Math.min(Math.max(rect.left + VIEWPORT_PADDING, VIEWPORT_PADDING), maxX);

  const belowY = rect.bottom + VIEWPORT_PADDING;
  const canPlaceBelow = belowY + popupSize.height <= viewport.height - VIEWPORT_PADDING;

  const preferredY = canPlaceBelow ? belowY : rect.top - popupSize.height - VIEWPORT_PADDING;
  const maxY = Math.max(VIEWPORT_PADDING, viewport.height - popupSize.height - VIEWPORT_PADDING);
  const y = Math.min(Math.max(preferredY, VIEWPORT_PADDING), maxY);

  return { x, y };
}
