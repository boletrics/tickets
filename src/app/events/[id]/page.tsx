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
		} catch (error) {
			console.warn(`Failed to fetch event by ID ${idOrSlug}:`, error);
			// ID lookup failed, will try slug below
		}
	}

	// Try fetching by slug using the list endpoint with filter
	try {
		const events = await serverGet<ApiEvent[]>(`/events?slug=${idOrSlug}`);
		if (events && events.length > 0) {
			return events[0];
		}
	} catch (error) {
		console.warn(`Failed to fetch event by slug ${idOrSlug}:`, error);
		// Slug lookup failed
	}

	// If not a UUID and slug failed, try ID lookup as last resort
	if (!isUUID(idOrSlug)) {
		try {
			return await serverGet<ApiEvent>(`/events/${idOrSlug}`);
		} catch (error) {
			console.warn(`Failed to fetch event by ID ${idOrSlug}:`, error);
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

		// Fetch venue, ticket types, and dates in parallel for better performance
		const [venueResult, ticketTypesResult, datesResult] =
			await Promise.allSettled([
				apiEvent.venue_id
					? serverGet<ApiEvent["venue"]>(`/venues/${apiEvent.venue_id}`)
					: Promise.resolve(null),
				serverGet<ApiEvent["ticket_types"]>(
					`/ticket-types?event_id=${apiEvent.id}`,
				),
				serverGet<ApiEvent["dates"]>(`/event-dates?event_id=${apiEvent.id}`),
			]);

		// Apply venue if fetch succeeded
		if (venueResult.status === "fulfilled" && venueResult.value) {
			apiEvent.venue = venueResult.value;
		} else if (venueResult.status === "rejected") {
			console.warn(
				`Failed to fetch venue ${apiEvent.venue_id}:`,
				venueResult.reason,
			);
		}

		// Apply ticket types if fetch succeeded
		if (ticketTypesResult.status === "fulfilled") {
			apiEvent.ticket_types = ticketTypesResult.value;
		} else {
			console.warn(
				`Failed to fetch ticket types for event ${apiEvent.id}:`,
				ticketTypesResult.reason,
			);
		}

		// Apply dates if fetch succeeded
		if (datesResult.status === "fulfilled") {
			apiEvent.dates = datesResult.value;
		} else {
			console.warn(
				`Failed to fetch dates for event ${apiEvent.id}:`,
				datesResult.reason,
			);
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
