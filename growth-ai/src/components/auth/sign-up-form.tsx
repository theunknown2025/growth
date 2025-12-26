"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shadcn/ui/button"
import { Input } from "@/shadcn/ui/input"
import { Label } from "@/shadcn/ui/label"
import { Checkbox } from "@/shadcn/ui/checkbox"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { signUp } from "@/actions/auth"

export default function SignUpForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        acceptTerms: false,
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => ({ ...prev, acceptTerms: checked }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match!")
            return
        } 

        try {
        setIsLoading(true)
        await signUp({
            firstName: formData.firstName,
            lastName: formData.lastName,
            username: formData.username,
            email: formData.email,
            password: formData.password,
            confirmpassword: formData.confirmPassword,
        })
        setIsLoading(false)
        alert("Account created successfully for " + formData.username)
        router.push("/auth/login")
        }catch (error: any) {
            console.log("Error signing up:", error)
            alert(error.message || "An unexpected error occurred.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name and Last Name in a row */}
            <div className="flex space-x-4">
                <div className="w-1/2 space-y-2">
                    <Label htmlFor="firstName" className="text-white">
                        First Name
                    </Label>
                    <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="bg-[#1A1625] border-purple-primary/20 text-white focus-visible:ring-purple-light"
                    />
                </div>
                <div className="w-1/2 space-y-2">
                    <Label htmlFor="lastName" className="text-white">
                        Last Name
                    </Label>
                    <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="bg-[#1A1625] border-purple-primary/20 text-white focus-visible:ring-purple-light"
                    />
                </div>
            </div>

            {/* Username Input */}
            <div className="space-y-2">
                <Label htmlFor="username" className="text-white">
                    Username
                </Label>
                <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="bg-[#1A1625] border-purple-primary/20 text-white focus-visible:ring-purple-light"
                />
            </div>

            {/* Email Input */}
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

            {/* Password Input */}
            <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                    Password
                </Label>
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
                        onClick={() => setShowPassword((prev) => !prev)}
                    >
                        {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                </div>
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                    Confirm Password
                </Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="bg-[#1A1625] border-purple-primary/20 text-white focus-visible:ring-purple-light pr-10"
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                        {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                </div>
            </div>

            {/* Accept Terms Checkbox */}
            <div className="flex items-center space-x-2">
                <Checkbox
                    id="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={handleCheckboxChange}
                    className="border-purple-primary/30 data-[state=checked]:bg-purple-light data-[state=checked]:border-purple-light"
                />
                <Label htmlFor="acceptTerms" className="text-sm text-white/60">
                    I accept the terms and conditions
                </Label>
            </div>

            <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-light to-purple-primary hover:opacity-90 text-white"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing up...
                    </>
                ) : (
                    "Sign Up"
                )}
            </Button>
        </form>
    )
}