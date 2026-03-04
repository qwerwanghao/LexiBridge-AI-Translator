import { useMemo } from 'react';

import { useOptionsStore } from '@/options/store';

export function Statistics() {
  const model = useOptionsStore((state) => state.apiConfig.model);
  const autoTranslate = useOptionsStore((state) => state.autoTranslate);

  const stats = useMemo(
    () => [
      { label: 'Current Model', value: model },
      { label: 'Auto Translate', value: autoTranslate ? 'Enabled' : 'Disabled' },
      { label: 'Build Stage', value: '3.3.x' },
    ],
    [autoTranslate, model],
  );

  return (
    <section className="mt-6 rounded-md border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold">Statistics</h2>
      <ul className="mt-3 space-y-1 text-sm text-slate-700">
        {stats.map((item) => (
          <li key={item.label}>
            {item.label}: {item.value}
          </li>
        ))}
      </ul>
    </section>
  );
}
