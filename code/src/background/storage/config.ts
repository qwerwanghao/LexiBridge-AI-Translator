import { StorageManager } from '@/background/storage';

const CONFIG_KEY = 'config';

export async function getConfig(storage: StorageManager): Promise<Record<string, unknown>> {
  const result = await storage.get(CONFIG_KEY);
  return (result[CONFIG_KEY] as Record<string, unknown>) ?? {};
}

export async function setConfig(
  storage: StorageManager,
  value: Record<string, unknown>,
): Promise<void> {
  await storage.set(CONFIG_KEY, value);
}
