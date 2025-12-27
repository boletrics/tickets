import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock better-auth/client before importing
const mockToken = vi.fn();
vi.mock("better-auth/client", () => {
	const mockTokenFn = vi.fn();
	return {
		createAuthClient: vi.fn(() => ({
			token: mockTokenFn,
		})),
	};
});

vi.mock("better-auth/client/plugins", () => ({
	jwtClient: vi.fn(() => ({})),
	emailOTPClient: vi.fn(() => ({})),
}));

import { getClientJwt, authClient } from "./authClient";

describe("auth/authClient", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getClientJwt", () => {
		it("returns JWT token when authClient.token() succeeds", async () => {
			const mockTokenValue = "mock-jwt-token-123";
			vi.mocked(authClient.token).mockResolvedValue({
				data: { token: mockTokenValue },
				error: null,
			} as any);

			const result = await getClientJwt();

			expect(result).toBe(mockTokenValue);
			expect(authClient.token).toHaveBeenCalled();
		});

		it("returns null when authClient.token() returns error", async () => {
			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			vi.mocked(authClient.token).mockResolvedValue({
				data: null,
				error: { message: "Failed to get token" },
			} as any);

			const result = await getClientJwt();

			expect(result).toBeNull();
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Failed to get JWT:",
				expect.objectContaining({ message: "Failed to get token" }),
			);

			consoleErrorSpy.mockRestore();
		});

		it("returns null when authClient.token() returns no token data", async () => {
			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			vi.mocked(authClient.token).mockResolvedValue({
				data: {},
				error: null,
			} as any);

			const result = await getClientJwt();

			expect(result).toBeNull();
			expect(consoleErrorSpy).toHaveBeenCalled();

			consoleErrorSpy.mockRestore();
		});

		it("returns null and logs error when authClient.token() throws", async () => {
			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			const mockError = new Error("Network error");
			vi.mocked(authClient.token).mockRejectedValue(mockError);

			const result = await getClientJwt();

			expect(result).toBeNull();
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Error fetching JWT:",
				expect.any(Error),
			);

			consoleErrorSpy.mockRestore();
		});
	});
});
