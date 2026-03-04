import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfigPanel } from '@/options/components/ConfigPanel';
import { useOptionsStore } from '@/options/store';

describe('ConfigPanel', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    (globalThis as { chrome?: unknown }).chrome = {
      runtime: {
        sendMessage: vi.fn().mockResolvedValue({ success: true }),
      },
    };

    useOptionsStore.setState({
      apiConfig: {
        baseUrl: 'https://api.openai.com',
        apiKey: '',
        model: 'gpt-4o-mini',
      },
      autoTranslate: false,
    });
  });

  it('updates model in store when input changes', () => {
    render(<ConfigPanel />);

    const modelInput = screen.getByLabelText('Model');
    fireEvent.change(modelInput, { target: { value: 'gpt-4.1-mini' } });

    expect(useOptionsStore.getState().apiConfig.model).toBe('gpt-4.1-mini');
  });

  it('shows saved message after click save', async () => {
    render(<ConfigPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Saved locally')).toBeTruthy();
  });

  it('uses password input for api key', () => {
    render(<ConfigPanel />);

    const apiKey = screen.getByLabelText('API Key');
    expect(apiKey.getAttribute('type')).toBe('password');
  });

  it('shows validation error for non-https base url', async () => {
    render(<ConfigPanel />);

    fireEvent.change(screen.getByLabelText('Base URL'), {
      target: { value: 'http://example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Base URL must start with https://')).toBeTruthy();
  });
});
