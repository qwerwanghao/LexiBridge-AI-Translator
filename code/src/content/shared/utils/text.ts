/**
 * 清洗用户选中文本，避免多余换行导致翻译质量下降。
 */
export function normalizeSelectedText(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}
