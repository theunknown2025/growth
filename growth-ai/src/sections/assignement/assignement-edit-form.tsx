"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Trash2, Plus, Calendar, HelpCircle, Link2, FileText } from "lucide-react"

import { Button } from "@/shadcn/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shadcn/ui/form"
import { Input } from "@/shadcn/ui/input"
import { Textarea } from "@/shadcn/ui/textarea"
import { Card, CardContent } from "@/shadcn/ui/card"
import { Separator } from "@/shadcn/ui/separator"
import { Label } from "@/shadcn/ui/label"
import { useToast } from "@/shadcn/hooks/use-toast"

import { useUpdateAssignement, useGetAssignementById } from "@/actions/assignements"
import { paths } from "@/routes/paths"

// Updated question schema with multiple resources
const questionSchema = z.object({
  question: z.string().min(5, { message: "Question must be at least 5 characters." }),
  description: z.string().min(1, { message: "Description is required." }),
  answer: z.string().optional(),
  urlresources: z.array(z.string().url({ message: "Please enter a valid URL" }).or(z.literal(""))).optional().default([]),
  fileresources: z.array(z.any()).optional().default([])
})

// Form schema to match your assignment schema.
const formSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters." }),
  description: z.string().min(1, { message: "Description is required." }),
  deadline: z.string().min(1, { message: "Please select a deadline." }),
  questions: z.array(questionSchema).min(1, { message: "Add at least one question." }),
})

type FormValues = z.infer<typeof formSchema>

type AssignmentFormProps = {
    assignementId: string
}

export function AssignmentEditForm({ assignementId }: AssignmentFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const { updateAssignement } = useUpdateAssignement()

    // Fetch the assignment details
    const { assignement } = useGetAssignementById(assignementId)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            deadline: "",
            questions: [
                {
                    question: "",
                    description: "",
                    answer: "",
                    urlresources: [""],
                    fileresources: []
                },
            ],
        },
    })

    // Reset the form with the fetched assignment details.
    useEffect(() => {
        if (assignement) {
            form.reset({
                title: assignement.title,
                description: assignement.description,
                deadline: assignement.deadline.split("T")[0],
                questions: assignement.questions.map(q => ({
                    question: q.question,
                    description: q.description,
                    answer: q.answer || "",
                    urlresources: q.urlresources?.length ? q.urlresources : [""],
                    fileresources: q.fileresources || []
                }))
            })
        }
    }, [assignement, form])

    const watchQuestions = form.watch("questions")

    const handleSubmit = async (data: FormValues) => {
        try {
            // Create FormData to handle file uploads
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('deadline', new Date(data.deadline).toISOString());
            
            if (assignement?.status) {
                formData.append('status', assignement.status);
            }
            
            // Process questions to remove File objects before JSON stringifying
            const processedQuestions = data.questions.map(q => {
                const questionCopy = { ...q };
                // Keep only string entries (existing filenames)
                questionCopy.fileresources = Array.isArray(q.fileresources) 
                  ? q.fileresources.filter(file => typeof file === 'string')
                  : [];
                return questionCopy;
            });
            
            formData.append('questions', JSON.stringify(processedQuestions));
            
            // Append new files with proper field names
            data.questions.forEach((question, qIndex) => {
                if (question.fileresources && question.fileresources.length > 0) {
                    question.fileresources.forEach(file => {
                        if (file instanceof File) {
                            formData.append(`questions[${qIndex}].fileresources`, file);
                        }
                    });
                }
            });

            await updateAssignement(formData, assignementId);
            toast({
                title: "Assignment Updated",
                description: "Your assignment has been updated successfully.",
            });
            router.push(paths.dashboard.assignements.root);
        } catch (err) {
            console.error("Update Error:", err);
            toast({
                title: "Error",
                description: "Failed to update assignment.",
                variant: "destructive"
            });
        }
    }

    const addQuestion = () => {
        const currentQuestions = form.getValues("questions")
        form.setValue("questions", [
            ...currentQuestions,
            { 
                question: "", 
                description: "", 
                answer: "",
                urlresources: [""], 
                fileresources: [] 
            },
        ])
    }

    const removeQuestion = (index: number) => {
        const currentQuestions = form.getValues("questions")
        if (currentQuestions.length > 1) {
            form.setValue("questions", currentQuestions.filter((_, i) => i !== index))
        }
    }

    const addUrlResource = (questionIndex: number) => {
        const questions = form.getValues("questions");
        const currentUrlResources = questions[questionIndex].urlresources || [];
        
        // Add an empty string for a new URL input
        questions[questionIndex].urlresources = [...currentUrlResources, ""];
        form.setValue("questions", questions);
    }

    const removeUrlResource = (questionIndex: number, urlIndex: number) => {
        const questions = form.getValues("questions");
        const currentUrlResources = questions[questionIndex].urlresources || [];
        
        if (currentUrlResources.length > 1) {
            questions[questionIndex].urlresources = currentUrlResources.filter((_, i) => i !== urlIndex);
            form.setValue("questions", questions);
        }
    }

    const removeFileResource = (questionIndex: number, fileIndex: number) => {
        const questions = form.getValues("questions");
        const currentFileResources = questions[questionIndex].fileresources || [];
        
        if (currentFileResources.length > 0) {
            questions[questionIndex].fileresources = currentFileResources.filter((_, i) => i !== fileIndex);
            form.setValue("questions", questions);
        }
    }

    return (
        <div className="space-y-6">
            <Form {...form}>
                <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
                    {/* Assignment Details */}
                    <Card className="bg-[#1A1525] border-purple-primary/20 shadow-lg">
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white">Assignment Title</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter assignment title"
                                                    {...field}
                                                    className="bg-[#0F0A19] border-purple-primary/20 text-white focus-visible:ring-purple-light"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white">Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter assignment description"
                                                    {...field}
                                                    className="bg-[#0F0A19] border-purple-primary/20 text-white focus-visible:ring-purple-light min-h-[100px]"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="deadline"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-white">Assignment Deadline</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="h-4 w-4 text-purple-light flex-shrink-0" />
                                                    <Input
                                                        type="date"
                                                        {...field}
                                                        className="bg-[#0F0A19] border-purple-primary/20 text-white focus-visible:ring-purple-light"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Questions with Resources */}
                    {watchQuestions.map((_, questionIndex) => (
                        <Card key={questionIndex} className="bg-[#1A1525] border-purple-primary/20 shadow-lg">
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-white">Question {questionIndex + 1}</h3>
                                    {form.getValues("questions").length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeQuestion(questionIndex)}
                                            className="h-8 w-8 text-white/70 hover:text-white hover:bg-purple-light/10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name={`questions.${questionIndex}.question`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Question</FormLabel>
                                                <FormControl>
                                                    <div className="flex items-center space-x-2">
                                                        <HelpCircle className="h-4 w-4 text-purple-light flex-shrink-0" />
                                                        <Input
                                                            placeholder="Enter question"
                                                            {...field}
                                                            className="bg-[#0F0A19] border-purple-primary/20 text-white focus-visible:ring-purple-light"
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name={`questions.${questionIndex}.description`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Description</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Enter Description"
                                                        {...field}
                                                        className="bg-[#0F0A19] border-purple-primary/20 text-white focus-visible:ring-purple-light min-h-[80px]"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    
                                    {/* Answer (keep if present in existing question) */}
                                    <FormField
                                        control={form.control}
                                        name={`questions.${questionIndex}.answer`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-white">Answer (if provided)</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="No answer provided yet"
                                                        {...field}
                                                        className="bg-[#0F0A19] border-purple-primary/20 text-white focus-visible:ring-purple-light min-h-[80px]"
                                                        disabled={true}  // Make it read-only to preserve answers
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* URL Resources */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-white">URL Resources</FormLabel>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addUrlResource(questionIndex)}
                                                className="h-7 bg-purple-light/10 border-purple-light/30 hover:bg-purple-light/20 text-white"
                                            >
                                                <Plus className="h-3.5 w-3.5 mr-1" /> Add URL
                                            </Button>
                                        </div>
                                        
                                        {(form.getValues(`questions.${questionIndex}.urlresources`) || [""]).map((_, urlIndex) => (
                                            <div key={urlIndex} className="flex items-center space-x-2">
                                                <FormField
                                                    control={form.control}
                                                    name={`questions.${questionIndex}.urlresources.${urlIndex}`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex-1">
                                                            <FormControl>
                                                                <div className="flex items-center space-x-2">
                                                                    <Link2 className="h-4 w-4 text-purple-light flex-shrink-0" />
                                                                    <Input
                                                                        placeholder="Enter resource URL"
                                                                        {...field}
                                                                        className="bg-[#0F0A19] border-purple-primary/20 text-white focus-visible:ring-purple-light"
                                                                    />
                                                                </div>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                {urlIndex > 0 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeUrlResource(questionIndex, urlIndex)}
                                                        className="h-8 w-8 text-white/70 hover:text-white hover:bg-purple-light/10 flex-shrink-0"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* File Resources */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <FormLabel className="text-white">File Resources</FormLabel>
                                            <FormField
                                                control={form.control}
                                                name={`questions.${questionIndex}.fileresources`}
                                                render={({ field }) => (
                                                    <FormItem className="w-auto">
                                                        <FormControl>
                                                            <div className="relative">
                                                                <Input
                                                                    type="file"
                                                                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                                                                    onChange={(e) => {
                                                                        if (e.target.files && e.target.files[0]) {
                                                                            const newFiles = [...field.value];
                                                                            newFiles.push(e.target.files[0]);
                                                                            field.onChange(newFiles);
                                                                        }
                                                                    }}
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-7 bg-purple-light/10 border-purple-light/30 hover:bg-purple-light/20 text-white"
                                                                >
                                                                    <Plus className="h-3.5 w-3.5 mr-1" /> Add File
                                                                </Button>
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        
                                        {/* Display uploaded files */}
                                        <div className="space-y-2">
                                            {(form.getValues(`questions.${questionIndex}.fileresources`) || []).map((file, fileIndex) => (
                                                <div key={fileIndex} className="flex items-center justify-between bg-[#0F0A19] border border-purple-primary/20 rounded-md p-2">
                                                    <div className="flex items-center space-x-2">
                                                        <FileText className="h-4 w-4 text-purple-light flex-shrink-0" />
                                                        <span className="text-white text-sm truncate">
                                                            {file instanceof File ? file.name : (typeof file === 'string' ? file : 'Unknown file')}
                                                        </span>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFileResource(questionIndex, fileIndex)}
                                                        className="h-7 w-7 p-0 text-white/70 hover:text-white hover:bg-purple-light/10"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        onClick={addQuestion}
                        className="w-full bg-purple-light/10 border-purple-light/30 hover:bg-purple-light/20 text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Question
                    </Button>

                    <Separator className="bg-purple-primary/20" />

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-purple-light to-purple-primary hover:from-purple-light/90 hover:to-purple-primary/90 text-white"
                        >
                            Update Assignment
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
