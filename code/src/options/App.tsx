import { useEffect, useMemo } from 'react';

import { ConfigPanel } from '@/options/components/ConfigPanel';
import { Statistics } from '@/options/components/Statistics';
import { TermEditor } from '@/options/components/TermEditor';
import { useTranslationConfig } from '@/options/hooks/useTranslation';
import { useOptionsStore } from '@/options/store';

export function App() {
  const today = useMemo(() => new Date().toISOString(), []);
  const { apiConfig, autoTranslate } = useTranslationConfig();
  const setAutoTranslate = useOptionsStore((state) => state.setAutoTranslate);
  const hydrateFromConfig = useOptionsStore((state) => state.hydrateFromConfig);

  useEffect(() => {
    let cancelled = false;

    const loadConfig = async () => {
      try {
        const response = (await chrome.runtime.sendMessage({
          type: 'GET_CONFIG',
          payload: null,
          timestamp: Date.now(),
        })) as { success: boolean; data?: unknown };

        if (!cancelled && response.success) {
          hydrateFromConfig(response.data ?? {});
        }
      } catch {
        // Keep defaults if config loading fails.
      }
    };

    void loadConfig();

    return () => {
      cancelled = true;
    };
  }, [hydrateFromConfig]);

  return (
    <main className="appContainer">
      <h1 className="text-2xl font-semibold">LexiBridge AI Translator</h1>
      <p className="mt-2 text-slate-700">Build phase foundation is ready.</p>
      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
        <p className="text-sm font-medium text-slate-700">Build Timestamp</p>
        <p className="metaText mt-1">{today}</p>
        <p className="metaText mt-1">Model: {apiConfig.model}</p>
        <button
          type="button"
          className="mt-2 rounded border border-slate-300 bg-white px-3 py-1 text-sm"
          onClick={() => setAutoTranslate(!autoTranslate)}
        >
          Auto Translate: {autoTranslate ? 'ON' : 'OFF'}
        </button>
      </div>
      <ConfigPanel />
      <TermEditor />
      <Statistics />
    </main>
  );
}
