// hooks/stores/sessionStore.ts
import { create } from "zustand";

interface User extends WebAppUser {
  strooperId?: string;
  wallet?: { publicKey: string };
  // Add any other user properties as needed
}

interface SessionState {
  user: User | null;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
  setWallet: (wallet: { publicKey: string }) => void;
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

  // Action to clear the session (logout)
  clearSession: () =>
    set(() => ({
      user: null,
      isAuthenticated: false,
    })),

  // Action to set the wallet for the user
  setWallet: (wallet: { publicKey: string }) =>
    set((state) => ({
      user: {
        ...state.user!,
        wallet,
      },
    })),
}));
