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
