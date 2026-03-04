import { describe, expect, it } from 'vitest';

import { matchesShortcut } from '@/content/shared/utils/shortcut';

describe('matchesShortcut', () => {
  it('matches default Alt+T shortcut', () => {
    const event = new KeyboardEvent('keydown', { key: 't', altKey: true });
    expect(matchesShortcut(event)).toBe(true);
  });

  it('matches custom shortcut with modifiers', () => {
    const event = new KeyboardEvent('keydown', { key: 'K', ctrlKey: true, shiftKey: true });
    expect(matchesShortcut(event, 'Ctrl+Shift+K')).toBe(true);
  });

  it('rejects non-matching shortcut', () => {
    const event = new KeyboardEvent('keydown', { key: 't', altKey: false });
    expect(matchesShortcut(event)).toBe(false);
  });
});
