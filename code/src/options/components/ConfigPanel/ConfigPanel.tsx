import { useState } from 'react';

import { useOptionsStore } from '@/options/store';

export function ConfigPanel() {
  const apiConfig = useOptionsStore((state) => state.apiConfig);
  const autoTranslate = useOptionsStore((state) => state.autoTranslate);
  const setApiConfig = useOptionsStore((state) => state.setApiConfig);
  const setAutoTranslate = useOptionsStore((state) => state.setAutoTranslate);

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const saveConfig = async () => {
    setSaved(false);
    setError(null);

    if (!apiConfig.baseUrl.startsWith('https://')) {
      setError('Base URL must start with https://');
      return;
    }
    if (!apiConfig.model.trim()) {
      setError('Model is required');
      return;
    }

    setSaving(true);
    try {
      const response = (await chrome.runtime.sendMessage({
        type: 'UPDATE_CONFIG',
        payload: {
          api: apiConfig,
          translation: {
            autoTranslate,
          },
        },
        timestamp: Date.now(),
      })) as { success: boolean; error?: { message?: string } };

      if (!response.success) {
        setError(response.error?.message ?? 'Save failed');
        return;
      }

      setSaved(true);
    } catch (saveError) {
      setError((saveError as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mt-6 rounded-md border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold">API Config Panel</h2>

      <label className="mt-3 block text-sm text-slate-700" htmlFor="baseUrl">
        Base URL
      </label>
      <input
        id="baseUrl"
        value={apiConfig.baseUrl}
        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
        onChange={(event) => setApiConfig({ baseUrl: event.target.value })}
      />

      <label className="mt-3 block text-sm text-slate-700" htmlFor="apiKey">
        API Key
      </label>
      <input
        id="apiKey"
        type="password"
        autoComplete="off"
        value={apiConfig.apiKey}
        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
        onChange={(event) => setApiConfig({ apiKey: event.target.value })}
      />

      <label className="mt-3 block text-sm text-slate-700" htmlFor="model">
        Model
      </label>
      <input
        id="model"
        value={apiConfig.model}
        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
        onChange={(event) => setApiConfig({ model: event.target.value })}
      />

      <label
        className="mt-3 inline-flex items-center gap-2 text-sm text-slate-700"
        htmlFor="autoTranslate"
      >
        <input
          id="autoTranslate"
          type="checkbox"
          checked={autoTranslate}
          onChange={(event) => setAutoTranslate(event.target.checked)}
        />
        Auto Translate
      </label>

      <button
        type="button"
        disabled={saving}
        className="mt-4 rounded border border-slate-300 bg-slate-100 px-3 py-1 text-sm"
        onClick={() => void saveConfig()}
      >
        {saving ? 'Saving...' : 'Save'}
      </button>

      {saved ? <p className="mt-2 text-sm text-emerald-700">Saved locally</p> : null}
      {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
    </section>
  );
}
