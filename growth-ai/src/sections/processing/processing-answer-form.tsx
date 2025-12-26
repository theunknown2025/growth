"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { AlertTriangle, BookOpen, Calendar, CheckCircle2, HelpCircle, Loader2, Save } from "lucide-react"

import { Button } from "@/shadcn/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card"
import { Separator } from "@/shadcn/ui/separator"
import { useToast } from "@/shadcn/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/shadcn/ui/badge"
import { Textarea } from "@/shadcn/ui/textarea"

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

import { useAnswerAssignement, useGetAssignementById } from "@/actions/assignements"
import { paths } from "@/routes/paths"

// Updated answer schema to require a non-empty string
const answerSchema = z.object({
    answer: z.string().min(1, "Answer is required"),
})

const formSchema = z.object({
    answers: z.array(answerSchema),
})

type FormValues = z.infer<typeof formSchema>

type AssignmentFormProps = {
    assignementId: string
}

export function ProcessingAnswerView({ assignementId }: AssignmentFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const { answerAssignement } = useAnswerAssignement()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const { assignement, assignementLoading } = useGetAssignementById(assignementId)
    // Set mode to onChange so that formState.isValid updates as the user types
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            answers: [],
        },
    })

    // When assignment data is loaded, reset default values for each question
    useEffect(() => {
        if (assignement && assignement.questions) {
            form.reset({
                answers: assignement.questions.map(() => ({ answer: "" })),
            })
        }
    }, [assignement, form])

    const handleSubmit = async (data: FormValues) => {
        setShowConfirmDialog(false)
        setIsSubmitting(true)
        try {
            await answerAssignement({ answers: data.answers } as any, assignementId)
            setIsSubmitting(false)
            toast({
                title: "Answers Submitted Successfully",
                description: "Your responses have been saved.",
                variant: "default",
            })
            router.push(paths.dashboard.processing.root)
        } catch (err) {
            setIsSubmitting(false)
            console.error("Submission Error:", err)
            toast({
                title: "Submission Failed",
                description: "There was an error submitting your answers. Please try again.",
                variant: "destructive",
            })
        }
    }

    if (assignementLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="h-12 w-12 text-purple-light animate-spin mb-4" />
                <p className="text-white text-lg">Loading assignment...</p>
            </div>
        )
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
            >
                {/* Assignment details card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    <Card className="bg-[#1A1525] border-purple-primary/20 shadow-lg overflow-hidden">
                        <CardHeader className="pb-2 border-b border-purple-primary/10">
                            <CardTitle className="text-xl text-white">{assignement?.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <p className="text-white/80">{assignement?.description}</p>
                            <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-purple-light flex-shrink-0" />
                                <div>
                                    <span className="text-white/70 mr-2">Deadline:</span>
                                    <span className="text-white font-medium">
                                        {assignement?.deadline?.split("T")[0] || "Not specified"}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <Form {...form}>
                    <form className="space-y-6" onSubmit={form.handleSubmit(() => setShowConfirmDialog(true))}>
                        {assignement?.questions?.map((q: any, questionIndex: number) => (
                            <motion.div
                                key={questionIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 + questionIndex * 0.1 }}
                            >
                                <Card className="bg-[#1A1525] border-purple-primary/20 shadow-lg overflow-hidden">
                                    <CardHeader className="pb-2 border-b border-purple-primary/10">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg text-white flex items-center">
                                                <span className="flex items-center justify-center bg-purple-primary/20 text-purple-light rounded-full w-6 h-6 text-sm mr-3">
                                                    {questionIndex + 1}
                                                </span>
                                                {q.question}
                                            </CardTitle>
                                            {form.watch(`answers.${questionIndex}.answer`) ? (
                                                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    Answered
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                                                    <AlertTriangle className="h-3 w-3 mr-1" />
                                                    Pending
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-4 space-y-4">
                                        <p className="text-white/80">{q.description}</p>

                                        {q.resources && q.resources.length > 0 && (
                                            <div className="bg-[#0F0A19] rounded-lg p-4">
                                                <div className="flex items-center mb-2">
                                                    <BookOpen className="h-4 w-4 text-purple-light mr-2" />
                                                    <h4 className="text-sm font-medium text-white">Resources</h4>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {q.resources.map((resource: any, idx: number) => (
                                                        <a
                                                            key={idx}
                                                            href={resource.link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 bg-[#1A1525] hover:bg-[#2A2035] text-purple-light px-3 py-1.5 rounded-md text-sm transition-colors"
                                                        >
                                                            {resource.title}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <FormField
                                            control={form.control}
                                            name={`answers.${questionIndex}.answer` as const}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-white flex items-center">
                                                        Your Answer
                                                        <HelpCircle className="h-3.5 w-3.5 text-purple-light ml-1.5 cursor-help" />
                                                    </FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Enter your answer here..."
                                                            className="min-h-[120px] bg-[#0F0A19] border-purple-primary/20 text-white focus-visible:ring-purple-light resize-none"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}

                        <Separator className="bg-purple-primary/20" />

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.5 }}
                            className="flex justify-between items-center"
                        >
                            <Button
                                type="submit"
                                // Disable if submitting or form is invalid (i.e. not every answer is filled)
                                disabled={isSubmitting || !form.formState.isValid}
                                className="bg-gradient-to-r from-purple-light to-purple-primary hover:from-purple-light/90 hover:to-purple-primary/90 text-white"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Submit Answers"
                                )}
                            </Button>
                        </motion.div>
                    </form>
                </Form>

                {/* Confirmation Dialog */}
                <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                    <AlertDialogContent className="bg-[#1A1525] border-purple-primary/20 text-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Submit your answers?</AlertDialogTitle>
                            <AlertDialogDescription className="text-white/70">
                                Are you sure you want to submit your answers? You won't be able to edit them after submission.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-[#0F0A19] border-purple-primary/20 text-white hover:bg-[#2A2035]">
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => handleSubmit(form.getValues())}
                                className="bg-gradient-to-r from-purple-light to-purple-primary hover:from-purple-light/90 hover:to-purple-primary/90 text-white"
                            >
                                Submit
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </motion.div>
        </AnimatePresence>
    )
}