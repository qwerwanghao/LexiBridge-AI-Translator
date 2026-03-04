import { describe, expect, it, vi } from 'vitest';

import { MessageDispatcher } from '@/background/dispatcher';

describe('MessageDispatcher', () => {
  it('routes translate message to handler', async () => {
    const dispatcher = new MessageDispatcher({
      TRANSLATE: vi.fn(async () => ({ text: 'ok' })),
    });

    const response = await dispatcher.dispatch({
      type: 'TRANSLATE',
      payload: { text: 'hello', to: 'zh-CN' },
      timestamp: Date.now(),
    });

    expect(response.success).toBe(true);
    expect(response.data).toEqual({ text: 'ok' });
  });

  it('returns error for unknown message type', async () => {
    const dispatcher = new MessageDispatcher({});

    const response = await dispatcher.dispatch({
      type: 'UNKNOWN',
      payload: {},
      timestamp: Date.now(),
    });

    expect(response.success).toBe(false);
    expect(response.error?.code).toBe('UNKNOWN_MESSAGE_TYPE');
  });

  it('returns handler error when handler throws', async () => {
    const dispatcher = new MessageDispatcher({
      TRANSLATE: vi.fn(async () => {
        throw new Error('boom');
      }),
    });

    const response = await dispatcher.dispatch({
      type: 'TRANSLATE',
      payload: { text: 'hello' },
      timestamp: Date.now(),
    });

    expect(response.success).toBe(false);
    expect(response.error?.code).toBe('HANDLER_ERROR');
    expect(response.error?.message).toBe('boom');
  });
});
