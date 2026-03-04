import { describe, expect, it } from 'vitest';

import { computePopupPosition } from '@/content/shared/utils/popup-position';

describe('computePopupPosition', () => {
  it('places popup below selection when space is enough', () => {
    const position = computePopupPosition(
      { left: 120, top: 80, bottom: 110 },
      { width: 360, height: 120 },
      { width: 1280, height: 720 },
    );

    expect(position.x).toBe(128);
    expect(position.y).toBe(118);
  });

  it('places popup above selection when near viewport bottom', () => {
    const position = computePopupPosition(
      { left: 200, top: 650, bottom: 680 },
      { width: 360, height: 120 },
      { width: 1280, height: 720 },
    );

    expect(position.y).toBe(522);
  });

  it('clamps popup inside viewport bounds', () => {
    const position = computePopupPosition(
      { left: 980, top: 20, bottom: 40 },
      { width: 360, height: 120 },
      { width: 1280, height: 720 },
    );

    expect(position.x).toBe(912);
    expect(position.y).toBe(48);
  });
});
