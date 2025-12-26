"use client"

import { useState, useContext, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shadcn/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs"
import { Button } from "@/shadcn/ui/button"
import { Input } from "@/shadcn/ui/input"
import { Label } from "@/shadcn/ui/label"
import { Separator } from "@/shadcn/ui/separator"
import { Lock, User } from "lucide-react"
import { AuthContext } from "@/sections/auth/context/AuthContext"
import { useUpdateUser } from "@/actions/user"
import { useGetcompany, useCreateCompany, useUpdateCompany } from "@/actions/user"

export function SettingsView() {
  const { user } = useContext(AuthContext) || {}
  const [firstName, setFirstName] = useState(user?.firstName || "")
  const [lastName, setLastName] = useState(user?.lastName || "")
  const [username, setUsername] = useState(user?.username || "")
  const [email, setEmail] = useState(user?.email || "")

  const [password, setPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const { updateUsers, updateUserPassword } = useUpdateUser()
  const { company } = useGetcompany() || {}

  const { createCompany } = useCreateCompany()
  const { updateCompany } = useUpdateCompany()

  // Company information state
  const [companyName, setCompanyName] = useState(company?.companyName || "")
  const [sector, setSector] = useState(company?.sectorOfActivity || "")
  const [companySize, setCompanySize] = useState(company?.size || "")
  const [yearsOfActivity, setYearsOfActivity] = useState(company?.yearsOfActivity || "")
  const [companyDescription, setCompanyDescription] = useState(company?.description || "")
  
  const hundleUpdateProfile = async () => {
    const updatedUser = {
      firstName,
      lastName,
      username,
      email,
    }
    try {
      await updateUsers(updatedUser)
      alert("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile")
    }
  }

  const hundleUpdateCompany = async () => {
    const companyData = {
      companyName,
      sectorOfActivity: sector,
      size: Number(companySize),
      yearsOfActivity: Number(yearsOfActivity),
      description: companyDescription,
    }
    try {
      if (company) {
        await updateCompany(companyData)
        alert("Company updated successfully")
      } else {
        await createCompany(companyData)
        alert("Company created successfully")
      }
    } catch (error) {
      console.log("Error managing company information:", error)
      alert("Failed to manage company information")
    }
  }

  const hundleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("New password and confirmation do not match")
      return
    }

    const updatedPassword = {
      password,
      newPassword,
    }
    try {
      await updateUserPassword(updatedPassword)
      alert("Password updated successfully")
    } catch (error) {
      console.error("Error updating password:", error)
      alert("Failed to update password")
    }
  }

  useEffect(() => {
    if (company) {
      setCompanyName(company.companyName)
      setSector(company.sectorOfActivity)
      setCompanySize(company.size)
      setYearsOfActivity(company.yearsOfActivity)
      setCompanyDescription(company.description)
    }
  }
, [company])

  return (
    <div className="space-y-6 animate-fadeIn w-[80%] mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-2 md:w-[400px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card className="border-purple-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <User className="h-5 w-5 text-purple-light" />
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={hundleUpdateProfile}
                className="bg-purple-primary hover:bg-purple-light"
              >
                Save Changes
              </Button>
            </CardFooter>
          </Card>

          {/* Conditionally render Company Information Section if user is not admin */}
          {user?.role !== "admin" && (
            <Card className="border-purple-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <CardTitle>Company Description</CardTitle>
                  <CardDescription>Update your company details</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector of Activity</Label>
                    <Input id="sector" value={sector} onChange={(e) => setSector(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-size">Company Size</Label>
                    <Input id="company-size" value={companySize} onChange={(e) => setCompanySize(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="years-of-activity">Years of Activity</Label>
                    <Input id="years-of-activity" value={yearsOfActivity} onChange={(e) => setYearsOfActivity(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="company-description">Description</Label>
                  <textarea
                    id="company-description"
                    className="border rounded-md p-2 w-full"
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={hundleUpdateCompany}
                  className="bg-purple-primary hover:bg-purple-light"
                >
                  Save Company Details
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="account" className="mt-6 space-y-6">
          <Card className="border-purple-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Lock className="h-5 w-5 text-purple-light" />
                <div>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <Separator className="my-4" />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                className="bg-purple-primary hover:bg-purple-light"
                onClick={hundleUpdatePassword}
              >
                Update Password
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
