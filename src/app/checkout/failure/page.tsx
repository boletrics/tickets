"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, RefreshCcw, HelpCircle } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLocale } from "@/hooks/use-locale";
import { useThemeEffect } from "@/hooks/use-theme";

export default function CheckoutFailurePage() {
	useThemeEffect();
	const { t } = useLocale();
	const searchParams = useSearchParams();

	const orderNumber = searchParams.get("order");
	const errorCode = searchParams.get("error");

	const getErrorMessage = () => {
		switch (errorCode) {
			case "declined":
				return (
					t("checkout.errors.declined") ||
					"Your card was declined. Please try a different payment method."
				);
			case "expired":
				return (
					t("checkout.errors.expired") ||
					"The payment session expired. Please try again."
				);
			case "insufficient_funds":
				return (
					t("checkout.errors.insufficientFunds") ||
					"Insufficient funds. Please try a different card."
				);
			default:
				return (
					t("checkout.errors.generic") ||
					"Something went wrong with your payment. Please try again."
				);
		}
	};

	return (
		<div className="min-h-screen bg-background">
			<Header />

			<div className="container mx-auto px-4 py-12">
				<div className="max-w-lg mx-auto">
					{/* Failure Header */}
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
							<XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
						</div>
						<h1 className="text-3xl font-bold mb-2">
							{t("checkout.paymentFailed") || "Payment Failed"}
						</h1>
						<p className="text-muted-foreground">{getErrorMessage()}</p>
					</div>

					{/* Info Card */}
					<Card className="mb-6">
						<CardContent className="pt-6">
							<p className="text-sm text-muted-foreground mb-4">
								{t("checkout.noChargeMessage") ||
									"Don't worry, your card has not been charged. Your tickets are still reserved for a few more minutes."}
							</p>

							{orderNumber && (
								<p className="text-sm">
									<span className="text-muted-foreground">
										{t("checkout.orderReference") || "Order reference"}:{" "}
									</span>
									<span className="font-mono">{orderNumber}</span>
								</p>
							)}
						</CardContent>
					</Card>

					{/* Actions */}
					<div className="flex flex-col gap-4">
						<Button asChild size="lg">
							<Link href="/checkout">
								<RefreshCcw className="h-4 w-4 mr-2" />
								{t("checkout.tryAgain") || "Try Again"}
							</Link>
						</Button>

						<Button
							variant="outline"
							asChild
							size="lg"
							className="bg-transparent"
						>
							<Link href="/support">
								<HelpCircle className="h-4 w-4 mr-2" />
								{t("checkout.contactSupport") || "Contact Support"}
							</Link>
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
