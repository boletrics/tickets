import { notFound } from "next/navigation";
import { serverGet } from "@/lib/api/server";
import { mapApiEventToDisplay } from "@/lib/api/mappers";
import type { Event as ApiEvent } from "@/lib/api/types";
import { EventDetailClient } from "@/components/event-detail-client";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function EventPage({ params }: PageProps) {
	const { id } = await params;

	try {
		// Fetch event (API doesn't support include, so fetch relations separately)
		const apiEvent = await serverGet<ApiEvent>(`/events/${id}`);

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

		// Fetch ticket types for this event
		try {
			const ticketTypes = await serverGet<ApiEvent["ticket_types"]>(
				`/ticket-types?event_id=${id}`,
			);
			apiEvent.ticket_types = ticketTypes;
		} catch {
			// Ticket types fetch failed, continue without them
		}

		// Fetch event dates for this event
		try {
			const dates = await serverGet<ApiEvent["dates"]>(
				`/event-dates?event_id=${id}`,
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
		const apiEvent = await serverGet<ApiEvent>(`/events/${id}`);

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
