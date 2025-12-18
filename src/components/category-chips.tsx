"use client";

import { useRef } from "react";
import Link from "next/link";
import {
	Music,
	Trophy,
	Theater,
	PartyPopper,
	Laugh,
	Presentation,
	Frame,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/hooks/use-locale";

const categories = [
	{
		id: "concert",
		icon: Music,
		color:
			"bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20",
	},
	{
		id: "sports",
		icon: Trophy,
		color:
			"bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20",
	},
	{
		id: "theater",
		icon: Theater,
		color:
			"bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20",
	},
	{
		id: "festival",
		icon: PartyPopper,
		color:
			"bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20",
	},
	{
		id: "comedy",
		icon: Laugh,
		color:
			"bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20",
	},
	{
		id: "conference",
		icon: Presentation,
		color:
			"bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20",
	},
	{
		id: "exhibition",
		icon: Frame,
		color:
			"bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20",
	},
];

export function CategoryChips() {
	const { t } = useLocale();
	const scrollRef = useRef<HTMLDivElement>(null);

	const scroll = (direction: "left" | "right") => {
		if (scrollRef.current) {
			const scrollAmount = 200;
			scrollRef.current.scrollBy({
				left: direction === "left" ? -scrollAmount : scrollAmount,
				behavior: "smooth",
			});
		}
	};

	return (
		<div className="relative">
			<Button
				variant="ghost"
				size="icon"
				className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm hidden md:flex"
				onClick={() => scroll("left")}
			>
				<ChevronLeft className="h-4 w-4" />
			</Button>

			<div
				ref={scrollRef}
				className="flex gap-3 overflow-x-auto scrollbar-hide py-2 px-4 md:px-8"
				style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
			>
				{categories.map((category) => {
					const Icon = category.icon;
					return (
						<Link
							key={category.id}
							href={`/search?category=${category.id}`}
							className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${category.color}`}
						>
							<Icon className="h-4 w-4" />
							{t(`categories.${category.id}`)}
						</Link>
					);
				})}
			</div>

			<Button
				variant="ghost"
				size="icon"
				className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 bg-background/80 backdrop-blur-sm hidden md:flex"
				onClick={() => scroll("right")}
			>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
}
