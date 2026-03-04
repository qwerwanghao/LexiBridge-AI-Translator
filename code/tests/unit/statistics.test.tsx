import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Statistics } from '@/options/components/Statistics';

afterEach(() => {
  cleanup();
});

describe('Statistics', () => {
  it('renders current model label', () => {
    render(<Statistics />);
    expect(screen.getByText(/Current Model:/)).toBeTruthy();
  });
});
