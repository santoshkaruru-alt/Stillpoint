import { createJSONStorage } from 'zustand/middleware';

/** Browser storage for persisted Zustand stores (synchronous, like native). */
export const kvStorage = createJSONStorage(() => ({
  getItem: (key: string) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      console.warn('Could not save settings', e);
    }
  },
  removeItem: (key: string) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
}));
