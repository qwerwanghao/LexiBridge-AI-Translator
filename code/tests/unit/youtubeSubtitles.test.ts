import { describe, expect, it } from 'vitest';

import {
  extractSubtitleSnapshot,
  findSubtitleRoot,
} from '@/content/shared/utils/youtube-subtitles';

describe('youtube subtitles utils', () => {
  it('finds subtitle root container', () => {
    document.body.innerHTML = `
      <div class="ytp-caption-window-container">
        <span class="ytp-caption-segment">Hello world</span>
      </div>
    `;

    const root = findSubtitleRoot(document);
    expect(root).toBeTruthy();
    expect(root?.className).toContain('ytp-caption-window-container');
  });

  it('extracts normalized subtitle text from visible segments', () => {
    document.body.innerHTML = `
      <div class="ytp-caption-window-container">
        <span class="ytp-caption-segment">  Hello </span>
        <span class="ytp-caption-segment">world </span>
        <span class="ytp-caption-segment">world </span>
      </div>
    `;

    const snapshot = extractSubtitleSnapshot(document);
    expect(snapshot?.segments).toEqual(['Hello', 'world']);
    expect(snapshot?.text).toBe('Hello world');
  });

  it('returns null when subtitle text is empty', () => {
    document.body.innerHTML = `
      <div class="ytp-caption-window-container">
        <span class="ytp-caption-segment">   </span>
      </div>
    `;

    const snapshot = extractSubtitleSnapshot(document);
    expect(snapshot).toBeNull();
  });
});
