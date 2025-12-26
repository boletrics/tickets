import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import { usePublicEvents, useEvent } from "../hooks";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock auth
vi.mock("../../auth/authClient", () => ({
	getClientJwt: vi.fn().mockResolvedValue(null),
}));

// Wrapper to provide SWR configuration
function TestWrapper({ children }: { children: React.ReactNode }) {
	return (
		<SWRConfig
			value={{
				dedupingInterval: 0,
				provider: () => new Map(),
			}}
		>
			{children}
		</SWRConfig>
	);
}

describe("API Hooks", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("usePublicEvents", () => {
		it("should fetch events successfully", async () => {
			// API returns { success: true, result: [...] } - client extracts result
			const mockApiResponse = {
				success: true,
				result: [
					{ id: "1", title: "Event 1" },
					{ id: "2", title: "Event 2" },
				],
				result_info: { page: 1, per_page: 10, count: 2, total_count: 2 },
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				headers: {
					get: () => "application/json",
				},
				json: async () => mockApiResponse,
			});

			const { result } = renderHook(() => usePublicEvents(), {
				wrapper: TestWrapper,
			});

			// Initial loading state
			expect(result.current.isLoading).toBe(true);

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.data).toHaveLength(2);
			expect(result.current.data?.[0].title).toBe("Event 1");
		});

		it("should handle fetch errors", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				headers: {
					get: () => "application/json",
				},
				json: async () => ({
					errors: [{ message: "Server error", code: 500 }],
				}),
			});

			const { result } = renderHook(() => usePublicEvents(), {
				wrapper: TestWrapper,
			});

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.error).toBeDefined();
		});

		it("should apply filters", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: true,
				headers: {
					get: () => "application/json",
				},
				json: async () => ({ data: [], pagination: {} }),
			});

			renderHook(() => usePublicEvents({ category: "concert" }), {
				wrapper: TestWrapper,
			});

			await waitFor(() => {
				expect(mockFetch).toHaveBeenCalled();
			});

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("category=concert"),
				expect.any(Object),
			);
		});
	});

	describe("useEvent", () => {
		it("should fetch a specific event by ID", async () => {
			const mockEvent = {
				id: "event-1",
				title: "Test Event",
				description: "A test event",
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				headers: {
					get: () => "application/json",
				},
				json: async () => mockEvent,
			});

			const { result } = renderHook(() => useEvent("event-1"), {
				wrapper: TestWrapper,
			});

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.data).toEqual(mockEvent);
		});

		it("should not fetch when eventId is null", async () => {
			const { result } = renderHook(() => useEvent(null), {
				wrapper: TestWrapper,
			});

			// Should not be loading because no request is made
			expect(result.current.isLoading).toBe(false);
			expect(result.current.data).toBeUndefined();
			expect(mockFetch).not.toHaveBeenCalled();
		});
	});
});
