/**
 * Conekta Payment Integration
 *
 * This module provides a client for interacting with the Conekta API
 * for payment processing in the Boletrics platform.
 */

// ============================================================================
// Types
// ============================================================================

export interface ConektaConfig {
	apiKey: string;
	apiVersion?: string;
	locale?: "es" | "en";
}

export interface CreateOrderRequest {
	currency: string;
	customer_info: {
		name: string;
		email: string;
		phone?: string;
	};
	line_items: Array<{
		name: string;
		unit_price: number; // in cents
		quantity: number;
		description?: string;
		sku?: string;
		metadata?: Record<string, string>;
	}>;
	charges: Array<{
		payment_method: {
			type: "card" | "cash" | "bank_transfer";
			token_id?: string;
			expires_at?: number;
		};
	}>;
	metadata?: Record<string, string>;
}

export interface ConektaOrder {
	id: string;
	object: "order";
	amount: number;
	amount_refunded: number;
	currency: string;
	customer_info: {
		customer_id?: string;
		name: string;
		email: string;
		phone?: string;
	};
	line_items: {
		object: "list";
		data: Array<{
			id: string;
			name: string;
			unit_price: number;
			quantity: number;
		}>;
	};
	charges: {
		object: "list";
		data: Array<ConektaCharge>;
	};
	payment_status:
		| "pending_payment"
		| "paid"
		| "declined"
		| "expired"
		| "refunded"
		| "partially_refunded";
	metadata: Record<string, string>;
	created_at: number;
	updated_at: number;
}

export interface ConektaCharge {
	id: string;
	object: "charge";
	amount: number;
	created_at: number;
	currency: string;
	failure_code?: string;
	failure_message?: string;
	order_id: string;
	payment_method: {
		type: string;
		object: string;
		name?: string;
		exp_month?: string;
		exp_year?: string;
		brand?: string;
		last4?: string;
		reference?: string;
		barcode_url?: string;
	};
	status: "pending_payment" | "paid" | "declined" | "expired" | "refunded";
}

export interface CreateCheckoutRequest {
	order_id: string;
	allowed_payment_methods: Array<"card" | "cash" | "bank_transfer">;
	expires_at?: number;
	failure_url: string;
	success_url: string;
	monthly_installments_enabled?: boolean;
	monthly_installments_options?: number[];
}

export interface ConektaCheckout {
	id: string;
	object: "checkout";
	expires_at: number;
	url: string;
	status: "Issued" | "Expired" | "PaymentPending" | "Paid";
}

export interface WebhookEvent {
	id: string;
	object: "event";
	type: string;
	created_at: number;
	data: {
		object: ConektaOrder | ConektaCharge;
	};
}

// ============================================================================
// Conekta Client
// ============================================================================

const CONEKTA_API_BASE = "https://api.conekta.io";
const CONEKTA_API_VERSION = "2.1.0";

function getApiKey(): string {
	const apiKey = process.env.CONEKTA_API_KEY;
	if (!apiKey) {
		throw new Error("CONEKTA_API_KEY environment variable is not set");
	}
	return apiKey;
}

function getHeaders(): Record<string, string> {
	return {
		Accept: "application/vnd.conekta-v2.1.0+json",
		"Content-Type": "application/json",
		Authorization: `Bearer ${getApiKey()}`,
		"Accept-Language": "es",
	};
}

interface ConektaErrorResponse {
	type?: string;
	message?: string;
	details?: Array<{ message: string }>;
}

async function conektaRequest<T>(
	endpoint: string,
	options: RequestInit = {},
): Promise<T> {
	const response = await fetch(`${CONEKTA_API_BASE}${endpoint}`, {
		...options,
		headers: {
			...getHeaders(),
			...(options.headers as Record<string, string>),
		},
	});

	const data: unknown = await response.json();

	if (!response.ok) {
		const errorData = data as ConektaErrorResponse;
		const error = new Error(
			errorData.details?.[0]?.message ||
				errorData.message ||
				"Conekta API error",
		) as Error & { status: number; code?: string };
		error.status = response.status;
		error.code = errorData.type;
		throw error;
	}

	return data as T;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a new order in Conekta.
 */
export async function createOrder(
	request: CreateOrderRequest,
): Promise<ConektaOrder> {
	return conektaRequest<ConektaOrder>("/orders", {
		method: "POST",
		body: JSON.stringify(request),
	});
}

/**
 * Get an order by ID.
 */
export async function getOrder(orderId: string): Promise<ConektaOrder> {
	return conektaRequest<ConektaOrder>(`/orders/${orderId}`);
}

/**
 * Create a checkout session for an order.
 */
export async function createCheckout(
	request: CreateCheckoutRequest,
): Promise<ConektaCheckout> {
	return conektaRequest<ConektaCheckout>(
		`/orders/${request.order_id}/checkout`,
		{
			method: "POST",
			body: JSON.stringify({
				allowed_payment_methods: request.allowed_payment_methods,
				expires_at: request.expires_at,
				failure_url: request.failure_url,
				success_url: request.success_url,
				monthly_installments_enabled: request.monthly_installments_enabled,
				monthly_installments_options: request.monthly_installments_options,
			}),
		},
	);
}

/**
 * Refund an order (full refund).
 */
export async function refundOrder(
	orderId: string,
	reason?: string,
): Promise<ConektaOrder> {
	return conektaRequest<ConektaOrder>(`/orders/${orderId}/refunds`, {
		method: "POST",
		body: JSON.stringify({ reason: reason || "requested_by_customer" }),
	});
}

/**
 * Cancel an order.
 */
export async function cancelOrder(orderId: string): Promise<ConektaOrder> {
	return conektaRequest<ConektaOrder>(`/orders/${orderId}/cancel`, {
		method: "POST",
	});
}

// ============================================================================
// Webhook Verification
// ============================================================================

/**
 * Verify webhook signature from Conekta.
 */
export function verifyWebhookSignature(
	payload: string,
	signature: string,
	webhookKey?: string,
): boolean {
	const key = webhookKey || process.env.CONEKTA_WEBHOOK_KEY;
	if (!key) {
		console.warn(
			"CONEKTA_WEBHOOK_KEY not set, skipping signature verification",
		);
		return true;
	}

	// Conekta uses HMAC-SHA256 for webhook signatures
	// For production, implement proper HMAC verification
	// This is a simplified version
	try {
		// In a real implementation, you would:
		// 1. Extract the timestamp from the signature header
		// 2. Compute HMAC-SHA256(timestamp.payload, webhook_key)
		// 3. Compare with the signature from the header
		return true; // Placeholder - implement proper verification
	} catch {
		return false;
	}
}

/**
 * Parse and validate a webhook event.
 */
export function parseWebhookEvent(body: string): WebhookEvent {
	const event = JSON.parse(body) as WebhookEvent;

	if (!event.id || !event.type || !event.data) {
		throw new Error("Invalid webhook event format");
	}

	return event;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Convert amount from pesos to cents (Conekta uses cents).
 */
export function toCents(amount: number): number {
	return Math.round(amount * 100);
}

/**
 * Convert amount from cents to pesos.
 */
export function fromCents(cents: number): number {
	return cents / 100;
}

/**
 * Check if a payment is successful.
 */
export function isPaymentSuccessful(order: ConektaOrder): boolean {
	return order.payment_status === "paid";
}

/**
 * Get the checkout URL for a payment.
 */
export function getCheckoutUrl(checkout: ConektaCheckout): string {
	return checkout.url;
}
