import { serverGet, buildQueryString } from "@/lib/api/server";
import type { Event, PaginatedResult } from "@/lib/api/types";
import { HomePageClient } from "./home-page-client";

/**
 * Server-side data fetching for the homepage.
 * Fetches initial events to be displayed on page load.
 */
async function getInitialEvents(): Promise<Event[]> {
	try {
		const queryString = buildQueryString({
			status: "published",
			include: "venue,dates,ticket_types",
			limit: 50,
		});

		const result = await serverGet<PaginatedResult<Event>>(
			`/events${queryString}`,
		);
		return result.data ?? [];
	} catch (error) {
		console.error("Failed to fetch events:", error);
		// Return empty array on error - the page will show empty state
		return [];
	}
}

export default async function HomePage() {
	const events = await getInitialEvents();

	return <HomePageClient initialEvents={events} />;
}
