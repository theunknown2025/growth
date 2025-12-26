"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, CheckCircle, Calendar, Clock, Info, Link2, FileText } from "lucide-react"

import { Button } from "@/shadcn/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card"
import { Badge } from "@/shadcn/ui/badge"
import { useToast } from "@/shadcn/hooks/use-toast"
import { useGetAssignementById } from "@/actions/assignements"
import { useUpdateAssignement } from "@/actions/assignements"
import { Assignement } from "@/types/assignements"
import { paths } from "@/routes/paths"
import { AuthContext } from "@/sections/auth/context/AuthContext"
import { useContext } from "react"

export function AssignmentView({ id }: { id: string }) {
  const { toast } = useToast()
  const { user } = useContext(AuthContext) || {};

  const { assignement } = useGetAssignementById(id)
  const { updateAssignement } = useUpdateAssignement()

  const router = useRouter()
  const [isFinishing, setIsFinishing] = useState(false)

  const handleFinishAssignment = async (id : string) => {
    if (!assignement) {
      toast({
        title: "Error",
        description: "Assignment data not loaded.",
        variant: "destructive"
      })
      return
    }
    setIsFinishing(true)
    await updateAssignement(
      { ...assignement, status: "finished" } as unknown as Assignement,
      id
    )

    setIsFinishing(false)
    toast({
      title: "Assignment finished",
      description: "You have successfully finished the assignment.",
      variant: "default"
    })
    router.push(paths.dashboard.assignements.root)
  }

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "finished":
        return "bg-green-500/10 text-green-500 border-green-500/30"
      case "in progress":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/30"
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/30"
    }
  }

  console.log("Assignment data:", assignement)

  return (
    <div className="space-y-6">
      {/* Header with back button and actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(assignement?.status !== "finished" && user?.role === "admin" && assignement?.type !== "template") && (
            <Button
              onClick={() => handleFinishAssignment(id)}
              disabled={isFinishing}
              className="bg-gradient-to-r from-purple-light to-purple-primary hover:from-purple-light/90 hover:to-purple-primary/90 text-white"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {isFinishing ? "Finishing..." : "Finish Assignment"}
            </Button>
          )}
        </div>
      </div>

      {/* Assignment details card */}
      <Card className="bg-[#1A1525] border-purple-primary/20 shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-white">{assignement?.title}</CardTitle>
              <p className="text-white/70 mt-2">{assignement?.description}</p>
            </div>
            <Badge variant="outline" className={`${getStatusColor(assignement?.status)} whitespace-nowrap px-3 py-1`}>
              {assignement?.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-purple-light" />
              <span className="text-white/70">ID:</span>
              <span className="text-white">{assignement?.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-light" />
              <span className="text-white/70">Created:</span>
                <span className="text-white">
                {new Date(assignement?.createdAt || "").toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-light" />
                <span className="text-white/70">Deadline:</span>
                <span className="text-white">
                {new Date(assignement?.deadline || "").toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "long",
                  year: "numeric"
                })}
                </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions section */}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-white">Questions</h2>
        <p className="text-white/70">View details and resources for each question.</p>
      </div>

      {/* Questions list with resources */}
      <div className="space-y-4">
        {assignement?.questions.map((question, index) => (
          <Card key={index} className="bg-[#1A1525] border-purple-primary/20 shadow-lg overflow-hidden">
            <CardHeader className="pb-3">
              <h3 className="text-lg font-medium text-white flex items-center">
                <span className="flex items-center justify-center bg-purple-primary/20 text-purple-light rounded-full w-6 h-6 text-sm mr-3">
                  {index + 1}
                </span>
                {question.question}
              </h3>
              {question.description && (
                <p className="mt-2 text-sm text-white/70">{question.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Resources for this question */}
              <div className="space-y-3">
                {((question.urlresources && question.urlresources.length > 0) || 
                  (question.fileresources && question.fileresources.length > 0)) && (
                  <div>
                    <h4 className="text-sm font-medium text-white/70 mb-2">Resources</h4>
                    <div className="flex flex-wrap gap-2">
                      {/* URL Resources */}
                      {question.urlresources?.filter(url => url.trim() !== '').map((url, urlIndex) => (
                        <a
                          key={`url-${urlIndex}`}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#0F0A19] hover:bg-[#2A2035] text-purple-light px-3 py-1.5 rounded-md text-sm transition-colors"
                        >
                          <Link2 className="h-4 w-4" />
                          URL Resource {urlIndex + 1}
                        </a>
                      ))}
                      
                      {/* File Resources */}
                      {question.fileresources?.map((file, fileIndex) => (
                        <a
                          key={`file-${fileIndex}`}
                          href={`${process.env.NEXT_PUBLIC_BASE_URL}/documents/${file}`}
                          download
                          rel="noopener noreferrer"
                          title="Download file resource"
                          className="inline-flex items-center gap-1.5 bg-[#0F0A19] hover:bg-[#2A2035] text-purple-light px-3 py-1.5 rounded-md text-sm transition-colors"
                        >
                          <Download className="h-4 w-4" />
                          File Resource {fileIndex + 1}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Answer */}
              {(assignement.type !== "template") && (
              <div>
                <h4 className="text-sm font-medium text-white/70 mb-2">Answer</h4>
                <div className="bg-[#0F0A19] rounded-lg p-4">
                  <p className="text-white">{question.answer || "No answer provided"}</p>
                </div>
              </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
