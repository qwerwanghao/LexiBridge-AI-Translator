const DEFAULT_SHORTCUT = 'Alt+T';

interface ShortcutParts {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}

function parseShortcut(shortcut: string): ShortcutParts {
  const normalized = shortcut
    .split('+')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.toLowerCase());

  const keyPart = normalized.find(
    (part) => !['alt', 'ctrl', 'control', 'shift', 'meta', 'cmd'].includes(part),
  );

  return {
    key: (keyPart ?? 't').toLowerCase(),
    altKey: normalized.includes('alt'),
    ctrlKey: normalized.includes('ctrl') || normalized.includes('control'),
    metaKey: normalized.includes('meta') || normalized.includes('cmd'),
    shiftKey: normalized.includes('shift'),
  };
}

/**
 * 检查键盘事件是否命中配置快捷键，默认使用 Alt+T。
 */
export function matchesShortcut(event: KeyboardEvent, shortcut?: string): boolean {
  const parts = parseShortcut(shortcut ?? DEFAULT_SHORTCUT);
  const eventKey = event.key.length === 1 ? event.key.toLowerCase() : event.key.toLowerCase();

  return (
    eventKey === parts.key &&
    event.altKey === parts.altKey &&
    event.ctrlKey === parts.ctrlKey &&
    event.metaKey === parts.metaKey &&
    event.shiftKey === parts.shiftKey
  );
}
