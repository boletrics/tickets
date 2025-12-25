import { describe, it, expect } from "vitest";
import { mapApiEventToDisplay, mapApiEventsToDisplay } from "../mappers";
import type { Event as ApiEvent } from "../types";

describe("mappers", () => {
	describe("mapApiEventToDisplay", () => {
		const createMockApiEvent = (overrides?: Partial<ApiEvent>): ApiEvent => ({
			id: "event-1",
			org_id: "org-1",
			venue_id: "venue-1",
			title: "Test Event",
			slug: "test-event",
			description: "A test event description",
			category: "concert",
			artist: "Test Artist",
			image_url: "https://example.com/image.jpg",
			status: "published",
			published_at: "2025-01-01T00:00:00Z",
			created_at: "2025-01-01T00:00:00Z",
			updated_at: "2025-01-01T00:00:00Z",
			venue: {
				id: "venue-1",
				name: "Test Venue",
				address: "123 Test St",
				city: "Mexico City",
				state: "CDMX",
				country: "Mexico",
				region: "mexico-city",
				created_at: "2025-01-01T00:00:00Z",
				updated_at: "2025-01-01T00:00:00Z",
			},
			dates: [
				{
					id: "date-1",
					event_id: "event-1",
					date: "2025-06-15",
					start_time: "20:00",
					created_at: "2025-01-01T00:00:00Z",
					updated_at: "2025-01-01T00:00:00Z",
				},
			],
			ticket_types: [
				{
					id: "ticket-1",
					event_id: "event-1",
					name: "General Admission",
					description: "Standard entry",
					price: 500,
					quantity_total: 100,
					quantity_sold: 10,
					quantity_available: 90,
					status: "active",
					created_at: "2025-01-01T00:00:00Z",
					updated_at: "2025-01-01T00:00:00Z",
				},
			],
			organization: {
				id: "org-1",
				name: "Test Organization",
				slug: "test-org",
				createdAt: "2025-01-01T00:00:00Z",
			},
			...overrides,
		});

		it("should map a complete API event to display format", () => {
			const apiEvent = createMockApiEvent();
			const result = mapApiEventToDisplay(apiEvent);

			expect(result).toEqual({
				id: "event-1",
				title: "Test Event",
				description: "A test event description",
				dates: [{ date: "2025-06-15", times: ["20:00"] }],
				location: "Mexico City, CDMX",
				venue: "Test Venue",
				region: "mexico-city",
				image: "https://example.com/image.jpg",
				category: "concert",
				artist: "Test Artist",
				organizer: "Test Organization",
				orgId: "org-1",
				ticketTypes: [
					{
						id: "ticket-1",
						name: "General Admission",
						price: 500,
						available: 90,
						description: "Standard entry",
					},
				],
			});
		});

		it("should handle missing description", () => {
			const apiEvent = createMockApiEvent({ description: null });
			const result = mapApiEventToDisplay(apiEvent);

			expect(result.description).toBe("");
		});

		it("should handle missing venue with fallback values", () => {
			const apiEvent = createMockApiEvent({ venue: undefined });
			const result = mapApiEventToDisplay(apiEvent);

			expect(result.location).toBe("Location TBD");
			expect(result.venue).toBe("Venue TBD");
			expect(result.region).toBe("mexico-city");
		});

		it("should handle missing dates with empty array", () => {
			const apiEvent = createMockApiEvent({ dates: undefined });
			const result = mapApiEventToDisplay(apiEvent);

			expect(result.dates).toEqual([]);
		});

		it("should handle missing ticket_types with empty array", () => {
			const apiEvent = createMockApiEvent({ ticket_types: undefined });
			const result = mapApiEventToDisplay(apiEvent);

			expect(result.ticketTypes).toEqual([]);
		});

		it("should handle missing image_url with placeholder", () => {
			const apiEvent = createMockApiEvent({ image_url: null });
			const result = mapApiEventToDisplay(apiEvent);

			expect(result.image).toBe("/placeholder.svg?height=400&width=600");
		});

		it("should handle missing artist", () => {
			const apiEvent = createMockApiEvent({ artist: null });
			const result = mapApiEventToDisplay(apiEvent);

			expect(result.artist).toBeUndefined();
		});

		it("should handle missing organization with default organizer", () => {
			const apiEvent = createMockApiEvent({ organization: undefined });
			const result = mapApiEventToDisplay(apiEvent);

			expect(result.organizer).toBe("Boletrics");
		});

		it("should handle ticket type with null description", () => {
			const apiEvent = createMockApiEvent({
				ticket_types: [
					{
						id: "ticket-1",
						event_id: "event-1",
						name: "VIP",
						description: null,
						price: 1000,
						quantity_total: 50,
						quantity_sold: 5,
						quantity_available: 45,
						status: "active",
						created_at: "2025-01-01T00:00:00Z",
						updated_at: "2025-01-01T00:00:00Z",
					},
				],
			});
			const result = mapApiEventToDisplay(apiEvent);

			expect(result.ticketTypes[0].description).toBe("");
		});

		it("should validate region and use fallback for invalid region", () => {
			const apiEvent = createMockApiEvent({
				venue: {
					id: "venue-1",
					name: "Test Venue",
					address: "123 Test St",
					city: "Unknown City",
					state: "Unknown",
					country: "Mexico",
					region: "invalid-region" as ApiEvent["venue"] extends {
						region: infer R;
					}
						? R
						: never,
					created_at: "2025-01-01T00:00:00Z",
					updated_at: "2025-01-01T00:00:00Z",
				},
			});
			const result = mapApiEventToDisplay(apiEvent);

			expect(result.region).toBe("mexico-city");
		});

		it("should handle all valid regions", () => {
			const regions = [
				"mexico-city",
				"monterrey",
				"guadalajara",
				"cancun",
			] as const;

			for (const region of regions) {
				const apiEvent = createMockApiEvent({
					venue: {
						id: "venue-1",
						name: "Test Venue",
						address: "123 Test St",
						city: "Test City",
						state: "Test State",
						country: "Mexico",
						region,
						created_at: "2025-01-01T00:00:00Z",
						updated_at: "2025-01-01T00:00:00Z",
					},
				});
				const result = mapApiEventToDisplay(apiEvent);

				expect(result.region).toBe(region);
			}
		});
	});

	describe("mapApiEventsToDisplay", () => {
		it("should map an array of API events", () => {
			const apiEvents: ApiEvent[] = [
				{
					id: "event-1",
					org_id: "org-1",
					venue_id: "venue-1",
					title: "Event 1",
					slug: "event-1",
					category: "concert",
					status: "published",
					created_at: "2025-01-01T00:00:00Z",
					updated_at: "2025-01-01T00:00:00Z",
				},
				{
					id: "event-2",
					org_id: "org-1",
					venue_id: "venue-1",
					title: "Event 2",
					slug: "event-2",
					category: "sports",
					status: "published",
					created_at: "2025-01-01T00:00:00Z",
					updated_at: "2025-01-01T00:00:00Z",
				},
			];

			const result = mapApiEventsToDisplay(apiEvents);

			expect(result).toHaveLength(2);
			expect(result[0].id).toBe("event-1");
			expect(result[0].title).toBe("Event 1");
			expect(result[1].id).toBe("event-2");
			expect(result[1].title).toBe("Event 2");
		});

		it("should return empty array for empty input", () => {
			const result = mapApiEventsToDisplay([]);

			expect(result).toEqual([]);
		});
	});
});
