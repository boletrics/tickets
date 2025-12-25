import { describe, it, expect, beforeEach } from "vitest";
import { useCartStore, type CartItem } from "../cart-store";

describe("Cart Store", () => {
	beforeEach(() => {
		// Reset the store before each test
		useCartStore.setState({
			items: [],
			selectedTickets: {},
		});
	});

	const mockItem: CartItem = {
		eventId: "event-1",
		eventTitle: "Test Event",
		eventDate: "2025-01-15",
		eventTime: "20:00",
		eventLocation: "Test Venue",
		orgId: "org-1",
		ticketTypeId: "ticket-type-1",
		ticketTypeName: "General",
		quantity: 2,
		price: 500,
	};

	describe("addToCart", () => {
		it("should add a new item to the cart", () => {
			useCartStore.getState().addToCart(mockItem);

			const items = useCartStore.getState().items;
			expect(items).toHaveLength(1);
			expect(items[0]).toEqual(mockItem);
		});

		it("should update quantity when adding existing item", () => {
			useCartStore.getState().addToCart(mockItem);
			useCartStore.getState().addToCart({
				...mockItem,
				quantity: 5,
			});

			const items = useCartStore.getState().items;
			expect(items).toHaveLength(1);
			expect(items[0].quantity).toBe(5);
		});

		it("should handle multiple different items", () => {
			useCartStore.getState().addToCart(mockItem);
			useCartStore.getState().addToCart({
				...mockItem,
				ticketTypeId: "ticket-type-2",
				ticketTypeName: "VIP",
				price: 1000,
			});

			const items = useCartStore.getState().items;
			expect(items).toHaveLength(2);
		});
	});

	describe("removeFromCart", () => {
		it("should remove an item from the cart", () => {
			useCartStore.getState().addToCart(mockItem);
			useCartStore
				.getState()
				.removeFromCart(mockItem.eventId, mockItem.ticketTypeId);

			expect(useCartStore.getState().items).toHaveLength(0);
		});

		it("should not affect other items", () => {
			useCartStore.getState().addToCart(mockItem);
			useCartStore.getState().addToCart({
				...mockItem,
				ticketTypeId: "ticket-type-2",
			});

			useCartStore
				.getState()
				.removeFromCart(mockItem.eventId, mockItem.ticketTypeId);

			const items = useCartStore.getState().items;
			expect(items).toHaveLength(1);
			expect(items[0].ticketTypeId).toBe("ticket-type-2");
		});
	});

	describe("updateQuantity", () => {
		it("should update the quantity of an item", () => {
			useCartStore.getState().addToCart(mockItem);
			useCartStore
				.getState()
				.updateQuantity(mockItem.eventId, mockItem.ticketTypeId, 10);

			expect(useCartStore.getState().items[0].quantity).toBe(10);
		});
	});

	describe("clearCart", () => {
		it("should remove all items from the cart", () => {
			useCartStore.getState().addToCart(mockItem);
			useCartStore.getState().addToCart({
				...mockItem,
				ticketTypeId: "ticket-type-2",
			});

			useCartStore.getState().clearCart();

			expect(useCartStore.getState().items).toHaveLength(0);
		});
	});

	describe("getSubtotal", () => {
		it("should calculate the correct subtotal", () => {
			useCartStore.getState().addToCart(mockItem); // 2 * 500 = 1000
			useCartStore.getState().addToCart({
				...mockItem,
				ticketTypeId: "ticket-type-2",
				quantity: 3,
				price: 200,
			}); // 3 * 200 = 600

			const subtotal = useCartStore.getState().getSubtotal();
			expect(subtotal).toBe(1600);
		});

		it("should return 0 for empty cart", () => {
			expect(useCartStore.getState().getSubtotal()).toBe(0);
		});
	});

	describe("getFees", () => {
		it("should calculate 10% fees", () => {
			useCartStore.getState().addToCart(mockItem); // subtotal = 1000

			const fees = useCartStore.getState().getFees();
			expect(fees).toBe(100); // 10% of 1000
		});
	});

	describe("getTotal", () => {
		it("should calculate total including fees", () => {
			useCartStore.getState().addToCart(mockItem); // subtotal = 1000, fees = 100

			const total = useCartStore.getState().getTotal();
			expect(total).toBe(1100);
		});
	});

	describe("selectedTickets", () => {
		it("should set selected tickets", () => {
			useCartStore.getState().setSelectedTickets({
				"ticket-type-1": 2,
				"ticket-type-2": 3,
			});

			expect(useCartStore.getState().selectedTickets).toEqual({
				"ticket-type-1": 2,
				"ticket-type-2": 3,
			});
		});
	});
});
