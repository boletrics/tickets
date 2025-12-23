import { notFound } from "next/navigation";
import { serverGet } from "@/lib/api/server";
import type { Event as ApiEvent } from "@/lib/api/types";
import { EventDetailClient } from "@/components/event-detail-client";
import type { Event } from "@/lib/types";

interface PageProps {
	params: Promise<{ id: string }>;
}

// Map API event to display event format
function mapApiEventToDisplay(apiEvent: ApiEvent): Event {
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
		region: (apiEvent.venue?.region ?? "mexico-city") as
			| "mexico-city"
			| "monterrey"
			| "guadalajara"
			| "cancun",
		image: apiEvent.image_url ?? "/placeholder.svg?height=400&width=600",
		category: apiEvent.category,
		artist: apiEvent.artist ?? undefined,
		organizer: apiEvent.organization?.name ?? "Boletrics",
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

export default async function EventPage({ params }: PageProps) {
	const { id } = await params;

	try {
		const apiEvent = await serverGet<ApiEvent>(
			`/events/${id}?include=venue,dates,ticket_types,organization`,
		);

		if (!apiEvent) {
			notFound();
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
