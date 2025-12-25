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
			const mockEvents = {
				data: [
					{ id: "1", title: "Event 1" },
					{ id: "2", title: "Event 2" },
				],
				pagination: { page: 1, limit: 10, total: 2, totalPages: 1 },
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				headers: {
					get: () => "application/json",
				},
				json: async () => mockEvents,
			});

			const { result } = renderHook(() => usePublicEvents(), {
				wrapper: TestWrapper,
			});

			// Initial loading state
			expect(result.current.isLoading).toBe(true);

			await waitFor(() => {
				expect(result.current.isLoading).toBe(false);
			});

			expect(result.current.data?.data).toHaveLength(2);
			expect(result.current.data?.data?.[0].title).toBe("Event 1");
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
