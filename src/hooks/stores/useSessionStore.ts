// hooks/stores/sessionStore.ts
import { create } from "zustand";

interface User extends WebAppUser {
  strooperId?: string;
  defaultContractAddress?: string;
  // Add any other user properties as needed
}

interface SessionState {
  user: User | null;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setUser: (user: User) => void;
  setDefaultContractId: (contractId: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  isAuthenticated: false,

  // Action to set the authentication status
  setIsAuthenticated: (isAuthenticated: boolean) =>
    set(() => ({
      isAuthenticated,
    })),

  // Action to set the user and mark as authenticated
  setUser: (user: User) =>
    set(() => ({
      user,
    })),

  setDefaultContractId: (contractId: string) =>
    set((state) => ({
      user: {
        ...state.user!,
        defaultContractAddress: contractId,
      },
    })),

  // Action to clear the session (logout)
  clearSession: () =>
    set(() => ({
      isAuthenticated: false,
    })),
}));
