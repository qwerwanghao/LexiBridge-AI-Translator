import { StorageError } from '@/background/errors';

/**
 * StorageManager 封装 chrome.storage.local 的异步读写。
 */
export class StorageManager {
  async get(key: string | string[]): Promise<Record<string, unknown>> {
    try {
      return await chrome.storage.local.get(key);
    } catch (error) {
      throw new StorageError((error as Error).message, Array.isArray(key) ? key.join(',') : key);
    }
  }

  async set(key: string, value: unknown): Promise<void> {
    try {
      await chrome.storage.local.set({ [key]: value });
    } catch (error) {
      throw new StorageError((error as Error).message, key);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await chrome.storage.local.remove(key);
    } catch (error) {
      throw new StorageError((error as Error).message, key);
    }
  }

  async clear(): Promise<void> {
    try {
      await chrome.storage.local.clear();
    } catch (error) {
      throw new StorageError((error as Error).message);
    }
  }

  onChanged(callback: (changes: Record<string, chrome.storage.StorageChange>) => void): () => void {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string,
    ): void => {
      if (areaName === 'local') {
        callback(changes);
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }
}
