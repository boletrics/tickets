"use client";

import { authClient } from "./authClient";
import { clearSession } from "./sessionStore";

export async function logout(): Promise<void> {
	try {
		await authClient.signOut();
	} catch {
		// Continue even if API call fails
	}

	// Clear local session state
	clearSession();

	// Note: Unlike aml, we don't redirect - allow guest navigation
}
