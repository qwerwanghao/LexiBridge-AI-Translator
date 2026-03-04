import { StorageManager } from '@/background/storage';
import type { TermTable } from '@/background/types';

const TERM_TABLES_KEY = 'termTables';

export async function getTermTables(storage: StorageManager): Promise<TermTable[]> {
  const result = await storage.get(TERM_TABLES_KEY);
  return (result[TERM_TABLES_KEY] as TermTable[] | undefined) ?? [];
}

export async function setTermTables(storage: StorageManager, tables: TermTable[]): Promise<void> {
  await storage.set(TERM_TABLES_KEY, tables);
}
