"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useLocale } from "@/hooks/use-locale"
import { useThemeEffect } from "@/hooks/use-theme"
import { useAuthStore } from "@/lib/auth-store"
import type { User } from "@/lib/types"

// TODO: Replace with actual API call
const users: User[] = []
import { useToast } from "@/hooks/use-toast"

function AuthContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLocale()
  const { setUser } = useAuthStore()
  const { toast } = useToast()

  const mode = searchParams.get("mode") || "signin"
  const [activeTab, setActiveTab] = useState(mode === "signup" ? "signup" : "signin")

  // Sign In State
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [signInLoading, setSignInLoading] = useState(false)

  // Sign Up State
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [signUpLoading, setSignUpLoading] = useState(false)

  // OTP State
  const [showOTP, setShowOTP] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpEmail, setOtpEmail] = useState("")
  const [otpMode, setOtpMode] = useState<"signin" | "signup">("signin")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignInLoading(true)

    // Simulate API call
    setTimeout(() => {
      const user = users.find((u) => u.email === signInEmail)

      if (user) {
        setUser(user)
        toast({
          title: t("common.success") || "Success",
          description: t("auth.signInSuccess") || "Signed in successfully",
        })
        router.push("/")
      } else {
        toast({
          variant: "destructive",
          title: t("common.error"),
          description: t("auth.invalidCredentials") || "Invalid email or password",
        })
      }
      setSignInLoading(false)
    }, 1000)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignUpLoading(true)

    // Simulate API call
    setTimeout(() => {
      const newUser = {
        id: Date.now().toString(),
        email: signUpEmail,
        firstName,
        lastName,
      }

      // TODO: Replace with actual API call
      users.push(newUser)
      setUser(newUser)

      toast({
        title: t("common.success") || "Success",
        description: t("auth.accountCreated") || "Account created successfully",
      })
      router.push("/")
      setSignUpLoading(false)
    }, 1000)
  }

  const handleEmailOTP = async (email: string, mode: "signin" | "signup") => {
    setOtpEmail(email)
    setOtpMode(mode)
    setShowOTP(true)

    // Simulate sending OTP
    toast({
      title: t("auth.otpSent") || "Code sent",
      description: t("auth.otpSentMessage") || `Verification code sent to ${email}`,
    })

    // In demo, the OTP is always "123456"
    console.log("[v0] Demo OTP code: 123456")
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpLoading(true)

    // Simulate API call
    setTimeout(() => {
      if (otpCode === "123456") {
        if (otpMode === "signup") {
          const newUser = {
            id: Date.now().toString(),
            email: otpEmail,
            firstName: firstName || "User",
            lastName: lastName || "",
          }
          // TODO: Replace with actual API call
      users.push(newUser)
          setUser(newUser)
        } else {
          const user = users.find((u) => u.email === otpEmail) || {
            id: Date.now().toString(),
            email: otpEmail,
            firstName: "User",
            lastName: "",
          }
          setUser(user)
        }

        toast({
          title: t("common.success") || "Success",
          description: t("auth.verificationSuccess") || "Verification successful",
        })
        router.push("/")
      } else {
        toast({
          variant: "destructive",
          title: t("common.error"),
          description: t("auth.invalidOTP") || "Invalid verification code",
        })
      }
      setOtpLoading(false)
    }, 1000)
  }

  const handleSocialSignIn = (provider: "google" | "apple") => {
    toast({
      title: t("common.comingSoon") || "Coming Soon",
      description: `${provider === "google" ? "Google" : "Apple"} sign-in will be available soon`,
    })
  }

  if (showOTP) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.verifyOTP")}</CardTitle>
          <CardDescription>
            {t("auth.otpSentTo") || "Enter the 6-digit code sent to"} {otpEmail}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">{t("auth.enterOTP")}</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                required
                className="text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-muted-foreground text-center">Demo code: 123456</p>
            </div>

            <Button type="submit" className="w-full" disabled={otpLoading}>
              {otpLoading ? t("common.loading") : t("auth.verifyOTP")}
            </Button>

            <Button type="button" variant="ghost" className="w-full" onClick={() => handleEmailOTP(otpEmail, otpMode)}>
              {t("auth.resendCode")}
            </Button>

            <Button type="button" variant="ghost" className="w-full" onClick={() => setShowOTP(false)}>
              {t("common.back") || "Back"}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">{t("auth.welcome") || "Welcome"}</CardTitle>
        <CardDescription>{t("auth.welcomeMessage") || "Sign in or create an account to continue"}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{t("auth.signIn")}</TabsTrigger>
            <TabsTrigger value="signup">{t("auth.signUp")}</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">{t("auth.email")}</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">{t("auth.password")}</Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={signInLoading}>
                {signInLoading ? t("common.loading") : t("auth.signIn")}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm"
                  onClick={() => handleEmailOTP(signInEmail, "signin")}
                >
                  {t("auth.useOTP") || "Sign in with verification code"}
                </Button>
              </div>
            </form>

            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                {t("auth.orContinueWith")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => handleSocialSignIn("google")}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" onClick={() => handleSocialSignIn("apple")}>
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Apple
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{t("checkout.firstName")}</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{t("checkout.lastName")}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">{t("auth.email")}</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password">{t("auth.password")}</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={signUpLoading}>
                {signUpLoading ? t("common.loading") : t("auth.createAccount")}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm"
                  onClick={() => handleEmailOTP(signUpEmail, "signup")}
                >
                  {t("auth.useOTP") || "Sign up with verification code"}
                </Button>
              </div>
            </form>

            <div className="relative my-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                {t("auth.orContinueWith")}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => handleSocialSignIn("google")}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" onClick={() => handleSocialSignIn("apple")}>
                <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Apple
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default function AuthPage() {
  useThemeEffect()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-center">
          <Suspense fallback={<div>Loading...</div>}>
            <AuthContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
