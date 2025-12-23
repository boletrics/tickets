"use client";

import { useState, useEffect, useCallback } from "react";
import { getClientJwt } from "@/lib/auth/authClient";

interface UseJwtResult {
	jwt: string | null;
	isLoading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
}

/**
 * React hook for client components to asynchronously retrieve and provide the JWT.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { jwt, isLoading } = useJwt();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (!jwt) return <div>Not authenticated</div>;
 *
 *   // Use jwt for API calls
 *   return <div>Authenticated</div>;
 * }
 * ```
 */
export function useJwt(): UseJwtResult {
	const [jwt, setJwt] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchJwt = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);
			const token = await getClientJwt();
			setJwt(token);
		} catch (err) {
			setError(err instanceof Error ? err : new Error("Failed to fetch JWT"));
			setJwt(null);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchJwt();
	}, [fetchJwt]);

	return { jwt, isLoading, error, refetch: fetchJwt };
}
