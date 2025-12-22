"use client";

import type { User } from "@/lib/types";
import { logout } from "./auth/actions";
import { sessionStore } from "./auth/sessionStore";
import { useStore } from "@nanostores/react";

interface AuthStore {
	user: User | null;
	guestEmail: string | null;
	setUser: (user: User) => void;
	setGuestEmail: (email: string) => void;
	signOut: () => void;
}

/**
 * Helper function to convert Session user to User format
 */
function sessionUserToUser(sessionUser: {
	id: string;
	name: string;
	email: string;
}): User {
	const nameParts = sessionUser.name.split(" ");
	return {
		id: sessionUser.id,
		email: sessionUser.email,
		firstName: nameParts[0] || "",
		lastName: nameParts.slice(1).join(" ") || "",
	};
}

/**
 * @deprecated This store is maintained for backward compatibility.
 * Use `useAuthSession()` from `/lib/auth/useAuthSession` for new code.
 *
 * This adapter bridges the old User interface with the new Session system.
 * It reads from the session store and converts the Session format to User format.
 */
export function useAuthStore(): AuthStore {
	// Read from session store
	const sessionState = useStore(sessionStore);

	// Convert session to user format
	const user = sessionState.data?.user
		? sessionUserToUser(sessionState.data.user)
		: null;

	// Create a compatible store interface
	return {
		user,
		guestEmail: null, // Guest email is not part of session system
		setUser: (_user: User) => {
			// This is a no-op - user comes from session
			console.warn(
				"setUser is deprecated. User is managed by the session system.",
			);
		},
		setGuestEmail: (_email: string) => {
			// This is a no-op - guest email is not part of session system
			console.warn(
				"setGuestEmail is deprecated. Use the session system instead.",
			);
		},
		signOut: async () => {
			await logout();
		},
	};
}
