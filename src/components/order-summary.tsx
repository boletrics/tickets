"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/hooks/use-locale";
import { useCartStore } from "@/lib/cart-store";
import type { Event } from "@/lib/types";

interface OrderSummaryProps {
	event: Event;
}

export function OrderSummary({ event }: OrderSummaryProps) {
	const router = useRouter();
	const { t, locale } = useLocale();
	const { selectedTickets, addToCart } = useCartStore();

	const summary = useMemo(() => {
		const tickets = Object.entries(selectedTickets || {})
			.map(([ticketId, quantity]) => {
				const ticket = event.ticketTypes.find((t) => t.id === ticketId);
				if (!ticket) return null;
				return { ticket, quantity, subtotal: ticket.price * quantity };
			})
			.filter(Boolean) as Array<{
			ticket: any;
			quantity: number;
			subtotal: number;
		}>;

		const subtotal = tickets.reduce((sum, item) => sum + item.subtotal, 0);
		const fees = subtotal * 0.1;
		const total = subtotal + fees;
		const totalTickets = tickets.reduce((sum, item) => sum + item.quantity, 0);

		return { tickets, subtotal, fees, total, totalTickets };
	}, [selectedTickets, event.ticketTypes]);

	const formatPrice = (price: number) => {
		return locale === "es"
			? `$${price.toLocaleString("es-MX")} MXN`
			: `$${price.toLocaleString("en-US")}`;
	};

	const handleContinue = () => {
		if (summary.totalTickets === 0) return;

		const firstDate = event.dates[0];
		const eventDate = firstDate?.date || "";
		const eventTime = firstDate?.times[0] || "";

		// Add items to cart
		Object.entries(selectedTickets || {}).forEach(([ticketId, quantity]) => {
			const ticket = event.ticketTypes.find((t) => t.id === ticketId);
			if (!ticket) return;

			addToCart({
				eventId: event.id,
				eventTitle: event.title,
				eventDate: eventDate,
				eventTime: eventTime,
				eventLocation: event.location,
				ticketTypeId: ticketId,
				ticketTypeName: ticket.name,
				quantity,
				price: ticket.price,
			});
		});

		router.push("/checkout");
	};

	return (
		<Card className="sticky top-24">
			<CardHeader>
				<CardTitle>{t("checkout.orderSummary")}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{summary.totalTickets === 0 ? (
					<p className="text-sm text-muted-foreground text-center py-8">
						{t("tickets.selectTickets")}
					</p>
				) : (
					<>
						<div className="space-y-3">
							{summary.tickets.map(({ ticket, quantity, subtotal }) => (
								<div key={ticket.id} className="flex justify-between text-sm">
									<span className="text-muted-foreground">
										{quantity}x {ticket.name}
									</span>
									<span className="font-medium">{formatPrice(subtotal)}</span>
								</div>
							))}
						</div>

						<Separator />

						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">
									{t("tickets.subtotal")}
								</span>
								<span className="font-medium">
									{formatPrice(summary.subtotal)}
								</span>
							</div>

							<div className="flex justify-between text-sm">
								<span className="text-muted-foreground">
									{t("tickets.fees")}
								</span>
								<span className="font-medium">{formatPrice(summary.fees)}</span>
							</div>
						</div>

						<Separator />

						<div className="flex justify-between text-lg font-bold">
							<span>{t("tickets.total")}</span>
							<span>{formatPrice(summary.total)}</span>
						</div>

						<Button className="w-full" size="lg" onClick={handleContinue}>
							{t("tickets.continue")}
						</Button>
					</>
				)}
			</CardContent>
		</Card>
	);
}
