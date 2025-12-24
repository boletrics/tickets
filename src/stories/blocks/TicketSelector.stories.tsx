import type { Meta, StoryObj } from "@storybook/react";
import { TicketSelector } from "@/components/ticket-selector";
import type { Event } from "@/lib/types";

const mockEvent: Event = {
	id: "1",
	title: "Rock Festival 2025",
	description: "The biggest rock festival of the year",
	category: "concert",
	dates: [
		{
			date: "2025-06-15",
			times: ["20:00"],
		},
	],
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
			description: "Standard entry to the event",
			price: 500,
			available: 100,
		},
		{
			id: "vip",
			name: "VIP",
			description: "Premium access with exclusive perks",
			price: 1500,
			available: 20,
		},
		{
			id: "platinum",
			name: "Platinum",
			description: "Ultimate experience with backstage access",
			price: 3000,
			available: 5,
		},
	],
	orgId: "org-1",
};

const meta: Meta<typeof TicketSelector> = {
	title: "Blocks/TicketSelector",
	component: TicketSelector,
	parameters: {
		layout: "padded",
	},
	args: {
		event: mockEvent,
	},
};

export default meta;

type Story = StoryObj<typeof TicketSelector>;

export const Default: Story = {};

export const LimitedAvailability: Story = {
	args: {
		event: {
			...mockEvent,
			ticketTypes: [
				{
					id: "general",
					name: "General Admission",
					description: "Standard entry to the event",
					price: 500,
					available: 3,
				},
				{
					id: "vip",
					name: "VIP",
					description: "Premium access with exclusive perks",
					price: 1500,
					available: 0,
				},
			],
		},
	},
};

export const SoldOut: Story = {
	args: {
		event: {
			...mockEvent,
			ticketTypes: mockEvent.ticketTypes.map((t) => ({
				...t,
				available: 0,
			})),
		},
	},
};
