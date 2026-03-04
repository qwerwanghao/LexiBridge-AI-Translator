import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TermEditor } from '@/options/components/TermEditor';

afterEach(() => {
  cleanup();
});

describe('TermEditor', () => {
  beforeEach(() => {
    const sendMessage = vi.fn(async (message: { type: string }) => {
      if (message.type === 'GET_TERM_TABLES') {
        return { success: true, data: [] };
      }
      if (message.type === 'DELETE_TERM_TABLE') {
        return { success: true, data: { success: true } };
      }
      if (message.type === 'ADD_TERM_TABLE') {
        return { success: true, data: { id: 'default-terms' } };
      }
      return { success: false };
    });

    (globalThis as { chrome?: unknown }).chrome = {
      runtime: {
        sendMessage,
      },
    };
  });

  it('adds term to list', async () => {
    render(<TermEditor />);

    fireEvent.change(screen.getByPlaceholderText('Source'), { target: { value: 'service' } });
    fireEvent.change(screen.getByPlaceholderText('Target'), { target: { value: '服务' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add Term' }));

    expect(await screen.findByText('service → 服务')).toBeTruthy();
    expect(await screen.findByText('Terms saved')).toBeTruthy();
  });
});
