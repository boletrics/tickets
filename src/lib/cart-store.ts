"use client";

import { create } from "zustand";

export interface CartItem {
	eventId: string;
	eventTitle: string;
	eventDate: string;
	eventTime: string;
	eventLocation: string;
	ticketTypeId: string;
	ticketTypeName: string;
	quantity: number;
	price: number;
}

interface CartStore {
	items: CartItem[];
	selectedTickets: Record<string, number>;
	setSelectedTickets: (tickets: Record<string, number>) => void;
	addToCart: (item: CartItem) => void;
	removeFromCart: (eventId: string, ticketTypeId: string) => void;
	updateQuantity: (
		eventId: string,
		ticketTypeId: string,
		quantity: number,
	) => void;
	clearCart: () => void;
	getTotal: () => number;
	getSubtotal: () => number;
	getFees: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
	items: [],
	selectedTickets: {},

	setSelectedTickets: (tickets) => set({ selectedTickets: tickets }),

	addToCart: (item) =>
		set((state) => {
			const existingIndex = state.items.findIndex(
				(i) =>
					i.eventId === item.eventId && i.ticketTypeId === item.ticketTypeId,
			);

			if (existingIndex >= 0) {
				const newItems = [...state.items];
				newItems[existingIndex] = {
					...newItems[existingIndex],
					quantity: item.quantity,
				};
				return { items: newItems };
			}

			return { items: [...state.items, item] };
		}),

	removeFromCart: (eventId, ticketTypeId) =>
		set((state) => ({
			items: state.items.filter(
				(item) =>
					!(item.eventId === eventId && item.ticketTypeId === ticketTypeId),
			),
		})),

	updateQuantity: (eventId, ticketTypeId, quantity) =>
		set((state) => ({
			items: state.items.map((item) =>
				item.eventId === eventId && item.ticketTypeId === ticketTypeId
					? { ...item, quantity }
					: item,
			),
		})),

	clearCart: () => set({ items: [] }),

	getSubtotal: () => {
		const items = get().items;
		return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
	},

	getFees: () => {
		const subtotal = get().getSubtotal();
		return subtotal * 0.1;
	},

	getTotal: () => {
		return get().getSubtotal() + get().getFees();
	},
}));
