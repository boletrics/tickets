"use client";

import { MapPin, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRegionStore, regionNames, type Region } from "@/lib/region-store";
import { useLocale } from "@/hooks/use-locale";

export function RegionSelector() {
	const { region, setRegion } = useRegionStore();
	const { locale } = useLocale();

	const regions: Region[] = [
		"mexico-city",
		"monterrey",
		"guadalajara",
		"cancun",
		"all",
	];

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline" size="sm" className="gap-2 bg-transparent">
					<MapPin className="h-4 w-4" />
					<span className="hidden sm:inline">
						{regionNames[region][locale]}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-48">
				{regions.map((r) => (
					<DropdownMenuItem
						key={r}
						onClick={() => setRegion(r)}
						className="cursor-pointer"
					>
						<div className="flex items-center justify-between w-full">
							<span>{regionNames[r][locale]}</span>
							{region === r && <Check className="h-4 w-4" />}
						</div>
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
