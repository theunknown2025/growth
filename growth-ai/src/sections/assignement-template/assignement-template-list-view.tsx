"use client"

import { useState, useContext } from "react"
import { useRouter } from "next/navigation"
import { Eye, Edit, Trash2, Check, Plus } from "lucide-react"

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
import { paths } from "@/routes/paths"
import { AuthContext } from "../auth/context/AuthContext"
import { useGetAllAssignementTemplates , useDeleteAssignementTemplate} from "@/actions/assignements"

export function AssignementsTemplateListView() {
  const { assignementTemplates } = useGetAllAssignementTemplates()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<number | null>(null)
  const { deleteAssignementTemplate } = useDeleteAssignementTemplate()
  const { user } = useContext(AuthContext) || {}

  console.log("assignementTemplates", assignementTemplates)

  const handleView = (id: number) => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push(paths.dashboard.assignements.details(id.toString()))
    }, 300)
  }

  const handleEdit = (id: string) => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push(paths.dashboard.assignmentTemplates.edit(id))
    }, 300)
  }

  const handleDeleteClick = async (id: string) => {
    await deleteAssignementTemplate(id)
    toast({
      title: "Assignment deleted",
      description: "The assignment has been deleted successfully.",
    })
  }

  const confirmDelete = () => {
    if (selectedAssignment === null) return

    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setDeleteDialogOpen(false)
      toast({
        title: "Assignment deleted",
      })
    }, 500)
  }

  const handleAnswer = (id: number) => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      router.push(paths.dashboard.processing.edit(id.toString()))
    }, 300)
  }

  const handleCreateAssignment = () => {
    router.push(paths.dashboard.assignmentTemplates.create)
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Assignment Templates</h1>
        <Button
          onClick={handleCreateAssignment}
          className="bg-purple-primary text-white hover:bg-purple-light"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Assignment Template
        </Button>
      </div>

      <Card className="bg-[#1A1525] border-purple-primary/20 shadow-lg">
        <CardHeader className="border-b border-purple-primary/20 bg-[#0F0A19] px-6">
          <CardTitle className="text-lg font-medium text-white">Assignments</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {assignementTemplates?.length === 0 ? (
            <div className="text-center text-white/70">
              <p>You don't have any assignment templates yet.</p>
              <p className="mt-2">
                <Button
                  onClick={handleCreateAssignment}
                  className="bg-purple-primary text-white hover:bg-purple-light"
                >
                  Create Assignment
                </Button>
              </p>
            </div>
          ) : (
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
                    {assignementTemplates?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-white/70">
                      You don't have any assignment templates yet.{" "}
                      <Button
                        onClick={handleCreateAssignment}
                        className="ml-2 bg-purple-primary text-white hover:bg-purple-light"
                      >
                        Create Assignment
                      </Button>
                      </TableCell>
                    </TableRow>
                    ) : (
                    assignementTemplates?.map((assignment, idx) => (
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
                        className={`${
                          assignment.status.toLowerCase() === "finished"
                          ? "border-green-500 text-green-500"
                          : ""
                        } ${
                          assignment.status.toLowerCase() === "in progress"
                          ? "border-yellow-500 text-yellow-500"
                          : ""
                        } ${
                          assignment.status.toLowerCase() === "pending"
                          ? "border-purple-light text-purple-light"
                          : ""
                        }`}
                        >
                        {assignment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleView(assignment.id)}
                          className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-purple-light/10"
                          disabled={isLoading}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Button>
                        {user?.role === "admin" ? (
                          <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(assignment.id.toString())}
                            className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-purple-light/10"
                            disabled={isLoading || assignment.status.toLowerCase() === "finished"}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(assignment.id.toString())}
                            className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-purple-light/10"
                            disabled={isLoading || assignment.status.toLowerCase() === "finished"}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                          </>
                        ) : (
                          <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAnswer(assignment.id)}
                          className="h-8 px-3 text-white/70 hover:text-white hover:bg-purple-light/10"
                          disabled={isLoading}
                          >
                          <Check className="h-4 w-4 mr-1" />
                          Answer Assignment
                          </Button>
                        )}
                        </div>
                      </TableCell>
                      </TableRow>
                    ))
                    )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1A1525] border-purple-primary/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete assignment?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              This will permanently delete this assignment and all its data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#0F0A19] text-white hover:bg-[#2A2035] border-purple-primary/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
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
