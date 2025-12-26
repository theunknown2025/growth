"use client"

import { useState, useEffect, useRef } from "react"
import { PDFDownloadLink } from '@react-pdf/renderer';
import EvaluationResultsPDF from "../../evaluatio-results-pdf";
import { useRouter } from "next/navigation"
import { Button } from "@/shadcn/ui/button"
import {
  ClipboardList,
  LineChart,
  Wrench,
  FileText,
  Send,
  BarChart4,
  ChevronDown,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Printer,
  ChevronUp,
  CheckCircle2,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs"
import { cn } from "@/shadcn/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Textarea } from "@/shadcn/ui/textarea"
import { useAnswerAdvancedEvaluation } from "@/actions/evaluation"
import { TestStep } from "@/types/evaluation"
import { AdvancedTestAnswers } from "@/types/evaluation"
import { Progress } from "@/shadcn/ui/progress"
import { toast } from "sonner"
import {
  useSaveAdvancedEvaluationProgress,
  useGetAdvancedEvaluationById,
  useCompleteAdvancedEvaluation,
} from "@/actions/evaluation"

import { Radar } from 'react-chartjs-2';
import Chart from 'chart.js/auto'; 
import { RadialLinearScale } from 'chart.js'; 

// Register the scale with Chart.js
Chart.register(RadialLinearScale);

export default function EvaluationAdvancedTestView() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<TestStep>("assess")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    assessment: true,
    implementation: false,
    monitoring: false,
  })
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState("overview")
  const [animatingStep, setAnimatingStep] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>("marketResearch")
  const { answerAdvancedEvaluation } = useAnswerAdvancedEvaluation()
  const [evaluationresults, setEvaluationResults] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [isSavingProgress, setIsSavingProgress] = useState(false)
  const [isCompletingTest, setIsCompletingTest] = useState(false)
  const [testId, setTestId] = useState<string | null>(null)
  const [testLoaded, setTestLoaded] = useState(false)
  const { saveProgress } = useSaveAdvancedEvaluationProgress()
  const { completeTest } = useCompleteAdvancedEvaluation()
  const { advancedevaluation } = useGetAdvancedEvaluationById(testId || "")

  const [answers, setAnswers] = useState<AdvancedTestAnswers>({
    _id: "",
    assess: {
      marketResearch: {
        main: "",
        researchSources: "",
        validatedFindings: "",
        aiTools: "",
      },
      consumerSegmentation: {
        main: "",
        updatingSegments: "",
        behavioralPatterns: "",
        targetingCriteria: "",
      },
      competitiveAnalysis: {
        main: "",
        competitorStrengths: "",
        marketTrends: "",
        competitiveAdvantage: "",
      },
      problemSolutionFit: {
        main: "",
        validatedAssumptions: "",
        customerProblems: "",
        customerDissatisfaction: "",
      },
    },
    implement: {
      brandPositioning: {
        main: "",
        brandValues: "",
        brandPerception: "",
        brandConsistency: "",
      },
      productDevelopment: {
        main: "",
        customerInsights: "",
        productRoadmap: "",
        usabilityTesting: "",
      },
      marketingEffectiveness: {
        main: "",
        targetedMessages: "",
        campaignPerformance: "",
        channelStrategy: "",
      },
      customerExperience: {
        main: "",
        omniChannelExperience: "",
        customerService: "",
        continuousImprovement: "",
      },
    },
    monitor: {
      performanceTracking: {
        main: "",
        kpiAlignment: "",
        metricsReview: "",
        trackingSystems: "",
      },
      consumerSentiment: {
        main: "",
        feedbackCollection: "",
        sentimentAnalysis: "",
        socialMediaMonitoring: "",
      },
    },
    status: "in-progress",
    createdAt: new Date().toISOString(),
  })

  const steps: TestStep[] = ["assess", "implement", "monitor", "review", "submit", "result"]
  const currentStepIndex = steps.indexOf(currentStep)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id")
    if (id) setTestId(id)
  }, [])

  useEffect(() => {
    if (advancedevaluation && !testLoaded) {
      setAnswers(advancedevaluation.answers)
      setProgress(advancedevaluation.progress || 0)
      if (advancedevaluation.status === "completed") {
        setShowResults(true)
        setCurrentStep("result")
      }
      setTestLoaded(true)
    }
  }, [advancedevaluation, testLoaded])

  useEffect(() => {
    if (!testLoaded) return
    let total = 0, filled = 0
    const count = (obj: any) => {
      Object.values(obj).forEach(v => {
        if (typeof v === "object") count(v)
        else {
          total++
          if (typeof v === 'string' && v.trim()) filled++
        }
      })
    }
    count(answers.assess); count(answers.implement); count(answers.monitor)
    setProgress(total ? Math.round((filled/total)*100) : 0)
  }, [answers, testLoaded])

  const handleNext = () => {
    setAnimatingStep(true)
    setTimeout(() => {
      const nextIndex = currentStepIndex + 1
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex])
        window.scrollTo(0, 0)
      }
      setAnimatingStep(false)
    }, 300)
  }
 
  const handleBack = () => {
    setAnimatingStep(true)
    setTimeout(() => {
      const prevIndex = currentStepIndex - 1
      if (prevIndex >= 0) {
        setCurrentStep(steps[prevIndex])
        window.scrollTo(0, 0)
      }
      setAnimatingStep(false)
    }, 300)
  }

  const handleSubmit = async () => {
    setIsAnalyzing(true)
    setCurrentStep("result")

    const result = await answerAdvancedEvaluation(answers)
    setEvaluationResults(result)

    setIsAnalyzing(false)
    setShowResults(true)
  }

  const handleSaveProgress = async (show = true) => {
    setIsSavingProgress(true)
    const data = { ...answers, _id: answers._id || testId || "" }
    try {
      const saved = await saveProgress(data)
      setAnswers(prev => ({ ...prev, _id: saved._id }))
      if (!testId && saved._id) {
        setTestId(saved._id)
        const url = new URL(window.location.href)
        url.searchParams.set("id", saved._id)
        window.history.replaceState({}, "", url.toString())
      }
      show && toast.success("Progress saved")
    } catch {
      show && toast.error("Save failed")
    } finally {
      setIsSavingProgress(false)
    }
  }

  const handleCompleteTest = async () => {
    setIsCompletingTest(true)
    await handleSaveProgress(false)
    const id = testId || answers._id
    if (!id) return toast.error("No test ID")
    try {
      const result = await completeTest(id)
      setEvaluationResults(result)
      setShowResults(true)
      setCurrentStep("result")
      toast.success("Test completed")
    } catch {
      toast.error("Complete failed")
    } finally {
      setIsCompletingTest(false)
    }
  }

  const handleUpdateAnswer = <S extends keyof AdvancedTestAnswers, C extends keyof AdvancedTestAnswers[S]>(section: S, category: C, field: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [category]: {
          ...((prev[section] as any)[category]),
          [field]: value,
        },
      },
    }))
  }

  const handleBackToTests = () => {
    router.push("/dashboard/evaluation")
  }

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  const toggleQuestionSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const handleFocus = (field: string) => {
    setActiveField(field)
  }

  const handleBlur = () => {
    setActiveField(null)
  }

  const getStepName = (step: TestStep): string => {
    return step.charAt(0).toUpperCase() + step.slice(1)
  }

  const getStepNumber = (step: TestStep): number => {
    return steps.indexOf(step) + 1
  }

  const isFormValid = (step: TestStep): boolean => {
    if (step === "assess") {
      // Check if at least one question in each section has been answered
      const marketResearchAnswered = Object.values(answers.assess.marketResearch).some(
        (answer) => answer.trim().length > 0,
      )
      const consumerSegmentationAnswered = Object.values(answers.assess.consumerSegmentation).some(
        (answer) => answer.trim().length > 0,
      )
      const competitiveAnalysisAnswered = Object.values(answers.assess.competitiveAnalysis).some(
        (answer) => answer.trim().length > 0,
      )
      const problemSolutionFitAnswered = Object.values(answers.assess.problemSolutionFit).some(
        (answer) => answer.trim().length > 0,
      )

      return (
        marketResearchAnswered &&
        consumerSegmentationAnswered &&
        competitiveAnalysisAnswered &&
        problemSolutionFitAnswered
      )
    } else if (step === "implement") {
      const brandPositioningAnswered = Object.values(answers.implement.brandPositioning).some(
        (answer) => answer.trim().length > 0,
      )
      const productDevelopmentAnswered = Object.values(answers.implement.productDevelopment).some(
        (answer) => answer.trim().length > 0,
      )
      const marketingEffectivenessAnswered = Object.values(answers.implement.marketingEffectiveness).some(
        (answer) => answer.trim().length > 0,
      )
      const customerExperienceAnswered = Object.values(answers.implement.customerExperience).some(
        (answer) => answer.trim().length > 0,
      )

      return (
        brandPositioningAnswered &&
        productDevelopmentAnswered &&
        marketingEffectivenessAnswered &&
        customerExperienceAnswered
      )
    } else if (step === "monitor") {
      const performanceTrackingAnswered = Object.values(answers.monitor.performanceTracking).some(
        (answer) => answer.trim().length > 0,
      )
      const consumerSentimentAnswered = Object.values(answers.monitor.consumerSentiment).some(
        (answer) => answer.trim().length > 0,
      )

      return performanceTrackingAnswered && consumerSentimentAnswered
    }

    return true
  }

  const onBack = () => {
    handleBack()
  }

  const onBackToSubmit = () => {
    setCurrentStep("submit")
  }

  const onBackToTests = () => {
    router.push("/dashboard/evaluation")
  }

  return (
    <div className="min-h-screen bg-[#13101C] overflow-hidden">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <motion.h1
            className="text-2xl md:text-3xl font-bold text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Advanced Test
          </motion.h1>
          <motion.p
            className="text-sm mt-1 text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Step {getStepNumber(currentStep)} of {steps.length}: {getStepName(currentStep)}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Button
              variant="outline"
              size="sm"
              className="mt-4 border-purple-primary/20 bg-[#1A1625]/50 hover:bg-purple-primary/20 text-white transition-all duration-300"
              onClick={handleBackToTests}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              GO BACK TO TESTS
            </Button>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <motion.div
          className="w-full max-w-md mx-auto mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-white/70">Your progress</span>
            <span className="text-xs text-white/70">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 bg-[#0F0A19]" />
        </motion.div>

        {/* Content Area */}
        <motion.div
          className="bg-[#1A1625] backdrop-blur-sm text-white rounded-xl shadow-xl overflow-hidden border border-purple-primary/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: animatingStep ? 20 : 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: animatingStep ? -20 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* ASSESS STEP */}
              {currentStep === "assess" && (
                <div className="p-6 md:p-8 animate-fadeIn">
                  <motion.h2
                    className="text-xl font-semibold text-center mb-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    Assess
                  </motion.h2>
                  <motion.p
                    className="text-center text-sm text-gray-300 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    Please provide detailed answers to all questions
                  </motion.p>

                  <div className="bg-gray-800/30 rounded-lg p-4 mb-6">
                    <p className="text-sm text-center">Assessment Questions</p>
                    <p className="text-xs text-center text-gray-400">
                      Click on each subsection to view and answer the questions
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Market Research Quality */}
                    <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 bg-[#13101C] text-left"
                        onClick={() => toggleQuestionSection("marketResearch")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-primary text-white flex items-center justify-center text-sm">
                            1
                          </div>
                          <div>
                            <h3 className="font-medium text-white">Market Research Quality</h3>
                            <p className="text-sm text-gray-400">
                              Have we gathered sufficient market & consumer insights?
                            </p>
                          </div>
                        </div>
                        {expandedSection === "marketResearch" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>

                      {expandedSection === "marketResearch" && (
                        <div className="p-4 bg-[#0F0A19] space-y-6">
                          <div className="space-y-3">
                            <h4 className="font-medium text-white">
                              Main Question: Have we gathered sufficient market & consumer insights?
                            </h4>
                            <Textarea
                              placeholder="Enter your answer for the main question..."
                              value={answers.assess.marketResearch.main}
                              onChange={(e:any) => handleUpdateAnswer("assess", "marketResearch", "main", e.target.value)}
                              className={cn(
                                "min-h-[100px] bg-[#13101C] border-purple-primary/20 text-white focus:border-purple-light",
                                activeField === "marketResearch-main"
                                  ? "border-purple-light ring-1 ring-purple-light"
                                  : "",
                              )}
                              onFocus={() => handleFocus("marketResearch-main")}
                              onBlur={handleBlur}
                            />
                          </div>

                          <div className="bg-[#13101C] p-4 rounded-lg">
                            <h4 className="font-medium text-white mb-4">Additional Questions:</h4>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  1. Are our research sources diverse and up to date?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.assess.marketResearch.researchSources}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer("assess", "marketResearch", "researchSources", e.target.value)
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "marketResearch-researchSources"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("marketResearch-researchSources")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  2. Have we validated our research findings with external experts?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.assess.marketResearch.validatedFindings}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer("assess", "marketResearch", "validatedFindings", e.target.value)
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "marketResearch-validatedFindings"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("marketResearch-validatedFindings")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  3. Are we leveraging AI and digital tools for better consumer insights?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.assess.marketResearch.aiTools}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer("assess", "marketResearch", "aiTools", e.target.value)
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "marketResearch-aiTools"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("marketResearch-aiTools")}
                                  onBlur={handleBlur}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Consumer Segmentation */}
                    <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 bg-[#13101C] text-left"
                        onClick={() => toggleQuestionSection("consumerSegmentation")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-primary text-white flex items-center justify-center text-sm">
                            2
                          </div>
                          <div>
                            <h3 className="font-medium text-white">Consumer Segmentation</h3>
                            <p className="text-sm text-gray-400">Do we understand our ideal customers?</p>
                          </div>
                        </div>
                        {expandedSection === "consumerSegmentation" ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>

                      {expandedSection === "consumerSegmentation" && (
                        <div className="p-4 bg-[#0F0A19] space-y-6">
                          <div className="space-y-3">
                            <h4 className="font-medium text-white">
                              Main Question: Do we understand our ideal customers?
                            </h4>
                            <Textarea
                              placeholder="Enter your answer for the main question..."
                              value={answers.assess.consumerSegmentation.main}
                              onChange={(e:any) =>
                                handleUpdateAnswer("assess", "consumerSegmentation", "main", e.target.value)
                              }
                              className={cn(
                                "min-h-[100px] bg-[#13101C] border-purple-primary/20 text-white focus:border-purple-light",
                                activeField === "consumerSegmentation-main"
                                  ? "border-purple-light ring-1 ring-purple-light"
                                  : "",
                              )}
                              onFocus={() => handleFocus("consumerSegmentation-main")}
                              onBlur={handleBlur}
                            />
                          </div>

                          <div className="bg-[#13101C] p-4 rounded-lg">
                            <h4 className="font-medium text-white mb-4">Additional Questions:</h4>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  1. Are we continuously updating our customer segments based on new data?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.assess.consumerSegmentation.updatingSegments}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "assess",
                                      "consumerSegmentation",
                                      "updatingSegments",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "consumerSegmentation-updatingSegments"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("consumerSegmentation-updatingSegments")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  2. Have we identified behavioral patterns that impact purchasing decisions?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.assess.consumerSegmentation.behavioralPatterns}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "assess",
                                      "consumerSegmentation",
                                      "behavioralPatterns",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "consumerSegmentation-behavioralPatterns"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("consumerSegmentation-behavioralPatterns")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  3. Are our segmentation criteria relevant for targeting?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.assess.consumerSegmentation.targetingCriteria}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "assess",
                                      "consumerSegmentation",
                                      "targetingCriteria",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "consumerSegmentation-targetingCriteria"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("consumerSegmentation-targetingCriteria")}
                                  onBlur={handleBlur}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Competitive Analysis */}
                    <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 bg-[#13101C] text-left"
                        onClick={() => toggleQuestionSection("competitiveAnalysis")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-primary text-white flex items-center justify-center text-sm">
                            3
                          </div>
                          <div>
                            <h3 className="font-medium text-white">Competitive Analysis</h3>
                            <p className="text-sm text-gray-400">Have we benchmarked against competitors?</p>
                          </div>
                        </div>
                        {expandedSection === "competitiveAnalysis" ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>

                      {expandedSection === "competitiveAnalysis" && (
                        <div className="p-4 bg-[#0F0A19] space-y-6">
                          <div className="space-y-3">
                            <h4 className="font-medium text-white">
                              Main Question: Have we benchmarked against competitors?
                            </h4>
                            <Textarea
                              placeholder="Enter your answer for the main question..."
                              value={answers.assess.competitiveAnalysis.main}
                              onChange={(e:any) =>
                                handleUpdateAnswer("assess", "competitiveAnalysis", "main", e.target.value)
                              }
                              className={cn(
                                "min-h-[100px] bg-[#13101C] border-purple-primary/20 text-white focus:border-purple-light",
                                activeField === "competitiveAnalysis-main"
                                  ? "border-purple-light ring-1 ring-purple-light"
                                  : "",
                              )}
                              onFocus={() => handleFocus("competitiveAnalysis-main")}
                              onBlur={handleBlur}
                            />
                          </div>

                          <div className="bg-[#13101C] p-4 rounded-lg">
                            <h4 className="font-medium text-white mb-4">Additional Questions:</h4>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  1. Have we identified our competitors' strengths and weaknesses?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.assess.competitiveAnalysis.competitorStrengths}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "assess",
                                      "competitiveAnalysis",
                                      "competitorStrengths",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "competitiveAnalysis-competitorStrengths"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("competitiveAnalysis-competitorStrengths")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  2. Are we monitoring market trends and competitive landscape changes?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.assess.competitiveAnalysis.marketTrends}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer("assess", "competitiveAnalysis", "marketTrends", e.target.value)
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "competitiveAnalysis-marketTrends"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("competitiveAnalysis-marketTrends")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  3. Do we have a clear competitive advantage in the market?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.assess.competitiveAnalysis.competitiveAdvantage}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "assess",
                                      "competitiveAnalysis",
                                      "competitiveAdvantage",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "competitiveAnalysis-competitiveAdvantage"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("competitiveAnalysis-competitiveAdvantage")}
                                  onBlur={handleBlur}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Problem-Solution Fit */}
                    <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 bg-[#13101C] text-left"
                        onClick={() => toggleQuestionSection("problemSolutionFit")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-primary text-white flex items-center justify-center text-sm">
                            4
                          </div>
                          <div>
                            <h3 className="font-medium text-white">Problem-Solution Fit</h3>
                            <p className="text-sm text-gray-400">Do our offerings align with customer pain points?</p>
                          </div>
                        </div>
                        {expandedSection === "problemSolutionFit" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>

                      {expandedSection === "problemSolutionFit" && (
                        <div className="p-4 bg-[#0F0A19] space-y-6">
                          <div className="space-y-3">
                            <h4 className="font-medium text-white">
                              Main Question: Do our offerings align with customer pain points?
                            </h4>
                            <Textarea
                              placeholder="Enter your answer for the main question..."
                              value={answers.assess.problemSolutionFit.main}
                              onChange={(e:any) =>
                                handleUpdateAnswer("assess", "problemSolutionFit", "main", e.target.value)
                              }
                              className={cn(
                                "min-h-[100px] bg-[#13101C] border-purple-primary/20 text-white focus:border-purple-light",
                                activeField === "problemSolutionFit-main"
                                  ? "border-purple-light ring-1 ring-purple-light"
                                  : "",
                              )}
                              onFocus={() => handleFocus("problemSolutionFit-main")}
                              onBlur={handleBlur}
                            />
                          </div>

                          <div className="bg-[#13101C] p-4 rounded-lg">
                            <h4 className="font-medium text-white mb-4">Additional Questions:</h4>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  1. Have we validated our assumptions about customer pain points with real user data?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.assess.problemSolutionFit.validatedAssumptions}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "assess",
                                      "problemSolutionFit",
                                      "validatedAssumptions",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "problemSolutionFit-validatedAssumptions"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("problemSolutionFit-validatedAssumptions")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  2. How do customers currently solve their problems without our product?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.assess.problemSolutionFit.customerProblems}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "assess",
                                      "problemSolutionFit",
                                      "customerProblems",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "problemSolutionFit-customerProblems"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("problemSolutionFit-customerProblems")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  3. What percentage of potential customers express dissatisfaction with existing
                                  solutions?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.assess.problemSolutionFit.customerDissatisfaction}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "assess",
                                      "problemSolutionFit",
                                      "customerDissatisfaction",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "problemSolutionFit-customerDissatisfaction"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("problemSolutionFit-customerDissatisfaction")}
                                  onBlur={handleBlur}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <motion.div
                    className="flex justify-between mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Button
                      onClick={() => handleSaveProgress(true)}
                      variant="outline"
                      className="border-purple-primary/20 bg-[#1A1625]/50 text-white flex items-center gap-2"
                      disabled={isSavingProgress}
                    >
                      {isSavingProgress
                        ? <Loader2 className="animate-spin" />
                        : <CheckCircle2 size={16} />}
                      {isSavingProgress ? "SAVING..." : "SAVE PROGRESS"}
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!isFormValid("assess")}
                      className={cn(
                        "bg-purple-primary hover:bg-purple-light text-white transition-all duration-300 flex items-center gap-2",
                        !isFormValid("assess")
                          ? "opacity-50 cursor-not-allowed"
                          : "shadow-lg shadow-purple-primary/20 hover:shadow-purple-light/30",
                      )}
                    >
                      NEXT
                      <ArrowRight size={16} />
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* IMPLEMENT STEP */}
              {currentStep === "implement" && (
                <div className="p-6 md:p-8 animate-fadeIn">
                  <motion.h2
                    className="text-xl font-semibold text-center mb-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    Implement
                  </motion.h2>
                  <motion.p
                    className="text-center text-sm text-gray-300 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    Please provide detailed answers to all questions
                  </motion.p>

                  <div className="bg-gray-800/30 rounded-lg p-4 mb-6">
                    <p className="text-sm text-center">Implementation Questions</p>
                    <p className="text-xs text-center text-gray-400">
                      Click on each subsection to view and answer the questions
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Brand Positioning */}
                    <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 bg-[#13101C] text-left"
                        onClick={() => toggleQuestionSection("brandPositioning")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-primary text-white flex items-center justify-center text-sm">
                            1
                          </div>
                          <div>
                            <h3 className="font-medium text-white">Brand Positioning</h3>
                            <p className="text-sm text-gray-400">Is our brand differentiation clear to consumers?</p>
                          </div>
                        </div>
                        {expandedSection === "brandPositioning" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>

                      {expandedSection === "brandPositioning" && (
                        <div className="p-4 bg-[#0F0A19] space-y-6">
                          <div className="space-y-3">
                            <h4 className="font-medium text-white">
                              Main Question: Is our brand differentiation clear to consumers?
                            </h4>
                            <Textarea
                              placeholder="Enter your answer for the main question..."
                              value={answers.implement.brandPositioning.main}
                              onChange={(e:any) =>
                                handleUpdateAnswer("implement", "brandPositioning", "main", e.target.value)
                              }
                              className={cn(
                                "min-h-[100px] bg-[#13101C] border-purple-primary/20 text-white focus:border-purple-light",
                                activeField === "brandPositioning-main"
                                  ? "border-purple-light ring-1 ring-purple-light"
                                  : "",
                              )}
                              onFocus={() => handleFocus("brandPositioning-main")}
                              onBlur={handleBlur}
                            />
                          </div>

                          <div className="bg-[#13101C] p-4 rounded-lg">
                            <h4 className="font-medium text-white mb-4">Additional Questions:</h4>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  1. Do our brand values resonate with our target audience?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.implement.brandPositioning.brandValues}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer("implement", "brandPositioning", "brandValues", e.target.value)
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "brandPositioning-brandValues"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("brandPositioning-brandValues")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  2. How is our brand perceived compared to competitors?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.implement.brandPositioning.brandPerception}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "implement",
                                      "brandPositioning",
                                      "brandPerception",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "brandPositioning-brandPerception"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("brandPositioning-brandPerception")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  3. Is our brand messaging consistent across all touchpoints?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.implement.brandPositioning.brandConsistency}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "implement",
                                      "brandPositioning",
                                      "brandConsistency",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "brandPositioning-brandConsistency"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("brandPositioning-brandConsistency")}
                                  onBlur={handleBlur}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Product Development */}
                    <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 bg-[#13101C] text-left"
                        onClick={() => toggleQuestionSection("productDevelopment")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-primary text-white flex items-center justify-center text-sm">
                            2
                          </div>
                          <div>
                            <h3 className="font-medium text-white">Product Development</h3>
                            <p className="text-sm text-gray-400">Are products developed based on customer needs?</p>
                          </div>
                        </div>
                        {expandedSection === "productDevelopment" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>

                      {expandedSection === "productDevelopment" && (
                        <div className="p-4 bg-[#0F0A19] space-y-6">
                          <div className="space-y-3">
                            <h4 className="font-medium text-white">
                              Main Question: Are products developed based on customer needs?
                            </h4>
                            <Textarea
                              placeholder="Enter your answer for the main question..."
                              value={answers.implement.productDevelopment.main}
                              onChange={(e:any) =>
                                handleUpdateAnswer("implement", "productDevelopment", "main", e.target.value)
                              }
                              className={cn(
                                "min-h-[100px] bg-[#13101C] border-purple-primary/20 text-white focus:border-purple-light",
                                activeField === "productDevelopment-main"
                                  ? "border-purple-light ring-1 ring-purple-light"
                                  : "",
                              )}
                              onFocus={() => handleFocus("productDevelopment-main")}
                              onBlur={handleBlur}
                            />
                          </div>

                          <div className="bg-[#13101C] p-4 rounded-lg">
                            <h4 className="font-medium text-white mb-4">Additional Questions:</h4>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  1. How frequently are customer insights integrated into product iterations?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.implement.productDevelopment.customerInsights}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "implement",
                                      "productDevelopment",
                                      "customerInsights",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "productDevelopment-customerInsights"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("productDevelopment-customerInsights")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  2. Does our product roadmap reflect emerging trends and evolving consumer demands?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.implement.productDevelopment.productRoadmap}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "implement",
                                      "productDevelopment",
                                      "productRoadmap",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "productDevelopment-productRoadmap"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("productDevelopment-productRoadmap")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  3. Are usability testing and beta feedback effectively driving product improvements?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.implement.productDevelopment.usabilityTesting}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "implement",
                                      "productDevelopment",
                                      "usabilityTesting",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "productDevelopment-usabilityTesting"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("productDevelopment-usabilityTesting")}
                                  onBlur={handleBlur}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Marketing Effectiveness */}
                    <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 bg-[#13101C] text-left"
                        onClick={() => toggleQuestionSection("marketingEffectiveness")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-primary text-white flex items-center justify-center text-sm">
                            3
                          </div>
                          <div>
                            <h3 className="font-medium text-white">Marketing Effectiveness</h3>
                            <p className="text-sm text-gray-400">Do campaigns effectively engage target audiences?</p>
                          </div>
                        </div>
                        {expandedSection === "marketingEffectiveness" ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>

                      {expandedSection === "marketingEffectiveness" && (
                        <div className="p-4 bg-[#0F0A19] space-y-6">
                          <div className="space-y-3">
                            <h4 className="font-medium text-white">
                              Main Question: Do campaigns effectively engage target audiences?
                            </h4>
                            <Textarea
                              placeholder="Enter your answer for the main question..."
                              value={answers.implement.marketingEffectiveness.main}
                              onChange={(e:any) =>
                                handleUpdateAnswer("implement", "marketingEffectiveness", "main", e.target.value)
                              }
                              className={cn(
                                "min-h-[100px] bg-[#13101C] border-purple-primary/20 text-white focus:border-purple-light",
                                activeField === "marketingEffectiveness-main"
                                  ? "border-purple-light ring-1 ring-purple-light"
                                  : "",
                              )}
                              onFocus={() => handleFocus("marketingEffectiveness-main")}
                              onBlur={handleBlur}
                            />
                          </div>

                          <div className="bg-[#13101C] p-4 rounded-lg">
                            <h4 className="font-medium text-white mb-4">Additional Questions:</h4>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  1. Are our marketing messages tailored to the specific interests and needs of each
                                  target segment?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.implement.marketingEffectiveness.targetedMessages}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "implement",
                                      "marketingEffectiveness",
                                      "targetedMessages",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "marketingEffectiveness-targetedMessages"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("marketingEffectiveness-targetedMessages")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  2. How well do our campaigns perform in terms of conversion rates and return on
                                  investment (ROI)?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.implement.marketingEffectiveness.campaignPerformance}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "implement",
                                      "marketingEffectiveness",
                                      "campaignPerformance",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "marketingEffectiveness-campaignPerformance"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("marketingEffectiveness-campaignPerformance")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  3. Are we using the right channels to maximize reach and engagement?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.implement.marketingEffectiveness.channelStrategy}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "implement",
                                      "marketingEffectiveness",
                                      "channelStrategy",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "marketingEffectiveness-channelStrategy"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("marketingEffectiveness-channelStrategy")}
                                  onBlur={handleBlur}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Customer Experience */}
                    <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 bg-[#13101C] text-left"
                        onClick={() => toggleQuestionSection("customerExperience")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-primary text-white flex items-center justify-center text-sm">
                            4
                          </div>
                          <div>
                            <h3 className="font-medium text-white">Customer Experience</h3>
                            <p className="text-sm text-gray-400">
                              Are customers satisfied with their interactions across all touchpoints?
                            </p>
                          </div>
                        </div>
                        {expandedSection === "customerExperience" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>

                      {expandedSection === "customerExperience" && (
                        <div className="p-4 bg-[#0F0A19] space-y-6">
                          <div className="space-y-3">
                            <h4 className="font-medium text-white">
                              Main Question: Are customers satisfied with their interactions across all touchpoints?
                            </h4>
                            <Textarea
                              placeholder="Enter your answer for the main question..."
                              value={answers.implement.customerExperience.main}
                              onChange={(e:any) =>
                                handleUpdateAnswer("implement", "customerExperience", "main", e.target.value)
                              }
                              className={cn(
                                "min-h-[100px] bg-[#13101C] border-purple-primary/20 text-white focus:border-purple-light",
                                activeField === "customerExperience-main"
                                  ? "border-purple-light ring-1 ring-purple-light"
                                  : "",
                              )}
                              onFocus={() => handleFocus("customerExperience-main")}
                              onBlur={handleBlur}
                            />
                          </div>

                          <div className="bg-[#13101C] p-4 rounded-lg">
                            <h4 className="font-medium text-white mb-4">Additional Questions:</h4>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  1. Do customers report a seamless, consistent experience across online and offline
                                  channels?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.implement.customerExperience.omniChannelExperience}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "implement",
                                      "customerExperience",
                                      "omniChannelExperience",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "customerExperience-omniChannelExperience"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("customerExperience-omniChannelExperience")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  2. How effectively does our customer service resolve issues and meet expectations?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.implement.customerExperience.customerService}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "implement",
                                      "customerExperience",
                                      "customerService",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "customerExperience-customerService"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("customerExperience-customerService")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  3. Is customer feedback leading to continuous improvements in our service delivery?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.implement.customerExperience.continuousImprovement}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "implement",
                                      "customerExperience",
                                      "continuousImprovement",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "customerExperience-continuousImprovement"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("customerExperience-continuousImprovement")}
                                  onBlur={handleBlur}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <motion.div
                    className="flex justify-between mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      className="border-purple-primary/20 text-white hover:bg-purple-primary/20 transition-all duration-300 flex items-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      BACK
                    </Button>
                    <Button
                      onClick={() => handleSaveProgress(true)}
                      variant="outline"
                      className="border-purple-primary/20 bg-[#1A1625]/50 text-white flex items-center gap-2"
                      disabled={isSavingProgress}
                    >
                      {isSavingProgress
                        ? <Loader2 className="animate-spin" />
                        : <CheckCircle2 size={16} />}
                      {isSavingProgress ? "SAVING..." : "SAVE PROGRESS"}
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!isFormValid("implement")}
                      className={cn(
                        "bg-purple-primary hover:bg-purple-light text-white transition-all duration-300 flex items-center gap-2",
                        !isFormValid("implement")
                          ? "opacity-50 cursor-not-allowed"
                          : "shadow-lg shadow-purple-primary/20 hover:shadow-purple-light/30",
                      )}
                    >
                      NEXT
                      <ArrowRight size={16} />
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* MONITOR STEP */}
              {currentStep === "monitor" && (
                <div className="p-6 md:p-8 animate-fadeIn">
                  <motion.h2
                    className="text-xl font-semibold text-center mb-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    Monitor
                  </motion.h2>
                  <motion.p
                    className="text-center text-sm text-gray-300 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    Please provide detailed answers to all questions
                  </motion.p>

                  <div className="bg-gray-800/30 rounded-lg p-4 mb-6">
                    <p className="text-sm text-center">Monitoring Questions</p>
                    <p className="text-xs text-center text-gray-400">
                      Click on each subsection to view and answer the questions
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Performance Tracking */}
                    <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 bg-[#13101C] text-left"
                        onClick={() => toggleQuestionSection("performanceTracking")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-primary text-white flex items-center justify-center text-sm">
                            1
                          </div>
                          <div>
                            <h3 className="font-medium text-white">Performance Tracking</h3>
                            <p className="text-sm text-gray-400">Are we regularly measuring brand & product success?</p>
                          </div>
                        </div>
                        {expandedSection === "performanceTracking" ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>

                      {expandedSection === "performanceTracking" && (
                        <div className="p-4 bg-[#0F0A19] space-y-6">
                          <div className="space-y-3">
                            <h4 className="font-medium text-white">
                              Main Question: Are we regularly measuring brand & product success?
                            </h4>
                            <Textarea
                              placeholder="Enter your answer for the main question..."
                              value={answers.monitor.performanceTracking.main}
                              onChange={(e:any) =>
                                handleUpdateAnswer("monitor", "performanceTracking", "main", e.target.value)
                              }
                              className={cn(
                                "min-h-[100px] bg-[#13101C] border-purple-primary/20 text-white focus:border-purple-light",
                                activeField === "performanceTracking-main"
                                  ? "border-purple-light ring-1 ring-purple-light"
                                  : "",
                              )}
                              onFocus={() => handleFocus("performanceTracking-main")}
                              onBlur={handleBlur}
                            />
                          </div>

                          <div className="bg-[#13101C] p-4 rounded-lg">
                            <h4 className="font-medium text-white mb-4">Additional Questions:</h4>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  1. Are our KPIs clearly defined and aligned with our overall business goals?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.monitor.performanceTracking.kpiAlignment}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer("monitor", "performanceTracking", "kpiAlignment", e.target.value)
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "performanceTracking-kpiAlignment"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("performanceTracking-kpiAlignment")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  2. How frequently are performance metrics updated and reviewed by our team?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.monitor.performanceTracking.metricsReview}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "monitor",
                                      "performanceTracking",
                                      "metricsReview",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "performanceTracking-metricsReview"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("performanceTracking-metricsReview")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                   3. Are our tracking systems integrated and automated to provide real-time insights?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.monitor.performanceTracking.trackingSystems}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "monitor",
                                      "performanceTracking",
                                      "trackingSystems",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "performanceTracking-trackingSystems"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("performanceTracking-trackingSystems")}
                                  onBlur={handleBlur}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Consumer Sentiment Analysis */}
                    <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between p-4 bg-[#13101C] text-left"
                        onClick={() => toggleQuestionSection("consumerSentiment")}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-primary text-white flex items-center justify-center text-sm">
                            2
                          </div>
                          <div>
                            <h3 className="font-medium text-white">Consumer Sentiment Analysis</h3>
                            <p className="text-sm text-gray-400">How are customers responding to our offerings?</p>
                          </div>
                        </div>
                        {expandedSection === "consumerSentiment" ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>

                      {expandedSection === "consumerSentiment" && (
                        <div className="p-4 bg-[#0F0A19] space-y-6">
                          <div className="space-y-3">
                            <h4 className="font-medium text-white">
                              Main Question: How are customers responding to our offerings?
                            </h4>
                            <Textarea
                              placeholder="Enter your answer for the main question..."
                              value={answers.monitor.consumerSentiment.main}
                              onChange={(e:any) =>
                                handleUpdateAnswer("monitor", "consumerSentiment", "main", e.target.value)
                              }
                              className={cn(
                                "min-h-[100px] bg-[#13101C] border-purple-primary/20 text-white focus:border-purple-light",
                                activeField === "consumerSentiment-main"
                                  ? "border-purple-light ring-1 ring-purple-light"
                                  : "",
                              )}
                              onFocus={() => handleFocus("consumerSentiment-main")}
                              onBlur={handleBlur}
                            />
                          </div>

                          <div className="bg-[#13101C] p-4 rounded-lg">
                            <h4 className="font-medium text-white mb-4">Additional Questions:</h4>

                            <div className="space-y-4">
                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  1. Are we systematically collecting customer feedback across multiple channels?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.monitor.consumerSentiment.feedbackCollection}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "monitor",
                                      "consumerSentiment",
                                      "feedbackCollection",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "consumerSentiment-feedbackCollection"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("consumerSentiment-feedbackCollection")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  2. Do our sentiment analysis tools provide actionable insights on customer
                                  satisfaction?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.monitor.consumerSentiment.sentimentAnalysis}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "monitor",
                                      "consumerSentiment",
                                      "sentimentAnalysis",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "consumerSentiment-sentimentAnalysis"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("consumerSentiment-sentimentAnalysis")}
                                  onBlur={handleBlur}
                                />
                              </div>

                              <div className="space-y-2">
                                <p className="text-sm text-white">
                                  3. Are we effectively monitoring social media and online review platforms?
                                </p>
                                <Textarea
                                  placeholder="Enter your answer..."
                                  value={answers.monitor.consumerSentiment.socialMediaMonitoring}
                                  onChange={(e:any) =>
                                    handleUpdateAnswer(
                                      "monitor",
                                      "consumerSentiment",
                                      "socialMediaMonitoring",
                                      e.target.value,
                                    )
                                  }
                                  className={cn(
                                    "min-h-[80px] bg-[#0F0A19] border-purple-primary/20 text-white focus:border-purple-light",
                                    activeField === "consumerSentiment-socialMediaMonitoring"
                                      ? "border-purple-light ring-1 ring-purple-light"
                                      : "",
                                  )}
                                  onFocus={() => handleFocus("consumerSentiment-socialMediaMonitoring")}
                                  onBlur={handleBlur}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <motion.div
                    className="flex justify-between mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Button
                      onClick={onBack}
                      variant="outline"
                      className="border-purple-primary/20 text-white hover:bg-purple-primary/20 transition-all duration-300 flex items-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      BACK
                    </Button>
                    <Button
                      onClick={() => handleSaveProgress(true)}
                      variant="outline"
                      className="border-purple-primary/20 bg-[#1A1625]/50 text-white flex items-center gap-2"
                      disabled={isSavingProgress}
                    >
                      {isSavingProgress
                        ? <Loader2 className="animate-spin" />
                        : <CheckCircle2 size={16} />}
                      {isSavingProgress ? "SAVING..." : "SAVE PROGRESS"}
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!isFormValid("monitor")}
                      className={cn(
                        "bg-purple-primary hover:bg-purple-light text-white transition-all duration-300 flex items-center gap-2",
                        !isFormValid("monitor")
                          ? "opacity-50 cursor-not-allowed"
                          : "shadow-lg shadow-purple-primary/20 hover:shadow-purple-light/30",
                      )}
                    >
                      NEXT
                      <ArrowRight size={16} />
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* REVIEW STEP */}
              {currentStep === "review" && (
                <div className="p-6 md:p-8 animate-fadeIn">
                  <motion.h2
                    className="text-xl font-semibold text-center mb-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    Review Your Answers
                  </motion.h2>
                  <motion.p
                    className="text-center text-sm text-gray-300 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    Please review all your answers carefully.
                  </motion.p>

                  <div className="space-y-4">
                    {/* Assessment Questions */}
                    <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between bg-purple-primary text-white p-3 text-left"
                        onClick={() => toggleSection("assessment")}
                      >
                        <span className="font-medium">Assessment Questions</span>
                        {expandedSections.assessment ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>

                      {expandedSections.assessment && (
                        <div className="p-4 bg-[#13101C] space-y-6">
                          {/* Market Research Quality */}
                          <div className="border-b border-purple-primary/20 pb-4">
                            <h3 className="font-medium text-white mb-2">Market Research Quality</h3>
                            <p className="text-sm text-gray-400 mb-2">
                              Have we gathered sufficient market & consumer insights?
                            </p>
                            <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                              {answers.assess.marketResearch.main || "No answer provided"}
                            </div>

                            <div className="mt-3 space-y-3">
                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  1. Are our research sources diverse and up to date?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.assess.marketResearch.researchSources || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  2. Have we validated our research findings with external experts?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.assess.marketResearch.validatedFindings || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  3. Are we leveraging AI and digital tools for better consumer insights?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.assess.marketResearch.aiTools || "No answer provided"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Consumer Segmentation */}
                          <div className="border-b border-purple-primary/20 pb-4">
                            <h3 className="font-medium text-white mb-2">Consumer Segmentation</h3>
                            <p className="text-sm text-gray-400 mb-2">Do we understand our ideal customers?</p>
                            <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                              {answers.assess.consumerSegmentation.main || "No answer provided"}
                            </div>

                            <div className="mt-3 space-y-3">
                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  1. Are we continuously updating our customer segments based on new data?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.assess.consumerSegmentation.updatingSegments || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  2. Have we identified behavioral patterns that impact purchasing decisions?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.assess.consumerSegmentation.behavioralPatterns || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  3. Are our segmentation criteria relevant for targeting?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.assess.consumerSegmentation.targetingCriteria || "No answer provided"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Competitive Analysis */}
                          <div className="border-b border-purple-primary/20 pb-4">
                            <h3 className="font-medium text-white mb-2">Competitive Analysis</h3>
                            <p className="text-sm text-gray-400 mb-2">Have we benchmarked against competitors?</p>
                            <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                              {answers.assess.competitiveAnalysis.main || "No answer provided"}
                            </div>

                            <div className="mt-3 space-y-3">
                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  1. Have we identified our competitors' strengths and weaknesses?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.assess.competitiveAnalysis.competitorStrengths || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  2. Are we monitoring market trends and competitive landscape changes?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.assess.competitiveAnalysis.marketTrends || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  3. Do we have a clear competitive advantage in the market?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.assess.competitiveAnalysis.competitiveAdvantage || "No answer provided"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Problem-Solution Fit */}
                          <div>
                            <h3 className="font-medium text-white mb-2">Problem-Solution Fit</h3>
                            <p className="text-sm text-gray-400 mb-2">
                              Do our offerings align with customer pain points?
                            </p>
                            <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                              {answers.assess.problemSolutionFit.main || "No answer provided"}
                            </div>

                            <div className="mt-3 space-y-3">
                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  1. Have we validated our assumptions about customer pain points with real user data?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.assess.problemSolutionFit.validatedAssumptions || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  2. How do customers currently solve their problems without our product?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.assess.problemSolutionFit.customerProblems || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  3. What percentage of potential customers express dissatisfaction with existing
                                  solutions?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.assess.problemSolutionFit.customerDissatisfaction || "No answer provided"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Implementation Questions */}
                    <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between bg-purple-primary text-white p-3 text-left"
                        onClick={() => toggleSection("implementation")}
                      >
                        <span className="font-medium">Implementation Questions</span>
                        {expandedSections.implementation ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>

                      {expandedSections.implementation && (
                        <div className="p-4 bg-[#13101C] space-y-6">
                          {/* Brand Positioning */}
                          <div className="border-b border-purple-primary/20 pb-4">
                            <h3 className="font-medium text-white mb-2">Brand Positioning</h3>
                            <p className="text-sm text-gray-400 mb-2">
                              Is our brand differentiation clear to consumers?
                            </p>
                            <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                              {answers.implement.brandPositioning.main || "No answer provided"}
                            </div>

                            <div className="mt-3 space-y-3">
                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  1. Do our brand values resonate with our target audience?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.implement.brandPositioning.brandValues || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  2. How is our brand perceived compared to competitors?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.implement.brandPositioning.brandPerception || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  3. Is our brand messaging consistent across all touchpoints?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.implement.brandPositioning.brandConsistency || "No answer provided"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Product Development */}
                          <div className="border-b border-purple-primary/20 pb-4">
                            <h3 className="font-medium text-white mb-2">Product Development</h3>
                            <p className="text-sm text-gray-400 mb-2">
                              Are products developed based on customer needs?
                            </p>
                            <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                              {answers.implement.productDevelopment.main || "No answer provided"}
                            </div>

                            <div className="mt-3 space-y-3">
                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  1. How frequently are customer insights integrated into product iterations?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.implement.productDevelopment.customerInsights || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  2. Does our product roadmap reflect emerging trends and evolving consumer demands?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.implement.productDevelopment.productRoadmap || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  3. Are usability testing and beta feedback effectively driving product improvements?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.implement.productDevelopment.usabilityTesting || "No answer provided"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Marketing Effectiveness */}
                          <div className="border-b border-purple-primary/20 pb-4">
                            <h3 className="font-medium text-white mb-2">Marketing Effectiveness</h3>
                            <p className="text-sm text-gray-400 mb-2">
                              Do campaigns effectively engage target audiences?
                            </p>
                            <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                              {answers.implement.marketingEffectiveness.main || "No answer provided"}
                            </div>

                            <div className="mt-3 space-y-3">
                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  1. Are our marketing messages tailored to the specific interests and needs of each
                                  target segment?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.implement.marketingEffectiveness.targetedMessages || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  2. How well do our campaigns perform in terms of conversion rates and return on
                                  investment (ROI)?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.implement.marketingEffectiveness.campaignPerformance || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  3. Are we using the right channels to maximize reach and engagement?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.implement.marketingEffectiveness.channelStrategy || "No answer provided"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Customer Experience */}
                          <div>
                            <h3 className="font-medium text-white mb-2">Customer Experience</h3>
                            <p className="text-sm text-gray-400 mb-2">
                              Are customers satisfied with their interactions across all touchpoints?
                            </p>
                            <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                              {answers.implement.customerExperience.main || "No answer provided"}
                            </div>

                            <div className="mt-3 space-y-3">
                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  1. Do customers report a seamless, consistent experience across online and offline
                                  channels?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.implement.customerExperience.omniChannelExperience || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  2. How effectively does our customer service resolve issues and meet expectations?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.implement.customerExperience.customerService || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  3. Is customer feedback leading to continuous improvements in our service delivery?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.implement.customerExperience.continuousImprovement || "No answer provided"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Monitoring Questions */}
                    <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between bg-purple-primary text-white p-3 text-left"
                        onClick={() => toggleSection("monitoring")}
                      >
                        <span className="font-medium">Monitoring Questions</span>
                        {expandedSections.monitoring ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>

                      {expandedSections.monitoring && (
                        <div className="p-4 bg-[#13101C] space-y-6">
                          {/* Performance Tracking */}
                          <div className="border-b border-purple-primary/20 pb-4">
                            <h3 className="font-medium text-white mb-2">Performance Tracking</h3>
                            <p className="text-sm text-gray-400 mb-2">
                              Are we regularly measuring brand & product success?
                            </p>
                            <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                              {answers.monitor.performanceTracking.main || "No answer provided"}
                            </div>

                            <div className="mt-3 space-y-3">
                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  1. Are our KPIs clearly defined and aligned with our overall business goals?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.monitor.performanceTracking.kpiAlignment || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  2. How frequently are performance metrics updated and reviewed by our team?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.monitor.performanceTracking.metricsReview || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  3. Are our tracking systems integrated and automated to provide real-time insights?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.monitor.performanceTracking.trackingSystems || "No answer provided"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Consumer Sentiment Analysis */}
                          <div>
                            <h3 className="font-medium text-white mb-2">Consumer Sentiment Analysis</h3>
                            <p className="text-sm text-gray-400 mb-2">How are customers responding to our offerings?</p>
                            <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                              {answers.monitor.consumerSentiment.main || "No answer provided"}
                            </div>

                            <div className="mt-3 space-y-3">
                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  1. Are we systematically collecting customer feedback across multiple channels?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.monitor.consumerSentiment.feedbackCollection || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  2. Do our sentiment analysis tools provide actionable insights on customer
                                  satisfaction?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.monitor.consumerSentiment.sentimentAnalysis || "No answer provided"}
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-gray-400 mb-1">
                                  3. Are we effectively monitoring social media and online review platforms?
                                </p>
                                <div className="bg-[#0F0A19] p-3 rounded text-sm text-white">
                                  {answers.monitor.consumerSentiment.socialMediaMonitoring || "No answer provided"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <motion.div
                    className="flex justify-between mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    <Button
                      onClick={onBack}
                      variant="outline"
                      className="border-purple-primary/20 text-white hover:bg-purple-primary/20 transition-all duration-300 flex items-center gap-2"
                    >
                      <ArrowLeft size={16} />
                      BACK
                    </Button>

                    <Button
                      onClick={handleNext}
                      className="bg-purple-primary hover:bg-purple-light text-white transition-all duration-300 shadow-lg shadow-purple-primary/20 hover:shadow-purple-light/30 flex items-center gap-2"
                    >
                      NEXT
                      <ArrowRight size={16} />
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* SUBMIT STEP */}
              {currentStep === "submit" && (
                <div className="p-6 md:p-8 min-h-[500px] flex flex-col items-center justify-center animate-fadeIn">
                  <div className="bg-[#13101C] rounded-lg shadow-lg p-8 max-w-2xl w-full text-center border border-purple-primary/20">
                    <motion.div
                      className="w-16 h-16 rounded-full bg-purple-primary flex items-center justify-center mx-auto mb-6"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Send className="h-7 w-7 text-white" />
                    </motion.div>

                    <motion.h2
                      className="text-xl font-semibold text-white mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      Ready to Submit Your Advanced Test
                    </motion.h2>

                    <motion.div
                      className="bg-[#0F0A19] p-4 rounded-lg mb-6 text-sm text-left"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      <p className="text-gray-300 mb-2">
                        By clicking "Submit Final" below, your answers will be submitted and you will not be able to
                        make further changes.
                      </p>
                      <p className="text-gray-300">
                        Your comprehensive assessment provides valuable insights into your brand strategy approach and
                        will help identify areas for potential improvement.
                      </p>
                    </motion.div>

                    <motion.p
                      className="text-gray-400 mb-8"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      Thank you for completing the Advanced Test. Your detailed responses will be analyzed to provide
                      tailored recommendations.
                    </motion.p>

                    <motion.div
                      className="flex justify-between"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                    >
                      <Button
                        onClick={onBack}
                        variant="outline"
                        className="border-purple-primary/20 text-white hover:bg-purple-primary/20 transition-all duration-300 flex items-center gap-2"
                      >
                        <ArrowLeft size={16} />
                        BACK
                      </Button>

                      <Button
                        onClick={handleCompleteTest}
                        className="bg-gradient-to-r from-purple-light to-purple-primary text-white flex items-center gap-2"
                        disabled={isCompletingTest}
                      >
                        {isCompletingTest
                          ? <Loader2 className="animate-spin" />
                          : "SUBMIT TEST"}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* RESULT STEP */}
              {currentStep === "result" && (
                <div className="p-6 md:p-8 animate-fadeIn">
                  {isAnalyzing ? (
                    <div className="min-h-[500px] flex flex-col items-center justify-center">
                      <motion.div
                        className="bg-[#13101C] rounded-xl shadow-lg p-8 max-w-md w-full text-center border border-purple-primary/20"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          className="relative w-24 h-24 mx-auto mb-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-purple-primary animate-spin"></div>
                          <div className="absolute inset-2 rounded-full bg-purple-primary/10 flex items-center justify-center">
                            <BarChart4 className="h-10 w-10 text-purple-light opacity-70" />
                          </div>
                        </motion.div>

                        <motion.h3
                          className="text-xl font-semibold text-white mb-6"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        >
                          AI is analyzing your test responses and preparing insights...
                        </motion.h3>

                        <motion.div
                          className="space-y-3 text-sm text-gray-300"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.4 }}
                        >
                          <p className="flex items-center justify-center">
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3, delay: 0.5 }}
                            >
                              Processing your responses...
                            </motion.span>
                          </p>
                          <p className="flex items-center justify-center">
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3, delay: 1.0 }}
                            >
                              Evaluating against assessment criteria...
                            </motion.span>
                          </p>
                          <p className="flex items-center justify-center">
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3, delay: 1.5 }}
                            >
                              Generating personalized recommendations...
                            </motion.span>
                          </p>
                        </motion.div>

                        <motion.p
                          className="mt-8 text-xs text-gray-400"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 2.0 }}
                        >
                          This may take a minute. Please don't refresh the page.
                        </motion.p>
                      </motion.div>

                      <motion.div
                        className="flex justify-between w-full max-w-md mt-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <Button
                          onClick={onBackToSubmit}
                          variant="outline"
                          className="border-purple-primary/20 text-white hover:bg-purple-primary/20 transition-all duration-300"
                        >
                          BACK TO SUBMIT
                        </Button>

                        <Button
                          disabled
                          className="bg-purple-primary opacity-50 cursor-not-allowed text-white flex items-center gap-2"
                        >
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ANALYZING
                        </Button>
                      </motion.div>
                    </div>
                  ) : (
                    showResults && (
                      <>
                        <motion.h2
                          className="text-xl font-semibold text-center mb-2"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          Analysis Results
                        </motion.h2>
                        <motion.p
                          className="text-center text-sm text-gray-300 mb-6"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          An extensive analysis of your test responses.
                        </motion.p>

                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                        >
                          <Tabs
                            defaultValue="overview"
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="w-full"
                          >
                            <TabsList className="grid w-full grid-cols-2 bg-[#0F0A19]">
                              <TabsTrigger
                                value="overview"
                                className="data-[state=active]:bg-purple-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md py-2"
                              >
                                OVERVIEW
                              </TabsTrigger>
                              <TabsTrigger
                                value="details"
                                className="data-[state=active]:bg-purple-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md py-2"
                              >
                                DETAILS
                              </TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="mt-6">
                              <div className="bg-[#13101C] rounded-xl p-6 shadow-lg border border-purple-primary/20">
                                <motion.h3
                                  className="text-lg font-semibold text-center text-white mb-2"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.5, delay: 0.1 }}
                                >
                                  Performance Analysis
                                </motion.h3>
                                <motion.p
                                  className="text-sm text-center text-gray-300 mb-6"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                  Visualization of scores across key business metrics
                                </motion.p>

                                <motion.div
                                  className="max-w-4xl mx-auto h-[400px]"
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.5, delay: 0.3 }}
                                >
                                  <AdvancedRadarChartComponent
                                    results={evaluationresults}
                                    setChartImage={setChartImage} // Pass the callback
                                  />
                                </motion.div>

                                <motion.div
                                  className="mt-8 p-4 bg-[#0F0A19] rounded-lg border border-purple-primary/20"
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.5, delay: 0.4 }}
                                >
                                  <h4 className="font-medium text-white mb-2">Overall Assessment</h4>
                                  <p className="text-sm text-gray-300">
                                    {evaluationresults.overall || "No assessment available"}
                                  </p>
                                </motion.div>
                              </div>
                            </TabsContent>

                            <TabsContent value="details" className="mt-6">
                              <div className="bg-[#13101C] rounded-xl p-6 shadow-lg border border-purple-primary/20 space-y-4">
                                {/* Assess Section */}
                                <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                                  <button
                                    className="w-full flex items-center justify-between bg-purple-primary text-white p-3 text-left"
                                    onClick={() => toggleSection("assessment")}
                                  >
                                    <span className="font-medium">Assess</span>
                                    {expandedSections.assessment ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                  </button>

                                  {expandedSections.assessment && (
                                    <div className="p-4 space-y-4">
                                      <p className="text-sm text-gray-300 mb-2">
                                        Evaluation of market research quality, consumer segmentation, competitive analysis and problem-solution fit
                                      </p>

                                      {/* Market Research Quality */}
                                      <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                                        <button
                                          className="w-full flex items-center justify-between bg-[#0F0A19] p-3 text-left"
                                          onClick={() => toggleItem("marketResearch")}
                                        >
                                          <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-purple-primary mr-2"></div>
                                            <span className="font-medium text-white">Market Research Quality</span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="text-sm font-medium text-amber-500 mr-2">
                                              Score: {evaluationresults.scores["Market Research Quality"] || "N/A"}/10
                                            </span>
                                            {expandedItems.marketResearch ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                          </div>
                                        </button>

                                        {expandedItems.marketResearch && (
                                          <div className="p-3 bg-[#13101C]">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Feedback</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.feedback["Market Research Quality"] || "No feedback available"}
                                                </p>
                                              </div>

                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Recommendation</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.recommendations["Market Research Quality"] || "No recommendation available"}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Consumer Segmentation */}
                                      <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                                        <button
                                          className="w-full flex items-center justify-between bg-[#0F0A19] p-3 text-left"
                                          onClick={() => toggleItem("consumerSegmentation")}
                                        >
                                          <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-purple-primary mr-2"></div>
                                            <span className="font-medium text-white">Consumer Segmentation</span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="text-sm font-medium text-amber-500 mr-2">
                                              Score: {evaluationresults.scores["Consumer Segmentation"] || "N/A"}/10
                                            </span>
                                            {expandedItems.consumerSegmentation ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                          </div>
                                        </button>

                                        {expandedItems.consumerSegmentation && (
                                          <div className="p-3 bg-[#13101C]">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Feedback</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.feedback["Consumer Segmentation"] || "No feedback available"}
                                                </p>
                                              </div>

                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Recommendation</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.recommendations["Consumer Segmentation"] || "No recommendation available"}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Competitive Analysis */}
                                      <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                                        <button
                                          className="w-full flex items-center justify-between bg-[#0F0A19] p-3 text-left"
                                          onClick={() => toggleItem("competitiveAnalysis")}
                                        >
                                          <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-purple-primary mr-2"></div>
                                            <span className="font-medium text-white">Competitive Analysis</span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="text-sm font-medium text-green-500 mr-2">
                                              Score: {evaluationresults.scores["Competitive Analysis"] || "N/A"}/10
                                            </span>
                                            {expandedItems.competitiveAnalysis ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                          </div>
                                        </button>

                                        {expandedItems.competitiveAnalysis && (
                                          <div className="p-3 bg-[#13101C]">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Feedback</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.feedback["Competitive Analysis"] || "No feedback available"}
                                                </p>
                                              </div>

                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Recommendation</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.recommendations["Competitive Analysis"] || "No recommendation available"}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Problem-Solution Fit */}
                                      <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                                        <button
                                          className="w-full flex items-center justify-between bg-[#0F0A19] p-3 text-left"
                                          onClick={() => toggleItem("problemSolutionFit")}
                                        >
                                          <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-purple-primary mr-2"></div>
                                            <span className="font-medium text-white">Problem-Solution Fit</span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="text-sm font-medium text-amber-500 mr-2">
                                              Score: {evaluationresults.scores["Problem-Solution Fit"] || "N/A"}/10
                                            </span>
                                            {expandedItems.problemSolutionFit ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                          </div>
                                        </button>

                                        {expandedItems.problemSolutionFit && (
                                          <div className="p-3 bg-[#13101C]">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Feedback</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.feedback["Problem-Solution Fit"] || "No feedback available"}
                                                </p>
                                              </div>

                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Recommendation</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.recommendations["Problem-Solution Fit"] || "No recommendation available"}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Implement Section */}
                                <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                                  <button
                                    className="w-full flex items-center justify-between bg-purple-primary text-white p-3 text-left"
                                    onClick={() => toggleSection("implementation")}
                                  >
                                    <span className="font-medium">Implement</span>
                                    {expandedSections.implementation ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                  </button>

                                  {expandedSections.implementation && (
                                    <div className="p-4 space-y-4">
                                      <p className="text-sm text-gray-300 mb-2">
                                        Evaluation of brand positioning, product development, marketing effectiveness and customer experience
                                      </p>

                                      {/* Brand Positioning */}
                                      <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                                        <button
                                          className="w-full flex items-center justify-between bg-[#0F0A19] p-3 text-left"
                                          onClick={() => toggleItem("brandPositioning")}
                                        >
                                          <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-purple-primary mr-2"></div>
                                            <span className="font-medium text-white">Brand Positioning</span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="text-sm font-medium text-amber-500 mr-2">
                                              Score: {evaluationresults.scores["Brand Positioning"] || "N/A"}/10
                                            </span>
                                            {expandedItems.brandPositioning ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                          </div>
                                        </button>

                                        {expandedItems.brandPositioning && (
                                          <div className="p-3 bg-[#13101C]">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Feedback</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.feedback["Brand Positioning"] || "No feedback available"}
                                                </p>
                                              </div>

                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Recommendation</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.recommendations["Brand Positioning"] || "No recommendation available"}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Product Development */}
                                      <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                                        <button
                                          className="w-full flex items-center justify-between bg-[#0F0A19] p-3 text-left"
                                          onClick={() => toggleItem("productDevelopment")}
                                        >
                                          <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-purple-primary mr-2"></div>
                                            <span className="font-medium text-white">Product Development</span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="text-sm font-medium text-amber-500 mr-2">
                                              Score: {evaluationresults.scores["Product Development"] || "N/A"}/10
                                            </span>
                                            {expandedItems.productDevelopment ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                          </div>
                                        </button>

                                        {expandedItems.productDevelopment && (
                                          <div className="p-3 bg-[#13101C]">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Feedback</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.feedback["Product Development"] || "No feedback available"}
                                                </p>
                                              </div>

                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Recommendation</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.recommendations["Product Development"] || "No recommendation available"}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Marketing Effectiveness */}
                                      <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                                        <button
                                          className="w-full flex items-center justify-between bg-[#0F0A19] p-3 text-left"
                                          onClick={() => toggleItem("marketingEffectiveness")}
                                        >
                                          <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-purple-primary mr-2"></div>
                                            <span className="font-medium text-white">Marketing Effectiveness</span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="text-sm font-medium text-green-500 mr-2">
                                              Score: {evaluationresults.scores["Marketing Effectiveness"] || "N/A"}/10
                                            </span>
                                            {expandedItems.marketingEffectiveness ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                          </div>
                                        </button>

                                        {expandedItems.marketingEffectiveness && (
                                          <div className="p-3 bg-[#13101C]">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Feedback</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.feedback["Marketing Effectiveness"] || "No feedback available"}
                                                </p>
                                              </div>

                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Recommendation</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.recommendations["Marketing Effectiveness"] || "No recommendation available"}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Customer Experience */}
                                      <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                                        <button
                                          className="w-full flex items-center justify-between bg-[#0F0A19] p-3 text-left"
                                          onClick={() => toggleItem("customerExperience")}
                                        >
                                          <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-purple-primary mr-2"></div>
                                            <span className="font-medium text-white">Customer Experience</span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="text-sm font-medium text-amber-500 mr-2">
                                              Score: {evaluationresults.scores["Customer Experience"] || "N/A"}/10
                                            </span>
                                            {expandedItems.customerExperience ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                          </div>
                                        </button>

                                        {expandedItems.customerExperience && (
                                          <div className="p-3 bg-[#13101C]">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Feedback</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.feedback["Customer Experience"] || "No feedback available"}
                                                </p>
                                              </div>

                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Recommendation</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.recommendations["Customer Experience"] || "No recommendation available"}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {/* Monitor Section */}
                                <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                                  <button
                                    className="w-full flex items-center justify-between bg-purple-primary text-white p-3 text-left"
                                    onClick={() => toggleSection("monitoring")}
                                  >
                                    <span className="font-medium">Monitor</span>
                                    {expandedSections.monitoring ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                  </button>

                                  {expandedSections.monitoring && (
                                    <div className="p-4 space-y-4">
                                      <p className="text-sm text-gray-300 mb-2">
                                        Evaluation of performance tracking and consumer sentiment analysis
                                      </p>

                                      {/* Performance Tracking */}
                                      <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                                        <button
                                          className="w-full flex items-center justify-between bg-[#0F0A19] p-3 text-left"
                                          onClick={() => toggleItem("performanceTracking")}
                                        >
                                          <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-purple-primary mr-2"></div>
                                            <span className="font-medium text-white">Performance Tracking</span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="text-sm font-medium text-amber-500 mr-2">
                                              Score: {evaluationresults.scores["Performance Tracking"] || "N/A"}/10
                                            </span>
                                            {expandedItems.performanceTracking ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                          </div>
                                        </button>

                                        {expandedItems.performanceTracking && (
                                          <div className="p-3 bg-[#13101C]">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Feedback</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.feedback["Performance Tracking"] || "No feedback available"}
                                                </p>
                                              </div>

                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Recommendation</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.recommendations["Performance Tracking"] || "No recommendation available"}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      {/* Consumer Sentiment */}
                                      <div className="border border-purple-primary/20 rounded-lg overflow-hidden">
                                        <button
                                          className="w-full flex items-center justify-between bg-[#0F0A19] p-3 text-left"
                                          onClick={() => toggleItem("consumerSentiment")}
                                        >
                                          <div className="flex items-center">
                                            <div className="w-2 h-2 rounded-full bg-purple-primary mr-2"></div>
                                            <span className="font-medium text-white">Consumer Sentiment</span>
                                          </div>
                                          <div className="flex items-center">
                                            <span className="text-sm font-medium text-amber-500 mr-2">
                                              Score: {evaluationresults.scores["Consumer Sentiment"] || "N/A"}/10
                                            </span>
                                            {expandedItems.consumerSentiment ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                          </div>
                                        </button>

                                        {expandedItems.consumerSentiment && (
                                          <div className="p-3 bg-[#13101C]">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Feedback</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.feedback["Consumer Sentiment"] || "No feedback available"}
                                                </p>
                                              </div>

                                              <div className="bg-[#0F0A19] p-3 rounded">
                                                <h4 className="text-xs font-medium text-gray-400 mb-1">Recommendation</h4>
                                                <p className="text-sm text-gray-300">
                                                  {evaluationresults.recommendations["Consumer Sentiment"] || "No recommendation available"}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TabsContent>
                          </Tabs>
                        </motion.div>

                        <motion.div
                          className="flex justify-between mt-8"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.5 }}
                        >
                          <Button
                            onClick={onBackToSubmit}
                            variant="outline"
                            className="border-purple-primary/20 text-white hover:bg-purple-primary/20 transition-all duration-300"
                          >
                            BACK TO SUBMIT
                          </Button>

                          <Button
                            onClick={onBackToTests}
                            className="bg-purple-primary hover:bg-purple-light text-white transition-all duration-300 shadow-lg shadow-purple-primary/20 hover:shadow-purple-light/30"
                          >
                            GO BACK TO TESTS
                          </Button>

                          <PDFDownloadLink
                            document={<EvaluationResultsPDF results={evaluationresults} chartImage={chartImage || ''} />}
                            fileName="evaluation_results.pdf"
                          >
                            {({ loading }) => (
                              <Button
                                disabled={loading || !chartImage}
                                className={cn(
                                  "bg-purple-primary hover:bg-purple-light text-white transition-all duration-300 shadow-lg shadow-purple-primary/20 hover:shadow-purple-light/30 flex items-center gap-2",
                                  (loading || !chartImage) && "opacity-50 cursor-not-allowed"
                                )}
                              >
                                <Printer size={16} />
                                {loading ? 'GENERATING PDF...' : 'PRINT RESULTS'}
                              </Button>
                            )}
                          </PDFDownloadLink>
                        </motion.div>
                      </>
                    )
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

interface RadarChartProps {
  results: {
    scores: Record<string, number>;
  };
  setChartImage: (image: string) => void;
}

function AdvancedRadarChartComponent({ results , setChartImage }: RadarChartProps) {
  const chartRef = useRef<any>(null); // Ref to access the chart instance
  
  // Extract score keys and values
  const scoreKeys = Object.keys(results?.scores || {});
  if (scoreKeys.length === 0) {
    return <div>No data available</div>;
  }
  const scoreValues = scoreKeys.map((key) => results.scores[key]);

  // Chart.js data configuration
  const data = {
    labels: scoreKeys, // e.g., ["Market Research Quality", "Consumer Preference", ...]
    datasets: [
      {
        label: 'Performance Scores',
        data: scoreValues,
        backgroundColor: 'rgba(0, 123, 255, 0.3)', // Semi-transparent blue fill
        borderColor: '#007bff', // Blue border
        borderWidth: 2,
        pointBackgroundColor: '#007bff',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Chart.js options for customization
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
          font: {
            size: 16, // Larger font for better readability
          },
          backdropColor: 'rgba(0,0,0,0)', // Clear background on ticks
        },
        pointLabels: {
          font: {
            size: 16, // Larger font for axis labels
          },
        },
        grid: {
          color: 'rgba(255,255,255,0.15)',
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          font: {
            size: 16, // Larger font for legend
          },
        },
      },
      setImagePlugin: {
        id: 'setImagePlugin',
        afterRender: (chart: any) => {
          if (setChartImage) {
            setChartImage(chart.toBase64Image());
          }
        },
      },
    },
  };

  // Render the chart in a centered container with limited width
  return (
    <div style={{ width: '100%', height: '100%', margin: '0 auto' }}>
      <Radar
        ref={chartRef}
        data={data}
        options={options}
        plugins={[options.plugins.setImagePlugin]}
      />
    </div>
  );
}