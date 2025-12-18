"use client";

import { useState, useEffect } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/hooks/use-locale";
import { useCartStore } from "@/lib/cart-store";
import type { Event } from "@/lib/types";

interface TicketSelectorProps {
	event: Event;
}

export function TicketSelector({ event }: TicketSelectorProps) {
	const { t, locale } = useLocale();
	const { setSelectedTickets } = useCartStore();
	const [quantities, setQuantities] = useState<Record<string, number>>({});

	useEffect(() => {
		setSelectedTickets(quantities);
	}, [quantities, setSelectedTickets]);

	const formatPrice = (price: number) => {
		return locale === "es"
			? `$${price.toLocaleString("es-MX")} MXN`
			: `$${price.toLocaleString("en-US")}`;
	};

	const updateQuantity = (ticketId: string, delta: number) => {
		setQuantities((prev) => {
			const current = prev[ticketId] || 0;
			const newValue = Math.max(0, Math.min(10, current + delta));

			const updated = { ...prev };
			if (newValue === 0) {
				delete updated[ticketId];
			} else {
				updated[ticketId] = newValue;
			}

			return updated;
		});
	};

	return (
		<div>
			<h2 className="text-2xl font-bold mb-6">{t("event.selectTickets")}</h2>

			<div className="space-y-4">
				{event.ticketTypes.map((ticket) => (
					<Card
						key={ticket.id}
						className={ticket.available === 0 ? "opacity-60" : ""}
					>
						<CardContent className="p-5">
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-2">
										<h3 className="text-lg font-bold">{ticket.name}</h3>
										{ticket.available === 0 && (
											<Badge variant="destructive" className="text-xs">
												{t("event.soldOut")}
											</Badge>
										)}
										{ticket.available > 0 && ticket.available <= 10 && (
											<Badge variant="secondary" className="text-xs">
												{ticket.available} {t("event.available").toLowerCase()}
											</Badge>
										)}
									</div>
									<p className="text-sm text-muted-foreground mb-3">
										{ticket.description}
									</p>
									<p className="text-2xl font-bold">
										{formatPrice(ticket.price)}
									</p>
								</div>

								{ticket.available > 0 && (
									<div className="flex items-center gap-3 justify-end sm:justify-start">
										<Button
											variant="outline"
											size="icon"
											onClick={() => updateQuantity(ticket.id, -1)}
											disabled={!quantities[ticket.id]}
											className="h-10 w-10"
										>
											<Minus className="h-4 w-4" />
										</Button>
										<span className="w-12 text-center text-lg font-bold">
											{quantities[ticket.id] || 0}
										</span>
										<Button
											variant="outline"
											size="icon"
											onClick={() => updateQuantity(ticket.id, 1)}
											disabled={
												(quantities[ticket.id] || 0) >=
												Math.min(10, ticket.available)
											}
											className="h-10 w-10"
										>
											<Plus className="h-4 w-4" />
										</Button>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
