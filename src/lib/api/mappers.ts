/**
 * Mapping utilities for converting API types to display types.
 */

import type { Event as ApiEvent } from "./types";
import type { Event as DisplayEvent } from "@/lib/types";

/**
 * Valid regions supported by the application.
 */
const VALID_REGIONS = [
	"mexico-city",
	"monterrey",
	"guadalajara",
	"cancun",
] as const;

type ValidRegion = (typeof VALID_REGIONS)[number];

/**
 * Maps an API Event to the display Event format used by UI components.
 * This is the single source of truth for event mapping across the application.
 */
export function mapApiEventToDisplay(apiEvent: ApiEvent): DisplayEvent {
	// Validate region with fallback
	const rawRegion = apiEvent.venue?.region ?? "mexico-city";
	const region: ValidRegion = VALID_REGIONS.includes(rawRegion as ValidRegion)
		? (rawRegion as ValidRegion)
		: "mexico-city";

	return {
		id: apiEvent.id,
		title: apiEvent.title,
		description: apiEvent.description ?? "",
		dates:
			apiEvent.dates?.map((d) => ({
				date: d.date,
				times: [d.start_time],
			})) ?? [],
		location: apiEvent.venue
			? `${apiEvent.venue.city}, ${apiEvent.venue.state}`
			: "Location TBD",
		venue: apiEvent.venue?.name ?? "Venue TBD",
		region,
		image: apiEvent.image_url ?? "/placeholder.svg?height=400&width=600",
		imageBlur: apiEvent.image_blur ?? undefined,
		category: apiEvent.category,
		artist: apiEvent.artist ?? undefined,
		organizer: apiEvent.organization?.name ?? "Boletrics",
		orgId: apiEvent.org_id,
		ticketTypes:
			apiEvent.ticket_types?.map((tt) => ({
				id: tt.id,
				name: tt.name,
				price: tt.price,
				available: tt.quantity_available,
				description: tt.description ?? "",
			})) ?? [],
	};
}

/**
 * Maps an array of API Events to display Events.
 */
export function mapApiEventsToDisplay(apiEvents: ApiEvent[]): DisplayEvent[] {
	return apiEvents.map(mapApiEventToDisplay);
}
