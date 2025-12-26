"use client"

import { useState, useContext } from "react"
import { useRouter } from "next/navigation"
import { Eye, Edit, Trash2, Check } from "lucide-react"

import { Button } from "@/shadcn/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shadcn/ui/table"
import { Badge } from "@/shadcn/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shadcn/ui/alert-dialog"
import { useToast } from "@/shadcn/hooks/use-toast"
import { AssignementData } from "@/types/assignements"
import { paths } from "@/routes/paths"
import { useDeleteAssignement } from "@/actions/assignements"
import { AuthContext } from "../auth/context/AuthContext"

interface AssignementsTableProps {
  assignements: AssignementData[] | null
}

export function ProcessingTable({ assignements }: AssignementsTableProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  console.log("assignements", assignements)

  const handleView = (id: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push(paths.dashboard.assignements.details(id.toString()))
    }, 300)
  }

  const handleAnswer = (id: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push(paths.dashboard.processing.edit(id.toString()))
    }, 300)
  }

  return (
    <>
      <Card className="bg-[#1A1525] border-purple-primary/20 shadow-lg">
        <CardHeader className="border-b border-purple-primary/20 bg-[#0F0A19] px-6">
          <CardTitle className="text-lg font-medium text-white">Assignments</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="rounded-md border border-purple-primary/20 overflow-hidden">
            <Table>
              <TableHeader className="bg-[#0F0A19]">
                <TableRow className="hover:bg-transparent border-purple-primary/20">
                  <TableHead className="text-white/70 font-medium">Title</TableHead>
                  <TableHead className="text-white/70 font-medium">Deadline</TableHead>
                  <TableHead className="text-white/70 font-medium">Created At</TableHead>
                  <TableHead className="text-white/70 font-medium">Status</TableHead>
                  <TableHead className="text-white/70 font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignements?.map((assignment, idx) => (
                  <TableRow key={idx} className="hover:bg-[#2A2035] border-purple-primary/20">
                    <TableCell className="text-white font-medium">{assignment.title}</TableCell>
                    <TableCell className="text-white">
                      {new Date(assignment.deadline).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-white">
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`
                          ${assignment.status.toLowerCase() === "finished" ? "border-green-500 text-green-500" : ""}
                          ${assignment.status.toLowerCase() === "in progress" ? "border-yellow-500 text-yellow-500" : ""}
                          ${assignment.status.toLowerCase() === "pending" ? "border-purple-light text-purple-light" : ""}
                        `}
                      >
                        {assignment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(assignment._id)}
                        className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-purple-light/10"
                        disabled={isLoading}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAnswer(assignment._id)}
                        className="h-8 px-3 text-white/70 hover:text-white hover:bg-purple-light/10"
                        disabled={isLoading || assignment.status.toLowerCase() === "finished"}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Answer Assignment
                      </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
