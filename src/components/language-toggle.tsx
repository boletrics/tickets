"use client";

import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/use-locale";

export function LanguageToggle() {
	const { locale, setLocale } = useLocale();

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={() => setLocale(locale === "en" ? "es" : "en")}
			className="w-14 font-medium"
		>
			{locale === "en" ? "ES" : "EN"}
		</Button>
	);
}
