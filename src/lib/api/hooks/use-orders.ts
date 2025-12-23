"use client";

import {
	useApiQuery,
	useApiMutation,
	buildQueryString,
	revalidate,
} from "../client";
import type {
	Order,
	OrdersQueryParams,
	CreateOrderInput,
	PaginatedResult,
} from "../types";

// ============================================================================
// Orders Hooks
// ============================================================================

/**
 * Fetch orders for an organization (for partner dashboard).
 */
export function useOrganizationOrders(
	organizationId: string | null,
	params: Omit<OrdersQueryParams, "organization_id"> = {},
) {
	const queryString = buildQueryString({
		...params,
		organization_id: organizationId ?? undefined,
	});

	return useApiQuery<PaginatedResult<Order>>(
		organizationId ? `/orders${queryString}` : null,
	);
}

/**
 * Fetch orders for an event.
 */
export function useEventOrders(
	eventId: string | null,
	params: Omit<OrdersQueryParams, "event_id"> = {},
) {
	const queryString = buildQueryString({
		...params,
		event_id: eventId ?? undefined,
	});

	return useApiQuery<PaginatedResult<Order>>(
		eventId ? `/orders${queryString}` : null,
	);
}

/**
 * Fetch orders for the current user.
 */
export function useMyOrders(params: Omit<OrdersQueryParams, "user_id"> = {}) {
	const queryString = buildQueryString({
		...params,
		include: "items,event,tickets",
	});
	const result = useApiQuery<PaginatedResult<Order>>(
		`/orders/me${queryString}`,
	);

	return {
		...result,
		data: result.data?.data,
	};
}

/**
 * Fetch a single order by ID.
 */
export function useOrder(orderId: string | null) {
	return useApiQuery<Order>(
		orderId ? `/orders/${orderId}?include=items,tickets,event` : null,
	);
}

/**
 * Fetch an order by order number.
 */
export function useOrderByNumber(orderNumber: string | null) {
	const queryString = buildQueryString({
		order_number: orderNumber ?? undefined,
	});

	const { data, ...rest } = useApiQuery<PaginatedResult<Order>>(
		orderNumber ? `/orders${queryString}` : null,
	);

	return {
		data: data?.data?.[0] ?? undefined,
		...rest,
	};
}

// ============================================================================
// Order Mutations
// ============================================================================

/**
 * Create a new order.
 */
export function useCreateOrder() {
	const mutation = useApiMutation<Order, CreateOrderInput>("/orders", "POST");

	const createOrder = async (data: CreateOrderInput) => {
		const result = await mutation.trigger(data);
		revalidate(/\/orders/);
		return result;
	};

	return {
		...mutation,
		createOrder,
	};
}

/**
 * Cancel an order.
 */
export function useCancelOrder(orderId: string) {
	const mutation = useApiMutation<Order, { status: "cancelled" }>(
		`/orders/${orderId}`,
		"PUT",
	);

	const cancelOrder = async () => {
		const result = await mutation.trigger({ status: "cancelled" });
		revalidate(`/orders/${orderId}`);
		revalidate(/\/orders/);
		return result;
	};

	return {
		...mutation,
		cancelOrder,
	};
}

/**
 * Refund an order.
 */
export function useRefundOrder(orderId: string) {
	const mutation = useApiMutation<Order, { status: "refunded" }>(
		`/orders/${orderId}`,
		"PUT",
	);

	const refundOrder = async () => {
		const result = await mutation.trigger({ status: "refunded" });
		revalidate(`/orders/${orderId}`);
		revalidate(/\/orders/);
		return result;
	};

	return {
		...mutation,
		refundOrder,
	};
}

// ============================================================================
// Payment Mutations (will be expanded with Conekta integration)
// ============================================================================

export interface PayOrderInput {
	payment_method_id: string;
}

export interface PayOrderResult {
	order: Order;
	requires_action: boolean;
	payment_intent_client_secret?: string;
}

/**
 * Process payment for an order.
 */
export function usePayOrder(orderId: string) {
	const mutation = useApiMutation<PayOrderResult, PayOrderInput>(
		`/orders/${orderId}/pay`,
		"POST",
	);

	const payOrder = async (data: PayOrderInput) => {
		const result = await mutation.trigger(data);
		revalidate(`/orders/${orderId}`);
		revalidate(/\/orders/);
		return result;
	};

	return {
		...mutation,
		payOrder,
	};
}

/**
 * Confirm payment after 3DS or other verification.
 */
export function useConfirmOrder(orderId: string) {
	const mutation = useApiMutation<Order, void>(
		`/orders/${orderId}/confirm`,
		"POST",
	);

	const confirmOrder = async () => {
		const result = await mutation.trigger();
		revalidate(`/orders/${orderId}`);
		revalidate(/\/orders/);
		return result;
	};

	return {
		...mutation,
		confirmOrder,
	};
}
