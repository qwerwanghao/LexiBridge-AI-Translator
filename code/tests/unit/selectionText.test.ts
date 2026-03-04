import { describe, expect, it } from 'vitest';

import { normalizeSelectedText } from '@/content/shared/utils/text';

describe('normalizeSelectedText', () => {
  it('trims whitespace and collapses lines', () => {
    const result = normalizeSelectedText('  hello\n\n world  ');
    expect(result).toBe('hello world');
  });
});
