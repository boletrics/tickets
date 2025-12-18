"use client";

import { useEffect } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeStore {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
}

export const useTheme = create<ThemeStore>()(
	persist(
		(set) => ({
			theme: "light",
			setTheme: (theme: Theme) => {
				set({ theme });
				if (typeof document !== "undefined") {
					document.documentElement.classList.toggle("dark", theme === "dark");
				}
			},
			toggleTheme: () =>
				set((state) => {
					const newTheme = state.theme === "light" ? "dark" : "light";
					if (typeof document !== "undefined") {
						document.documentElement.classList.toggle(
							"dark",
							newTheme === "dark",
						);
					}
					return { theme: newTheme };
				}),
		}),
		{
			name: "theme-storage",
		},
	),
);

export function useThemeEffect() {
	const theme = useTheme((state) => state.theme);

	useEffect(() => {
		document.documentElement.classList.toggle("dark", theme === "dark");
	}, [theme]);
}
