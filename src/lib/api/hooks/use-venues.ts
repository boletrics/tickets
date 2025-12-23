"use client";

import {
	useApiQuery,
	useApiMutation,
	buildQueryString,
	revalidate,
} from "../client";
import type {
	Venue,
	CreateVenueInput,
	UpdateVenueInput,
	PaginatedResult,
} from "../types";

// ============================================================================
// Venues Query Params
// ============================================================================

export interface VenuesQueryParams {
	region?: string;
	city?: string;
	search?: string;
	page?: number;
	limit?: number;
	[key: string]: string | number | boolean | undefined | null;
}

// ============================================================================
// Venues Hooks
// ============================================================================

/**
 * Fetch a list of venues.
 */
export function useVenues(params: VenuesQueryParams = {}) {
	const queryString = buildQueryString(params);
	return useApiQuery<PaginatedResult<Venue>>(`/venues${queryString}`);
}

/**
 * Fetch venues by region (for filtering).
 */
export function useVenuesByRegion(region: string | null) {
	const queryString = buildQueryString({ region: region ?? undefined });
	return useApiQuery<PaginatedResult<Venue>>(
		region ? `/venues${queryString}` : null,
	);
}

/**
 * Fetch a single venue by ID.
 */
export function useVenue(venueId: string | null) {
	return useApiQuery<Venue>(venueId ? `/venues/${venueId}` : null);
}

// ============================================================================
// Venue Mutations
// ============================================================================

/**
 * Create a new venue.
 */
export function useCreateVenue() {
	const mutation = useApiMutation<Venue, CreateVenueInput>("/venues", "POST");

	const createVenue = async (data: CreateVenueInput) => {
		const result = await mutation.trigger(data);
		revalidate(/\/venues/);
		return result;
	};

	return {
		...mutation,
		createVenue,
	};
}

/**
 * Update an existing venue.
 */
export function useUpdateVenue(venueId: string) {
	const mutation = useApiMutation<Venue, UpdateVenueInput>(
		`/venues/${venueId}`,
		"PUT",
	);

	const updateVenue = async (data: UpdateVenueInput) => {
		const result = await mutation.trigger(data);
		revalidate(`/venues/${venueId}`);
		revalidate(/\/venues/);
		return result;
	};

	return {
		...mutation,
		updateVenue,
	};
}

/**
 * Delete a venue.
 */
export function useDeleteVenue() {
	const deleteVenue = async (venueId: string) => {
		const mutation = useApiMutation<void, void>(`/venues/${venueId}`, "DELETE");
		await mutation.trigger();
		revalidate(/\/venues/);
	};

	return { deleteVenue };
}
