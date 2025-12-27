import { serverGet, buildQueryString } from "@/lib/api/server";
import type { Event, Venue, EventDate, TicketType } from "@/lib/api/types";
import { HomePageClient } from "./home-page-client";

/**
 * Enrich events with venue, dates, and ticket types data.
 * Fetches related data in parallel, filtered by the specific events being displayed.
 */
async function enrichEvents(events: Event[]): Promise<Event[]> {
	if (events.length === 0) return events;

	// Get unique venue IDs and event IDs
	const venueIds = [...new Set(events.map((e) => e.venue_id).filter(Boolean))];
	const eventIds = events.map((e) => e.id);

	// Fetch venues, dates, and ticket types in parallel
	// Note: Venues are fetched individually as the API doesn't support bulk venue queries
	// Dates and ticket types are fetched per event to avoid loading unrelated data
	const [venues, datesResults, ticketTypesResults] = await Promise.all([
		// Fetch venues in parallel (one request per unique venue)
		venueIds.length > 0
			? Promise.all(
					venueIds.map((id) =>
						serverGet<Venue>(`/venues/${id}`).catch((error) => {
							console.warn(`Failed to fetch venue ${id}:`, error);
							return null;
						}),
					),
				)
			: [],
		// Fetch dates per event in parallel (filtered by event_id)
		eventIds.length > 0
			? Promise.all(
					eventIds.map((id) =>
						serverGet<EventDate[]>(`/event-dates?event_id=${id}`).catch(
							(error) => {
								console.warn(`Failed to fetch dates for event ${id}:`, error);
								return [] as EventDate[];
							},
						),
					),
				)
			: [],
		// Fetch ticket types per event in parallel (filtered by event_id)
		eventIds.length > 0
			? Promise.all(
					eventIds.map((id) =>
						serverGet<TicketType[]>(`/ticket-types?event_id=${id}`).catch(
							(error) => {
								console.warn(
									`Failed to fetch ticket types for event ${id}:`,
									error,
								);
								return [] as TicketType[];
							},
						),
					),
				)
			: [],
	]);

	// Flatten dates and ticket types arrays
	const dates = datesResults.flat();
	const ticketTypes = ticketTypesResults.flat();

	// Create lookup maps
	const venueMap = new Map<string, Venue>();
	venues.forEach((v) => {
		if (v) venueMap.set(v.id, v);
	});

	const datesByEvent = new Map<string, EventDate[]>();
	(dates || []).forEach((d) => {
		if (!datesByEvent.has(d.event_id)) {
			datesByEvent.set(d.event_id, []);
		}
		datesByEvent.get(d.event_id)!.push(d);
	});

	const ticketsByEvent = new Map<string, TicketType[]>();
	(ticketTypes || []).forEach((t) => {
		if (!ticketsByEvent.has(t.event_id)) {
			ticketsByEvent.set(t.event_id, []);
		}
		ticketsByEvent.get(t.event_id)!.push(t);
	});

	// Enrich events
	return events.map((event) => ({
		...event,
		venue: event.venue_id ? venueMap.get(event.venue_id) : undefined,
		dates: datesByEvent.get(event.id) || [],
		ticket_types: ticketsByEvent.get(event.id) || [],
	}));
}

/**
 * Server-side data fetching for the homepage.
 * Fetches initial events to be displayed on page load.
 */
async function getInitialEvents(): Promise<Event[]> {
	try {
		const queryString = buildQueryString({
			status: "published",
			limit: 50,
		});

		const events = await serverGet<Event[]>(`/events${queryString}`);
		return enrichEvents(events);
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
