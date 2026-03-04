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
  }));
}

export const useOptionsStore = createOptionsStore();
