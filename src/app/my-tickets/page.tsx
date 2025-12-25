"use client";

import { useState, useEffect } from "react";
import {
	Calendar,
	MapPin,
	TicketIcon,
	Download,
	Mail,
	QrCode,
	Loader2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useLocale } from "@/hooks/use-locale";
import { useThemeEffect } from "@/hooks/use-theme";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/auth-store";
import { getAuthLoginUrl } from "@/lib/auth/config";
import { useMyOrders } from "@/lib/api/hooks";
import type { Order, OrderItem } from "@/lib/api/types";

interface TicketDetails {
	id: string;
	code: string;
	ticketTypeName: string;
	eventName: string;
	date: string;
	time: string;
	venue: string;
	holderName?: string;
	qrData: string;
}

export default function MyTicketsPage() {
	useThemeEffect();
	const router = useRouter();
	const { t, locale } = useLocale();
	const { user, guestEmail } = useAuthStore();
	const { toast } = useToast();
	const [activeTab, setActiveTab] = useState("upcoming");
	const [selectedTicket, setSelectedTicket] = useState<TicketDetails | null>(
		null,
	);

	// Redirect if not authenticated
	useEffect(() => {
		if (!user && !guestEmail && typeof window !== "undefined") {
			window.location.href = getAuthLoginUrl(window.location.href);
		}
	}, [user, guestEmail]);

	// Fetch orders from API
	const { data: orders = [], isLoading } = useMyOrders();

	const now = new Date();

	const getEventDate = (order: Order): Date | null => {
		const dateStr = order.event?.dates?.[0]?.date;
		return dateStr ? new Date(dateStr) : null;
	};

	const upcomingOrders = orders.filter((order) => {
		const eventDate = getEventDate(order);
		return eventDate && eventDate >= now;
	});

	const pastOrders = orders.filter((order) => {
		const eventDate = getEventDate(order);
		return eventDate && eventDate < now;
	});

	if (!user && !guestEmail) {
		return null;
	}

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return locale === "es"
			? date.toLocaleDateString("es-MX", {
					month: "long",
					day: "numeric",
					year: "numeric",
				})
			: date.toLocaleDateString("en-US", {
					month: "long",
					day: "numeric",
					year: "numeric",
				});
	};

	const formatPrice = (price: number) => {
		return locale === "es"
			? `$${price.toLocaleString("es-MX")} MXN`
			: `$${price.toLocaleString("en-US")}`;
	};

	const handleDownloadTicket = (orderId: string) => {
		toast({
			title: t("tickets.downloadStarted") || "Download started",
			description:
				t("tickets.downloadMessage") || "Your ticket is being downloaded",
		});
	};

	const handleEmailTicket = (orderId: string, email: string) => {
		toast({
			title: t("tickets.emailSent") || "Email sent",
			description: `${t("tickets.emailMessage") || "Ticket sent to"} ${email}`,
		});
	};

	const handleViewTicket = (order: Order, item: OrderItem, index: number) => {
		if (!order.event) return;

		// Find ticket associated with this order item
		const ticket = order.tickets?.find((t) => t.order_item_id === item.id);
		const ticketCode =
			ticket?.ticket_code || `TKT-${order.id.slice(-6).toUpperCase()}`;

		setSelectedTicket({
			id: item.id || `${order.id}-${index}`,
			code: ticketCode,
			ticketTypeName: item.ticket_type?.name || "General",
			eventName: order.event.title || "",
			date: order.event.dates?.[0]?.date || "",
			time: order.event.dates?.[0]?.start_time || "",
			venue: order.event.venue?.name || "",
			holderName: user?.firstName || "",
			qrData: ticketCode,
		});
	};

	const OrderCard = ({ order }: { order: Order }) => {
		if (!order.event) return null;

		const firstDate = order.event.dates?.[0];
		const dateDisplay = firstDate?.date ? formatDate(firstDate.date) : "";
		const timeDisplay = firstDate?.start_time || "";

		return (
			<Card className="overflow-hidden">
				<div className="flex flex-col md:flex-row">
					<div className="relative w-full md:w-48 h-48 md:h-auto">
						<Image
							src={order.event.image_url || "/placeholder.svg"}
							alt={order.event.title}
							fill
							className="object-cover"
						/>
					</div>

					<div className="flex-1">
						<CardHeader>
							<div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
								<div className="flex-1">
									<CardTitle className="text-xl mb-2 text-balance">
										{order.event.title}
									</CardTitle>
									<div className="space-y-1 text-sm text-muted-foreground">
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4" />
											<span>
												{dateDisplay} {timeDisplay && `• ${timeDisplay}`}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<MapPin className="h-4 w-4" />
											<span>{order.event.venue?.name || "TBD"}</span>
										</div>
									</div>
								</div>
								<Badge variant="outline" className="shrink-0">
									{t("success.orderNumber")}: {order.order_number}
								</Badge>
							</div>
						</CardHeader>

						<CardContent className="space-y-4">
							<div className="space-y-2">
								{(order.items || []).map((item, index) => (
									<div
										key={item.id}
										className="flex items-center justify-between text-sm"
									>
										<div className="flex items-center gap-2">
											<TicketIcon className="h-4 w-4 text-muted-foreground" />
											<span>
												{item.quantity}x {item.ticket_type?.name || "Ticket"}
											</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="font-medium">
												{formatPrice(item.unit_price * item.quantity)}
											</span>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleViewTicket(order, item, index)}
											>
												<QrCode className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))}

								<div className="flex items-center justify-between text-sm font-bold pt-2 border-t">
									<span>{t("tickets.total")}</span>
									<span>{formatPrice(order.total)}</span>
								</div>
							</div>

							<div className="flex flex-wrap gap-2">
								<Button
									size="sm"
									onClick={() => handleDownloadTicket(order.id)}
								>
									<Download className="h-4 w-4 mr-2" />
									{t("tickets.download") || "Download"}
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleEmailTicket(order.id, order.email || "")}
								>
									<Mail className="h-4 w-4 mr-2" />
									{t("tickets.email") || "Email"}
								</Button>
							</div>
						</CardContent>
					</div>
				</div>
			</Card>
		);
	};

	// Simple QR Code component using SVG (placeholder - can be enhanced with a library)
	const QRCodeDisplay = ({ data }: { data: string }) => {
		// Generate a simple visual representation
		// In production, use a proper QR code library like 'qrcode.react'
		return (
			<div className="relative w-48 h-48 mx-auto bg-white p-4 rounded-lg">
				<div className="absolute inset-4 flex items-center justify-center">
					<div className="grid grid-cols-8 gap-0.5 w-full h-full">
						{Array.from({ length: 64 }).map((_, i) => (
							<div
								key={i}
								className={`aspect-square ${
									// Create a pseudo-random pattern based on the data
									(data.charCodeAt(i % data.length) + i) % 3 === 0
										? "bg-black"
										: "bg-white"
								}`}
							/>
						))}
					</div>
				</div>
				<div className="absolute top-4 left-4 w-6 h-6 bg-black rounded-sm" />
				<div className="absolute top-4 right-4 w-6 h-6 bg-black rounded-sm" />
				<div className="absolute bottom-4 left-4 w-6 h-6 bg-black rounded-sm" />
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-background">
			<Header />

			<div className="container mx-auto px-4 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold mb-2">{t("nav.myTickets")}</h1>
					{user && (
						<p className="text-muted-foreground">
							{t("tickets.welcome") || "Welcome back"}, {user.firstName}
						</p>
					)}
				</div>

				{isLoading ? (
					<div className="flex items-center justify-center py-20">
						<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				) : (
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className="mb-6">
							<TabsTrigger value="upcoming">
								{t("tickets.upcoming") || "Upcoming"} ({upcomingOrders.length})
							</TabsTrigger>
							<TabsTrigger value="past">
								{t("tickets.past") || "Past"} ({pastOrders.length})
							</TabsTrigger>
						</TabsList>

						<TabsContent value="upcoming" className="space-y-4">
							{upcomingOrders.length === 0 ? (
								<Card>
									<CardContent className="py-20 text-center">
										<TicketIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
										<h3 className="text-lg font-semibold mb-2">
											{t("tickets.noUpcoming") || "No upcoming tickets"}
										</h3>
										<p className="text-muted-foreground mb-6">
											{t("tickets.noUpcomingMessage") ||
												"You don't have any upcoming events"}
										</p>
										<Button onClick={() => router.push("/")}>
											{t("tickets.browseEvents") || "Browse Events"}
										</Button>
									</CardContent>
								</Card>
							) : (
								upcomingOrders.map((order) => (
									<OrderCard key={order.id} order={order} />
								))
							)}
						</TabsContent>

						<TabsContent value="past" className="space-y-4">
							{pastOrders.length === 0 ? (
								<Card>
									<CardContent className="py-20 text-center">
										<TicketIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
										<h3 className="text-lg font-semibold mb-2">
											{t("tickets.noPast") || "No past tickets"}
										</h3>
										<p className="text-muted-foreground">
											{t("tickets.noPastMessage") ||
												"You don't have any past events"}
										</p>
									</CardContent>
								</Card>
							) : (
								pastOrders.map((order) => (
									<OrderCard key={order.id} order={order} />
								))
							)}
						</TabsContent>
					</Tabs>
				)}
			</div>

			{/* Ticket QR Code Dialog */}
			<Dialog
				open={!!selectedTicket}
				onOpenChange={() => setSelectedTicket(null)}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-center">
							{t("tickets.yourTicket") || "Your Ticket"}
						</DialogTitle>
					</DialogHeader>

					{selectedTicket && (
						<div className="space-y-4 text-center">
							<QRCodeDisplay data={selectedTicket.qrData} />

							<div className="space-y-2">
								<p className="font-mono text-sm text-muted-foreground">
									{selectedTicket.code}
								</p>
								<h3 className="font-semibold text-lg">
									{selectedTicket.eventName}
								</h3>
								<p className="text-muted-foreground">
									{selectedTicket.ticketTypeName}
								</p>
								<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
									<Calendar className="h-4 w-4" />
									<span>
										{selectedTicket.date && formatDate(selectedTicket.date)}{" "}
										{selectedTicket.time && `• ${selectedTicket.time}`}
									</span>
								</div>
								<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
									<MapPin className="h-4 w-4" />
									<span>{selectedTicket.venue}</span>
								</div>
								{selectedTicket.holderName && (
									<p className="text-sm">
										{t("tickets.holder") || "Ticket holder"}:{" "}
										<span className="font-medium">
											{selectedTicket.holderName}
										</span>
									</p>
								)}
							</div>

							<div className="flex gap-2 justify-center pt-4">
								<Button
									size="sm"
									onClick={() => handleDownloadTicket(selectedTicket.id)}
								>
									<Download className="h-4 w-4 mr-2" />
									{t("tickets.download") || "Download"}
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}
