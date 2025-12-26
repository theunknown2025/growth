"use client"

import { useRef, useState, useEffect } from "react"
import { PDFDownloadLink } from '@react-pdf/renderer';
import EvaluationResultsPDF from "../../evaluatio-results-pdf";
import { useRouter } from "next/navigation"
import { Button } from "@/shadcn/ui/button"
import { Radar } from 'react-chartjs-2';
import Chart from 'chart.js/auto'; 
import { RadialLinearScale } from 'chart.js'; 
import { CheckCircle2 } from "lucide-react"
import { useCompleteSimpleEvaluation, useSaveSimpleEvaluationProgress, useGetSimpleEvaluationById } from "@/actions/evaluation"
import { Progress } from "@/shadcn/ui/progress"
import { toast } from "sonner"

import {
  ClipboardList,
  LineChart,
  Wrench,
  FileText,
  Send,
  BarChart4,
  ChevronDown,
  Play,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Printer,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs"
import { cn } from "@/shadcn/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { TestAnswers , TestStep } from "@/types/evaluation"
import { useAnswerSimpleEvaluation } from "@/actions/evaluation"

Chart.register(RadialLinearScale);

export function EvaluationSimpleTestView() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<TestStep>("assess")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [evaluationresults, setEvaluationResults] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    assessment: true,
    implementation: false,
    monitoring: false,
  })
  const [activeTab, setActiveTab] = useState("overview")
  const [animatingStep, setAnimatingStep] = useState(false)
  const [isCompletingTest, setIsCompletingTest] = useState(false)
  const [isSavingProgress, setIsSavingProgress] = useState(false)
  const [testLoaded, setTestLoaded] = useState(false)
  const { answerSimpleEvaluation } = useAnswerSimpleEvaluation()
  const { saveProgress } = useSaveSimpleEvaluationProgress()
  const { completeTest } = useCompleteSimpleEvaluation()

  // Get test ID from URL if it exists (for resuming a saved test)
  const [testId, setTestId] = useState<string | null>(null)
  
  // Use effect to safely grab the URL parameters after component mounts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) setTestId(id);
  }, []);
  
  // Use SWR to fetch saved test data if testId exists
  const { simpleevaluation, simpleevaluationLoading, simpleevaluationError } = 
    useGetSimpleEvaluationById(testId || '');

  const [answers, setAnswers] = useState<TestAnswers>({
    _id: "",
    assess: {
      marketResearch: "",
      consumerSegmentation: "",
      competitiveAnalysis: "",
      problemSolutionFit: "",
    },
    monitor: {
      performanceTracking: "",
      consumerSentiment: "",
    },
    implement: {
      brandPositioning: "",
      productDevelopment: "",
      marketingEffectiveness: "",
      customerExperience: "",
    },
    status: "pending",
    createdAt: new Date().toISOString(),
  })

  const [progress, setProgress] = useState(0)
  
  // Load saved answers when data is fetched
  useEffect(() => {
    if (simpleevaluation && !testLoaded) {
      console.log("Loading saved test data:", simpleevaluation);
      
      // Set answers from loaded test data
      setAnswers({
        _id: simpleevaluation._id,
        assess: {
          marketResearch: simpleevaluation.answers.assess.marketResearch || "",
          consumerSegmentation: simpleevaluation.answers.assess.consumerSegmentation || "",
          competitiveAnalysis: simpleevaluation.answers.assess.competitiveAnalysis || "",
          problemSolutionFit: simpleevaluation.answers.assess.problemSolutionFit || "",
        },
        implement: {
          brandPositioning: simpleevaluation.answers.implement.brandPositioning || "",
          productDevelopment: simpleevaluation.answers.implement.productDevelopment || "",
          marketingEffectiveness: simpleevaluation.answers.implement.marketingEffectiveness || "",
          customerExperience: simpleevaluation.answers.implement.customerExperience || "",
        },
        monitor: {
          performanceTracking: simpleevaluation.answers.monitor.performanceTracking || "",
          consumerSentiment: simpleevaluation.answers.monitor.consumerSentiment || "",
        },
        status: simpleevaluation.status,
        createdAt: simpleevaluation.createdAt,
      });
      
      setProgress(simpleevaluation.progress || 0);
      
      // If test is already completed, show the results right away
      if (simpleevaluation.status === 'completed') {
        setEvaluationResults(simpleevaluation);
        setCurrentStep('result');
        setShowResults(true);
      }
      
      setTestLoaded(true);
    }
  }, [simpleevaluation, testLoaded]);
  
  // Add event listener for save progress button clicks
  useEffect(() => {
    const handleSaveProgressEvent = () => {
      handleSaveProgress(true);
    };
    
    window.addEventListener('save-progress', handleSaveProgressEvent);
    
    return () => {
      window.removeEventListener('save-progress', handleSaveProgressEvent);
    };
  }, [answers]); // Re-add listener when answers change
  
  // Improved progress calculation function to count non-empty answers
  const calculateProgress = () => {
    if (!testLoaded) return; // Skip automatic calculation while loading saved data
    
    let totalQuestions = 0;
    let answeredQuestions = 0;
    
    // Count assess section questions and answers
    Object.entries(answers.assess).forEach(([_, value]) => {
      totalQuestions++;
      if (value && value.trim().length > 0) {
        answeredQuestions++;
      }
    });
    
    // Count implement section questions and answers
    Object.entries(answers.implement).forEach(([_, value]) => {
      totalQuestions++;
      if (value && value.trim().length > 0) {
        answeredQuestions++;
      }
    });
    
    // Count monitor section questions and answers
    Object.entries(answers.monitor).forEach(([_, value]) => {
      totalQuestions++;
      if (value && value.trim().length > 0) {
        answeredQuestions++;
      }
    });
    
    // Calculate and set progress percentage
    const calculatedProgress = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
    setProgress(calculatedProgress);
  };
  
  // Update progress when answers change
  useEffect(() => {
    calculateProgress();
  }, [answers, testLoaded]);

  // Handle next step navigation 
  const handleNext = () => {
    // Auto-save progress when moving to next step
    if (answers._id || progress > 0) {
      handleSaveProgress(false);
    }
    
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
    setIsAnalyzing(true);
    setCurrentStep("result");
    
    let result;
    
    try {
      // If we already have a test ID, use completeTest instead of creating a new test
      if (testId || answers._id) {
        // Use existing test ID
        const id = testId || answers._id;
        result = await completeTest(id);
      } else {
        // Create new test if no existing test found
        result = await answerSimpleEvaluation(answers);
      }
      
      setEvaluationResults(result);
      setIsAnalyzing(false);
      setShowResults(true);
    } catch (error) {
      console.error('Error submitting test:', error);
      toast.error('Failed to submit test');
      setIsAnalyzing(false);
    }
  }

  const handleUpdateAnswer = (section: keyof TestAnswers, field: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: value,
      },
    }))
  }

  const handleBackToTests = () => {
    router.push("/dashboard/evaluation")
  }

  const toggleSection = (section: string | number | symbol) => {
    const key = section as keyof typeof expandedSections;
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const getStepName = (step: TestStep): string => {
    return step.charAt(0).toUpperCase() + step.slice(1)
  }

  const getStepNumber = (step: TestStep): number => {
    return steps.indexOf(step) + 1
  }

  const handleCompleteTest = async () => {
    if (!testId && !answers._id) {
      toast.error('Cannot complete test: No test ID found');
      return;
    }
    
    try {
      setIsCompletingTest(true);
      
      // Save progress first to ensure all answers are up-to-date
      const savedTest = await handleSaveProgress(false);
      
      // Complete the test using the correct ID
      const id = testId || answers._id || (savedTest && savedTest._id);
      if (!id) {
        throw new Error('No test ID available');
      }
      
      const result = await completeTest(id);
      setEvaluationResults(result);
      setCurrentStep("result");
      setShowResults(true);
      
      toast.success('Test completed successfully!');
    } catch (error) {
      console.error('Error completing test:', error);
      toast.error('Failed to complete test');
    } finally {
      setIsCompletingTest(false);
    }
  };

  const handleSaveProgress = async (showToast = true) => {
    try {
      setIsSavingProgress(true);
      
      // Prepare the data with the existing test ID if available
      const dataToSave = {
        ...answers,
        _id: answers._id || testId || ""
      };
      
      const savedTest = await saveProgress(dataToSave);
      
      // Update local state with saved test ID
      setAnswers(prev => ({
        ...prev,
        _id: savedTest._id,
        status: savedTest.status
      }));
      
      // Update URL with test ID (only if it's not already there)
      if (!testId && savedTest._id) {
        setTestId(savedTest._id);
        const url = new URL(window.location.href);
        url.searchParams.set('id', savedTest._id);
        window.history.replaceState({}, '', url.toString());
      }
      
      if (showToast) {
        toast.success('Progress saved successfully');
      }
      
      return savedTest;
    } catch (error) {
      console.error('Error saving progress:', error);
      if (showToast) {
        toast.error('Failed to save progress');
      }
      return null;
    } finally {
      setIsSavingProgress(false);
    }
  };

  const steps: TestStep[] = ["assess", "implement", "monitor" , "review", "submit", "result"]
  const currentStepIndex = steps.indexOf(currentStep)

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
            Simple Test
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
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
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
          className="flex items-center justify-between w-full max-w-4xl mx-auto mb-8 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Connecting line */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-purple-primary/20 -translate-y-1/2 z-0"></div>

          {steps.map((step, index) => {
            const stepNumber = index + 1
            const isActive = step === currentStep
            const isCompleted = steps.indexOf(step) < steps.indexOf(currentStep)

            return (
              <div key={step} className="flex flex-col items-center z-10">
                <motion.div
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500",
                    isActive
                      ? "bg-purple-primary text-white shadow-lg shadow-purple-primary/30"
                      : isCompleted
                        ? "bg-purple-primary/70 text-white"
                        : "bg-[#1A1625] text-gray-400",
                  )}
                  whileHover={isCompleted || isActive ? { scale: 1.1 } : {}}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {step === "assess" && <ClipboardList size={22} />}
                  {step === "monitor" && <LineChart size={22} />}
                  {step === "implement" && <Wrench size={22} />}
                  {step === "review" && <FileText size={22} />}
                  {step === "submit" && <Send size={22} />}
                  {step === "result" && <BarChart4 size={22} />}
                </motion.div>
                <span
                  className={cn(
                    "text-xs mt-2 transition-all duration-300",
                    isActive ? "text-white font-medium" : isCompleted ? "text-white/80" : "text-gray-400",
                  )}
                >
                  {getStepName(step)}
                </span>
              </div>
            )
          })}
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
              {currentStep === "assess" && (
                <AssessStep
                  answers={answers.assess}
                  onUpdateAnswer={(field, value) => handleUpdateAnswer("assess", field, value)}
                  onNext={handleNext}
                />
              )}

              {currentStep === "monitor" && (
                <MonitorStep
                  answers={answers.monitor}
                  onUpdateAnswer={(field, value) => handleUpdateAnswer("monitor", field, value)}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === "implement" && (
                <ImplementStep
                  answers={answers.implement}
                  onUpdateAnswer={(field, value) => handleUpdateAnswer("implement", field, value)}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}

              {currentStep === "review" && <ReviewStep answers={answers} onNext={handleNext} onBack={handleBack} />}

              {currentStep === "submit" && <SubmitStep onSubmit={handleSubmit} onBack={handleBack} />}

              {currentStep === "result" && (
                <ResultStep
                  isAnalyzing={isAnalyzing}
                  showResults={showResults}
                  evaluationResults={evaluationresults}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                  onBackToTests={handleBackToTests}
                  onBackToSubmit={() => setCurrentStep("submit")}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}

// Assess Step Component
interface AssessStepProps {
  answers: {
    marketResearch: string
    consumerSegmentation: string
    competitiveAnalysis: string
    problemSolutionFit: string
  }
  onUpdateAnswer: (field: string, value: string) => void
  onNext: () => void
}

function AssessStep({ answers, onUpdateAnswer, onNext }: AssessStepProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const isFormValid = () => {
    return Object.values(answers).every((answer) => answer.trim().length > 0)
  }

  return (
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
        Please provide detailed answers to the following questions:
      </motion.p>

      <div className="space-y-6">
        <QuestionCard
          number={1}
          title="Market Research Quality"
          question="Have we gathered sufficient market & consumer insights?"
          value={answers.marketResearch}
          onChange={(value) => onUpdateAnswer("marketResearch", value)}
          isFocused={focusedField === "marketResearch"}
          onFocus={() => setFocusedField("marketResearch")}
          onBlur={() => setFocusedField(null)}
          delay={0.1}
        />

        <QuestionCard
          number={2}
          title="Consumer Segmentation"
          question="Do we understand our ideal customers?"
          value={answers.consumerSegmentation}
          onChange={(value) => onUpdateAnswer("consumerSegmentation", value)}
          isFocused={focusedField === "consumerSegmentation"}
          onFocus={() => setFocusedField("consumerSegmentation")}
          onBlur={() => setFocusedField(null)}
          delay={0.2}
        />

        <QuestionCard
          number={3}
          title="Competitive Analysis"
          question="Have we benchmarked against competitors?"
          value={answers.competitiveAnalysis}
          onChange={(value) => onUpdateAnswer("competitiveAnalysis", value)}
          isFocused={focusedField === "competitiveAnalysis"}
          onFocus={() => setFocusedField("competitiveAnalysis")}
          onBlur={() => setFocusedField(null)}
          delay={0.3}
        />

        <QuestionCard
          number={4}
          title="Problem-Solution Fit"
          question="Do our offerings align with customer pain points?"
          value={answers.problemSolutionFit}
          onChange={(value) => onUpdateAnswer("problemSolutionFit", value)}
          isFocused={focusedField === "problemSolutionFit"}
          onFocus={() => setFocusedField("problemSolutionFit")}
          onBlur={() => setFocusedField(null)}
          delay={0.4}
        />
      </div>

      <motion.div
        className="flex justify-between mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Button
          onClick={() => window.dispatchEvent(new CustomEvent('save-progress'))}
          variant="outline"
          className="border-purple-primary/20 bg-[#1A1625]/50 text-white hover:bg-purple-primary/20 transition-all duration-300 flex items-center gap-2"
        >
          <CheckCircle2 size={16} />
          SAVE PROGRESS
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!isFormValid()}
          className={cn(
            "bg-purple-primary hover:bg-purple-light text-white transition-all duration-300 flex items-center gap-2",
            !isFormValid()
              ? "opacity-50 cursor-not-allowed"
              : "shadow-lg shadow-purple-primary/20 hover:shadow-purple-light/30",
          )}
        >
          NEXT
          <ArrowRight size={16} />
        </Button>
      </motion.div>
    </div>
  )
}

// Monitor Step Component
interface MonitorStepProps {
  answers: {
    performanceTracking: string
    consumerSentiment: string
  }
  onUpdateAnswer: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
}

function MonitorStep({ answers, onUpdateAnswer, onNext, onBack }: MonitorStepProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const isFormValid = () => {
    return Object.values(answers).every((answer) => answer.trim().length > 0)
  }

  return (
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
        Please provide detailed answers to the following questions:
      </motion.p>

      <div className="space-y-6">
        <QuestionCard
          number={1}
          title="Performance Tracking"
          question="Are we regularly measuring brand & product success?"
          value={answers.performanceTracking}
          onChange={(value) => onUpdateAnswer("performanceTracking", value)}
          isFocused={focusedField === "performanceTracking"}
          onFocus={() => setFocusedField("performanceTracking")}
          onBlur={() => setFocusedField(null)}
          delay={0.1}
        />

        <QuestionCard
          number={2}
          title="Consumer Sentiment Analysis"
          question="How are customers responding to our offerings?"
          value={answers.consumerSentiment}
          onChange={(value) => onUpdateAnswer("consumerSentiment", value)}
          isFocused={focusedField === "consumerSentiment"}
          onFocus={() => setFocusedField("consumerSentiment")}
          onBlur={() => setFocusedField(null)}
          delay={0.2}
        />
      </div>

      <motion.div
        className="flex justify-between mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
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
          onClick={() => window.dispatchEvent(new CustomEvent('save-progress'))}
          variant="outline"
          className="border-purple-primary/20 bg-[#1A1625]/50 text-white hover:bg-purple-primary/20 transition-all duration-300 flex items-center gap-2"
        >
          <CheckCircle2 size={16} />
          SAVE PROGRESS
        </Button>

        <Button
          onClick={onNext}
          disabled={!isFormValid()}
          className={cn(
            "bg-purple-primary hover:bg-purple-light text-white transition-all duration-300 flex items-center gap-2",
            !isFormValid()
              ? "opacity-50 cursor-not-allowed"
              : "shadow-lg shadow-purple-primary/20 hover:shadow-purple-light/30",
          )}
        >
          NEXT
          <ArrowRight size={16} />
        </Button>
      </motion.div>
    </div>
  )
}

// Implement Step Component
interface ImplementStepProps {
  answers: {
    brandPositioning: string
    productDevelopment: string
    marketingEffectiveness: string
    customerExperience: string
  }
  onUpdateAnswer: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
}

function ImplementStep({ answers, onUpdateAnswer, onNext, onBack }: ImplementStepProps) {
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const isFormValid = () => {
    return Object.values(answers).every((answer) => answer.trim().length > 0)
  }

  return (
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
        Please provide detailed answers to the following questions:
      </motion.p>

      <div className="space-y-6">
        <QuestionCard
          number={1}
          title="Brand Positioning"
          question="Is our brand differentiation clear to consumers?"
          value={answers.brandPositioning}
          onChange={(value) => onUpdateAnswer("brandPositioning", value)}
          isFocused={focusedField === "brandPositioning"}
          onFocus={() => setFocusedField("brandPositioning")}
          onBlur={() => setFocusedField(null)}
          delay={0.1}
        />

        <QuestionCard
          number={2}
          title="Product Development"
          question="Are products developed based on customer needs?"
          value={answers.productDevelopment}
          onChange={(value) => onUpdateAnswer("productDevelopment", value)}
          isFocused={focusedField === "productDevelopment"}
          onFocus={() => setFocusedField("productDevelopment")}
          onBlur={() => setFocusedField(null)}
          delay={0.2}
        />

        <QuestionCard
          number={3}
          title="Marketing Effectiveness"
          question="Do campaigns effectively engage target audiences?"
          value={answers.marketingEffectiveness}
          onChange={(value) => onUpdateAnswer("marketingEffectiveness", value)}
          isFocused={focusedField === "marketingEffectiveness"}
          onFocus={() => setFocusedField("marketingEffectiveness")}
          onBlur={() => setFocusedField(null)}
          delay={0.3}
        />

        <QuestionCard
          number={4}
          title="Customer Experience"
          question="Are customers satisfied with their interactions across all touchpoints?"
          value={answers.customerExperience}
          onChange={(value) => onUpdateAnswer("customerExperience", value)}
          isFocused={focusedField === "customerExperience"}
          onFocus={() => setFocusedField("customerExperience")}
          onBlur={() => setFocusedField(null)}
          delay={0.4}
        />
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
          onClick={() => window.dispatchEvent(new CustomEvent('save-progress'))}
          variant="outline"
          className="border-purple-primary/20 bg-[#1A1625]/50 text-white hover:bg-purple-primary/20 transition-all duration-300 flex items-center gap-2"
        >
          <CheckCircle2 size={16} />
          SAVE PROGRESS
        </Button>

        <Button
          onClick={onNext}
          disabled={!isFormValid()}
          className={cn(
            "bg-purple-primary hover:bg-purple-light text-white transition-all duration-300 flex items-center gap-2",
            !isFormValid()
              ? "opacity-50 cursor-not-allowed"
              : "shadow-lg shadow-purple-primary/20 hover:shadow-purple-light/30",
          )}
        >
          NEXT
          <ArrowRight size={16} />
        </Button>
      </motion.div>
    </div>
  )
}

// Review Step Component
interface ReviewStepProps {
  answers: TestAnswers
  onNext: () => void
  onBack: () => void
}

function ReviewStep({ answers, onNext, onBack }: ReviewStepProps) {
  const [expandedSections, setExpandedSections] = useState({
    assessment: true,
    implementation: false,
    monitoring: false,
  })

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  return (
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

      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Assessment Questions */}
        <motion.div
          className="border border-purple-primary/20 rounded-lg overflow-hidden shadow-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <button
            className="w-full flex items-center justify-between bg-purple-primary text-white p-4 text-left transition-all duration-300 hover:bg-purple-light"
            onClick={() => toggleSection("assessment")}
          >
            <span className="font-medium flex items-center">
              <ClipboardList className="mr-2 h-5 w-5" />
              Assessment Questions
            </span>
            <motion.div animate={{ rotate: expandedSections.assessment ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown size={18} />
            </motion.div>
          </button>

          <AnimatePresence>
            {expandedSections.assessment && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-[#13101C] space-y-4">
                  <ReviewItem
                    title="Market Research Quality"
                    question="Have we gathered sufficient market & consumer insights?"
                    answer={answers.assess.marketResearch || "No answer provided"}
                  />

                  <ReviewItem
                    title="Consumer Segmentation"
                    question="Do we understand our ideal customers?"
                    answer={answers.assess.consumerSegmentation || "No answer provided"}
                  />

                  <ReviewItem
                    title="Competitive Analysis"
                    question="Have we benchmarked against competitors?"
                    answer={answers.assess.competitiveAnalysis || "No answer provided"}
                  />

                  <ReviewItem
                    title="Problem-Solution Fit"
                    question="Do our offerings align with customer pain points?"
                    answer={answers.assess.problemSolutionFit || "No answer provided"}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Implementation Questions */}
        <motion.div
          className="border border-purple-primary/20 rounded-lg overflow-hidden shadow-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <button
            className="w-full flex items-center justify-between bg-purple-primary text-white p-4 text-left transition-all duration-300 hover:bg-purple-light"
            onClick={() => toggleSection("implementation")}
          >
            <span className="font-medium flex items-center">
              <Wrench className="mr-2 h-5 w-5" />
              Implementation Questions
            </span>
            <motion.div animate={{ rotate: expandedSections.implementation ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown size={18} />
            </motion.div>
          </button>

          <AnimatePresence>
            {expandedSections.implementation && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-[#13101C] space-y-4">
                  <ReviewItem
                    title="Brand Positioning"
                    question="Is our brand differentiation clear to consumers?"
                    answer={answers.implement.brandPositioning || "No answer provided"}
                  />

                  <ReviewItem
                    title="Product Development"
                    question="Are products developed based on customer needs?"
                    answer={answers.implement.productDevelopment || "No answer provided"}
                  />

                  <ReviewItem
                    title="Marketing Effectiveness"
                    question="Do campaigns effectively engage target audiences?"
                    answer={answers.implement.marketingEffectiveness || "No answer provided"}
                  />

                  <ReviewItem
                    title="Customer Experience"
                    question="Are customers satisfied with their interactions across all touchpoints?"
                    answer={answers.implement.customerExperience || "No answer provided"}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Monitoring Questions */}
        <motion.div
          className="border border-purple-primary/20 rounded-lg overflow-hidden shadow-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <button
            className="w-full flex items-center justify-between bg-purple-primary text-white p-4 text-left transition-all duration-300 hover:bg-purple-light"
            onClick={() => toggleSection("monitoring")}
          >
            <span className="font-medium flex items-center">
              <LineChart className="mr-2 h-5 w-5" />
              Monitoring Questions
            </span>
            <motion.div animate={{ rotate: expandedSections.monitoring ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown size={18} />
            </motion.div>
          </button>

          <AnimatePresence>
            {expandedSections.monitoring && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-[#13101C] space-y-4">
                  <ReviewItem
                    title="Performance Tracking"
                    question="Are we regularly measuring brand & product success?"
                    answer={answers.monitor.performanceTracking || "No answer provided"}
                  />

                  <ReviewItem
                    title="Consumer Sentiment Analysis"
                    question="How are customers responding to our offerings?"
                    answer={answers.monitor.consumerSentiment || "No answer provided"}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

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
          onClick={() => window.dispatchEvent(new CustomEvent('save-progress'))}
          variant="outline"
          className="border-purple-primary/20 bg-[#1A1625]/50 text-white hover:bg-purple-primary/20 transition-all duration-300 flex items-center gap-2"
        >
          <CheckCircle2 size={16} />
          SAVE PROGRESS
        </Button>

        <Button
          onClick={onNext}
          className="bg-purple-primary hover:bg-purple-light text-white transition-all duration-300 shadow-lg shadow-purple-primary/20 hover:shadow-purple-light/30 flex items-center gap-2"
        >
          NEXT
          <ArrowRight size={16} />
        </Button>
      </motion.div>
    </div>
  )
}

// Submit Step Component
interface SubmitStepProps {
  onSubmit: () => void
  onBack: () => void
}

function SubmitStep({ onSubmit, onBack }: SubmitStepProps) {
  return (
    <div className="p-6 md:p-8 animate-fadeIn">
      <motion.h2
        className="text-xl font-semibold text-center mb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Submit Your Test
      </motion.h2>
      <motion.p
        className="text-center text-sm text-gray-300 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Please confirm all your answers before final submission.
      </motion.p>

      <motion.div
        className="flex flex-col items-center justify-center max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.div
          className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-light to-purple-primary flex items-center justify-center mb-6 shadow-lg shadow-purple-primary/30"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            repeatDelay: 1,
          }}
        >
          <Play className="h-10 w-10 text-white ml-1" />
        </motion.div>

        <h3 className="text-xl font-semibold text-white mb-6">Ready to Submit Your Test</h3>

        <motion.div
          className="space-y-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-sm text-gray-300">
            By clicking "Submit Test" below, your answers will be submitted and you will not be able to make further
            changes.
          </p>

          <p className="text-sm text-gray-300">
            Your comprehensive assessment includes valuable insights into your brand strategy approach and will help
            guide your business development.
          </p>

          <p className="text-xs text-gray-400 mt-6">
            Thank you for completing this test. Your insights will help us understand your brand strategy approach.
          </p>
        </motion.div>

        <motion.div
          className="flex w-full justify-between mt-8"
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
            onClick={onSubmit}
            className="bg-gradient-to-r from-purple-light to-purple-primary hover:opacity-90 text-white transition-all duration-300 shadow-lg shadow-purple-primary/20 hover:shadow-purple-light/30"
          >
            SUBMIT TEST
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}

// Result Step Component
interface ExpandedSections {
  assessment: boolean
  implementation: boolean
  monitoring: boolean
}

interface ResultStepProps {
  isAnalyzing: boolean
  showResults: boolean
  evaluationResults: any
  activeTab: string
  setActiveTab: (tab: string) => void
  expandedSections: ExpandedSections
  toggleSection: (section: keyof ExpandedSections) => void
  onBackToTests: () => void
  onBackToSubmit: () => void
}

function ResultStep({
  isAnalyzing,
  showResults,
  evaluationResults,
  activeTab,
  setActiveTab,
  expandedSections,
  toggleSection,
  onBackToTests,
  onBackToSubmit,
}: ResultStepProps) {
  const [chartImage, setChartImage] = useState<string | null>(null);

  if (isAnalyzing) {
    return (
      <div className="p-6 md:p-8 min-h-[500px] flex flex-col items-center justify-center animate-fadeIn">
        <motion.div
          className="bg-[#13101C] rounded-xl shadow-xl p-8 max-w-md w-full text-center border border-purple-primary/20"
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
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.5 }}>
                Processing your responses...
              </motion.span>
            </p>
            <p className="flex items-center justify-center">
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 1.0 }}>
                Evaluating against assessment criteria...
              </motion.span>
            </p>
            <p className="flex items-center justify-center">
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 1.5 }}>
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
    )
  }

  if (!showResults) {
    return null
  }

  return (
    <div className="p-6 md:p-8 animate-fadeIn">
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
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#13101C] p-1 rounded-lg">
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
            <motion.div
              className="bg-[#13101C] rounded-xl p-6 shadow-lg border border-purple-primary/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
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
                <RadarChartComponent 
                  results={evaluationResults} 
                  setChartImage={setChartImage} 
                />
              </motion.div>

              <motion.div
                className="mt-8 p-4 bg-[#1A1625] rounded-lg border border-purple-primary/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <h4 className="font-medium text-white mb-2">Overall Assessment</h4>
                <p className="text-sm text-gray-300">
                  {evaluationResults.overall
                    ? evaluationResults.overall
                    : "No overall assessment available."}
                </p>
              </motion.div>
            </motion.div>
          </TabsContent>

          <TabsContent value="details" className="mt-6">
            <motion.div
              className="bg-[#13101C] rounded-xl p-6 shadow-lg border border-purple-primary/20 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Assess Section */}
              <motion.div
                className="border border-purple-primary/20 rounded-lg overflow-hidden shadow-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <button
                  className="w-full flex items-center justify-between bg-purple-primary text-white p-4 text-left transition-all duration-300 hover:bg-purple-light"
                  onClick={() => toggleSection("assessment")}
                >
                  <span className="font-medium flex items-center">
                    <ClipboardList className="mr-2 h-5 w-5" />
                    Assess
                  </span>
                  <motion.div
                    animate={{ rotate: expandedSections.assessment ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedSections.assessment && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-4">
                        <p className="text-sm text-gray-300 mb-2">
                          Evaluation of market research quality, consumer segmentation, and competitive analysis
                        </p>

                        <ResultDetailItem
                          title="Market Research Quality"
                          score={evaluationResults.scores["Market Research Quality"]}
                          feedback={evaluationResults.feedback["Market Research Quality"]}
                          recommendation={evaluationResults.recommendations["Market Research Quality"]}
                        />

                        <ResultDetailItem
                          title="Consumer Segmentation"
                          score={evaluationResults.scores["Consumer Segmentation"]}
                          feedback={evaluationResults.feedback["Consumer Segmentation"]}
                          recommendation={evaluationResults.recommendations["Consumer Segmentation"]}
                        />

                        <ResultDetailItem
                          title="Competitive Analysis"
                          score={evaluationResults.scores["Competitive Analysis"]}
                          feedback={evaluationResults.feedback["Competitive Analysis"]}
                          recommendation={evaluationResults.recommendations["Competitive Analysis"]}
                        />

                        <ResultDetailItem
                          title="Problem-Solution Fit"
                          score={evaluationResults.scores["Problem-Solution Fit"]}
                          feedback={evaluationResults.feedback["Problem-Solution Fit"]}
                          recommendation={evaluationResults.recommendations["Problem-Solution Fit"]}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Implement Section */}
              <motion.div
                className="border border-purple-primary/20 rounded-lg overflow-hidden shadow-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <button
                  className="w-full flex items-center justify-between bg-purple-primary text-white p-4 text-left transition-all duration-300 hover:bg-purple-light"
                  onClick={() => toggleSection("implementation")}
                >
                  <span className="font-medium flex items-center">
                    <Wrench className="mr-2 h-5 w-5" />
                    Implement
                  </span>
                  <motion.div
                    animate={{ rotate: expandedSections.implementation ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedSections.implementation && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-4">
                        <p className="text-sm text-gray-300 mb-2">
                          Evaluation of product development, marketing effectiveness, and customer experience
                        </p>

                        <ResultDetailItem
                          title="Brand Positioning"
                          score={evaluationResults.scores["Brand Positioning"]}
                          feedback={evaluationResults.feedback["Brand Positioning"]}
                          recommendation={evaluationResults.recommendations["Brand Positioning"]}
                        />

                        <ResultDetailItem
                          title="Product Development"
                          score={evaluationResults.scores["Product Development"]}
                          feedback={evaluationResults.feedback["Product Development"]}
                          recommendation={evaluationResults.recommendations["Product Development"]}
                        />

                        <ResultDetailItem
                          title="Marketing Effectiveness"
                          score={evaluationResults.scores["Marketing Effectiveness"]}
                          feedback={evaluationResults.feedback["Marketing Effectiveness"]}
                          recommendation={evaluationResults.recommendations["Marketing Effectiveness"]}
                        />

                        <ResultDetailItem
                          title="Customer Experience"
                          score={evaluationResults.scores["Customer Experience"]}
                          feedback={evaluationResults.feedback["Customer Experience"]}
                          recommendation={evaluationResults.recommendations["Customer Experience"]}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Monitor Section */}
              <motion.div
                className="border border-purple-primary/20 rounded-lg overflow-hidden shadow-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <button
                  className="w-full flex items-center justify-between bg-purple-primary text-white p-4 text-left transition-all duration-300 hover:bg-purple-light"
                  onClick={() => toggleSection("monitoring")}
                >
                  <span className="font-medium flex items-center">
                    <LineChart className="mr-2 h-5 w-5" />
                    Monitor
                  </span>
                  <motion.div 
                    animate={{ rotate: expandedSections.monitoring ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedSections.monitoring && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-4">
                        <p className="text-sm text-gray-300 mb-2">
                          Evaluation of performance tracking and consumer sentiment analysis
                        </p>

                        <ResultDetailItem
                          title="Performance Tracking"
                          score={evaluationResults.scores["Performance Tracking"]}
                          feedback={evaluationResults.feedback["Performance Tracking"]}
                          recommendation={evaluationResults.recommendations["Performance Tracking"]}
                        />

                        <ResultDetailItem
                          title="Consumer Sentiment"
                          score={evaluationResults.scores["Consumer Sentiment"]}
                          feedback={evaluationResults.feedback["Consumer Sentiment"]}
                          recommendation={evaluationResults.recommendations["Consumer Sentiment"]}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
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
          className="border-purple-primary/20 text-white hover:bg-purple-primary/20 transition-all duration-300 flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          BACK
        </Button>

        <Button
          onClick={onBackToTests}
          className="bg-purple-primary hover:bg-purple-light text-white transition-all duration-300 shadow-lg shadow-purple-primary/20 hover:shadow-purple-light/30"
        >
          GO BACK TO TESTS
        </Button>

        <PDFDownloadLink
          document={<EvaluationResultsPDF results={evaluationResults} chartImage={chartImage || ''} />}
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
    </div>
  )
}

// Helper Components
interface QuestionCardProps {
  number: number
  title: string
  question: string
  value: string
  onChange: (value: string) => void
  isFocused?: boolean
  onFocus?: () => void
  onBlur?: () => void
  delay?: number
}

function QuestionCard({
  number,
  title,
  question,
  value,
  onChange,
  isFocused = false,
  onFocus = () => {},
  onBlur = () => {},
  delay = 0,
}: QuestionCardProps) {
  return (
    <motion.div
      className={cn(
        "bg-[#13101C] rounded-xl p-5 shadow-lg border border-purple-primary/20 transition-all duration-300",
        isFocused ? "border-purple-light shadow-purple-primary/30 scale-[1.02]" : "",
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-purple-light to-purple-primary text-white flex items-center justify-center text-sm font-medium shadow-md shadow-purple-primary/20">
          {number}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-white text-lg">{title}</h3>
          <p className="text-sm text-gray-300 mt-1 mb-4">{question}</p>
          <textarea
            placeholder="Enter your answer here..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            className={cn(
              "min-h-[120px] w-full rounded-lg border bg-[#0F0A19] text-white p-3 transition-all duration-300 resize-none focus:outline-none",
              isFocused
                ? "border-purple-light shadow-md shadow-purple-primary/20"
                : "border-purple-primary/20 focus:border-purple-light",
            )}
          />
        </div>
      </div>
    </motion.div>
  )
}

interface ReviewItemProps {
  title: string
  question: string
  answer: string
}

export function ReviewItem({ title, question, answer }: ReviewItemProps) {
  return (
    <div className="border-b border-purple-primary/20 pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-purple-light"></div>
        <h3 className="font-medium text-white">{title}</h3>
      </div>
      <p className="text-sm text-gray-300 mb-2">{question}</p>
      <div className="bg-[#0F0A19] p-3 rounded-lg text-sm text-white border border-purple-primary/10">{answer}</div>
    </div>
  )
}

interface ResultDetailItemProps {
  title: string
  score: number
  feedback: string
  recommendation: string
}

export function ResultDetailItem({ title, score, feedback, recommendation }: ResultDetailItemProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-400"
    if (score >= 6) return "text-yellow-400"
    return "text-red-400"
  }

  return (
    <div className="border-b border-purple-primary/20 pb-4 last:border-b-0 last:pb-0">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-white">{title}</h3>
        <div className={cn("text-sm font-medium", getScoreColor(score))}>Score: {score}/10</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
        <div className="bg-[#0F0A19] p-3 rounded-lg border border-purple-primary/10">
          <h4 className="text-xs font-medium text-gray-400">Feedback</h4>
          <p className="text-sm text-gray-300">{feedback}</p>
        </div>

        <div className="bg-[#0F0A19] p-3 rounded-lg border border-purple-primary/10">
          <h4 className="text-xs font-medium text-gray-400">Recommendation</h4>
          <p className="text-sm text-gray-300">{recommendation}</p>
        </div>
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

function RadarChartComponent({ results , setChartImage }: RadarChartProps) {
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