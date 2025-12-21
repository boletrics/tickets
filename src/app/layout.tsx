import type React from "react";
import type { Metadata } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import { getServerSession } from "@/lib/auth/getServerSession";
import { SessionHydrator } from "@/lib/auth/useAuthSession";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const sourceSerif4 = Source_Serif_4({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Boletrics - Discover Amazing Events",
	description: "Find and book tickets to concerts, sports, theater, and more",
	icons: {
		icon: [
			{
				url: "/icon-light-32x32.png",
				media: "(prefers-color-scheme: light)",
			},
			{
				url: "/icon-dark-32x32.png",
				media: "(prefers-color-scheme: dark)",
			},
			{
				url: "/icon.svg",
				type: "image/svg+xml",
			},
		],
		apple: "/apple-icon.png",
	},
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await getServerSession();

	return (
		<html lang="en">
			<body className={`font-sans antialiased`}>
				<SessionHydrator serverSession={session}>{children}</SessionHydrator>
			</body>
		</html>
	);
}
