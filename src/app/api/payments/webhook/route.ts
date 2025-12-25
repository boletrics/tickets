import { NextRequest, NextResponse } from "next/server";
import {
	parseWebhookEvent,
	verifyWebhookSignature,
	isPaymentSuccessful,
	type ConektaOrder,
	type WebhookEvent,
} from "@/lib/payments/conekta";
import { serverPost, serverPut } from "@/lib/api/server";

/**
 * Conekta Webhook Handler
 *
 * This endpoint receives webhooks from Conekta when payment events occur.
 * It updates the order status in tickets-svc and triggers ticket generation.
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.text();
		const signature = request.headers.get("Digest") || "";

		// Verify webhook signature
		if (!verifyWebhookSignature(body, signature)) {
			console.error("Invalid webhook signature");
			return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
		}

		// Parse webhook event
		let event: WebhookEvent;
		try {
			event = parseWebhookEvent(body);
		} catch (error) {
			console.error("Failed to parse webhook event:", error);
			return NextResponse.json(
				{ error: "Invalid event format" },
				{ status: 400 },
			);
		}

		console.log(`Received Conekta webhook: ${event.type}`, {
			eventId: event.id,
			type: event.type,
		});

		// Handle different event types
		switch (event.type) {
			case "order.paid":
				await handleOrderPaid(event.data.object as ConektaOrder);
				break;

			case "order.pending_payment":
				await handleOrderPending(event.data.object as ConektaOrder);
				break;

			case "order.declined":
			case "order.expired":
				await handleOrderFailed(event.data.object as ConektaOrder);
				break;

			case "order.refunded":
			case "order.partially_refunded":
				await handleOrderRefunded(event.data.object as ConektaOrder);
				break;

			case "charge.paid":
				// Charge level events - order.paid is more reliable
				console.log("Charge paid event received");
				break;

			case "charge.declined":
				console.log("Charge declined event received");
				break;

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error("Webhook processing failed:", error);
		return NextResponse.json(
			{ error: "Webhook processing failed" },
			{ status: 500 },
		);
	}
}

/**
 * Handle successful payment - update order and generate tickets
 */
async function handleOrderPaid(conektaOrder: ConektaOrder) {
	const boletricsOrderId = conektaOrder.metadata?.boletrics_order_id;

	if (!boletricsOrderId) {
		console.error("Missing boletrics_order_id in Conekta order metadata");
		return;
	}

	console.log(`Processing paid order: ${boletricsOrderId}`);

	try {
		// Update order status to paid
		await serverPut(`/orders/${boletricsOrderId}`, {
			status: "paid",
			payment_method: getPaymentMethod(conektaOrder),
			paid_at: new Date().toISOString(),
		});

		// Trigger ticket generation
		await serverPost(`/orders/${boletricsOrderId}/generate-tickets`, {});

		console.log(
			`Order ${boletricsOrderId} marked as paid and tickets generated`,
		);
	} catch (error) {
		console.error(`Failed to process paid order ${boletricsOrderId}:`, error);
		// In production, you'd want to retry or alert
	}
}

/**
 * Handle pending payment
 */
async function handleOrderPending(conektaOrder: ConektaOrder) {
	const boletricsOrderId = conektaOrder.metadata?.boletrics_order_id;

	if (!boletricsOrderId) {
		return;
	}

	console.log(`Order ${boletricsOrderId} is pending payment`);
	// Order is already in pending state, no action needed
}

/**
 * Handle failed/expired payment
 */
async function handleOrderFailed(conektaOrder: ConektaOrder) {
	const boletricsOrderId = conektaOrder.metadata?.boletrics_order_id;

	if (!boletricsOrderId) {
		return;
	}

	console.log(`Order ${boletricsOrderId} payment failed or expired`);

	try {
		// Update order status to cancelled
		await serverPut(`/orders/${boletricsOrderId}`, {
			status: "cancelled",
		});

		// Release reserved tickets back to inventory
		await serverPost(`/orders/${boletricsOrderId}/release-inventory`, {});

		console.log(`Order ${boletricsOrderId} cancelled and inventory released`);
	} catch (error) {
		console.error(`Failed to cancel order ${boletricsOrderId}:`, error);
	}
}

/**
 * Handle refunded order
 */
async function handleOrderRefunded(conektaOrder: ConektaOrder) {
	const boletricsOrderId = conektaOrder.metadata?.boletrics_order_id;

	if (!boletricsOrderId) {
		return;
	}

	console.log(`Order ${boletricsOrderId} refunded`);

	try {
		// Update order status to refunded
		await serverPut(`/orders/${boletricsOrderId}`, {
			status: "refunded",
		});

		// Cancel associated tickets
		await serverPost(`/orders/${boletricsOrderId}/cancel-tickets`, {});

		console.log(`Order ${boletricsOrderId} refunded and tickets cancelled`);
	} catch (error) {
		console.error(`Failed to process refund for ${boletricsOrderId}:`, error);
	}
}

/**
 * Extract payment method description from Conekta order
 */
function getPaymentMethod(order: ConektaOrder): string {
	const charge = order.charges?.data?.[0];
	if (!charge?.payment_method) {
		return "card";
	}

	const pm = charge.payment_method;
	if (pm.brand && pm.last4) {
		return `${pm.brand} **** ${pm.last4}`;
	}

	return pm.type || "card";
}
