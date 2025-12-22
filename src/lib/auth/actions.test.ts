import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock modules before importing
vi.mock("./authClient", () => {
	const mockSignOut = vi.fn();
	return {
		authClient: {
			signOut: mockSignOut,
		},
	};
});

vi.mock("./sessionStore", () => ({
	clearSession: vi.fn(),
}));

vi.mock("./config", () => ({
	getAuthAppUrl: vi.fn(),
}));

import { logout } from "./actions";
import { authClient } from "./authClient";
import * as sessionStoreModule from "./sessionStore";
import * as configModule from "./config";

describe("auth/actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock window.location.href
		Object.defineProperty(window, "location", {
			writable: true,
			value: {
				href: "",
			},
		});
	});

	describe("logout", () => {
		it("calls authClient.signOut and redirects on success", async () => {
			const mockAuthAppUrl = "https://auth.example.com";
			vi.mocked(configModule.getAuthAppUrl).mockReturnValue(mockAuthAppUrl);

			const clearSessionSpy = vi.mocked(sessionStoreModule.clearSession);
			vi.mocked(authClient.signOut).mockResolvedValue(undefined as any);

			await logout();

			expect(authClient.signOut).toHaveBeenCalledWith({
				fetchOptions: {
					onSuccess: expect.any(Function),
				},
			});

			// Call the onSuccess callback
			const onSuccessCallback = vi.mocked(authClient.signOut).mock.calls[0]?.[0]
				?.fetchOptions?.onSuccess;
			if (onSuccessCallback) {
				onSuccessCallback();
			}

			expect(clearSessionSpy).toHaveBeenCalled();
			expect(window.location.href).toBe(`${mockAuthAppUrl}/login`);
		});

		it("clears session and redirects even when signOut fails", async () => {
			const mockAuthAppUrl = "https://auth.example.com";
			vi.mocked(configModule.getAuthAppUrl).mockReturnValue(mockAuthAppUrl);

			const clearSessionSpy = vi.mocked(sessionStoreModule.clearSession);
			vi.mocked(authClient.signOut).mockRejectedValue(
				new Error("Sign out failed"),
			);

			await logout();

			expect(authClient.signOut).toHaveBeenCalled();
			expect(clearSessionSpy).toHaveBeenCalled();
			expect(window.location.href).toBe(`${mockAuthAppUrl}/login`);
		});

		it("uses auth app URL from config", async () => {
			const customAuthUrl = "https://custom-auth.example.com";
			const getAuthAppUrlSpy = vi
				.mocked(configModule.getAuthAppUrl)
				.mockReturnValue(customAuthUrl);

			vi.mocked(authClient.signOut).mockResolvedValue(undefined as any);

			await logout();

			expect(getAuthAppUrlSpy).toHaveBeenCalled();

			// Call the onSuccess callback to trigger redirect
			const onSuccessCallback = vi.mocked(authClient.signOut).mock.calls[0]?.[0]
				?.fetchOptions?.onSuccess;
			if (onSuccessCallback) {
				onSuccessCallback();
			}

			expect(window.location.href).toBe(`${customAuthUrl}/login`);
		});
	});
});
