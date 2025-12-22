import { describe, expect, it, beforeEach } from "vitest";
import { sessionStore, setSession, clearSession } from "./sessionStore";
import type { Session } from "./types";

describe("auth/sessionStore", () => {
	beforeEach(() => {
		// Reset store to initial state before each test
		sessionStore.set({
			data: null,
			error: null,
			isPending: true,
		});
	});

	describe("initial state", () => {
		it("has null session data initially", () => {
			const state = sessionStore.get();
			expect(state.data).toBeNull();
			expect(state.error).toBeNull();
			expect(state.isPending).toBe(true);
		});
	});

	describe("setSession", () => {
		it("sets session data and updates state", () => {
			const mockSession: Session = {
				user: {
					id: "123",
					name: "Test User",
					email: "test@example.com",
					image: null,
					emailVerified: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				session: {
					id: "session-123",
					userId: "123",
					token: "token-123",
					expiresAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			};

			setSession(mockSession);

			const state = sessionStore.get();
			expect(state.data).toEqual(mockSession);
			expect(state.error).toBeNull();
			expect(state.isPending).toBe(false);
		});

		it("can set null session", () => {
			setSession(null);

			const state = sessionStore.get();
			expect(state.data).toBeNull();
			expect(state.error).toBeNull();
			expect(state.isPending).toBe(false);
		});
	});

	describe("clearSession", () => {
		it("clears session data and resets state", () => {
			// First set a session
			const mockSession: Session = {
				user: {
					id: "123",
					name: "Test User",
					email: "test@example.com",
					image: null,
					emailVerified: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				session: {
					id: "session-123",
					userId: "123",
					token: "token-123",
					expiresAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			};

			setSession(mockSession);
			expect(sessionStore.get().data).not.toBeNull();

			// Then clear it
			clearSession();

			const state = sessionStore.get();
			expect(state.data).toBeNull();
			expect(state.error).toBeNull();
			expect(state.isPending).toBe(false);
		});
	});

	describe("store reactivity", () => {
		it("notifies subscribers when session changes", () => {
			type SessionState = ReturnType<typeof sessionStore.get>;
			let notifiedValue: SessionState | null = null;

			const unsubscribe = sessionStore.subscribe((value) => {
				notifiedValue = value;
			});

			const mockSession: Session = {
				user: {
					id: "123",
					name: "Test User",
					email: "test@example.com",
					image: null,
					emailVerified: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
				session: {
					id: "session-123",
					userId: "123",
					token: "token-123",
					expiresAt: new Date(),
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			};

			setSession(mockSession);

			expect(notifiedValue).not.toBeNull();
			expect(notifiedValue?.data).toEqual(mockSession);

			unsubscribe();
		});
	});
});
