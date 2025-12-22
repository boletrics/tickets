export const getAuthServiceUrl = (): string => {
	return (
		process.env.NEXT_PUBLIC_AUTH_SERVICE_URL ||
		"https://auth-svc.example.workers.dev"
	);
};

export const getAuthAppUrl = (): string => {
	return (
		process.env.NEXT_PUBLIC_AUTH_APP_URL || "https://auth.boletrics.workers.dev"
	);
};

export const getAuthLoginUrl = (returnUrl?: string): string => {
	const authAppUrl = getAuthAppUrl();
	if (returnUrl) {
		return `${authAppUrl}/login?redirect_to=${encodeURIComponent(returnUrl)}`;
	}
	return `${authAppUrl}/login`;
};
