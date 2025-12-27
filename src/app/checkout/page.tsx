"use client";

import type React from "react";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	ArrowLeft,
	CreditCard,
	Mail,
	AlertCircle,
	Loader2,
	ShieldCheck,
	CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { useLocale } from "@/hooks/use-locale";
import { useThemeEffect } from "@/hooks/use-theme";
import { useAuthStore } from "@/lib/auth-store";
import { useCartStore } from "@/lib/cart-store";
import { getAuthLoginUrl } from "@/lib/auth/config";
import { authClient } from "@/lib/auth/authClient";
import { useToast } from "@/hooks/use-toast";
import type {
	CreatePaymentOrderRequest,
	CreatePaymentOrderResponse,
} from "@/app/api/payments/create-order/route";

const OTP_LENGTH = 6;

export default function CheckoutPage() {
	useThemeEffect();
	const router = useRouter();
	const { t, locale } = useLocale();
	const { user, setGuestEmail } = useAuthStore();
	const { items, getSubtotal, getFees, getTotal } = useCartStore();
	const { toast } = useToast();

	const [email, setEmail] = useState(user?.email || "");
	const [firstName, setFirstName] = useState(user?.firstName || "");
	const [lastName, setLastName] = useState(user?.lastName || "");
	const [phone, setPhone] = useState(user?.phone || "");

	const [needsVerification, setNeedsVerification] = useState(!user);
	const [otpCode, setOtpCode] = useState("");
	const [otpSent, setOtpSent] = useState(false);
	const [isSendingOtp, setIsSendingOtp] = useState(false);
	const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
	const [otpError, setOtpError] = useState<string | null>(null);

	const [createAccount, setCreateAccount] = useState(false);
	const [processing, setProcessing] = useState(false);
	const [acceptedTerms, setAcceptedTerms] = useState(false);

	const subtotal = getSubtotal();
	const fees = getFees();
	const total = getTotal();

	const formatPrice = (price: number) => {
		return locale === "es"
			? `$${price.toLocaleString("es-MX")} MXN`
			: `$${price.toLocaleString("en-US")}`;
	};

	const handleSendOTP = async () => {
		if (!email) {
			toast({
				variant: "destructive",
				title: t("common.error"),
				description: t("auth.emailRequired") || "Email is required",
			});
			return;
		}

		setIsSendingOtp(true);
		setOtpError(null);

		try {
			const result = await authClient.emailOtp.sendVerificationOtp({
				email,
				type: "email-verification",
			});

			if (result.error) {
				setOtpError(result.error.message || "Failed to send code");
				toast({
					variant: "destructive",
					title: t("common.error"),
					description:
						result.error.message || "Failed to send verification code",
				});
			} else {
				setOtpSent(true);
				toast({
					title: t("auth.otpSent") || "Code sent",
					description:
						t("auth.otpSentMessage") || `Verification code sent to ${email}`,
				});
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to send code";
			setOtpError(message);
			toast({
				variant: "destructive",
				title: t("common.error"),
				description: message,
			});
		} finally {
			setIsSendingOtp(false);
		}
	};

	const handleVerifyOTP = useCallback(async () => {
		if (!email || otpCode.length !== OTP_LENGTH) {
			return;
		}

		setIsVerifyingOtp(true);
		setOtpError(null);

		try {
			const result = await authClient.emailOtp.verifyEmail({
				email,
				otp: otpCode,
			});

			if (result.error) {
				setOtpError(result.error.message || "Invalid code");
				toast({
					variant: "destructive",
					title: t("common.error"),
					description:
						result.error.message ||
						t("auth.invalidOTP") ||
						"Invalid verification code",
				});
			} else {
				setNeedsVerification(false);
				setGuestEmail(email);
				toast({
					title: t("common.success") || "Success",
					description:
						t("auth.verificationSuccess") || "Verification successful",
				});
			}
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Verification failed";
			setOtpError(message);
			toast({
				variant: "destructive",
				title: t("common.error"),
				description: message,
			});
		} finally {
			setIsVerifyingOtp(false);
		}
	}, [email, otpCode, setGuestEmail, t, toast]);

	// Auto-submit when OTP is complete
	useEffect(() => {
		if (otpCode.length === OTP_LENGTH && email && !isVerifyingOtp && otpSent) {
			handleVerifyOTP();
		}
	}, [otpCode, email, isVerifyingOtp, otpSent, handleVerifyOTP]);

	const handleProceedToPayment = async (e: React.FormEvent) => {
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

		if (!acceptedTerms) {
			toast({
				variant: "destructive",
				title: t("common.error"),
				description:
					t("checkout.acceptTerms") || "Please accept the terms and conditions",
			});
			return;
		}

		if (items.length === 0) {
			toast({
				variant: "destructive",
				title: t("common.error"),
				description: t("checkout.emptyCart") || "Your cart is empty",
			});
			return;
		}

		setProcessing(true);

		try {
			// Prepare the order request
			const orderRequest: CreatePaymentOrderRequest = {
				email: email,
				name: `${firstName} ${lastName}`.trim() || email.split("@")[0],
				phone: phone || undefined,
				event_id: items[0].eventId,
				org_id: items[0].orgId || "",
				items: items.map((item) => ({
					ticket_type_id: item.ticketTypeId,
					ticket_type_name: item.ticketTypeName,
					quantity: item.quantity,
					price: item.price,
				})),
			};

			// Call the payment API
			const response = await fetch("/api/payments/create-order", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(orderRequest),
			});

			if (!response.ok) {
				const errorBody = (await response.json()) as { error?: string };
				throw new Error(errorBody.error || "Payment initialization failed");
			}

			const result: CreatePaymentOrderResponse = await response.json();

			// Store order info for success page
			localStorage.setItem(
				"pendingOrder",
				JSON.stringify({
					orderId: result.order_id,
					orderNumber: result.order_number,
					total: result.total,
					email: email,
				}),
			);

			// Redirect to Conekta checkout
			window.location.href = result.checkout_url;
		} catch (error) {
			console.error("Payment error:", error);
			toast({
				variant: "destructive",
				title: t("common.error"),
				description:
					error instanceof Error
						? error.message
						: t("checkout.paymentError") || "Payment initialization failed",
			});
			setProcessing(false);
		}
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

						<form onSubmit={handleProceedToPayment} className="space-y-8">
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
													disabled={isSendingOtp || !email}
												>
													{isSendingOtp ? (
														<>
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															{t("common.sending") || "Sending..."}
														</>
													) : (
														t("auth.sendCode") || "Send verification code"
													)}
												</Button>
											) : (
												<div className="space-y-4">
													<p className="text-sm text-muted-foreground text-center">
														{t("auth.enterCodeSentTo") ||
															"Enter the 6-digit code sent to"}{" "}
														<strong>{email}</strong>
													</p>

													{/* OTP Input */}
													<div className="flex justify-center">
														<InputOTP
															maxLength={OTP_LENGTH}
															value={otpCode}
															onChange={setOtpCode}
															disabled={isVerifyingOtp}
															aria-label="Verification code"
														>
															<InputOTPGroup>
																<InputOTPSlot index={0} />
																<InputOTPSlot index={1} />
																<InputOTPSlot index={2} />
																<InputOTPSlot index={3} />
																<InputOTPSlot index={4} />
																<InputOTPSlot index={5} />
															</InputOTPGroup>
														</InputOTP>
													</div>

													{isVerifyingOtp && (
														<div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
															<Loader2 className="h-4 w-4 animate-spin" />
															{t("common.verifying") || "Verifying..."}
														</div>
													)}

													{otpError && (
														<Alert variant="destructive">
															<AlertCircle className="h-4 w-4" />
															<AlertDescription>{otpError}</AlertDescription>
														</Alert>
													)}

													<Button
														type="button"
														onClick={handleSendOTP}
														variant="outline"
														className="w-full bg-transparent"
														disabled={isSendingOtp}
													>
														{isSendingOtp ? (
															<>
																<Loader2 className="mr-2 h-4 w-4 animate-spin" />
																{t("common.sending") || "Sending..."}
															</>
														) : (
															<>
																<Mail className="mr-2 h-4 w-4" />
																{t("auth.resendCode") || "Resend code"}
															</>
														)}
													</Button>
												</div>
											)}
										</div>
									)}

									{!user && !needsVerification && (
										<>
											<Alert className="bg-green-500/10 border-green-500/20">
												<CheckCircle2 className="h-4 w-4 text-green-600" />
												<AlertDescription className="text-green-700 dark:text-green-400">
													{t("auth.emailVerified") ||
														"Email verified successfully"}
												</AlertDescription>
											</Alert>
											<div className="flex items-center space-x-2">
												<Checkbox
													id="createAccount"
													checked={createAccount}
													onCheckedChange={(v) =>
														setCreateAccount(v as boolean)
													}
												/>
												<Label
													htmlFor="createAccount"
													className="text-sm cursor-pointer"
												>
													{t("checkout.createAccountPrompt")}
												</Label>
											</div>
										</>
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
									<div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
										<ShieldCheck className="h-8 w-8 text-primary" />
										<div>
											<p className="font-medium">
												{t("checkout.securePayment") ||
													"Secure payment with Conekta"}
											</p>
											<p className="text-sm text-muted-foreground">
												{t("checkout.securePaymentDesc") ||
													"You'll be redirected to Conekta's secure checkout to complete your payment."}
											</p>
										</div>
									</div>

									<div className="flex flex-wrap gap-2 justify-center py-2">
										<img
											src="/visa.svg"
											alt="Visa"
											className="h-8 opacity-80"
										/>
										<img
											src="/mastercard.svg"
											alt="Mastercard"
											className="h-8 opacity-80"
										/>
										<img
											src="/amex.svg"
											alt="American Express"
											className="h-8 opacity-80"
										/>
									</div>

									<p className="text-xs text-muted-foreground text-center">
										{t("checkout.installments") ||
											"Pay in up to 12 monthly installments with participating cards"}
									</p>
								</CardContent>
							</Card>

							{/* Terms */}
							<div className="flex items-start space-x-2">
								<Checkbox
									id="acceptTerms"
									checked={acceptedTerms}
									onCheckedChange={(v) => setAcceptedTerms(v as boolean)}
								/>
								<Label
									htmlFor="acceptTerms"
									className="text-sm cursor-pointer leading-normal"
								>
									{t("checkout.acceptTermsLabel") ||
										"I accept the terms and conditions and the privacy policy. I understand that my tickets will be sent to the email provided."}
								</Label>
							</div>

							<Button
								type="submit"
								size="lg"
								className="w-full"
								disabled={processing || needsVerification || !acceptedTerms}
							>
								{processing ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										{t("checkout.processing") || "Processing..."}
									</>
								) : (
									`${t("checkout.proceedToPayment") || "Proceed to Payment"} • ${formatPrice(total)}`
								)}
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
