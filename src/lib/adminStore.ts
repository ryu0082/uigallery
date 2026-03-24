import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminStore {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set) => ({
      isAdmin: false,
      login: (password: string) => {
        const correct = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
        if (password === correct) {
          set({ isAdmin: true });
          return true;
        }
        return false;
      },
      logout: () => set({ isAdmin: false }),
    }),
    { name: "admin-auth" }
  )
);
