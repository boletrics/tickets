"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Mail, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocale } from "@/hooks/use-locale";
import { useThemeEffect } from "@/hooks/use-theme";
import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import { getAuthLoginUrl } from "@/lib/auth/config";
import type { Order } from "@/lib/types";

// TODO: Replace with actual API call
const orders: Order[] = [];
import { useToast } from "@/hooks/use-toast";

export default function CheckoutPage() {
	useThemeEffect();
	const router = useRouter();
	const { t, locale } = useLocale();
	const { user, setGuestEmail } = useAuthStore();
	const { items, getSubtotal, getFees, getTotal, clearCart } = useCartStore();
	const { toast } = useToast();

	const [email, setEmail] = useState(user?.email || "");
	const [firstName, setFirstName] = useState(user?.firstName || "");
	const [lastName, setLastName] = useState(user?.lastName || "");
	const [phone, setPhone] = useState(user?.phone || "");

	const [cardNumber, setCardNumber] = useState("");
	const [expiryDate, setExpiryDate] = useState("");
	const [cvv, setCvv] = useState("");

	const [needsVerification, setNeedsVerification] = useState(!user);
	const [otpCode, setOtpCode] = useState("");
	const [otpSent, setOtpSent] = useState(false);

	const [createAccount, setCreateAccount] = useState(false);
	const [processing, setProcessing] = useState(false);

	const subtotal = getSubtotal();
	const fees = getFees();
	const total = getTotal();

	const formatPrice = (price: number) => {
		return locale === "es"
			? `$${price.toLocaleString("es-MX")} MXN`
			: `$${price.toLocaleString("en-US")}`;
	};

	const handleSendOTP = () => {
		if (!email) {
			toast({
				variant: "destructive",
				title: t("common.error"),
				description: t("auth.emailRequired") || "Email is required",
			});
			return;
		}

		setOtpSent(true);
		toast({
			title: t("auth.otpSent") || "Code sent",
			description:
				t("auth.otpSentMessage") || `Verification code sent to ${email}`,
		});

		// In demo, the OTP is always "123456"
		console.log("[v0] Demo OTP code: 123456");
	};

	const handleVerifyOTP = () => {
		if (otpCode === "123456") {
			setNeedsVerification(false);
			setGuestEmail(email);
			toast({
				title: t("common.success") || "Success",
				description: t("auth.verificationSuccess") || "Verification successful",
			});
		} else {
			toast({
				variant: "destructive",
				title: t("common.error"),
				description: t("auth.invalidOTP") || "Invalid verification code",
			});
		}
	};

	const handleCompleteOrder = async (e: React.FormEvent) => {
		e.preventDefault();

		if (needsVerification) {
			toast({
				variant: "destructive",
				title: t("common.error"),
				description:
					t("checkout.verifyFirst") || "Please verify your email first",
			});
			return;
		}

		setProcessing(true);

		// Simulate payment processing
		setTimeout(() => {
			const orderId = `ORD-${Date.now()}`;

			const order = {
				id: orderId,
				userId: user?.id,
				email: email,
				eventId: items[0]?.eventId || "",
				tickets: items.map((item) => ({
					ticketTypeId: item.ticketTypeId,
					quantity: item.quantity,
					price: item.price,
				})),
				total,
				createdAt: new Date().toISOString(),
			};

			// TODO: Replace with actual API call
			orders.push(order);
			clearCart();

			toast({
				title: t("success.title"),
				description: t("success.message"),
			});

			router.push(`/success?orderId=${orderId}`);
			setProcessing(false);
		}, 2000);
	};

	if (items.length === 0) {
		return (
			<div className="min-h-screen bg-background">
				<Header />
				<div className="container mx-auto px-4 py-20 text-center">
					<h1 className="text-2xl font-bold mb-4">
						{t("checkout.emptyCart") || "Your cart is empty"}
					</h1>
					<Button asChild>
						<Link href="/">{t("common.backToHome") || "Back to Events"}</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<Header />

			<div className="container mx-auto px-4 py-8">
				<Button variant="ghost" className="mb-6 -ml-4" asChild>
					<Link href="/">
						<ArrowLeft className="h-4 w-4 mr-2" />
						{t("common.back") || "Back"}
					</Link>
				</Button>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Checkout Form */}
					<div className="lg:col-span-2">
						<h1 className="text-3xl font-bold mb-8">{t("checkout.title")}</h1>

						<form onSubmit={handleCompleteOrder} className="space-y-8">
							{/* Contact Information */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Mail className="h-5 w-5" />
										{t("checkout.contactInfo")}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{!user && (
										<Alert>
											<AlertCircle className="h-4 w-4" />
											<AlertDescription>
												{t("auth.continueAsGuest")}{" "}
												<a
													href={getAuthLoginUrl(
														typeof window !== "undefined"
															? window.location.href
															: undefined,
													)}
													className="font-medium underline"
												>
													{t("auth.signIn")}
												</a>
											</AlertDescription>
										</Alert>
									)}

									<div className="grid md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="firstName">
												{t("checkout.firstName")}
											</Label>
											<Input
												id="firstName"
												type="text"
												value={firstName}
												onChange={(e) => setFirstName(e.target.value)}
												required
												disabled={!!user}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="lastName">{t("checkout.lastName")}</Label>
											<Input
												id="lastName"
												type="text"
												value={lastName}
												onChange={(e) => setLastName(e.target.value)}
												required
												disabled={!!user}
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="email">{t("auth.email")}</Label>
										<Input
											id="email"
											type="email"
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											required
											disabled={!!user}
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="phone">{t("auth.phone")}</Label>
										<Input
											id="phone"
											type="tel"
											value={phone}
											onChange={(e) => setPhone(e.target.value)}
											placeholder="+52 55 1234 5678"
										/>
									</div>

									{/* Guest OTP Verification */}
									{!user && needsVerification && (
										<div className="space-y-4 p-4 border rounded-lg bg-muted/50">
											<p className="text-sm font-medium">
												{t("checkout.verifyEmail") || "Verify your email"}
											</p>

											{!otpSent ? (
												<Button
													type="button"
													onClick={handleSendOTP}
													variant="outline"
													className="w-full bg-transparent"
												>
													{t("auth.sendCode")}
												</Button>
											) : (
												<div className="space-y-3">
													<Input
														type="text"
														placeholder={t("auth.enterOTP")}
														value={otpCode}
														onChange={(e) => setOtpCode(e.target.value)}
														maxLength={6}
														className="text-center"
													/>
													<p className="text-xs text-muted-foreground text-center">
														Demo code: 123456
													</p>
													<div className="flex gap-2">
														<Button
															type="button"
															onClick={handleVerifyOTP}
															variant="default"
															className="flex-1"
														>
															{t("auth.verifyOTP")}
														</Button>
														<Button
															type="button"
															onClick={handleSendOTP}
															variant="outline"
															className="flex-1 bg-transparent"
														>
															{t("auth.resendCode")}
														</Button>
													</div>
												</div>
											)}
										</div>
									)}

									{!user && !needsVerification && (
										<div className="flex items-center space-x-2">
											<Checkbox
												id="createAccount"
												checked={createAccount}
												onCheckedChange={(v) => setCreateAccount(v as boolean)}
											/>
											<Label
												htmlFor="createAccount"
												className="text-sm cursor-pointer"
											>
												{t("checkout.createAccountPrompt")}
											</Label>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Payment Information */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<CreditCard className="h-5 w-5" />
										{t("checkout.paymentInfo")}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="cardNumber">
											{t("checkout.cardNumber")}
										</Label>
										<Input
											id="cardNumber"
											type="text"
											placeholder="4242 4242 4242 4242"
											value={cardNumber}
											onChange={(e) => setCardNumber(e.target.value)}
											maxLength={19}
											required
										/>
									</div>

									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="expiryDate">
												{t("checkout.expiryDate")}
											</Label>
											<Input
												id="expiryDate"
												type="text"
												placeholder="MM/YY"
												value={expiryDate}
												onChange={(e) => setExpiryDate(e.target.value)}
												maxLength={5}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="cvv">{t("checkout.cvv")}</Label>
											<Input
												id="cvv"
												type="text"
												placeholder="123"
												value={cvv}
												onChange={(e) => setCvv(e.target.value)}
												maxLength={4}
												required
											/>
										</div>
									</div>

									<p className="text-xs text-muted-foreground">
										{t("checkout.securePayment") ||
											"Your payment information is encrypted and secure. We never store your card details."}
									</p>
								</CardContent>
							</Card>

							<Button
								type="submit"
								size="lg"
								className="w-full"
								disabled={processing || needsVerification}
							>
								{processing
									? t("checkout.processing")
									: `${t("checkout.completeOrder")} • ${formatPrice(total)}`}
							</Button>
						</form>
					</div>

					{/* Order Summary */}
					<div className="lg:col-span-1">
						<Card className="sticky top-24">
							<CardHeader>
								<CardTitle>{t("checkout.orderSummary")}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{items.map((item) => (
									<div
										key={`${item.eventId}-${item.ticketTypeId}`}
										className="space-y-2"
									>
										<h4 className="font-medium text-balance">
											{item.eventTitle}
										</h4>
										<div className="flex justify-between text-sm text-muted-foreground">
											<span>
												{item.quantity}x {item.ticketTypeName}
											</span>
											<span className="font-medium text-foreground">
												{formatPrice(item.price * item.quantity)}
											</span>
										</div>
									</div>
								))}

								<Separator />

								<div className="flex justify-between text-sm">
									<span>{t("tickets.subtotal")}</span>
									<span className="font-medium">{formatPrice(subtotal)}</span>
								</div>

								<div className="flex justify-between text-sm text-muted-foreground">
									<span>{t("tickets.fees")}</span>
									<span>{formatPrice(fees)}</span>
								</div>

								<Separator />

								<div className="flex justify-between text-lg font-bold">
									<span>{t("tickets.total")}</span>
									<span>{formatPrice(total)}</span>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
