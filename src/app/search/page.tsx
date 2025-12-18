"use client"

import { useMemo, useState } from "react"
import { Calendar, ChevronRight, Grid3X3, List, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { EventFilters, type FilterState } from "@/components/event-filters"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useLocale } from "@/hooks/use-locale"
import { useThemeEffect } from "@/hooks/use-theme"
import type { Event } from "@/lib/types"

// TODO: Replace with actual API call
const events: Event[] = []

const ITEMS_PER_PAGE = 24

export default function SearchPage() {
  useThemeEffect()
  const { t, locale } = useLocale()
  const searchParams = useSearchParams()

  const searchQuery = searchParams.get("search") || ""
  const categoryParam = searchParams.get("category") || ""
  const regionParam = searchParams.get("region") || ""

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<FilterState>({
    categories: categoryParam ? [categoryParam] : [],
    locations: [],
    venues: [],
    artists: [],
    dateRange: { from: undefined, to: undefined },
  })

  const filteredEvents = useMemo(() => {
    let filtered = events

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.artist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.venue.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Region filter from URL
    if (regionParam) {
      filtered = filtered.filter((event) => event.region === regionParam)
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter((event) => filters.categories.includes(event.category))
    }

    // Location filter
    if (filters.locations.length > 0) {
      filtered = filtered.filter((event) => filters.locations.includes(event.location))
    }

    // Venue filter
    if (filters.venues.length > 0) {
      filtered = filtered.filter((event) => filters.venues.includes(event.venue))
    }

    // Artist filter
    if (filters.artists.length > 0) {
      filtered = filtered.filter((event) => event.artist && filters.artists.includes(event.artist))
    }

    // Date range filter
    if (filters.dateRange.from) {
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.dates[0].date)
        const fromDate = filters.dateRange.from!
        const toDate = filters.dateRange.to || fromDate
        return eventDate >= fromDate && eventDate <= toDate
      })
    }

    return filtered
  }, [searchQuery, regionParam, filters])

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE)
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return locale === "es"
      ? date.toLocaleDateString("es-MX", { month: "long", day: "numeric", year: "numeric" })
      : date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  const formatPrice = (price: number) => {
    return locale === "es" ? `$${price.toLocaleString("es-MX")} MXN` : `$${price.toLocaleString("en-US")}`
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      concert: "bg-purple-500/90 text-white border-none",
      sports: "bg-blue-500/90 text-white border-none",
      theater: "bg-rose-500/90 text-white border-none",
      festival: "bg-amber-500/90 text-white border-none",
      comedy: "bg-green-500/90 text-white border-none",
      conference: "bg-cyan-500/90 text-white border-none",
      exhibition: "bg-pink-500/90 text-white border-none",
    }
    return colors[category] || "bg-secondary text-secondary-foreground"
  }

  const getDateDisplay = (event: Event) => {
    if (event.dates.length === 1 && event.dates[0].times.length === 1) {
      return `${formatDate(event.dates[0].date)} • ${event.dates[0].times[0]}`
    } else if (event.dates.length === 1 && event.dates[0].times.length > 1) {
      return `${formatDate(event.dates[0].date)} • ${event.dates[0].times.join(", ")}`
    } else if (event.dates.length > 1) {
      const firstDate = formatDate(event.dates[0].date)
      const lastDate = formatDate(event.dates[event.dates.length - 1].date)
      return `${firstDate} - ${lastDate}`
    }
    return ""
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-6">
        {/* Header with results count and view toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              {searchQuery ? `${t("search.resultsFor")} "${searchQuery}"` : t("search.allEvents")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {filteredEvents.length} {filteredEvents.length === 1 ? t("search.event") : t("search.events")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <EventFilters filters={filters} onFiltersChange={setFilters} events={events} />
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-r-none"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-l-none"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active filters display */}
        {(filters.categories.length > 0 ||
          filters.locations.length > 0 ||
          filters.venues.length > 0 ||
          filters.artists.length > 0 ||
          filters.dateRange.from) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filters.categories.map((cat) => (
              <Badge key={cat} variant="secondary" className="gap-1 capitalize">
                {cat}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters({ ...filters, categories: filters.categories.filter((c) => c !== cat) })}
                />
              </Badge>
            ))}
            {filters.locations.map((loc) => (
              <Badge key={loc} variant="secondary" className="gap-1">
                {loc}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters({ ...filters, locations: filters.locations.filter((l) => l !== loc) })}
                />
              </Badge>
            ))}
            {filters.venues.map((v) => (
              <Badge key={v} variant="secondary" className="gap-1">
                {v}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters({ ...filters, venues: filters.venues.filter((x) => x !== v) })}
                />
              </Badge>
            ))}
            {filters.artists.map((a) => (
              <Badge key={a} variant="secondary" className="gap-1">
                {a}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters({ ...filters, artists: filters.artists.filter((x) => x !== a) })}
                />
              </Badge>
            ))}
            {filters.dateRange.from && (
              <Badge variant="secondary" className="gap-1">
                {filters.dateRange.from.toLocaleDateString()} - {filters.dateRange.to?.toLocaleDateString() || "..."}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => setFilters({ ...filters, dateRange: { from: undefined, to: undefined } })}
                />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() =>
                setFilters({
                  categories: [],
                  locations: [],
                  venues: [],
                  artists: [],
                  dateRange: { from: undefined, to: undefined },
                })
              }
            >
              {t("filters.clearAll")}
            </Button>
          </div>
        )}

        {/* Results */}
        {paginatedEvents.length > 0 ? (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {paginatedEvents.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <Card className="h-full p-0 overflow-hidden hover:shadow-lg transition-shadow group">
                      <div className="relative aspect-[16/9] bg-muted">
                        <Image
                          src={event.image || "/placeholder.svg"}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className={`absolute top-2 right-2 text-xs ${getCategoryColor(event.category)}`}>
                          {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                        </Badge>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-1.5 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span className="truncate">{getDateDisplay(event)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-bold text-primary">{formatPrice(event.ticketTypes[0].price)}</p>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedEvents.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <Card className="p-0 overflow-hidden hover:shadow-lg transition-shadow group">
                      <div className="flex">
                        <div className="relative w-32 md:w-48 aspect-[4/3] bg-muted shrink-0">
                          <Image
                            src={event.image || "/placeholder.svg"}
                            alt={event.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <CardContent className="flex-1 p-3 md:p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="font-semibold text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
                                {event.title}
                              </h3>
                              <Badge className={`shrink-0 text-xs ${getCategoryColor(event.category)}`}>
                                {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                              </Badge>
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground mb-1 line-clamp-1">
                              {event.venue} • {event.location}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{getDateDisplay(event)}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-sm md:text-base font-bold text-primary">
                              {t("events.from")} {formatPrice(event.ticketTypes[0].price)}
                            </p>
                            <Button variant="ghost" size="sm" className="gap-1 -mr-2 hidden md:flex">
                              {t("events.viewDetails")}
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  {t("pagination.previous")}
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "ghost"}
                        size="sm"
                        className="w-9"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  {t("pagination.next")}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">{t("events.noEvents")}</p>
            <Link href="/">
              <Button variant="link" className="mt-2">
                {t("common.backToHome")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
