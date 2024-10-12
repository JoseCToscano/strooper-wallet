// stores/keyStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface KeyState {
  keyId: string | null;
  setKeyId: (keyId: string) => void;
}

export const useKeyStore = create<KeyState>()(
  persist(
    (set) => ({
      keyId: null,
      setKeyId: (keyId) => set({ keyId }),
    }),
    {
      name: "key-storage", // Name of localStorage key
    },
  ),
);
