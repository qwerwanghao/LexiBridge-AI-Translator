import { create, type StoreApi, type UseBoundStore } from 'zustand';

export interface APIConfigState {
  baseUrl: string;
  apiKey: string;
  model: string;
}

export interface OptionsState {
  apiConfig: APIConfigState;
  autoTranslate: boolean;
}

export interface OptionsActions {
  setApiConfig: (partial: Partial<APIConfigState>) => void;
  setAutoTranslate: (value: boolean) => void;
  hydrateFromConfig: (config: unknown) => void;
}

export type OptionsStore = OptionsState & OptionsActions;

const INITIAL_STATE: OptionsState = {
  apiConfig: {
    baseUrl: 'https://api.openai.com',
    apiKey: '',
    model: 'gpt-4o-mini',
  },
  autoTranslate: false,
};

export function createOptionsStore(): UseBoundStore<StoreApi<OptionsStore>> {
  return create<OptionsStore>((set) => ({
    ...INITIAL_STATE,
    setApiConfig: (partial) => {
      set((state) => ({
        apiConfig: {
          ...state.apiConfig,
          ...partial,
        },
      }));
    },
    setAutoTranslate: (value) => {
      set({ autoTranslate: value });
    },
    hydrateFromConfig: (config) => {
      const source =
        typeof config === 'object' && config ? (config as Record<string, unknown>) : {};
      const api =
        source.api && typeof source.api === 'object'
          ? (source.api as Record<string, unknown>)
          : source;
      const translation =
        source.translation && typeof source.translation === 'object'
          ? (source.translation as Record<string, unknown>)
          : {};

      set((state) => ({
        apiConfig: {
          ...state.apiConfig,
          baseUrl:
            typeof api.baseUrl === 'string' && api.baseUrl.trim()
              ? api.baseUrl.trim()
              : state.apiConfig.baseUrl,
          apiKey: typeof api.apiKey === 'string' ? api.apiKey : state.apiConfig.apiKey,
          model:
            typeof api.model === 'string' && api.model.trim()
              ? api.model.trim()
              : state.apiConfig.model,
        },
        autoTranslate:
          typeof translation.autoTranslate === 'boolean'
            ? translation.autoTranslate
            : state.autoTranslate,
      }));
    },
  }));
}

export const useOptionsStore = createOptionsStore();
