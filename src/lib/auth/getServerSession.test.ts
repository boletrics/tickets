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

import { getServerSession } from "./getServerSession";
import * as configModule from "./config";
import type { Session } from "./types";

describe("auth/getServerSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("getServerSession", () => {
		it("returns null when no session cookie is present", async () => {
			mockCookies.mockReturnValue({
				toString: () => "other-cookie=value",
			});

			const result = await getServerSession();

			expect(result).toBeNull();
			expect(global.fetch).not.toHaveBeenCalled();
		});

		it("returns null when no cookies are present", async () => {
			mockCookies.mockReturnValue({
				toString: () => "",
			});

			const result = await getServerSession();

			expect(result).toBeNull();
			expect(global.fetch).not.toHaveBeenCalled();
		});

		it("returns session when session cookie exists and API call succeeds", async () => {
			const mockAuthServiceUrl = "https://auth-svc.example.com";
			const mockAuthAppUrl = "https://auth.example.com";

			vi.mocked(configModule.getAuthServiceUrl).mockReturnValue(
				mockAuthServiceUrl,
			);
			vi.mocked(configModule.getAuthAppUrl).mockReturnValue(mockAuthAppUrl);

			mockCookies.mockReturnValue({
				toString: () => "better-auth.session_token=abc123",
			});

			const mockSession: Session = {
				user: {
					id: "123",
					name: "Test User",
					email: "test@example.com",
					image: null,
					emailVerified: true,
					createdAt: new Date("2024-01-01"),
					updatedAt: new Date("2024-01-01"),
				},
				session: {
					id: "session-123",
					userId: "123",
					token: "token-123",
					expiresAt: new Date("2024-12-31"),
					createdAt: new Date("2024-01-01"),
					updatedAt: new Date("2024-01-01"),
				},
			};

			vi.mocked(global.fetch).mockResolvedValue({
				ok: true,
				json: async () => ({
					session: mockSession.session,
					user: mockSession.user,
				}),
			} as Response);

			const result = await getServerSession();

			expect(result).toEqual(mockSession);
			expect(global.fetch).toHaveBeenCalledWith(
				`${mockAuthServiceUrl}/api/auth/get-session`,
				expect.objectContaining({
					headers: expect.objectContaining({
						Cookie: "better-auth.session_token=abc123",
						Origin: mockAuthAppUrl,
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
			} as Response);

			const result = await getServerSession();

			expect(result).toBeNull();
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

			vi.mocked(global.fetch).mockRejectedValue(new Error("Network error"));

			const result = await getServerSession();

			expect(result).toBeNull();
		});

		it("returns null when response has no session data", async () => {
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
				json: async () => ({
					session: null,
					user: null,
				}),
			} as Response);

			const result = await getServerSession();

			expect(result).toBeNull();
		});

		it("returns null when response has session but no user", async () => {
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
				json: async () => ({
					session: { id: "session-123" },
					user: null,
				}),
			} as Response);

			const result = await getServerSession();

			expect(result).toBeNull();
		});

		it("returns null when response has user but no session", async () => {
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
				json: async () => ({
					session: null,
					user: { id: "123", name: "Test" },
				}),
			} as Response);

			const result = await getServerSession();

			expect(result).toBeNull();
		});
	});
});
