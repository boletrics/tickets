"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLocale } from "@/hooks/use-locale"
import { useThemeEffect } from "@/hooks/use-theme"

function SuccessContent() {
  const searchParams = useSearchParams()
  const { t } = useLocale()
  const orderId = searchParams.get("orderId")

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-success/10 p-6">
            <CheckCircle2 className="h-16 w-16 text-success" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-balance">{t("success.title")}</h1>
        <p className="text-muted-foreground mb-8 text-pretty">{t("success.message")}</p>

        {orderId && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground mb-2">{t("success.orderNumber")}</p>
              <p className="font-mono font-bold text-lg">{orderId}</p>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link href="/my-tickets">{t("success.viewTickets")}</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">{t("success.backToEvents")}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  useThemeEffect()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
