import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";

export default function NotFound() {
	return (
		<div className="min-h-screen bg-background">
			<Header />
			<div className="container mx-auto px-4 py-20 text-center">
				<h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
				<p className="text-muted-foreground mb-6">
					The event you're looking for doesn't exist.
				</p>
				<Button asChild>
					<Link href="/">Back to Home</Link>
				</Button>
			</div>
		</div>
	);
}
