import Storage from 'expo-sqlite/kv-store';
import { createJSONStorage } from 'zustand/middleware';

/** Synchronous key-value storage for persisted Zustand stores. */
export const kvStorage = createJSONStorage(() => ({
  getItem: (key: string) => Storage.getItemSync(key),
  setItem: (key: string, value: string) => Storage.setItemSync(key, value),
  removeItem: (key: string) => {
    Storage.removeItemSync(key);
  },
}));
