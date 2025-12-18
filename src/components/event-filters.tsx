"use client";

import { useState } from "react";
import {
	Calendar,
	Filter,
	MapPin,
	Music,
	User,
	Building2,
	X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocale } from "@/hooks/use-locale";
import type { Event } from "@/lib/types";

export interface FilterState {
	categories: string[];
	locations: string[];
	venues: string[];
	artists: string[];
	dateRange: { from: Date | undefined; to: Date | undefined };
}

interface EventFiltersProps {
	filters: FilterState;
	onFiltersChange: (filters: FilterState) => void;
	events?: Event[];
}

export function EventFilters({
	filters,
	onFiltersChange,
	events = [],
}: EventFiltersProps) {
	const { t } = useLocale();
	const [showFilters, setShowFilters] = useState(false);

	// Extract unique values from events
	const categories = Array.from(new Set(events.map((e) => e.category)));
	const locations = Array.from(new Set(events.map((e) => e.location)));
	const venues = Array.from(new Set(events.map((e) => e.venue)));
	const artists = Array.from(
		new Set(
			events.map((e) => e.artist).filter((a): a is string => a !== undefined),
		),
	);

	const activeFiltersCount =
		filters.categories.length +
		filters.locations.length +
		filters.venues.length +
		filters.artists.length +
		(filters.dateRange.from ? 1 : 0);

	const clearFilters = () => {
		onFiltersChange({
			categories: [],
			locations: [],
			venues: [],
			artists: [],
			dateRange: { from: undefined, to: undefined },
		});
	};

	const toggleCategory = (category: string) => {
		const newCategories = filters.categories.includes(category)
			? filters.categories.filter((c) => c !== category)
			: [...filters.categories, category];
		onFiltersChange({ ...filters, categories: newCategories });
	};

	const toggleLocation = (location: string) => {
		const newLocations = filters.locations.includes(location)
			? filters.locations.filter((l) => l !== location)
			: [...filters.locations, location];
		onFiltersChange({ ...filters, locations: newLocations });
	};

	const toggleVenue = (venue: string) => {
		const newVenues = filters.venues.includes(venue)
			? filters.venues.filter((v) => v !== venue)
			: [...filters.venues, venue];
		onFiltersChange({ ...filters, venues: newVenues });
	};

	const toggleArtist = (artist: string) => {
		const newArtists = filters.artists.includes(artist)
			? filters.artists.filter((a) => a !== artist)
			: [...filters.artists, artist];
		onFiltersChange({ ...filters, artists: newArtists });
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-2 flex-wrap">
				<Popover open={showFilters} onOpenChange={setShowFilters}>
					<PopoverTrigger asChild>
						<Button variant="outline" className="gap-2 bg-transparent">
							<Filter className="h-4 w-4" />
							{t("common.filter")}
							{activeFiltersCount > 0 && (
								<Badge variant="secondary" className="ml-1 h-5 px-1.5">
									{activeFiltersCount}
								</Badge>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="w-[600px] max-h-[600px] overflow-y-auto"
						align="start"
					>
						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-lg">{t("filters.title")}</h3>
								{activeFiltersCount > 0 && (
									<Button variant="ghost" size="sm" onClick={clearFilters}>
										{t("filters.clear")}
									</Button>
								)}
							</div>

							{/* Date Range */}
							<div className="space-y-3">
								<Label className="flex items-center gap-2">
									<Calendar className="h-4 w-4" />
									{t("filters.dateRange")}
								</Label>
								<CalendarComponent
									mode="range"
									selected={filters.dateRange}
									onSelect={(range) =>
										onFiltersChange({
											...filters,
											dateRange: { from: range?.from, to: range?.to },
										})
									}
									numberOfMonths={2}
									className="rounded-md border"
								/>
							</div>

							{/* Categories */}
							<div className="space-y-3">
								<Label className="flex items-center gap-2">
									<Music className="h-4 w-4" />
									{t("filters.categories")}
								</Label>
								<div className="grid grid-cols-2 gap-2">
									{categories.map((category) => (
										<label
											key={category}
											className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-md"
										>
											<Checkbox
												checked={filters.categories.includes(category)}
												onCheckedChange={() => toggleCategory(category)}
											/>
											<span className="text-sm capitalize">{category}</span>
										</label>
									))}
								</div>
							</div>

							{/* Locations */}
							<div className="space-y-3">
								<Label className="flex items-center gap-2">
									<MapPin className="h-4 w-4" />
									{t("filters.locations")}
								</Label>
								<div className="grid grid-cols-2 gap-2">
									{locations.slice(0, 8).map((location) => (
										<label
											key={location}
											className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-md"
										>
											<Checkbox
												checked={filters.locations.includes(location)}
												onCheckedChange={() => toggleLocation(location)}
											/>
											<span className="text-sm truncate">{location}</span>
										</label>
									))}
								</div>
							</div>

							{/* Venues */}
							<div className="space-y-3">
								<Label className="flex items-center gap-2">
									<Building2 className="h-4 w-4" />
									{t("filters.venues")}
								</Label>
								<div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
									{venues.map((venue) => (
										<label
											key={venue}
											className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-md"
										>
											<Checkbox
												checked={filters.venues.includes(venue)}
												onCheckedChange={() => toggleVenue(venue)}
											/>
											<span className="text-sm truncate">{venue}</span>
										</label>
									))}
								</div>
							</div>

							{/* Artists */}
							<div className="space-y-3">
								<Label className="flex items-center gap-2">
									<User className="h-4 w-4" />
									{t("filters.artists")}
								</Label>
								<div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
									{artists.map((artist) => (
										<label
											key={artist}
											className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-md"
										>
											<Checkbox
												checked={filters.artists.includes(artist)}
												onCheckedChange={() => toggleArtist(artist)}
											/>
											<span className="text-sm truncate">{artist}</span>
										</label>
									))}
								</div>
							</div>
						</div>
					</PopoverContent>
				</Popover>

				{/* Active Filters */}
				{filters.categories.map((category) => (
					<Badge key={category} variant="secondary" className="gap-1">
						{category}
						<X
							className="h-3 w-3 cursor-pointer"
							onClick={() => toggleCategory(category)}
						/>
					</Badge>
				))}
				{filters.locations.map((location) => (
					<Badge key={location} variant="secondary" className="gap-1">
						{location}
						<X
							className="h-3 w-3 cursor-pointer"
							onClick={() => toggleLocation(location)}
						/>
					</Badge>
				))}
				{filters.venues.map((venue) => (
					<Badge key={venue} variant="secondary" className="gap-1">
						{venue}
						<X
							className="h-3 w-3 cursor-pointer"
							onClick={() => toggleVenue(venue)}
						/>
					</Badge>
				))}
				{filters.artists.map((artist) => (
					<Badge key={artist} variant="secondary" className="gap-1">
						{artist}
						<X
							className="h-3 w-3 cursor-pointer"
							onClick={() => toggleArtist(artist)}
						/>
					</Badge>
				))}
				{filters.dateRange.from && (
					<Badge variant="secondary" className="gap-1">
						{filters.dateRange.from.toLocaleDateString()} -{" "}
						{filters.dateRange.to?.toLocaleDateString() || "..."}
						<X
							className="h-3 w-3 cursor-pointer"
							onClick={() =>
								onFiltersChange({
									...filters,
									dateRange: { from: undefined, to: undefined },
								})
							}
						/>
					</Badge>
				)}
			</div>
		</div>
	);
}
