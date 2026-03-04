import { beforeEach, describe, expect, it, vi } from 'vitest';

import { StorageError } from '@/background/errors';
import { StorageManager } from '@/background/storage';

const localState = new Map<string, unknown>();

beforeEach(() => {
  localState.clear();
  const storageLocal = {
    get: vi.fn((keys?: string | string[] | null) => {
      if (!keys) {
        return Promise.resolve(Object.fromEntries(localState));
      }
      if (typeof keys === 'string') {
        return Promise.resolve({ [keys]: localState.get(keys) });
      }
      return Promise.resolve(Object.fromEntries(keys.map((key) => [key, localState.get(key)])));
    }),
    set: vi.fn((items: Record<string, unknown>) => {
      for (const [key, value] of Object.entries(items)) {
        localState.set(key, value);
      }
      return Promise.resolve();
    }),
    remove: vi.fn((key: string) => {
      localState.delete(key);
      return Promise.resolve();
    }),
    clear: vi.fn(() => {
      localState.clear();
      return Promise.resolve();
    }),
  };

  vi.stubGlobal('chrome', {
    storage: {
      local: storageLocal,
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
  });
});

describe('StorageManager', () => {
  it('can set and get values', async () => {
    const manager = new StorageManager();
    await manager.set('config', { key: 'value' });

    const result = await manager.get('config');
    expect(result.config).toEqual({ key: 'value' });
  });

  it('can remove values', async () => {
    const manager = new StorageManager();
    await manager.set('temp', 1);
    await manager.remove('temp');

    const result = await manager.get('temp');
    expect(result.temp).toBeUndefined();
  });

  it('can clear values', async () => {
    const manager = new StorageManager();
    await manager.set('temp', 1);
    await manager.clear();

    const result = await manager.get('temp');
    expect(result.temp).toBeUndefined();
  });

  it('registers and unregisters local storage change listener', () => {
    const manager = new StorageManager();
    const callback = vi.fn();
    const unsubscribe = manager.onChanged(callback);

    const addListenerMock = chrome.storage.onChanged.addListener as unknown as ReturnType<
      typeof vi.fn
    >;
    const removeListenerMock = chrome.storage.onChanged.removeListener as unknown as ReturnType<
      typeof vi.fn
    >;
    const listener = addListenerMock.mock.calls[0][0] as (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => void;

    listener({ config: { oldValue: 1, newValue: 2 } }, 'sync');
    expect(callback).not.toHaveBeenCalled();

    listener({ config: { oldValue: 1, newValue: 2 } }, 'local');
    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
    expect(removeListenerMock).toHaveBeenCalledTimes(1);
  });

  it('wraps underlying storage errors', async () => {
    const manager = new StorageManager();
    vi.mocked(chrome.storage.local.set).mockRejectedValueOnce(new Error('denied'));

    await expect(manager.set('config', {})).rejects.toBeInstanceOf(StorageError);
  });
});
