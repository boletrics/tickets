import type { Meta, StoryObj } from "@storybook/react";
import { EventCarousel } from "@/components/event-carousel";
import type { Event } from "@/lib/types";

const mockEvents: Event[] = [
	{
		id: "1",
		title: "Rock Festival 2025",
		description: "The biggest rock festival",
		category: "concert",
		dates: [{ date: "2025-06-15", times: ["20:00"] }],
		location: "Mexico City",
		venue: "Foro Sol",
		region: "mexico-city",
		image: "/placeholder.svg",
		artist: "Various",
		organizer: "Event Organizer",
		ticketTypes: [
			{ id: "1", name: "General", description: "", price: 500, available: 100 },
		],
		orgId: "org-1",
	},
	{
		id: "2",
		title: "Liga MX Final",
		description: "Championship match",
		category: "sports",
		dates: [{ date: "2025-05-20", times: ["18:00"] }],
		location: "Mexico City",
		venue: "Estadio Azteca",
		region: "mexico-city",
		image: "/placeholder.svg",
		artist: "América vs Guadalajara",
		organizer: "Event Organizer",
		ticketTypes: [
			{ id: "1", name: "General", description: "", price: 800, available: 50 },
		],
		orgId: "org-1",
	},
	{
		id: "3",
		title: "Comedy Night",
		description: "Stand-up comedy show",
		category: "comedy",
		dates: [{ date: "2025-04-10", times: ["21:00"] }],
		location: "Monterrey",
		venue: "Teatro",
		region: "monterrey",
		image: "/placeholder.svg",
		artist: "Top Comedians",
		organizer: "Event Organizer",
		ticketTypes: [
			{ id: "1", name: "VIP", description: "", price: 350, available: 200 },
		],
		orgId: "org-1",
	},
	{
		id: "4",
		title: "Electronic Music Festival",
		description: "EDM festival",
		category: "festival",
		dates: [{ date: "2025-07-01", times: ["16:00"] }],
		location: "Cancun",
		venue: "Beach Arena",
		region: "cancun",
		image: "/placeholder.svg",
		artist: "International DJs",
		organizer: "Event Organizer",
		ticketTypes: [
			{
				id: "1",
				name: "Weekend Pass",
				description: "",
				price: 2500,
				available: 500,
			},
		],
		orgId: "org-1",
	},
];

const meta: Meta<typeof EventCarousel> = {
	title: "Blocks/EventCarousel",
	component: EventCarousel,
	parameters: {
		layout: "fullscreen",
		nextjs: {
			appDirectory: true,
		},
	},
	args: {
		title: "Featured Events",
		events: mockEvents,
		showViewAll: true,
		viewAllHref: "/search",
	},
	decorators: [
		(Story) => (
			<div className="container mx-auto py-8">
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof EventCarousel>;

export const Default: Story = {};

export const WithoutViewAll: Story = {
	args: {
		showViewAll: false,
	},
};

export const SingleEvent: Story = {
	args: {
		title: "Special Event",
		events: [mockEvents[0]],
	},
};

export const ManyEvents: Story = {
	args: {
		title: "All Events",
		events: [
			...mockEvents,
			...mockEvents.map((e) => ({ ...e, id: `${e.id}-copy` })),
		],
	},
};

export const Empty: Story = {
	args: {
		events: [],
	},
};
