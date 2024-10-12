// stores/contractStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ContractState {
  contractId: string | null;
  setContractId: (contractId: string) => void;
}

export const useContractStore = create<ContractState>()(
  persist(
    (set) => ({
      contractId: null,
      setContractId: (contractId) => set({ contractId }),
    }),
    {
      name: "contract-storage", // Name of localStorage key
    },
  ),
);
