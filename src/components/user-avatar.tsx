"use client";

import { User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useLocale } from "@/hooks/use-locale";
import { useAuthStore } from "@/lib/auth-store";

export function UserAvatar() {
	const { t } = useLocale();
	const { user, signOut } = useAuthStore();

	// Guest avatar (not signed in) - show dropdown with sign in option
	if (!user) {
		return (
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="rounded-full">
						<Avatar className="h-9 w-9 border-2 border-dashed border-muted-foreground/40">
							<AvatarFallback className="bg-muted/30">
								<User className="h-5 w-5 text-muted-foreground" />
							</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-56">
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium leading-none">
								{t("auth.continueAsGuest") || "Guest"}
							</p>
							<p className="text-xs leading-none text-muted-foreground">
								{t("nav.signIn") || "Sign in to access your tickets"}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild>
						<Link href="/auth">{t("nav.signIn")}</Link>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		);
	}

	// Signed in avatar
	const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="rounded-full">
					<Avatar className="h-9 w-9 border-2 border-primary">
						<AvatarFallback className="bg-primary text-primary-foreground font-semibold">
							{initials}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">
							{user.firstName} {user.lastName}
						</p>
						<p className="text-xs leading-none text-muted-foreground">
							{user.email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link href="/my-tickets">{t("nav.myTickets")}</Link>
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem
					onClick={signOut}
					className="text-destructive focus:text-destructive"
				>
					{t("nav.signOut")}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
