import { create } from "zustand";
import type { User } from "@/types/user";

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  loadUser: () => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,

  setUser: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },

  loadUser: () => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;

      set({ user: JSON.parse(raw) });
    } catch {
      localStorage.removeItem("user");
    }
  },

  clearUser: () => {
    localStorage.removeItem("user");
    set({ user: null });
  },
}));
