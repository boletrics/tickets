"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/lib/i18n";
import { getTranslation } from "@/lib/i18n";

interface LocaleStore {
	locale: Locale;
	setLocale: (locale: Locale) => void;
	t: (key: string) => string;
}

export const useLocale = create<LocaleStore>()(
	persist(
		(set, get) => ({
			locale: "en",
			setLocale: (locale: Locale) => set({ locale }),
			t: (key: string) => getTranslation(get().locale, key),
		}),
		{
			name: "locale-storage",
		},
	),
);
