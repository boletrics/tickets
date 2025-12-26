import { notFound } from "next/navigation";
import { serverGet } from "@/lib/api/server";
import { mapApiEventToDisplay } from "@/lib/api/mappers";
import type { Event as ApiEvent } from "@/lib/api/types";
import { EventDetailClient } from "@/components/event-detail-client";

interface PageProps {
	params: Promise<{ id: string }>;
}

// Check if a string looks like a UUID
function isUUID(str: string): boolean {
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return uuidRegex.test(str);
}

// Fetch event by ID or slug
async function fetchEvent(idOrSlug: string): Promise<ApiEvent | null> {
	// If it looks like a UUID, try fetching by ID first
	if (isUUID(idOrSlug)) {
		try {
			return await serverGet<ApiEvent>(`/events/${idOrSlug}`);
		} catch {
			// ID lookup failed, will try slug below
		}
	}

	// Try fetching by slug using the list endpoint with filter
	try {
		const events = await serverGet<ApiEvent[]>(`/events?slug=${idOrSlug}`);
		if (events && events.length > 0) {
			return events[0];
		}
	} catch {
		// Slug lookup failed
	}

	// If not a UUID and slug failed, try ID lookup as last resort
	if (!isUUID(idOrSlug)) {
		try {
			return await serverGet<ApiEvent>(`/events/${idOrSlug}`);
		} catch {
			// ID lookup failed
		}
	}

	return null;
}

export default async function EventPage({ params }: PageProps) {
	const { id } = await params;

	try {
		// Fetch event by ID or slug
		const apiEvent = await fetchEvent(id);

		if (!apiEvent) {
			notFound();
		}

		// Fetch venue if venue_id exists
		if (apiEvent.venue_id) {
			try {
				const venue = await serverGet<ApiEvent["venue"]>(
					`/venues/${apiEvent.venue_id}`,
				);
				apiEvent.venue = venue;
			} catch {
				// Venue fetch failed, continue without it
			}
		}

		// Fetch ticket types for this event (use apiEvent.id in case we looked up by slug)
		try {
			const ticketTypes = await serverGet<ApiEvent["ticket_types"]>(
				`/ticket-types?event_id=${apiEvent.id}`,
			);
			apiEvent.ticket_types = ticketTypes;
		} catch {
			// Ticket types fetch failed, continue without them
		}

		// Fetch event dates for this event (use apiEvent.id in case we looked up by slug)
		try {
			const dates = await serverGet<ApiEvent["dates"]>(
				`/event-dates?event_id=${apiEvent.id}`,
			);
			apiEvent.dates = dates;
		} catch {
			// Dates fetch failed, continue without them
		}

		const event = mapApiEventToDisplay(apiEvent);
		return <EventDetailClient event={event} />;
	} catch (error) {
		console.error("Failed to fetch event:", error);
		notFound();
	}
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
	const { id } = await params;

	try {
		const apiEvent = await fetchEvent(id);

		if (!apiEvent) {
			return { title: "Event | Boletrics" };
		}

		return {
			title: `${apiEvent.title} | Boletrics`,
			description: apiEvent.description ?? `Get tickets for ${apiEvent.title}`,
			openGraph: {
				title: apiEvent.title,
				description:
					apiEvent.description ?? `Get tickets for ${apiEvent.title}`,
				images: apiEvent.image_url ? [apiEvent.image_url] : [],
			},
		};
	} catch {
		return {
			title: "Event | Boletrics",
		};
	}
}
