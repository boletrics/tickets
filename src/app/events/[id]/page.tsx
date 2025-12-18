"use client"
import { notFound } from "next/navigation"
import { EventDetailClient } from "@/components/event-detail-client"
import type { Event } from "@/lib/types"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: PageProps) {
  const { id } = await params

  // TODO: Replace with actual API call
  const events: Event[] = []
  const event = events.find((e) => e.id === id)

  if (!event) {
    notFound()
  }

  return <EventDetailClient event={event} />
}
