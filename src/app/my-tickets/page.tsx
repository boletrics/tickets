"use client"

import { useState } from "react"
import { Calendar, MapPin, TicketIcon, Download, Mail } from "lucide-react"
import Image from "next/image"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocale } from "@/hooks/use-locale"
import { useThemeEffect } from "@/hooks/use-theme"
import { useAuthStore } from "@/lib/auth-store"
import type { Order, Event } from "@/lib/types"

// TODO: Replace with actual API calls
const orders: Order[] = []
const events: Event[] = []
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function MyTicketsPage() {
  useThemeEffect()
  const router = useRouter()
  const { t, locale } = useLocale()
  const { user, guestEmail } = useAuthStore()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("upcoming")

  // Redirect if not authenticated
  if (!user && !guestEmail) {
    router.push("/auth")
    return null
  }

  const userEmail = user?.email || guestEmail

  const userOrders = orders.filter((order) => order.email === userEmail)

  const ordersWithEvents = userOrders.map((order) => {
    const event = events.find((e) => e.id === order.eventId)
    return { ...order, event }
  })

  const now = new Date()

  const upcomingOrders = ordersWithEvents.filter((order) => {
    if (!order.event || !order.event.dates || order.event.dates.length === 0) return false
    const eventDate = new Date(order.event.dates[0].date)
    return eventDate >= now
  })

  const pastOrders = ordersWithEvents.filter((order) => {
    if (!order.event || !order.event.dates || order.event.dates.length === 0) return false
    const eventDate = new Date(order.event.dates[0].date)
    return eventDate < now
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return locale === "es"
      ? date.toLocaleDateString("es-MX", { month: "long", day: "numeric", year: "numeric" })
      : date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  const formatPrice = (price: number) => {
    return locale === "es" ? `$${price.toLocaleString("es-MX")} MXN` : `$${price.toLocaleString("en-US")}`
  }

  const handleDownloadTicket = (orderId: string) => {
    toast({
      title: t("tickets.downloadStarted") || "Download started",
      description: t("tickets.downloadMessage") || "Your ticket is being downloaded",
    })
  }

  const handleEmailTicket = (orderId: string, email: string) => {
    toast({
      title: t("tickets.emailSent") || "Email sent",
      description: `${t("tickets.emailMessage") || "Ticket sent to"} ${email}`,
    })
  }

  const OrderCard = ({ order }: { order: (typeof ordersWithEvents)[0] }) => {
    if (!order.event) return null

    const firstDate = order.event.dates?.[0]
    const dateDisplay = firstDate ? formatDate(firstDate.date) : ""
    const timeDisplay = firstDate?.times?.[0] || ""

    return (
      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="relative w-full md:w-48 h-48 md:h-auto">
            <Image
              src={order.event.image || "/placeholder.svg"}
              alt={order.event.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2 text-balance">{order.event.title}</CardTitle>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {dateDisplay} {timeDisplay && `• ${timeDisplay}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{order.event.location}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {t("success.orderNumber")}: {order.id}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                {order.tickets.map((ticket, index) => {
                  const ticketType = order.event?.ticketTypes.find((t) => t.id === ticket.ticketTypeId)
                  return (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <TicketIcon className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {ticket.quantity}x {ticketType?.name}
                        </span>
                      </div>
                      <span className="font-medium">{formatPrice(ticket.price * ticket.quantity)}</span>
                    </div>
                  )
                })}

                <div className="flex items-center justify-between text-sm font-bold pt-2 border-t">
                  <span>{t("tickets.total")}</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => handleDownloadTicket(order.id)}>
                  <Download className="h-4 w-4 mr-2" />
                  {t("tickets.download") || "Download"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEmailTicket(order.id, order.email)}>
                  <Mail className="h-4 w-4 mr-2" />
                  {t("tickets.email") || "Email"}
                </Button>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    )
  }

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
                  <h3 className="text-lg font-semibold mb-2">{t("tickets.noUpcoming") || "No upcoming tickets"}</h3>
                  <p className="text-muted-foreground mb-6">
                    {t("tickets.noUpcomingMessage") || "You don't have any upcoming events"}
                  </p>
                  <Button onClick={() => router.push("/")}>{t("tickets.browseEvents") || "Browse Events"}</Button>
                </CardContent>
              </Card>
            ) : (
              upcomingOrders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastOrders.length === 0 ? (
              <Card>
                <CardContent className="py-20 text-center">
                  <TicketIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">{t("tickets.noPast") || "No past tickets"}</h3>
                  <p className="text-muted-foreground">
                    {t("tickets.noPastMessage") || "You don't have any past events"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              pastOrders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
