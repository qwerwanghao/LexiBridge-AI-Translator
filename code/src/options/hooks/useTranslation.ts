import { useMemo } from 'react';

import { useOptionsStore } from '@/options/store';

export function useTranslationConfig() {
  const apiConfig = useOptionsStore((state) => state.apiConfig);
  const autoTranslate = useOptionsStore((state) => state.autoTranslate);

  return useMemo(
    () => ({
      apiConfig,
      autoTranslate,
    }),
    [apiConfig, autoTranslate],
  );
}
