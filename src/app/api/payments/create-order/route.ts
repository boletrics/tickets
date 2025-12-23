import { NextRequest, NextResponse } from "next/server";
import { getJwt } from "@/lib/auth/getJwt";
import { serverPost } from "@/lib/api/server";
import { createOrder, createCheckout, toCents } from "@/lib/payments/conekta";
import type { Order, CreateOrderInput } from "@/lib/api/types";

export interface CreatePaymentOrderRequest {
	email: string;
	name: string;
	phone?: string;
	event_id: string;
	organization_id: string;
	items: Array<{
		ticket_type_id: string;
		ticket_type_name: string;
		quantity: number;
		price: number;
	}>;
}

export interface CreatePaymentOrderResponse {
	order_id: string;
	order_number: string;
	checkout_url: string;
	conekta_order_id: string;
	total: number;
}

export async function POST(request: NextRequest) {
	try {
		const body = (await request.json()) as CreatePaymentOrderRequest;

		// Validate required fields
		if (
			!body.email ||
			!body.event_id ||
			!body.organization_id ||
			!body.items?.length
		) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		// Get user JWT if authenticated
		const jwt = await getJwt();

		// 1. Create order in tickets-svc (pending status)
		const orderInput: CreateOrderInput = {
			email: body.email,
			event_id: body.event_id,
			organization_id: body.organization_id,
			items: body.items.map((item) => ({
				ticket_type_id: item.ticket_type_id,
				quantity: item.quantity,
			})),
		};

		let ticketsOrder: Order;
		try {
			ticketsOrder = await serverPost<Order>("/orders", orderInput);
		} catch (error) {
			console.error("Failed to create order in tickets-svc:", error);
			return NextResponse.json(
				{ error: "Failed to create order" },
				{ status: 500 },
			);
		}

		// 2. Create order in Conekta
		const lineItems = body.items.map((item) => ({
			name: item.ticket_type_name,
			unit_price: toCents(item.price),
			quantity: item.quantity,
			metadata: {
				ticket_type_id: item.ticket_type_id,
			},
		}));

		const totalAmount = body.items.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0,
		);

		let conektaOrder;
		try {
			conektaOrder = await createOrder({
				currency: "MXN",
				customer_info: {
					name: body.name || body.email.split("@")[0],
					email: body.email,
					phone: body.phone,
				},
				line_items: lineItems,
				charges: [
					{
						payment_method: {
							type: "card",
						},
					},
				],
				metadata: {
					boletrics_order_id: ticketsOrder.id,
					boletrics_order_number: ticketsOrder.order_number,
					event_id: body.event_id,
					organization_id: body.organization_id,
				},
			});
		} catch (error) {
			console.error("Failed to create Conekta order:", error);
			// TODO: Cancel the tickets-svc order
			return NextResponse.json(
				{ error: "Payment initialization failed" },
				{ status: 500 },
			);
		}

		// 3. Create checkout session
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
		let checkout;
		try {
			checkout = await createCheckout({
				order_id: conektaOrder.id,
				allowed_payment_methods: ["card"],
				success_url: `${baseUrl}/checkout/success?order=${ticketsOrder.order_number}`,
				failure_url: `${baseUrl}/checkout/failure?order=${ticketsOrder.order_number}`,
				monthly_installments_enabled: true,
				monthly_installments_options: [3, 6, 9, 12],
			});
		} catch (error) {
			console.error("Failed to create checkout session:", error);
			return NextResponse.json(
				{ error: "Payment initialization failed" },
				{ status: 500 },
			);
		}

		// 4. Update tickets-svc order with payment_intent_id
		try {
			await serverPost<Order>(`/orders/${ticketsOrder.id}`, {
				payment_intent_id: conektaOrder.id,
			});
		} catch (error) {
			console.error("Failed to update order with payment intent:", error);
			// Non-fatal - continue with checkout
		}

		// Return checkout URL to redirect user
		const response: CreatePaymentOrderResponse = {
			order_id: ticketsOrder.id,
			order_number: ticketsOrder.order_number,
			checkout_url: checkout.url,
			conekta_order_id: conektaOrder.id,
			total: totalAmount,
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error("Payment order creation failed:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
