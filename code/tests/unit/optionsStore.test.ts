import { describe, expect, it } from 'vitest';

import { createOptionsStore } from '@/options/store';

describe('OptionsStore', () => {
  it('updates api config fields', () => {
    const store = createOptionsStore();

    store.getState().setApiConfig({ model: 'gpt-4.1-mini' });

    expect(store.getState().apiConfig.model).toBe('gpt-4.1-mini');
  });

  it('toggles auto translate flag', () => {
    const store = createOptionsStore();

    store.getState().setAutoTranslate(true);

    expect(store.getState().autoTranslate).toBe(true);
  });
});
