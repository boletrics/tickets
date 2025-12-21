"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";

interface AuthStore {
	user: User | null;
	guestEmail: string | null;
	setUser: (user: User) => void;
	setGuestEmail: (email: string) => void;
	signOut: () => void;
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set) => ({
			user: null,
			guestEmail: null,
			setUser: (user: User) => set({ user, guestEmail: null }),
			setGuestEmail: (email: string) => set({ guestEmail: email }),
			signOut: () => set({ user: null, guestEmail: null }),
		}),
		{
			name: "auth-storage",
		},
	),
);
