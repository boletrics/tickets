"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getAuthLoginUrl } from "@/lib/auth/config";

function AuthRedirect() {
	const searchParams = useSearchParams();

	useEffect(() => {
		// Redirect to external auth service
		const returnUrl =
			searchParams.get("redirect_to") ||
			(typeof window !== "undefined" ? window.location.href : undefined);
		if (returnUrl) {
			window.location.href = getAuthLoginUrl(returnUrl);
		} else {
			window.location.href = getAuthLoginUrl();
		}
	}, [searchParams]);

	return null;
}

export default function AuthPage() {
	return (
		<Suspense fallback={null}>
			<AuthRedirect />
		</Suspense>
	);
}
