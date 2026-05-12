import { create } from "zustand";

interface AuthState {
  accessToken: string | null;

  refreshToken: string | null;

  setAuth: (accessToken: string, refreshToken: string) => void;

  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,

  refreshToken: null,

  setAuth: (accessToken, refreshToken) => {
    // zustand state
    set({
      accessToken,
      refreshToken,
    });

    // localStorage
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
  },

  logout: () => {
    set({
      accessToken: null,
      refreshToken: null,
    });

    localStorage.removeItem("access_token");

    localStorage.removeItem("refresh_token");
  },
}));
