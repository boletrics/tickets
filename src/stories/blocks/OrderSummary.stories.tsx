import type { Meta, StoryObj } from "@storybook/react";
import { useEffect } from "react";
import { OrderSummary } from "@/components/order-summary";
import { useCartStore } from "@/lib/cart-store";
import type { Event } from "@/lib/types";

const mockEvent: Event = {
	id: "1",
	title: "Rock Festival 2025",
	description: "The biggest rock festival of the year",
	category: "concert",
	dates: [{ date: "2025-06-15", times: ["20:00"] }],
	location: "Mexico City",
	venue: "Foro Sol",
	region: "mexico-city",
	image: "/placeholder.svg",
	artist: "Various Artists",
	organizer: "Event Organizer",
	ticketTypes: [
		{
			id: "general",
			name: "General Admission",
			description: "Standard entry",
			price: 500,
			available: 100,
		},
		{
			id: "vip",
			name: "VIP",
			description: "Premium access",
			price: 1500,
			available: 20,
		},
	],
	orgId: "org-1",
};

const meta: Meta<typeof OrderSummary> = {
	title: "Blocks/OrderSummary",
	component: OrderSummary,
	parameters: {
		layout: "centered",
		nextjs: {
			appDirectory: true,
		},
	},
	args: {
		event: mockEvent,
	},
	decorators: [
		(Story) => (
			<div className="w-[350px]">
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof OrderSummary>;

export const Empty: Story = {};

/**
 * Decorator that sets selectedTickets in the cart store
 */
function WithTicketsDecorator({ children }: { children: React.ReactNode }) {
	const setSelectedTickets = useCartStore((state) => state.setSelectedTickets);

	useEffect(() => {
		// Set mock selected tickets in the store
		setSelectedTickets({
			general: 2,
			vip: 1,
		});

		// Cleanup on unmount
		return () => {
			setSelectedTickets({});
		};
	}, [setSelectedTickets]);

	return <>{children}</>;
}

export const WithTickets: Story = {
	decorators: [
		(Story) => (
			<WithTicketsDecorator>
				<Story />
			</WithTicketsDecorator>
		),
	],
};
