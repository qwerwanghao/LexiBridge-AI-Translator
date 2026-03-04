import { describe, expect, it } from 'vitest';

import { APIError, StorageError, TimeoutError } from '@/background/errors';

describe('errors', () => {
  it('creates APIError with status context', () => {
    const error = new APIError(401, 'Unauthorized', { message: 'invalid key' });

    expect(error.name).toBe('APIError');
    expect(error.message).toContain('401');
    expect(error.statusText).toBe('Unauthorized');
  });

  it('creates TimeoutError with default message', () => {
    const error = new TimeoutError();

    expect(error.name).toBe('TimeoutError');
    expect(error.message).toBe('Request timed out');
  });

  it('creates StorageError with key', () => {
    const error = new StorageError('boom', 'config');

    expect(error.name).toBe('StorageError');
    expect(error.message).toContain('Storage Error');
    expect(error.key).toBe('config');
  });
});
