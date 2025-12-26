"use client"

import type React from "react"
import { useState, useContext } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shadcn/ui/button"
import { Input } from "@/shadcn/ui/input"
import { Label } from "@/shadcn/ui/label"
import { Checkbox } from "@/shadcn/ui/checkbox"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { signInWithPassword } from "@/actions/auth"
import { AuthContext } from "@/sections/auth/context/AuthContext"

export default function SignInForm() {
  const router = useRouter()
  const { checkUserSession } = useContext(AuthContext) || {}
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      await signInWithPassword({ email: formData.email, password: formData.password })
      await checkUserSession?.()
      router.push("/dashboard/chat")
    } catch (error: any) {
      console.log("Error signing in:", error)
      setErrorMessage(error.message || "An unexpected error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={handleChange}
          required
          className="bg-[#1A1625] border-purple-primary/20 text-white focus-visible:ring-purple-light"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-white">
            Password
          </Label>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            className="bg-[#1A1625] border-purple-primary/20 text-white focus-visible:ring-purple-light pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="remember"
          checked={formData.rememberMe}
          onCheckedChange={handleCheckboxChange}
          className="border-purple-primary/30 data-[state=checked]:bg-purple-light data-[state=checked]:border-purple-light"
        />
        <Label htmlFor="remember" className="text-sm text-white/60">
          Remember me for 30 days
        </Label>
      </div>

      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-purple-light to-purple-primary hover:opacity-90 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  )
}
