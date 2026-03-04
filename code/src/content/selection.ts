import { TranslationPopup } from '@/content/shared/ui/popup';
import { computePopupPosition } from '@/content/shared/utils/popup-position';
import { matchesShortcut } from '@/content/shared/utils/shortcut';
import { normalizeSelectedText } from '@/content/shared/utils/text';

interface TranslatePayload {
  text: string;
  to: string;
  domain: string;
}

interface GetConfigResponse {
  success: boolean;
  data?: {
    keyboard?: {
      toggleTranslation?: string;
    };
  };
}

interface TranslateResponse {
  success: boolean;
  data?: {
    translatedText?: string;
  };
  error?: {
    message: string;
  };
}

const POPUP_SIZE = { width: 360, height: 120 };
const FALLBACK_RECT = { left: 24, top: 24, bottom: 24 };
const DEFAULT_SHORTCUT = 'Alt+T';

export class SelectionTranslator {
  private readonly popup: TranslationPopup;
  private shortcut: string;
  private initialized: boolean;

  constructor() {
    this.popup = new TranslationPopup();
    this.shortcut = DEFAULT_SHORTCUT;
    this.initialized = false;
  }

  init(): void {
    if (this.initialized) {
      return;
    }

    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('keydown', this.onKeyDown);
    this.initialized = true;
    void this.loadShortcut();
  }

  destroy(): void {
    if (!this.initialized) {
      return;
    }

    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('keydown', this.onKeyDown);
    this.initialized = false;
  }

  private readonly onMouseUp = (): void => {
    void this.handleSelection();
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (!matchesShortcut(event, this.shortcut)) {
      return;
    }

    event.preventDefault();
    void this.handleSelection();
  };

  private async loadShortcut(): Promise<void> {
    const response = (await chrome.runtime.sendMessage({
      type: 'GET_CONFIG',
      payload: null,
      timestamp: Date.now(),
    })) as GetConfigResponse;

    const configuredShortcut = response.data?.keyboard?.toggleTranslation;
    if (response.success && configuredShortcut) {
      this.shortcut = configuredShortcut;
    }
  }

  private async handleSelection(): Promise<void> {
    const context = this.readSelectionContext();
    if (!context) {
      this.popup.hide();
      return;
    }

    const { text, position } = context;
    this.popup.show('Translating...', position);

    const payload: TranslatePayload = {
      text,
      to: 'zh-CN',
      domain: window.location.hostname,
    };

    const response = (await chrome.runtime.sendMessage({
      type: 'TRANSLATE',
      payload,
      timestamp: Date.now(),
    })) as TranslateResponse;

    this.renderTranslationResponse(response, position);
  }

  private readSelectionContext(): { text: string; position: { x: number; y: number } } | null {
    const selection = window.getSelection();
    const text = this.getSelectionText(selection);
    if (!text) {
      return null;
    }

    const rect = this.getSelectionRect(selection);
    const position = computePopupPosition(rect, POPUP_SIZE, {
      width: window.innerWidth,
      height: window.innerHeight,
    });

    return { text, position };
  }

  private renderTranslationResponse(
    response: TranslateResponse,
    position: { x: number; y: number },
  ): void {
    if (response.success && response.data?.translatedText) {
      this.popup.show(response.data.translatedText, position);
      return;
    }

    this.popup.show(response.error?.message ?? 'Translation failed', position);
  }

  private getSelectionText(selection: Selection | null): string {
    return normalizeSelectedText(selection?.toString() ?? '');
  }

  private getSelectionRect(selection: Selection | null): {
    left: number;
    top: number;
    bottom: number;
  } {
    if (!selection?.rangeCount) {
      return FALLBACK_RECT;
    }

    const rawRect = selection.getRangeAt(0).getBoundingClientRect();
    return {
      left: rawRect.left || FALLBACK_RECT.left,
      top: rawRect.top || FALLBACK_RECT.top,
      bottom: rawRect.bottom || FALLBACK_RECT.bottom,
    };
  }
}

const selectionTranslator = new SelectionTranslator();
selectionTranslator.init();
