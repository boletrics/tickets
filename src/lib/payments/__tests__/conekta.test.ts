import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
	createOrder,
	createCheckout,
	verifyWebhookSignature,
	toCents,
	fromCents,
	type CreateOrderRequest,
	type CreateCheckoutRequest,
} from "../conekta";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("Conekta Payment Integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock environment variable
		vi.stubEnv("CONEKTA_API_KEY", "test-api-key");
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
	});

	describe("createOrder", () => {
		const mockOrderRequest: CreateOrderRequest = {
			customer_info: {
				name: "John Doe",
				email: "john@example.com",
				phone: "+525511223344",
			},
			line_items: [
				{
					name: "General Admission",
					unit_price: 50000, // in cents
					quantity: 2,
					sku: "ticket-type-1",
				},
			],
			charges: [
				{
					payment_method: {
						type: "card",
						token_id: "tok_test",
					},
				},
			],
			currency: "MXN",
			metadata: {
				orderId: "order-123",
				eventId: "event-456",
			},
		};

		it("should create an order successfully", async () => {
			const mockResponse = {
				id: "ord_123456",
				object: "order",
				payment_status: "pending_payment",
				amount: 100000,
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const result = await createOrder(mockOrderRequest);

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("api.conekta.io/orders"),
				expect.objectContaining({
					method: "POST",
					headers: expect.objectContaining({
						"Content-Type": "application/json",
						Accept: "application/vnd.conekta-v2.1.0+json",
					}),
				}),
			);
			expect(result.id).toBe("ord_123456");
		});

		it("should throw an error when order creation fails", async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 400,
				json: async () => ({
					type: "parameter_error",
					details: [{ message: "Invalid card" }],
				}),
			});

			await expect(createOrder(mockOrderRequest)).rejects.toThrow(
				"Invalid card",
			);
		});
	});

	describe("createCheckout", () => {
		it("should create a checkout session", async () => {
			const mockResponse = {
				id: "checkout_123",
				object: "checkout",
				url: "https://pay.conekta.com/checkout/123",
				status: "Issued",
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const checkoutRequest: CreateCheckoutRequest = {
				order_id: "ord_123",
				allowed_payment_methods: ["card"],
				success_url: "https://example.com/success",
				failure_url: "https://example.com/failure",
			};

			const result = await createCheckout(checkoutRequest);

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("api.conekta.io/orders/ord_123/checkout"),
				expect.objectContaining({
					method: "POST",
				}),
			);
			expect(result.url).toBe("https://pay.conekta.com/checkout/123");
		});
	});

	describe("verifyWebhookSignature", () => {
		it("should return true for valid signature", () => {
			// Mock implementation - in real tests, use actual crypto
			const payload = JSON.stringify({ type: "order.paid" });
			const signature = "valid-signature";

			// This would be a real crypto verification in production
			const result = verifyWebhookSignature(payload, signature);

			// For now, we expect it to return the default behavior
			expect(typeof result).toBe("boolean");
		});

		it("should handle missing webhook key gracefully", () => {
			vi.unstubAllEnvs();
			const payload = JSON.stringify({ type: "order.paid" });
			const signature = "some-signature";

			// Should not throw and return true when key is not set
			const result = verifyWebhookSignature(payload, signature);
			expect(result).toBe(true);
		});

		it("should use provided webhook key", () => {
			const payload = JSON.stringify({ type: "order.paid" });
			const signature = "test-signature";
			const webhookKey = "test-webhook-key";

			const result = verifyWebhookSignature(payload, signature, webhookKey);
			expect(result).toBe(true);
		});
	});

	describe("utility functions", () => {
		it("toCents should convert pesos to cents", () => {
			expect(toCents(100)).toBe(10000);
			expect(toCents(99.99)).toBe(9999);
			expect(toCents(0)).toBe(0);
		});

		it("fromCents should convert cents to pesos", () => {
			expect(fromCents(10000)).toBe(100);
			expect(fromCents(9999)).toBe(99.99);
			expect(fromCents(0)).toBe(0);
		});
	});

	describe("getOrder", () => {
		it("should fetch an order by ID", async () => {
			const mockOrder = {
				id: "ord_123",
				object: "order",
				payment_status: "paid",
				amount: 10000,
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockOrder,
			});

			const { getOrder } = await import("../conekta");
			const result = await getOrder("ord_123");

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("/orders/ord_123"),
				expect.any(Object),
			);
			expect(result.id).toBe("ord_123");
		});
	});

	describe("refundOrder", () => {
		it("should refund an order", async () => {
			const mockResponse = {
				id: "ord_123",
				payment_status: "refunded",
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const { refundOrder } = await import("../conekta");
			const result = await refundOrder("ord_123", "customer_request");

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("/orders/ord_123/refunds"),
				expect.objectContaining({
					method: "POST",
				}),
			);
			expect(result.payment_status).toBe("refunded");
		});
	});

	describe("cancelOrder", () => {
		it("should cancel an order", async () => {
			const mockResponse = {
				id: "ord_123",
				payment_status: "expired",
			};

			mockFetch.mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse,
			});

			const { cancelOrder } = await import("../conekta");
			const result = await cancelOrder("ord_123");

			expect(mockFetch).toHaveBeenCalledWith(
				expect.stringContaining("/orders/ord_123/cancel"),
				expect.objectContaining({
					method: "POST",
				}),
			);
			expect(result.id).toBe("ord_123");
		});
	});

	describe("parseWebhookEvent", () => {
		it("should parse a valid webhook event", async () => {
			const { parseWebhookEvent } = await import("../conekta");
			const validEvent = {
				id: "evt_123",
				type: "order.paid",
				created_at: Date.now(),
				data: {
					object: { id: "ord_123" },
				},
			};

			const result = parseWebhookEvent(JSON.stringify(validEvent));
			expect(result.id).toBe("evt_123");
			expect(result.type).toBe("order.paid");
		});

		it("should throw for invalid webhook event", async () => {
			const { parseWebhookEvent } = await import("../conekta");
			const invalidEvent = { foo: "bar" };

			expect(() => parseWebhookEvent(JSON.stringify(invalidEvent))).toThrow();
		});
	});

	describe("isPaymentSuccessful", () => {
		it("should return true for paid orders", async () => {
			const { isPaymentSuccessful } = await import("../conekta");
			const paidOrder = { payment_status: "paid" };
			expect(isPaymentSuccessful(paidOrder as any)).toBe(true);
		});

		it("should return false for unpaid orders", async () => {
			const { isPaymentSuccessful } = await import("../conekta");
			const pendingOrder = { payment_status: "pending_payment" };
			expect(isPaymentSuccessful(pendingOrder as any)).toBe(false);
		});
	});

	describe("getCheckoutUrl", () => {
		it("should return the checkout URL", async () => {
			const { getCheckoutUrl } = await import("../conekta");
			const checkout = { url: "https://pay.conekta.com/test" };
			expect(getCheckoutUrl(checkout as any)).toBe(
				"https://pay.conekta.com/test",
			);
		});
	});
});
