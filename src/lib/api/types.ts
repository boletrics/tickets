/**
 * Shared API types for tickets-svc integration.
 * These types match the backend OpenAPI schema.
 */

// ============================================================================
// Common Types
// ============================================================================

export interface ApiSuccessResponse<T> {
	success: true;
	result: T;
}

export interface ApiErrorResponse {
	success: false;
	errors: Array<{
		code: number;
		message: string;
	}>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface PaginatedResult<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

// ============================================================================
// Organization Types
// ============================================================================

/**
 * Organization identity (from auth-svc).
 * This is the source of truth for organization name, slug, logo, and membership.
 */
export interface Organization {
	id: string;
	name: string;
	slug: string;
	logo?: string | null;
	metadata?: Record<string, unknown> | null;
	createdAt: string;
}

/**
 * Organization settings (from tickets-svc).
 * Ticketing-specific configuration like plan, commission, payout schedule.
 */
export interface OrgSettings {
	org_id: string;
	email: string;
	phone?: string | null;
	tax_id?: string | null;
	description?: string | null;
	website?: string | null;
	status: "pending" | "active" | "suspended" | "inactive";
	plan: "starter" | "professional" | "enterprise";
	currency: "MXN" | "USD";
	timezone: string;
	language: "es" | "en";
	commission_rate: number;
	payout_schedule: "daily" | "weekly" | "biweekly" | "monthly";
	created_at: string;
	updated_at: string;
}

// ============================================================================
// Venue Types
// ============================================================================

export interface Venue {
	id: string;
	name: string;
	address: string;
	city: string;
	state: string;
	postal_code?: string | null;
	country: string;
	region: "mexico-city" | "monterrey" | "guadalajara" | "cancun";
	capacity?: number | null;
	latitude?: number | null;
	longitude?: number | null;
	created_at: string;
	updated_at: string;
}

export interface CreateVenueInput {
	name: string;
	address: string;
	city: string;
	state: string;
	postal_code?: string;
	country?: string;
	region: Venue["region"];
	capacity?: number;
	latitude?: number;
	longitude?: number;
}

export interface UpdateVenueInput extends Partial<CreateVenueInput> {}

// ============================================================================
// Event Types
// ============================================================================

export type EventCategory =
	| "concert"
	| "sports"
	| "theater"
	| "festival"
	| "comedy"
	| "conference"
	| "exhibition";

export type EventStatus = "draft" | "published" | "cancelled" | "completed";

export interface EventDate {
	id: string;
	event_id: string;
	date: string;
	start_time: string;
	end_time?: string | null;
	created_at: string;
	updated_at: string;
}

export interface TicketType {
	id: string;
	event_id: string;
	name: string;
	description?: string | null;
	price: number;
	quantity_total: number;
	quantity_sold: number;
	quantity_available: number;
	sales_start_at?: string | null;
	sales_end_at?: string | null;
	status: "active" | "sold_out" | "cancelled";
	created_at: string;
	updated_at: string;
}

export interface Event {
	id: string;
	org_id: string; // References auth-svc organization.id
	venue_id: string;
	title: string;
	slug: string;
	description?: string | null;
	category: EventCategory;
	artist?: string | null;
	image_url?: string | null;
	image_blur?: string | null; // Base64 blur placeholder for Next.js blurDataURL
	status: EventStatus;
	published_at?: string | null;
	created_at: string;
	updated_at: string;
	// Relations (optional, included with ?include=)
	venue?: Venue;
	dates?: EventDate[];
	ticket_types?: TicketType[];
	organization?: Organization;
	settings?: OrgSettings;
}

export interface CreateEventInput {
	org_id: string; // References auth-svc organization.id
	venue_id: string;
	title: string;
	slug?: string;
	description?: string;
	category: EventCategory;
	artist?: string;
	image_url?: string;
	status?: EventStatus;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {}

export interface CreateEventDateInput {
	event_id: string;
	date: string;
	start_time: string;
	end_time?: string;
}

export interface CreateTicketTypeInput {
	event_id: string;
	name: string;
	description?: string;
	price: number;
	quantity_total: number;
	sales_start_at?: string;
	sales_end_at?: string;
}

export interface UpdateTicketTypeInput extends Partial<CreateTicketTypeInput> {}

// ============================================================================
// Order Types
// ============================================================================

export type OrderStatus = "pending" | "paid" | "cancelled" | "refunded";

export interface OrderItem {
	id: string;
	order_id: string;
	ticket_type_id: string;
	quantity: number;
	unit_price: number;
	subtotal: number;
	created_at: string;
	// Relations
	ticket_type?: TicketType;
}

export interface Order {
	id: string;
	order_number: string;
	user_id?: string | null;
	email: string;
	event_id: string;
	org_id: string; // References auth-svc organization.id
	subtotal: number;
	fees: number;
	tax: number;
	total: number;
	currency: string;
	status: OrderStatus;
	payment_method?: string | null;
	payment_intent_id?: string | null;
	created_at: string;
	updated_at: string;
	paid_at?: string | null;
	// Relations
	event?: Event;
	items?: OrderItem[];
	tickets?: Ticket[];
}

export interface CreateOrderInput {
	email: string;
	event_id: string;
	org_id: string; // References auth-svc organization.id
	items: Array<{
		ticket_type_id: string;
		quantity: number;
	}>;
	user_id?: string;
}

// ============================================================================
// Ticket Types
// ============================================================================

export type TicketStatus = "valid" | "used" | "cancelled" | "refunded";

export interface Ticket {
	id: string;
	order_id: string;
	order_item_id: string;
	ticket_type_id: string;
	event_id: string;
	ticket_code: string;
	attendee_name?: string | null;
	attendee_email?: string | null;
	status: TicketStatus;
	checked_in_at?: string | null;
	checked_in_by?: string | null;
	created_at: string;
	updated_at: string;
	// Relations
	event?: Event;
	ticket_type?: TicketType;
	order?: Order;
}

export interface CheckInTicketInput {
	ticket_code: string;
}

export interface CheckInTicketResult {
	success: boolean;
	ticket: Ticket;
	message: string;
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface OrganizationAnalytics {
	total_events: number;
	active_events: number;
	total_orders: number;
	total_revenue: number;
	total_tickets_sold: number;
	revenue_by_event: Array<{
		event_id: string;
		event_title: string;
		revenue: number;
		tickets_sold: number;
	}>;
	sales_over_time: Array<{
		date: string;
		revenue: number;
		orders: number;
	}>;
}

export interface PlatformAnalytics {
	total_organizations: number;
	total_events: number;
	total_orders: number;
	total_revenue: number;
	total_users: number;
	organizations_by_status: Record<string, number>;
	organizations_by_plan: Record<string, number>;
	top_organizations: Array<{
		id: string;
		name: string;
		revenue: number;
		events: number;
	}>;
}

// ============================================================================
// Query Params Types
// ============================================================================

export interface EventsQueryParams {
	org_id?: string; // References auth-svc organization.id
	status?: EventStatus;
	category?: EventCategory;
	region?: string;
	search?: string;
	page?: number;
	limit?: number;
	include?: string; // comma-separated: venue,dates,ticket_types
}

export interface OrdersQueryParams {
	org_id?: string; // References auth-svc organization.id
	event_id?: string;
	user_id?: string;
	status?: OrderStatus;
	page?: number;
	limit?: number;
}

export interface TicketsQueryParams {
	event_id?: string;
	order_id?: string;
	status?: TicketStatus;
	page?: number;
	limit?: number;
	[key: string]: string | number | boolean | undefined | null;
}
