"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
	CheckCircle,
	Download,
	Mail,
	Ticket,
	Calendar,
	MapPin,
} from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLocale } from "@/hooks/use-locale";
import { useThemeEffect } from "@/hooks/use-theme";
import { useCartStore } from "@/lib/cart-store";
import { useOrder } from "@/lib/api/hooks/use-orders";

export default function CheckoutSuccessPage() {
	useThemeEffect();
	const { t, locale } = useLocale();
	const searchParams = useSearchParams();
	const { clearCart } = useCartStore();

	const orderNumber = searchParams.get("order");
	const { data: order, isLoading } = useOrder(orderNumber);

	const [pendingOrder, setPendingOrder] = useState<{
		orderId: string;
		orderNumber: string;
		total: number;
		email: string;
	} | null>(null);

	useEffect(() => {
		// Clear cart on successful payment
		clearCart();

		// Get pending order info from localStorage
		const stored = localStorage.getItem("pendingOrder");
		if (stored) {
			try {
				setPendingOrder(JSON.parse(stored));
				localStorage.removeItem("pendingOrder");
			} catch {
				// Ignore parse errors
			}
		}
	}, [clearCart]);

	const formatPrice = (price: number) => {
		return locale === "es"
			? `$${price.toLocaleString("es-MX")} MXN`
			: `$${price.toLocaleString("en-US")}`;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString(
			locale === "es" ? "es-MX" : "en-US",
			{
				weekday: "long",
				month: "long",
				day: "numeric",
				year: "numeric",
			},
		);
	};

	return (
		<div className="min-h-screen bg-background">
			<Header />

			<div className="container mx-auto px-4 py-12">
				<div className="max-w-2xl mx-auto">
					{/* Success Header */}
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
							<CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
						</div>
						<h1 className="text-3xl font-bold mb-2">
							{t("success.title") || "Payment Successful!"}
						</h1>
						<p className="text-muted-foreground">
							{t("success.message") ||
								"Your tickets have been confirmed. You'll receive an email with your tickets shortly."}
						</p>
					</div>

					{/* Order Details */}
					<Card className="mb-6">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Ticket className="h-5 w-5" />
								{t("success.orderDetails") || "Order Details"}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-muted-foreground">
										{t("success.orderNumber") || "Order Number"}
									</p>
									<p className="font-mono font-medium">
										{orderNumber || pendingOrder?.orderNumber || "..."}
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										{t("success.total") || "Total Paid"}
									</p>
									<p className="font-medium">
										{order
											? formatPrice(order.total)
											: pendingOrder
												? formatPrice(pendingOrder.total)
												: "..."}
									</p>
								</div>
							</div>

							<Separator />

							<div className="flex items-start gap-3">
								<Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
								<div>
									<p className="font-medium">
										{t("success.emailSent") || "Confirmation email sent"}
									</p>
									<p className="text-sm text-muted-foreground">
										{order?.email || pendingOrder?.email || "your email"}
									</p>
								</div>
							</div>

							{order?.event && (
								<>
									<Separator />

									<div className="space-y-3">
										<h4 className="font-medium">{order.event.title}</h4>
										{order.event.dates?.[0] && (
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<Calendar className="h-4 w-4" />
												<span>{formatDate(order.event.dates[0].date)}</span>
											</div>
										)}
										{order.event.venue && (
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<MapPin className="h-4 w-4" />
												<span>
													{order.event.venue.name}, {order.event.venue.city}
												</span>
											</div>
										)}
									</div>
								</>
							)}
						</CardContent>
					</Card>

					{/* Actions */}
					<div className="flex flex-col sm:flex-row gap-4">
						<Button asChild className="flex-1">
							<Link href="/my-tickets">
								<Ticket className="h-4 w-4 mr-2" />
								{t("success.viewTickets") || "View My Tickets"}
							</Link>
						</Button>
						<Button variant="outline" className="flex-1 bg-transparent">
							<Download className="h-4 w-4 mr-2" />
							{t("success.downloadTickets") || "Download Tickets"}
						</Button>
					</div>

					<div className="text-center mt-8">
						<Link
							href="/"
							className="text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							{t("common.backToHome") || "Back to Home"}
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
