import {
  buildBatchCandidates,
  composeTranslatedSubtitle,
  composeTranslatedSubtitleProgressive,
  mergeBatchTranslations,
} from '@/content/shared/utils/youtube-batching';
import { extractSubtitleSnapshot } from '@/content/shared/utils/youtube-subtitles';

interface TranslateResponse {
  success: boolean;
  data?: {
    translatedText?: string;
  };
  error?: {
    message?: string;
  };
}

interface BatchTranslateResponse {
  success: boolean;
  data?: Array<{
    translatedText?: string;
  }>;
  error?: {
    message?: string;
  };
}

const BATCH_WINDOW_MS = 40;
const MAX_BATCH_SIZE = 8;

class YouTubeSubtitleTranslator {
  private readonly container: HTMLDivElement;
  private readonly originalLine: HTMLDivElement;
  private readonly translatedLine: HTMLDivElement;
  private observer: MutationObserver | null;
  private lastSubtitleText: string;
  private readonly translationCache: Map<string, string>;
  private readonly pendingSegments: Set<string>;
  private readonly inFlightSegments: Set<string>;
  private flushTimer: number | null;
  private wholeSubtitleInFlightText: string | null;

  constructor() {
    this.container = document.createElement('div');
    this.originalLine = document.createElement('div');
    this.translatedLine = document.createElement('div');
    this.observer = null;
    this.lastSubtitleText = '';
    this.translationCache = new Map<string, string>();
    this.pendingSegments = new Set<string>();
    this.inFlightSegments = new Set<string>();
    this.flushTimer = null;
    this.wholeSubtitleInFlightText = null;

    this.container.id = 'lexibridge-youtube-bilingual';
    this.container.style.position = 'fixed';
    this.container.style.bottom = '72px';
    this.container.style.left = '50%';
    this.container.style.transform = 'translateX(-50%)';
    this.container.style.zIndex = '2147483647';
    this.container.style.maxWidth = '80vw';
    this.container.style.padding = '8px 12px';
    this.container.style.borderRadius = '10px';
    this.container.style.backgroundColor = 'rgba(0, 0, 0, 0.65)';
    this.container.style.color = '#ffffff';
    this.container.style.fontSize = '32px';
    this.container.style.lineHeight = '1.45';
    this.container.style.textAlign = 'center';
    this.container.style.pointerEvents = 'none';
    this.container.style.display = 'none';

    this.originalLine.style.fontWeight = '600';
    this.translatedLine.style.marginTop = '6px';
    this.translatedLine.style.opacity = '0.95';

    this.container.append(this.originalLine, this.translatedLine);
  }

  init(): void {
    if (!window.location.hostname.includes('youtube.com')) {
      return;
    }

    if (!document.body.contains(this.container)) {
      document.body.appendChild(this.container);
    }

    this.observer = new MutationObserver(() => {
      void this.handleSubtitleChange();
    });

    this.observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
    });

    void this.handleSubtitleChange();
  }

  private async handleSubtitleChange(): Promise<void> {
    if (document.visibilityState === 'hidden') {
      return;
    }

    const snapshot = extractSubtitleSnapshot(document);
    if (!this.prepareSnapshot(snapshot)) {
      return;
    }

    const sourceText = snapshot.text;
    const completed = this.renderPendingSubtitle(snapshot);
    const candidates = this.collectBatchCandidates(snapshot.segments);
    this.enqueueBatch(candidates);

    if (candidates.length || completed) {
      return;
    }

    await this.translateWholeSubtitle(sourceText);
  }

  private enqueueBatch(segments: string[]): void {
    segments.forEach((segment) => this.pendingSegments.add(segment));
    if (!this.pendingSegments.size || this.flushTimer !== null) {
      return;
    }

    this.flushTimer = window.setTimeout(() => {
      void this.flushPendingTranslations();
    }, BATCH_WINDOW_MS);
  }

  private async flushPendingTranslations(): Promise<void> {
    this.flushTimer = null;

    const batch = [...this.pendingSegments].slice(0, MAX_BATCH_SIZE);
    if (!batch.length) {
      return;
    }

    batch.forEach((segment) => {
      this.pendingSegments.delete(segment);
      this.inFlightSegments.add(segment);
    });

    const response = (await chrome.runtime.sendMessage({
      type: 'TRANSLATE_BATCH',
      payload: {
        texts: batch,
        to: 'zh-CN',
        domain: window.location.hostname,
        concurrency: 3,
      },
      timestamp: Date.now(),
    })) as BatchTranslateResponse;

    if (response.success && response.data?.length) {
      const translatedSegments = response.data.map((item) => item.translatedText ?? '');
      mergeBatchTranslations(this.translationCache, batch, translatedSegments);
      this.renderLatestSubtitleFromCache();
    }

    batch.forEach((segment) => this.inFlightSegments.delete(segment));

    if (this.pendingSegments.size > 0) {
      this.enqueueBatch([]);
      return;
    }

    const latestSnapshot = extractSubtitleSnapshot(document);
    if (!latestSnapshot || latestSnapshot.text !== this.lastSubtitleText) {
      return;
    }

    const composed = composeTranslatedSubtitle(latestSnapshot.segments, this.translationCache);
    if (!composed) {
      void this.translateWholeSubtitleOnce(latestSnapshot.text);
    }
  }

  private renderLatestSubtitleFromCache(): void {
    const snapshot = extractSubtitleSnapshot(document);
    if (!snapshot || snapshot.text !== this.lastSubtitleText) {
      return;
    }

    const composed = composeTranslatedSubtitle(snapshot.segments, this.translationCache);
    if (composed) {
      this.translatedLine.textContent = composed;
    }
  }

  private prepareSnapshot(
    snapshot: ReturnType<typeof extractSubtitleSnapshot>,
  ): snapshot is NonNullable<ReturnType<typeof extractSubtitleSnapshot>> {
    if (!snapshot) {
      this.container.style.display = 'none';
      this.lastSubtitleText = '';
      return false;
    }

    if (snapshot.text === this.lastSubtitleText) {
      return false;
    }

    this.lastSubtitleText = snapshot.text;
    this.container.style.display = 'block';
    this.originalLine.textContent = snapshot.text;
    return true;
  }

  private renderPendingSubtitle(
    snapshot: NonNullable<ReturnType<typeof extractSubtitleSnapshot>>,
  ): boolean {
    const progressive = composeTranslatedSubtitleProgressive(
      snapshot.segments,
      this.translationCache,
    );
    this.translatedLine.textContent = progressive.text || 'Translating...';
    return progressive.complete;
  }

  private collectBatchCandidates(segments: string[]): string[] {
    return buildBatchCandidates(segments, this.translationCache).filter(
      (segment) => !this.inFlightSegments.has(segment),
    );
  }

  private async translateWholeSubtitle(sourceText: string): Promise<void> {
    const response = (await chrome.runtime.sendMessage({
      type: 'TRANSLATE',
      payload: {
        text: sourceText,
        to: 'zh-CN',
        domain: window.location.hostname,
      },
      timestamp: Date.now(),
    })) as TranslateResponse;

    // 只渲染最新字幕，避免慢响应覆盖新字幕。
    if (sourceText !== this.lastSubtitleText) {
      return;
    }

    if (response.success && response.data?.translatedText) {
      this.translatedLine.textContent = response.data.translatedText;
      return;
    }

    this.translatedLine.textContent = response.error?.message ?? 'Translation failed';
  }

  private async translateWholeSubtitleOnce(sourceText: string): Promise<void> {
    if (this.wholeSubtitleInFlightText === sourceText) {
      return;
    }

    this.wholeSubtitleInFlightText = sourceText;
    try {
      await this.translateWholeSubtitle(sourceText);
    } finally {
      if (this.wholeSubtitleInFlightText === sourceText) {
        this.wholeSubtitleInFlightText = null;
      }
    }
  }
}

const youtubeSubtitleTranslator = new YouTubeSubtitleTranslator();
youtubeSubtitleTranslator.init();
