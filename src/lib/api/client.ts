"use client";

import useSWR, { SWRConfiguration, mutate as globalMutate } from "swr";
import useSWRMutation from "swr/mutation";
import { getClientJwt } from "../auth/authClient";
import { getTicketsSvcUrl } from "./config";
import type { ApiResponse, ApiSuccessResponse } from "./types";

// ============================================================================
// API Error Handling
// ============================================================================

export class ApiError extends Error {
	name = "ApiError" as const;
	status: number;
	code?: number;
	body: unknown;

	constructor(
		message: string,
		opts: { status: number; code?: number; body: unknown },
	) {
		super(message);
		this.status = opts.status;
		this.code = opts.code;
		this.body = opts.body;
	}

	static isApiError(error: unknown): error is ApiError {
		return error instanceof ApiError;
	}
}

// ============================================================================
// Base Fetcher with JWT
// ============================================================================

export type FetcherOptions = RequestInit & {
	jwt?: string | null;
};

/**
 * Low-level fetch wrapper with JWT injection.
 * Used by both client fetcher and mutation functions.
 */
export async function apiFetch<T>(
	endpoint: string,
	options: FetcherOptions = {},
): Promise<T> {
	const { jwt, ...fetchOptions } = options;

	const headers: Record<string, string> = {
		Accept: "application/json",
		...(fetchOptions.headers as Record<string, string>),
	};

	// Add JWT if provided or try to get one
	const token = jwt ?? (await getClientJwt());
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}

	// If body is object and not FormData, stringify it
	if (
		fetchOptions.body &&
		typeof fetchOptions.body === "object" &&
		!(fetchOptions.body instanceof FormData)
	) {
		headers["Content-Type"] = "application/json";
		fetchOptions.body = JSON.stringify(fetchOptions.body);
	}

	const url = endpoint.startsWith("http")
		? endpoint
		: `${getTicketsSvcUrl()}${endpoint}`;

	const response = await fetch(url, {
		...fetchOptions,
		headers,
	});

	const contentType = response.headers.get("content-type") ?? "";
	const isJson = contentType.includes("application/json");
	const body = isJson ? await response.json() : await response.text();

	if (!response.ok) {
		const errorBody = body as ApiResponse<unknown>;
		const message =
			!isJson || typeof body === "string"
				? `Request failed: ${response.status}`
				: "errors" in errorBody && errorBody.errors?.[0]?.message
					? errorBody.errors[0].message
					: `Request failed: ${response.status}`;

		throw new ApiError(message, {
			status: response.status,
			code:
				isJson && "errors" in errorBody
					? errorBody.errors?.[0]?.code
					: undefined,
			body,
		});
	}

	// Handle successful response - extract result if wrapped
	if (isJson && typeof body === "object" && body !== null) {
		const apiResponse = body as ApiResponse<T>;
		if (
			"success" in apiResponse &&
			apiResponse.success &&
			"result" in apiResponse
		) {
			return (apiResponse as ApiSuccessResponse<T>).result;
		}
	}

	return body as T;
}

/**
 * SWR fetcher function - used automatically by useSWR hooks.
 */
export const swrFetcher = async <T>(url: string): Promise<T> => {
	return apiFetch<T>(url);
};

// ============================================================================
// SWR Configuration
// ============================================================================

export const defaultSwrConfig: SWRConfiguration = {
	fetcher: swrFetcher,
	revalidateOnFocus: true,
	revalidateOnReconnect: true,
	shouldRetryOnError: true,
	errorRetryCount: 3,
	dedupingInterval: 2000,
};

// ============================================================================
// Generic SWR Hooks
// ============================================================================

/**
 * Generic hook for GET requests with SWR.
 */
export function useApiQuery<T>(
	endpoint: string | null,
	config?: SWRConfiguration<T>,
) {
	const url = endpoint
		? endpoint.startsWith("http")
			? endpoint
			: `${getTicketsSvcUrl()}${endpoint}`
		: null;

	return useSWR<T, ApiError>(url, {
		...defaultSwrConfig,
		...config,
	});
}

/**
 * Generic hook for mutations (POST, PUT, DELETE).
 */
export function useApiMutation<TData, TArg = unknown>(
	endpoint: string,
	method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
) {
	const url = endpoint.startsWith("http")
		? endpoint
		: `${getTicketsSvcUrl()}${endpoint}`;

	return useSWRMutation<TData, ApiError, string, TArg>(
		url,
		async (key: string, { arg }: { arg: TArg }) => {
			return apiFetch<TData>(key, {
				method,
				body: arg as unknown as BodyInit,
			});
		},
	);
}

// ============================================================================
// Mutation Helpers
// ============================================================================

/**
 * Revalidate a specific endpoint or pattern.
 */
export function revalidate(key: string | RegExp) {
	if (typeof key === "string") {
		const url = key.startsWith("http") ? key : `${getTicketsSvcUrl()}${key}`;
		globalMutate(url);
	} else {
		// Revalidate all keys matching the pattern
		globalMutate((k) => typeof k === "string" && key.test(k));
	}
}

/**
 * Helper for optimistic updates.
 */
export async function optimisticUpdate<T>(
	key: string,
	updateFn: (current: T | undefined) => T,
	revalidateAfter = true,
) {
	const url = key.startsWith("http") ? key : `${getTicketsSvcUrl()}${key}`;
	await globalMutate(url, updateFn, {
		revalidate: revalidateAfter,
	});
}

// ============================================================================
// Query String Helpers
// ============================================================================

/**
 * Build query string from params object.
 */
export function buildQueryString(
	params: Record<string, string | number | boolean | undefined | null>,
): string {
	const searchParams = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null && value !== "") {
			searchParams.append(key, String(value));
		}
	});

	const queryString = searchParams.toString();
	return queryString ? `?${queryString}` : "";
}

// ============================================================================
// Re-exports for convenience
// ============================================================================

/**
 * SWR fetcher function - alias for backwards compatibility.
 */
export const fetcher = swrFetcher;

/**
 * Get the current auth token (for testing).
 */
export function getAuthToken(): string | null {
	// This would be implemented based on your auth setup
	return null;
}
