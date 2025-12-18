export interface Event {
	id: string;
	title: string;
	description: string;
	dates: EventDate[];
	location: string;
	venue: string;
	region: "mexico-city" | "monterrey" | "guadalajara" | "cancun";
	image: string;
	category:
		| "concert"
		| "sports"
		| "theater"
		| "festival"
		| "comedy"
		| "conference"
		| "exhibition";
	artist?: string;
	organizer: string;
	ticketTypes: TicketType[];
}

export interface EventDate {
	date: string;
	times: string[];
}

export interface TicketType {
	id: string;
	name: string;
	price: number;
	available: number;
	description: string;
}

export interface User {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	phone?: string;
}

export interface Order {
	id: string;
	userId?: string;
	email: string;
	eventId: string;
	tickets: {
		ticketTypeId: string;
		quantity: number;
		price: number;
	}[];
	total: number;
	createdAt: string;
}
