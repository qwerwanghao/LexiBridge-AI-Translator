# LexiBridge AI Translator

Chrome Extension (Manifest V3) for AI-based translation with configurable OpenAI-compatible API.

Current build includes:

- Selection translation (web pages)
- YouTube subtitle bilingual overlay
- Options page with API config, term editor, and stats
- Translation engine (cache, term match, API client)

## Requirements

- Node.js 20+
- npm 10+
- Chrome/Edge (Chromium, MV3)

## Install

```bash
npm install
```

详细安装步骤见 [docs/INSTALL.md](docs/INSTALL.md)。

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

Build output is generated in `dist/`.

## Quality Commands

```bash
npm run lint
npm run typecheck
npx vitest run --coverage
```

## Load Extension (Manual)

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select `dist/`.

## Usage

### Selection Translation

1. Select text on a web page.
2. Wait for popup translation, or use shortcut (default `Alt+T`).

### YouTube Subtitle Translation

1. Open a YouTube video with subtitles.
2. Extension overlays original + translated subtitle lines near bottom.

### Options Page

1. Open extension options.
2. Set `Base URL`, `API Key`, and `Model`.
3. Click `Save` to persist config to `chrome.storage.local`.

完整使用说明见 [docs/USAGE.md](docs/USAGE.md)。

## API/Message Contract (Internal)

Main runtime messages:

- `TRANSLATE`
- `TRANSLATE_BATCH`
- `GET_CONFIG`
- `UPDATE_CONFIG`
- `GET_CACHE_STATS`
- `CLEAR_CACHE`
- `TEST_API_CONNECTION`

Related type definitions are in:

- `src/background/types.ts`

完整消息协议文档见 [docs/API.md](docs/API.md)。

## Security Notes

- API calls only allow `https://` base URLs.
- API key input uses password masking in options page.
- Translation UI writes text via `textContent` to avoid HTML injection.

## Known Gaps

- `src/content/page.ts` and `src/content/pdf.ts` are placeholders for next-phase implementation.
