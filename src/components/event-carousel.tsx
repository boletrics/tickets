"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/hooks/use-locale";
import type { Event } from "@/lib/types";

interface EventCarouselProps {
	title: string;
	events: Event[];
	showViewAll?: boolean;
	viewAllHref?: string;
}

export function EventCarousel({
	title,
	events,
	showViewAll = true,
	viewAllHref = "/search",
}: EventCarouselProps) {
	const { t, locale } = useLocale();
	const scrollRef = useRef<HTMLDivElement>(null);

	const scroll = (direction: "left" | "right") => {
		if (scrollRef.current) {
			const scrollAmount = 300;
			scrollRef.current.scrollBy({
				left: direction === "left" ? -scrollAmount : scrollAmount,
				behavior: "smooth",
			});
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return locale === "es"
			? date.toLocaleDateString("es-MX", { month: "short", day: "numeric" })
			: date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	};

	const formatPrice = (price: number) => {
		return locale === "es"
			? `$${price.toLocaleString("es-MX")}`
			: `$${price.toLocaleString("en-US")}`;
	};

	const getCategoryColor = (category: string) => {
		const colors: Record<string, string> = {
			concert: "bg-purple-500/90 text-white border-none",
			sports: "bg-blue-500/90 text-white border-none",
			theater: "bg-rose-500/90 text-white border-none",
			festival: "bg-amber-500/90 text-white border-none",
			comedy: "bg-green-500/90 text-white border-none",
			conference: "bg-cyan-500/90 text-white border-none",
			exhibition: "bg-pink-500/90 text-white border-none",
		};
		return colors[category] || "bg-secondary text-secondary-foreground";
	};

	if (events.length === 0) return null;

	return (
		<section className="py-6">
			<div className="flex items-center justify-between mb-4 px-4 md:px-0">
				<h2 className="text-xl md:text-2xl font-bold">{title}</h2>
				<div className="flex items-center gap-2">
					{showViewAll && (
						<Link href={viewAllHref}>
							<Button
								variant="ghost"
								size="sm"
								className="text-muted-foreground"
							>
								{t("home.viewAll")}
								<ChevronRight className="h-4 w-4 ml-1" />
							</Button>
						</Link>
					)}
					<div className="hidden md:flex gap-1">
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8 bg-transparent"
							onClick={() => scroll("left")}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8 bg-transparent"
							onClick={() => scroll("right")}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>

			<div
				ref={scrollRef}
				className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory pl-4 md:pl-0 pr-4"
				style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
			>
				{events.map((event) => (
					<Link
						key={event.id}
						href={`/events/${event.id}`}
						className="flex-shrink-0 w-[280px] md:w-[300px] snap-start"
					>
						<Card className="h-full p-0 overflow-hidden hover:shadow-lg transition-shadow group">
							<div className="relative aspect-[4/3] bg-muted">
								<Image
									src={event.image || "/placeholder.svg"}
									alt={event.title}
									fill
									className="object-cover group-hover:scale-105 transition-transform duration-300"
								/>
								<Badge
									className={`absolute top-2 right-2 text-xs ${getCategoryColor(event.category)}`}
								>
									{event.category.charAt(0).toUpperCase() +
										event.category.slice(1)}
								</Badge>
							</div>
							<CardContent className="p-3">
								<h3 className="font-semibold text-sm line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
									{event.title}
								</h3>
								<div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
									<Calendar className="h-3 w-3" />
									<span>
										{event.dates[0]?.date
											? formatDate(event.dates[0].date)
											: t("events.dateNotSet")}
									</span>
									<span>•</span>
									<span className="truncate">{event.venue}</span>
								</div>
								<p className="text-sm font-bold text-primary">
									{t("events.from")}{" "}
									{event.ticketTypes[0]?.price != null
										? formatPrice(event.ticketTypes[0].price)
										: t("events.priceNotSet")}
								</p>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>
		</section>
	);
}
