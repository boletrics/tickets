import { describe, expect, it, vi, beforeEach } from "vitest";

// Mock config module
vi.mock("./config", () => ({
	getAuthServiceUrl: vi.fn(),
	getAuthAppUrl: vi.fn(),
}));

// Mock next/headers
const mockCookies = vi.fn();
vi.mock("next/headers", () => ({
	cookies: () => mockCookies(),
}));

// Mock global fetch
global.fetch = vi.fn();

import { getJwt } from "./getJwt";
import * as configModule from "./config";

describe("auth/getJwt", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getJwt", () => {
		it("returns null when no session cookie is present", async () => {
			mockCookies.mockReturnValue({
				toString: () => "other-cookie=value",
			});

			const result = await getJwt();

			expect(result).toBeNull();
			expect(global.fetch).not.toHaveBeenCalled();
		});

		it("returns null when no cookies are present", async () => {
			mockCookies.mockReturnValue({
				toString: () => "",
			});

			const result = await getJwt();

			expect(result).toBeNull();
			expect(global.fetch).not.toHaveBeenCalled();
		});

		it("returns JWT token when session cookie exists and API call succeeds", async () => {
			const mockToken = "test-jwt-token-123";
			const mockAuthServiceUrl = "https://auth-svc.example.com";

			vi.mocked(configModule.getAuthServiceUrl).mockReturnValue(
				mockAuthServiceUrl,
			);
			vi.mocked(configModule.getAuthAppUrl).mockReturnValue(
				"https://auth.example.com",
			);

			mockCookies.mockReturnValue({
				toString: () => "better-auth.session_token=abc123",
			});

			vi.mocked(global.fetch).mockResolvedValue({
				ok: true,
				json: async () => ({ token: mockToken }),
			} as Response);

			const result = await getJwt();

			expect(result).toBe(mockToken);
			expect(global.fetch).toHaveBeenCalledWith(
				`${mockAuthServiceUrl}/api/auth/token`,
				expect.objectContaining({
					headers: expect.objectContaining({
						Cookie: "better-auth.session_token=abc123",
					}),
				}),
			);
		});

		it("returns null when API call fails", async () => {
			const mockAuthServiceUrl = "https://auth-svc.example.com";

			vi.mocked(configModule.getAuthServiceUrl).mockReturnValue(
				mockAuthServiceUrl,
			);
			vi.mocked(configModule.getAuthAppUrl).mockReturnValue(
				"https://auth.example.com",
			);

			mockCookies.mockReturnValue({
				toString: () => "better-auth.session_token=abc123",
			});

			vi.mocked(global.fetch).mockResolvedValue({
				ok: false,
				status: 401,
				statusText: "Unauthorized",
			} as Response);

			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			const result = await getJwt();

			expect(result).toBeNull();
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Failed to get JWT: 401 Unauthorized",
			);

			consoleErrorSpy.mockRestore();
		});

		it("returns null when API call throws an error", async () => {
			const mockAuthServiceUrl = "https://auth-svc.example.com";

			vi.mocked(configModule.getAuthServiceUrl).mockReturnValue(
				mockAuthServiceUrl,
			);
			vi.mocked(configModule.getAuthAppUrl).mockReturnValue(
				"https://auth.example.com",
			);

			mockCookies.mockReturnValue({
				toString: () => "better-auth.session_token=abc123",
			});

			const mockError = new Error("Network error");
			vi.mocked(global.fetch).mockRejectedValue(mockError);

			const consoleErrorSpy = vi
				.spyOn(console, "error")
				.mockImplementation(() => {});

			const result = await getJwt();

			expect(result).toBeNull();
			expect(consoleErrorSpy).toHaveBeenCalledWith(
				"Error fetching JWT:",
				mockError,
			);

			consoleErrorSpy.mockRestore();
		});

		it("checks for secure session cookie variant", async () => {
			mockCookies.mockReturnValue({
				toString: () => "__Secure-better-auth.session_token=abc123",
			});

			const mockToken = "test-jwt-token-123";
			vi.mocked(configModule.getAuthServiceUrl).mockReturnValue(
				"https://auth-svc.example.com",
			);
			vi.mocked(configModule.getAuthAppUrl).mockReturnValue(
				"https://auth.example.com",
			);

			vi.mocked(global.fetch).mockResolvedValue({
				ok: true,
				json: async () => ({ token: mockToken }),
			} as Response);

			const result = await getJwt();

			expect(result).toBe(mockToken);
		});

		it("returns null when response has no token", async () => {
			const mockAuthServiceUrl = "https://auth-svc.example.com";

			vi.mocked(configModule.getAuthServiceUrl).mockReturnValue(
				mockAuthServiceUrl,
			);
			vi.mocked(configModule.getAuthAppUrl).mockReturnValue(
				"https://auth.example.com",
			);

			mockCookies.mockReturnValue({
				toString: () => "better-auth.session_token=abc123",
			});

			vi.mocked(global.fetch).mockResolvedValue({
				ok: true,
				json: async () => ({}),
			} as Response);

			const result = await getJwt();

			expect(result).toBeNull();
		});
	});
});
