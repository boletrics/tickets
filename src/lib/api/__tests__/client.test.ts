import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetcher, buildQueryString, getAuthToken, apiFetch } from "../client";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock auth
vi.mock("../../auth/authClient", () => ({
	getClientJwt: vi.fn().mockResolvedValue(null),
}));

describe("API Client", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("fetcher", () => {
		it("should call fetch with the correct URL", async () => {
			const mockResponse = { data: "test" };
			mockFetch.mockResolvedValueOnce({
				ok: true,
				headers: {
					get: () => "application/json",
				},
				json: async () => mockResponse,
			});

			const result = await fetcher("/test-endpoint");

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("/test-endpoint"),
				expect.objectContaining({
					headers: expect.any(Object),
				}),
			);
			expect(result).toEqual(mockResponse);
		});

		it("should throw an error when response is not ok", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 404,
				headers: {
					get: () => "application/json",
				},
				json: async () => ({ errors: [{ message: "Not found", code: 404 }] }),
			});

			await expect(fetcher("/test-endpoint")).rejects.toThrow();
		});

		it("should include Accept header", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				headers: {
					get: () => "application/json",
				},
				json: async () => ({}),
			});

			await fetcher("/test-endpoint");

			expect(mockFetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					headers: expect.objectContaining({
						Accept: "application/json",
					}),
				}),
			);
		});
	});

	describe("buildQueryString", () => {
		it("should return empty string for empty params", () => {
			expect(buildQueryString({})).toBe("");
		});

		it("should build query string from params", () => {
			const result = buildQueryString({
				page: 1,
				limit: 10,
				search: "test",
			});

			expect(result).toBe("?page=1&limit=10&search=test");
		});

		it("should skip undefined and null values", () => {
			const result = buildQueryString({
				page: 1,
				limit: undefined,
				search: null,
			});

			expect(result).toBe("?page=1");
		});

		it("should handle boolean values", () => {
			const result = buildQueryString({
				active: true,
				archived: false,
			});

			expect(result).toBe("?active=true&archived=false");
		});
	});

	describe("getAuthToken", () => {
		it("should return null when no token is stored", () => {
			expect(getAuthToken()).toBeNull();
		});
	});

	describe("apiFetch", () => {
		it("should add JWT to Authorization header when provided", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				headers: {
					get: () => "application/json",
				},
				json: async () => ({ data: "test" }),
			});

			await apiFetch("/test-endpoint", { jwt: "test-jwt-token" });

			expect(mockFetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					headers: expect.objectContaining({
						Authorization: "Bearer test-jwt-token",
					}),
				}),
			);
		});

		it("should stringify object body and add Content-Type", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				headers: {
					get: () => "application/json",
				},
				json: async () => ({ success: true }),
			});

			await apiFetch("/test-endpoint", {
				method: "POST",
				body: { foo: "bar" } as unknown as BodyInit,
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					method: "POST",
					body: JSON.stringify({ foo: "bar" }),
					headers: expect.objectContaining({
						"Content-Type": "application/json",
					}),
				}),
			);
		});

		it("should handle text/plain responses", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				headers: {
					get: () => "text/plain",
				},
				text: async () => "plain text response",
			});

			const result = await apiFetch("/test-endpoint");

			expect(result).toBe("plain text response");
		});

		it("should extract result from success response wrapper", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				headers: {
					get: () => "application/json",
				},
				json: async () => ({
					success: true,
					result: { id: "123", name: "test" },
				}),
			});

			const result = await apiFetch<{ id: string; name: string }>(
				"/test-endpoint",
			);

			expect(result).toEqual({ id: "123", name: "test" });
		});

		it("should throw ApiError with error details on failure", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
				headers: {
					get: () => "application/json",
				},
				json: async () => ({
					success: false,
					errors: [{ code: 1001, message: "Validation failed" }],
				}),
			});

			try {
				await apiFetch("/test-endpoint");
				expect.fail("Should have thrown");
			} catch (error: unknown) {
				expect((error as Error).message).toBe("Validation failed");
			}
		});

		it("should use absolute URLs when provided", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				headers: {
					get: () => "application/json",
				},
				json: async () => ({ data: "test" }),
			});

			await apiFetch("https://external-api.com/endpoint");

			expect(mockFetch).toHaveBeenCalledWith(
				"https://external-api.com/endpoint",
				expect.any(Object),
			);
		});
	});
});
