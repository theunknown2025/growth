"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Edit, Trash2, MoreHorizontal, FileText } from "lucide-react"

import { Button } from "@/shadcn/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu"
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
import { Toast } from "@/shadcn/ui/toast"

// Mock data for assignments
const assignments = [
  {
    id: "ASG-1001",
    title: "Network Security Evaluation",
    testId: "TEST-1234",
    client: "Acme Corp",
    questions: 3,
    deadline: "2023-05-15",
    status: "Pending",
  },
  {
    id: "ASG-1002",
    title: "Data Protection Assessment",
    testId: "TEST-1235",
    client: "Globex Inc",
    questions: 5,
    deadline: "2023-05-20",
    status: "In Progress",
  },
  {
    id: "ASG-1003",
    title: "Incident Response Readiness",
    testId: "TEST-1236",
    client: "Initech",
    questions: 4,
    deadline: "2023-05-25",
    status: "Completed",
  },
  {
    id: "ASG-1004",
    title: "Cloud Security Assessment",
    testId: "TEST-1237",
    client: "Umbrella Corp",
    questions: 6,
    deadline: "2023-05-18",
    status: "Pending",
  },
  {
    id: "ASG-1005",
    title: "Application Security Review",
    testId: "TEST-1238",
    client: "Stark Industries",
    questions: 3,
    deadline: "2023-05-22",
    status: "In Progress",
  },
]

export function SimpleTestEvaluationTable() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)

  const handleDelete = (assignmentId: string) => {
    setSelectedAssignment(assignmentId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (!selectedAssignment) return

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setDeleteDialogOpen(false)

      Toast({
        title: "Assignment Deleted",
      })

    }, 500)
  }

  return (
    <>
      <Card className="bg-[#1A1525] border-purple-primary/20 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-medium text-white">Evaluation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-purple-primary/20">
            <Table>
              <TableHeader className="bg-[#0F0A19]">
                <TableRow className="hover:bg-transparent border-purple-primary/20">
                  <TableHead className="text-white/70">ID</TableHead>
                  <TableHead className="text-white/70">Title</TableHead>
                  <TableHead className="text-white/70">Test ID</TableHead>
                  <TableHead className="text-white/70">Client</TableHead>
                  <TableHead className="text-white/70">Questions</TableHead>
                  <TableHead className="text-white/70">Deadline</TableHead>
                  <TableHead className="text-white/70">Status</TableHead>
                  <TableHead className="text-white/70 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id} className="hover:bg-[#2A2035] border-purple-primary/20">
                    <TableCell className="font-medium text-white">{assignment.id}</TableCell>
                    <TableCell className="text-white">{assignment.title}</TableCell>
                    <TableCell className="text-white">{assignment.testId}</TableCell>
                    <TableCell className="text-white">{assignment.client}</TableCell>
                    <TableCell className="text-white">{assignment.questions}</TableCell>
                    <TableCell className="text-white">{assignment.deadline}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`
                          ${assignment.status === "Completed" ? "border-green-500 text-green-500" : ""}
                          ${assignment.status === "In Progress" ? "border-yellow-500 text-yellow-500" : ""}
                          ${assignment.status === "Pending" ? "border-purple-light text-purple-light" : ""}
                        `}
                      >
                        {assignment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/processing/assignments/${assignment.id}`)}
                          className="h-8 px-2 text-white/70 hover:text-white hover:bg-purple-light/10"
                        >
                          <Eye className="h-4 w-4 text-purple-light" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-purple-light/10"
                            >
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#1A1525] border-purple-primary/20 text-white">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-purple-primary/20" />
                            <DropdownMenuItem
                              className="flex items-center gap-2 cursor-pointer hover:bg-purple-light/10"
                              onClick={() => {
                                router.push(`/dashboard/tests/${assignment.id}`)
                              }}
                            >
                              <Eye className="h-4 w-4 text-purple-light" />
                              <span>View</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="flex items-center gap-2 cursor-pointer hover:bg-purple-light/10"
                              onClick={() => handleDelete(assignment.id)}
                            >
                              <Trash2 className="h-4 w-4 text-purple-light" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1A1525] border-purple-primary/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              This will permanently delete the assignment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#0F0A19] text-white hover:bg-[#2A2035] border-purple-primary/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}