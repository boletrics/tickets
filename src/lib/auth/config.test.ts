import { describe, expect, it } from "vitest";
import { getAuthServiceUrl, getAuthAppUrl, getAuthLoginUrl } from "./config";

describe("auth/config", () => {
	describe("getAuthServiceUrl", () => {
		it("uses NEXT_PUBLIC_AUTH_SERVICE_URL when set", () => {
			const prev = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;

			try {
				process.env.NEXT_PUBLIC_AUTH_SERVICE_URL =
					"https://custom-auth-svc.example.com";
				expect(getAuthServiceUrl()).toBe("https://custom-auth-svc.example.com");
			} finally {
				if (prev === undefined) delete process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
				else process.env.NEXT_PUBLIC_AUTH_SERVICE_URL = prev;
			}
		});

		it("falls back to default when env var is unset", () => {
			const prev = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;

			try {
				delete process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
				expect(getAuthServiceUrl()).toBe(
					"https://auth-svc.example.workers.dev",
				);
			} finally {
				if (prev === undefined) delete process.env.NEXT_PUBLIC_AUTH_SERVICE_URL;
				else process.env.NEXT_PUBLIC_AUTH_SERVICE_URL = prev;
			}
		});
	});

	describe("getAuthAppUrl", () => {
		it("uses NEXT_PUBLIC_AUTH_APP_URL when set", () => {
			const prev = process.env.NEXT_PUBLIC_AUTH_APP_URL;

			try {
				process.env.NEXT_PUBLIC_AUTH_APP_URL =
					"https://custom-auth.example.com";
				expect(getAuthAppUrl()).toBe("https://custom-auth.example.com");
			} finally {
				if (prev === undefined) delete process.env.NEXT_PUBLIC_AUTH_APP_URL;
				else process.env.NEXT_PUBLIC_AUTH_APP_URL = prev;
			}
		});

		it("falls back to default when env var is unset", () => {
			const prev = process.env.NEXT_PUBLIC_AUTH_APP_URL;

			try {
				delete process.env.NEXT_PUBLIC_AUTH_APP_URL;
				expect(getAuthAppUrl()).toBe("https://auth.boletrics.workers.dev");
			} finally {
				if (prev === undefined) delete process.env.NEXT_PUBLIC_AUTH_APP_URL;
				else process.env.NEXT_PUBLIC_AUTH_APP_URL = prev;
			}
		});
	});

	describe("getAuthLoginUrl", () => {
		it("returns login URL without redirect when returnUrl is not provided", () => {
			const url = getAuthLoginUrl();
			expect(url).toBe("https://auth.boletrics.workers.dev/login");
		});

		it("returns login URL with redirect_to query param when returnUrl is provided", () => {
			const returnUrl = "https://example.com/page";
			const url = getAuthLoginUrl(returnUrl);
			expect(url).toBe(
				"https://auth.boletrics.workers.dev/login?redirect_to=https%3A%2F%2Fexample.com%2Fpage",
			);
		});

		it("encodes returnUrl with special characters", () => {
			const returnUrl = "https://example.com/page?foo=bar&baz=qux";
			const url = getAuthLoginUrl(returnUrl);
			expect(url).toContain("redirect_to=");
			expect(url).toContain(encodeURIComponent(returnUrl));
		});

		it("uses custom auth app URL from env when set", () => {
			const prev = process.env.NEXT_PUBLIC_AUTH_APP_URL;

			try {
				process.env.NEXT_PUBLIC_AUTH_APP_URL =
					"https://custom-auth.example.com";
				const url = getAuthLoginUrl("https://example.com");
				expect(url).toBe(
					"https://custom-auth.example.com/login?redirect_to=https%3A%2F%2Fexample.com",
				);
			} finally {
				if (prev === undefined) delete process.env.NEXT_PUBLIC_AUTH_APP_URL;
				else process.env.NEXT_PUBLIC_AUTH_APP_URL = prev;
			}
		});
	});
});
