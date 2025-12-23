"use client";

import { useMemo } from "react";
import { Header } from "@/components/header";
import { RegionSelector } from "@/components/region-selector";
import { EventCarousel } from "@/components/event-carousel";
import { CategoryChips } from "@/components/category-chips";
import { useLocale } from "@/hooks/use-locale";
import { useThemeEffect } from "@/hooks/use-theme";
import { useRegionStore } from "@/lib/region-store";
import { usePublicEvents } from "@/lib/api/hooks/use-events";
import type { Event } from "@/lib/api/types";

// Map API Event type to component Event type
function mapApiEventToDisplay(event: Event) {
	return {
		id: event.id,
		title: event.title,
		description: event.description ?? "",
		dates:
			event.dates?.map((d) => ({
				date: d.date,
				times: [d.start_time],
			})) ?? [],
		location: event.venue
			? `${event.venue.city}, ${event.venue.state}`
			: "Location TBD",
		venue: event.venue?.name ?? "Venue TBD",
		region: (event.venue?.region ?? "mexico-city") as
			| "mexico-city"
			| "monterrey"
			| "guadalajara"
			| "cancun",
		image: event.image_url ?? "/placeholder.svg?height=400&width=600",
		category: event.category,
		artist: event.artist ?? undefined,
		organizer: event.organization?.name ?? "Boletrics",
		ticketTypes:
			event.ticket_types?.map((tt) => ({
				id: tt.id,
				name: tt.name,
				price: tt.price,
				available: tt.quantity_available,
				description: tt.description ?? "",
			})) ?? [],
	};
}

interface HomePageClientProps {
	initialEvents: Event[];
}

export function HomePageClient({ initialEvents }: HomePageClientProps) {
	useThemeEffect();
	const { t } = useLocale();
	const { region } = useRegionStore();

	// Use SWR to keep events fresh, with initial data from SSR
	const { data: eventsResult } = usePublicEvents({
		limit: 50,
	});

	// Use API data if available, otherwise use initial SSR data
	const apiEvents = eventsResult?.data ?? initialEvents;
	const events = useMemo(
		() => apiEvents.map(mapApiEventToDisplay),
		[apiEvents],
	);

	const {
		nearYouEvents,
		trendingEvents,
		thisWeekEvents,
		concertEvents,
		sportsEvents,
		theaterEvents,
		festivalEvents,
		comedyEvents,
		conferenceEvents,
		exhibitionEvents,
	} = useMemo(() => {
		const now = new Date();
		const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

		// Near you events (if region selected)
		const nearYou =
			region !== "all"
				? events.filter((e) => e.region === region).slice(0, 12)
				: [];

		// Trending - most expensive tickets (simulating popularity)
		const trending = [...events]
			.sort(
				(a, b) =>
					(b.ticketTypes[0]?.price ?? 0) - (a.ticketTypes[0]?.price ?? 0),
			)
			.slice(0, 12);

		// This week
		const thisWeek = events
			.filter((event) => {
				const eventDate = new Date(event.dates[0]?.date);
				return eventDate >= now && eventDate <= oneWeekFromNow;
			})
			.slice(0, 12);

		// By category
		const concerts = events
			.filter((e) => e.category === "concert")
			.slice(0, 12);
		const sports = events.filter((e) => e.category === "sports").slice(0, 12);
		const theater = events.filter((e) => e.category === "theater").slice(0, 12);
		const festivals = events
			.filter((e) => e.category === "festival")
			.slice(0, 12);
		const comedy = events.filter((e) => e.category === "comedy").slice(0, 12);
		const conferences = events
			.filter((e) => e.category === "conference")
			.slice(0, 12);
		const exhibitions = events
			.filter((e) => e.category === "exhibition")
			.slice(0, 12);

		return {
			nearYouEvents: nearYou,
			trendingEvents: trending,
			thisWeekEvents: thisWeek,
			concertEvents: concerts,
			sportsEvents: sports,
			theaterEvents: theater,
			festivalEvents: festivals,
			comedyEvents: comedy,
			conferenceEvents: conferences,
			exhibitionEvents: exhibitions,
		};
	}, [region, events]);

	return (
		<div className="min-h-screen bg-background">
			<Header />

			{/* Hero Section - Compact */}
			<section className="border-b bg-gradient-to-b from-primary/5 to-transparent">
				<div className="container mx-auto px-4 py-8 md:py-12">
					<div className="max-w-2xl mx-auto text-center mb-6">
						<h1 className="text-3xl md:text-4xl font-bold mb-3 text-balance">
							{t("home.title")}
						</h1>
						<p className="text-muted-foreground text-sm md:text-base mb-4">
							{t("home.subtitle")}
						</p>
						<RegionSelector />
					</div>
				</div>
			</section>

			{/* Category Chips */}
			<section className="border-b">
				<div className="container mx-auto py-4">
					<CategoryChips />
				</div>
			</section>

			{/* Carousels Container */}
			<div className="container mx-auto">
				{/* Near You - only if region selected */}
				{nearYouEvents.length > 0 && (
					<EventCarousel
						title={`${t("home.nearYou")} • ${region.charAt(0).toUpperCase() + region.slice(1).replace("-", " ")}`}
						events={nearYouEvents}
						viewAllHref={`/search?region=${region}`}
					/>
				)}

				{/* Trending */}
				{trendingEvents.length > 0 && (
					<EventCarousel
						title={t("home.trending")}
						events={trendingEvents}
						viewAllHref="/search?sort=trending"
					/>
				)}

				{/* This Week */}
				{thisWeekEvents.length > 0 && (
					<EventCarousel
						title={t("home.thisWeek")}
						events={thisWeekEvents}
						viewAllHref="/search?period=week"
					/>
				)}

				{/* By Category */}
				{concertEvents.length > 0 && (
					<EventCarousel
						title={t("categories.concert")}
						events={concertEvents}
						viewAllHref="/search?category=concert"
					/>
				)}

				{sportsEvents.length > 0 && (
					<EventCarousel
						title={t("categories.sports")}
						events={sportsEvents}
						viewAllHref="/search?category=sports"
					/>
				)}

				{theaterEvents.length > 0 && (
					<EventCarousel
						title={t("categories.theater")}
						events={theaterEvents}
						viewAllHref="/search?category=theater"
					/>
				)}

				{festivalEvents.length > 0 && (
					<EventCarousel
						title={t("categories.festival")}
						events={festivalEvents}
						viewAllHref="/search?category=festival"
					/>
				)}

				{comedyEvents.length > 0 && (
					<EventCarousel
						title={t("categories.comedy")}
						events={comedyEvents}
						viewAllHref="/search?category=comedy"
					/>
				)}

				{conferenceEvents.length > 0 && (
					<EventCarousel
						title={t("categories.conference")}
						events={conferenceEvents}
						viewAllHref="/search?category=conference"
					/>
				)}

				{exhibitionEvents.length > 0 && (
					<EventCarousel
						title={t("categories.exhibition")}
						events={exhibitionEvents}
						viewAllHref="/search?category=exhibition"
					/>
				)}

				{/* Empty state when no events */}
				{events.length === 0 && (
					<div className="py-20 text-center">
						<p className="text-muted-foreground text-lg">
							{t("home.noEvents") ?? "No events available at the moment."}
						</p>
						<p className="text-muted-foreground text-sm mt-2">
							{t("home.checkBackLater") ??
								"Check back later for upcoming events!"}
						</p>
					</div>
				)}

				{/* Footer spacing */}
				<div className="h-8" />
			</div>
		</div>
	);
}
