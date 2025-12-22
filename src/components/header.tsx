"use client";

import type React from "react";

import { useState } from "react";
import { Ticket, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/hooks/use-locale";
import { useAuthStore } from "@/lib/auth-store";
import { UserAvatar } from "@/components/user-avatar";

export function Header() {
	const { t } = useLocale();
	const router = useRouter();
	const { user } = useAuthStore();
	const [searchQuery, setSearchQuery] = useState("");

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		if (searchQuery.trim()) {
			router.push(`/search?search=${encodeURIComponent(searchQuery)}`);
		} else {
			router.push("/search");
		}
	};

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto">
				<div className="flex h-16 items-center gap-4 px-4 md:px-0">
					<Link href="/" className="flex items-center gap-2 shrink-0">
						<Ticket className="h-6 w-6" />
						<span className="text-xl font-bold hidden md:inline">
							Boletrics
						</span>
					</Link>

					<form onSubmit={handleSearch} className="flex-1 max-w-2xl">
						<div className="relative w-full">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								type="text"
								placeholder={t("home.searchPlaceholder")}
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-9 h-10"
							/>
						</div>
					</form>

					<nav className="flex items-center gap-2 shrink-0">
						{user && (
							<Button
								variant="ghost"
								size="sm"
								asChild
								className="hidden lg:flex"
							>
								<Link href="/my-tickets">{t("nav.myTickets")}</Link>
							</Button>
						)}

						<LanguageToggle />
						<ThemeToggle />

						{user ? (
							<div className="flex items-center gap-2">
								<span className="text-sm text-muted-foreground hidden lg:inline">
									{user.firstName}
								</span>
								<UserAvatar />
							</div>
						) : (
							<UserAvatar />
						)}
					</nav>
				</div>
			</div>
		</header>
	);
}
