"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shadcn/ui/table"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shadcn/ui/card"
import { Badge } from "@/shadcn/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shadcn/ui/tabs"
import { Input } from "@/shadcn/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/shadcn/ui/dropdown-menu"
import { FileText, Info, MoreHorizontal } from "lucide-react"
import type { AllTestResult } from "@/types/evaluation"
import { useRouter } from "next/navigation"
import { paths } from "@/routes/paths"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shadcn/ui/dialog"
import { Button } from "@/shadcn/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shadcn/ui/select"
import { useGetAllAssignementTemplates , useAssignTemplate } from "@/actions/assignements"
import { useToast } from "@/shadcn/hooks/use-toast"

type Props = {
  evaluations: AllTestResult
}

export function SimpleTestEvaluationTable({ evaluations }: Props) {
  const simpleEvaluation = evaluations.simpleTests || []
  const advancedEvaluation = evaluations.advancedTests || []
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedUserName, setSelectedUserName] = useState<string>("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const { assignementTemplates } = useGetAllAssignementTemplates()
  const [deadline, setDeadline] = useState<string>("")
  const { assignTemplate } = useAssignTemplate()
  const { toast } = useToast()

  const router = useRouter()

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (e) {
      return dateString
    }
  }

  const getStatusBadgeClasses = (status: string) => {
    if (status.toLowerCase() === "completed")
      return "bg-green-500/10 text-green-400 border-green-500/30"
    if (status.toLowerCase() === "in progress")
      return "bg-amber-500/10 text-amber-400 border-amber-500/30"
    return "bg-purple-500/10 text-purple-400 border-purple-500/30"
  }

  const handleAssignment = (userId: string) => {
    router.push(paths.dashboard.manage.assignement(userId))
  }

  const handleView = (userId: string) => {
    router.push(paths.dashboard.evaluation.details(userId))
  }

  const handleAssignTemplate = (userId: string, firstName: string, lastName: string) => {
    setSelectedUserId(userId)
    setSelectedUserName(`${firstName} ${lastName}`)
    setDialogOpen(true)
  }

  const handleTemplateSubmit = () => {
    if (!selectedTemplate) return

    assignTemplate({ userId: selectedUserId, templateId: selectedTemplate , deadline: deadline })
      .then(() => {
        toast({
          title: "Template Assigned",
          description: `Template assigned to ${selectedUserName}`,
        })
        setDialogOpen(false)
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
      })    
  }

  const renderTable = (data: typeof simpleEvaluation, title: string) => (
    <Card className="bg-[#1A1525]/70 border-purple-primary/20 shadow-xl">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-400" />
            {title}
          </CardTitle>
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-400 border-purple-500/30"
          >
            {data.length} Tests
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {data.length > 0 ? (
          <div className="overflow-auto rounded-md border border-purple-primary/20">
            <Table>
              <TableHeader className="bg-[#0F0A19]/80">
                <TableRow className="border-purple-primary/20">
                  <TableHead className="text-white/80 font-medium">
                    First Name
                  </TableHead>
                  <TableHead className="text-white/80 font-medium">
                    Last Name
                  </TableHead>
                  <TableHead className="text-white/80 font-medium">
                    Company
                  </TableHead>
                  <TableHead className="text-white/80 font-medium">
                    Sector
                  </TableHead>
                  <TableHead className="text-white/80 font-medium">
                    Created At
                  </TableHead>
                  <TableHead className="text-white/80 font-medium">
                    Status
                  </TableHead>
                  <TableHead className="text-white/80 font-medium">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((result) => (
                  <TableRow
                    key={result._id}
                    className="hover:bg-[#2A2035] border-purple-primary/20"
                  >
                    <TableCell className="text-white font-medium">
                      {result.userFirstName}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {result.userLastName}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {result.companyName}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {result.sectorOfActivity}
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {formatDate(result.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeClasses(result.status)}
                      >
                        {result.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2">
                            <MoreHorizontal className="h-4 w-4 text-white" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAssignment(result.userId)}>
                            Make Assignment
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssignTemplate(
                            result.userId, 
                            result.userFirstName, 
                            result.userLastName
                          )}>
                            Assign Template
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleView(result._id)}>
                            View Evaluation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Info className="h-12 w-12 text-purple-400/50 mb-3" />
            <h3 className="text-lg font-medium text-white mb-1">
              No {title} Found
            </h3>
            <p className="text-white/60 max-w-md">
              There are no {title.toLowerCase()} in the system yet.
              Create your first test to see results here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <>
      <Tabs defaultValue="simple" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            Evaluation Results
          </h2>
          <TabsList className="bg-[#1A1525]/70 border border-purple-primary/20">
            <TabsTrigger
              value="simple"
              className="text-white data-[state=active]:bg-purple-primary data-[state=active]:text-white"
            >
              Simple Tests
            </TabsTrigger>
            <TabsTrigger
              value="advanced"
              className="text-white data-[state=active]:bg-purple-primary data-[state=active]:text-white"
            >
              Advanced Tests
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="simple">
          {renderTable(simpleEvaluation, "Simple Evaluation Results")}
        </TabsContent>
        <TabsContent value="advanced">
          {renderTable(advancedEvaluation, "Advanced Evaluation Results")}
        </TabsContent>
      </Tabs>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Select a template and deadline to assign to {selectedUserName}:</p>
            <Select onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {assignementTemplates?.map((template) => (
                  <SelectItem key={template.id} value={template.id.toString()}>
                    {template.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="Select a deadline"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTemplateSubmit} disabled={!selectedTemplate || !deadline}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
