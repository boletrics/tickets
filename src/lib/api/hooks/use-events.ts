"use client";

import useSWR from "swr";
import {
	useApiQuery,
	useApiMutation,
	buildQueryString,
	revalidate,
} from "../client";
import type {
	Event,
	EventsQueryParams,
	CreateEventInput,
	UpdateEventInput,
	PaginatedResult,
} from "../types";

// ============================================================================
// Events Hooks
// ============================================================================

/**
 * Fetch a list of published events (for B2C marketplace).
 * Optionally filter by category, region, search query.
 */
export function usePublicEvents(params: EventsQueryParams = {}) {
	const queryString = buildQueryString({
		...params,
		status: "published", // Only show published events on marketplace
		include: params.include ?? "venue,dates,ticket_types",
	});

	return useApiQuery<PaginatedResult<Event>>(`/events${queryString}`);
}

/**
 * Fetch all events for an organization (for partner dashboard).
 */
export function useOrganizationEvents(
	orgId: string | null,
	params: Omit<EventsQueryParams, "org_id"> = {},
) {
	const queryString = buildQueryString({
		...params,
		org_id: orgId ?? undefined,
		include: params.include ?? "venue,dates,ticket_types",
	});

	return useApiQuery<PaginatedResult<Event>>(
		orgId ? `/events${queryString}` : null,
	);
}

/**
 * Fetch a single event by ID.
 */
export function useEvent(eventId: string | null) {
	return useApiQuery<Event>(
		eventId
			? `/events/${eventId}?include=venue,dates,ticket_types,organization`
			: null,
	);
}

/**
 * Fetch a single event by slug.
 */
export function useEventBySlug(slug: string | null) {
	const queryString = buildQueryString({
		slug,
		include: "venue,dates,ticket_types,organization",
	});

	const { data, ...rest } = useApiQuery<PaginatedResult<Event>>(
		slug ? `/events${queryString}` : null,
	);

	return {
		data: data?.data?.[0] ?? undefined,
		...rest,
	};
}

// ============================================================================
// Event Mutations
// ============================================================================

/**
 * Create a new event.
 */
export function useCreateEvent() {
	const mutation = useApiMutation<Event, CreateEventInput>("/events", "POST");

	const createEvent = async (data: CreateEventInput) => {
		const result = await mutation.trigger(data);
		// Revalidate events list
		revalidate(/\/events/);
		return result;
	};

	return {
		...mutation,
		createEvent,
	};
}

/**
 * Update an existing event.
 */
export function useUpdateEvent(eventId: string) {
	const mutation = useApiMutation<Event, UpdateEventInput>(
		`/events/${eventId}`,
		"PUT",
	);

	const updateEvent = async (data: UpdateEventInput) => {
		const result = await mutation.trigger(data);
		// Revalidate both the specific event and events list
		revalidate(`/events/${eventId}`);
		revalidate(/\/events/);
		return result;
	};

	return {
		...mutation,
		updateEvent,
	};
}

/**
 * Delete an event.
 */
export function useDeleteEvent() {
	const deleteEvent = async (eventId: string) => {
		const mutation = useApiMutation<void, void>(`/events/${eventId}`, "DELETE");
		await mutation.trigger();
		revalidate(/\/events/);
	};

	return { deleteEvent };
}

/**
 * Publish an event (change status to published).
 */
export function usePublishEvent(eventId: string) {
	const mutation = useApiMutation<Event, { status: "published" }>(
		`/events/${eventId}`,
		"PUT",
	);

	const publishEvent = async () => {
		const result = await mutation.trigger({ status: "published" });
		revalidate(`/events/${eventId}`);
		revalidate(/\/events/);
		return result;
	};

	return {
		...mutation,
		publishEvent,
	};
}

// ============================================================================
// Ticket Type Availability Hook (for real-time updates)
// ============================================================================

/**
 * Poll ticket availability for an event.
 * Useful for showing real-time stock updates during checkout.
 */
export function useTicketAvailability(
	eventId: string | null,
	options?: { refreshInterval?: number },
) {
	return useApiQuery<Event>(
		eventId ? `/events/${eventId}?include=ticket_types` : null,
		{
			refreshInterval: options?.refreshInterval ?? 30000, // Default: 30 seconds
			revalidateOnFocus: true,
		},
	);
}
