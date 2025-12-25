import "server-only";

import { cookies } from "next/headers";
import { getTicketsSvcUrl } from "./config";
import { getAuthServiceUrl, getAuthAppUrl } from "../auth/config";
import type { ApiResponse, ApiSuccessResponse } from "./types";

// ============================================================================
// Server-side API Error
// ============================================================================

export class ServerApiError extends Error {
	name = "ServerApiError" as const;
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
}

// ============================================================================
// Server-side JWT Retrieval
// ============================================================================

/**
 * Get JWT token from auth-svc using session cookies.
 * Server-side only.
 */
async function getServerJwt(): Promise<string | null> {
	const cookieStore = await cookies();
	const cookieHeader = cookieStore.toString();

	// Check for session cookie existence
	if (
		!cookieHeader.includes("better-auth.session_token") &&
		!cookieHeader.includes("__Secure-better-auth.session_token")
	) {
		return null;
	}

	try {
		const response = await fetch(`${getAuthServiceUrl()}/api/auth/token`, {
			headers: {
				Cookie: cookieHeader,
				Origin: getAuthAppUrl(),
				Accept: "application/json",
			},
			cache: "no-store",
		});

		if (!response.ok) {
			console.error(
				`Failed to get JWT: ${response.status} ${response.statusText}`,
			);
			return null;
		}

		const data = (await response.json()) as { token?: string };
		return data.token ?? null;
	} catch (error) {
		console.error("Error fetching JWT:", error);
		return null;
	}
}

// ============================================================================
// Server-side Fetch
// ============================================================================

export interface ServerFetchOptions extends Omit<RequestInit, "body"> {
	body?: unknown;
	requireAuth?: boolean;
}

/**
 * Server-side fetch with automatic JWT injection.
 * Use this in Server Components, Route Handlers, and Server Actions.
 */
export async function serverFetch<T>(
	endpoint: string,
	options: ServerFetchOptions = {},
): Promise<T> {
	const { body, requireAuth = false, ...fetchOptions } = options;

	const headers: Record<string, string> = {
		Accept: "application/json",
		...(fetchOptions.headers as Record<string, string>),
	};

	// Get JWT for authenticated requests
	const jwt = await getServerJwt();
	if (jwt) {
		headers.Authorization = `Bearer ${jwt}`;
	} else if (requireAuth) {
		throw new ServerApiError("Authentication required", {
			status: 401,
			body: null,
		});
	}

	// Serialize body if needed
	let serializedBody: BodyInit | undefined;
	if (body !== undefined) {
		if (body instanceof FormData) {
			serializedBody = body;
		} else {
			headers["Content-Type"] = "application/json";
			serializedBody = JSON.stringify(body);
		}
	}

	const url = endpoint.startsWith("http")
		? endpoint
		: `${getTicketsSvcUrl()}${endpoint}`;

	const response = await fetch(url, {
		...fetchOptions,
		headers,
		body: serializedBody,
	});

	const contentType = response.headers.get("content-type") ?? "";
	const isJson = contentType.includes("application/json");
	const responseBody = isJson ? await response.json() : await response.text();

	if (!response.ok) {
		const errorBody = responseBody as ApiResponse<unknown>;
		const message =
			!isJson || typeof responseBody === "string"
				? `Request failed: ${response.status}`
				: "errors" in errorBody && errorBody.errors?.[0]?.message
					? errorBody.errors[0].message
					: `Request failed: ${response.status}`;

		throw new ServerApiError(message, {
			status: response.status,
			code:
				isJson && "errors" in errorBody
					? errorBody.errors?.[0]?.code
					: undefined,
			body: responseBody,
		});
	}

	// Handle successful response - extract result if wrapped
	if (isJson && typeof responseBody === "object" && responseBody !== null) {
		const apiResponse = responseBody as ApiResponse<T>;
		if (
			"success" in apiResponse &&
			apiResponse.success &&
			"result" in apiResponse
		) {
			return (apiResponse as ApiSuccessResponse<T>).result;
		}
	}

	return responseBody as T;
}

// ============================================================================
// Convenience Methods
// ============================================================================

/**
 * Server-side GET request.
 */
export function serverGet<T>(
	endpoint: string,
	options?: Omit<ServerFetchOptions, "method" | "body">,
): Promise<T> {
	return serverFetch<T>(endpoint, { ...options, method: "GET" });
}

/**
 * Server-side POST request.
 */
export function serverPost<T>(
	endpoint: string,
	body?: unknown,
	options?: Omit<ServerFetchOptions, "method" | "body">,
): Promise<T> {
	return serverFetch<T>(endpoint, { ...options, method: "POST", body });
}

/**
 * Server-side PUT request.
 */
export function serverPut<T>(
	endpoint: string,
	body?: unknown,
	options?: Omit<ServerFetchOptions, "method" | "body">,
): Promise<T> {
	return serverFetch<T>(endpoint, { ...options, method: "PUT", body });
}

/**
 * Server-side DELETE request.
 */
export function serverDelete<T>(
	endpoint: string,
	options?: Omit<ServerFetchOptions, "method" | "body">,
): Promise<T> {
	return serverFetch<T>(endpoint, { ...options, method: "DELETE" });
}

// ============================================================================
// Query String Helper (for server-side)
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
