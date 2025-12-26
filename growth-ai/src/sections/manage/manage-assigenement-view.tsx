"use client"

import { useContext, useState } from "react"
import {
  ClipboardList,
  ChevronDown,
  Wrench,
  LineChart,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Card, CardContent, CardHeader, CardTitle } from "@/shadcn/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shadcn/ui/tabs"

import { AssignmentRadarChart } from "./manage-radar-chart"
import { AssignementsTable } from "../assignement/assignement-table"
import { ResultDetailItem } from "../evaluation/simple-test/view/evaluation-simple-test-view"
import { useGetAdvancedEvaluationById, useGetSimpleEvaluationById } from "@/actions/evaluation"
import { useGetAllAssignementByUserId, useGetAllAssignementByClientId } from "@/actions/assignements"
import { useRouter } from "next/navigation"
import { paths } from "@/routes/paths"
import { AuthContext } from "../auth/context/AuthContext"

export function AssignmentView({ id }: { id: string }) {
  const { user } = useContext(AuthContext) || {}
  const { simpleevaluation } = useGetSimpleEvaluationById(id)
  const { advancedevaluation } = useGetAdvancedEvaluationById(id)
  const evaluationData = simpleevaluation || advancedevaluation
  const router = useRouter()
  const { assignements } = useGetAllAssignementByClientId(
    evaluationData?.user?._id as string
  )
  // State for Tabs and expandable sections in Evaluation Details
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedSections, setExpandedSections] = useState({
    assessment: false,
    implementation: false,
    monitoring: false,
    userAnswers: false, // New section for user answers
  })
  const toggleSection = (section: "assessment" | "implementation" | "monitoring" | "userAnswers") => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleCreateAssignment = (userId: string) => {
    router.push(paths.dashboard.manage.assignement(userId))
  }

  return (
    <div className="space-y-6">
      {/* Assignment Information Card */}
      <Card className="bg-[#1A1525] border-purple-primary/20 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-white">
                {evaluationData?.user?.firstName} {evaluationData?.user?.lastName}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-white/70">Client:</span>
                <span className="text-white font-medium">
                  {evaluationData?.user?.firstName} {evaluationData?.user?.lastName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/70">Email:</span>
                <span className="text-white font-medium">{evaluationData?.user?.email}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-white/70">Assignment ID:</span>
                <span className="text-white font-medium">{evaluationData?._id}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/70">Created:</span>
                <span className="text-white font-medium">{evaluationData?.createdAt}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create New Assignment Button and Assignment Table */}
      {user?.role === 'admin' && (
        <div className="space-y-4">
          <button
            className="px-4 py-2 bg-purple-primary text-white rounded transition-colors hover:bg-purple-light"
            onClick={() => handleCreateAssignment(evaluationData?.user?._id as string)}
          >
            Create New Assignment
          </button>
          <AssignementsTable assignements={assignements} />
        </div>
      )}

      <div className="grid grid-cols-1 w-full gap-6">
        <Card className="bg-[#1A1525] border-purple-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Evaluation Details</CardTitle>
          </CardHeader>
          <CardContent>
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
                <TabsList className="grid w-full grid-cols-3 bg-[#13101C] p-1 rounded-lg">
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
                  <TabsTrigger
                    value="answers"
                    className="data-[state=active]:bg-purple-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-md py-2"
                  >
                    USER ANSWERS
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

                    {/* Dummy Radar Chart Placeholder */}
                    <motion.div
                      className="max-w-4xl mx-auto h-[400px] bg-[#0F0A19] rounded-md flex items-center justify-center text-gray-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                    >
                      {evaluationData ? (
                        <AssignmentRadarChart evaluationData={evaluationData} />
                      ) : (
                        <span className="text-gray-500">No evaluation data available</span>
                      )}
                    </motion.div>

                    <motion.div
                      className="mt-8 p-4 bg-[#1A1625] rounded-lg border border-purple-primary/20"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      <h4 className="font-medium text-white mb-2">Overall Assessment</h4>
                      <p className="text-sm text-gray-300">
                        {evaluationData?.overall || "No overall assessment available."}
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
                              <ResultDetailItem
                                title="Market Research Quality"
                                score={(evaluationData?.scores as Record<string, number>)["Market Research Quality"]}
                                feedback={(evaluationData?.feedback as Record<string, string>)["Market Research Quality"]}
                                recommendation={(evaluationData?.recommendations as Record<string, string>)["Market Research Quality"]}
                              />
                              <ResultDetailItem
                                title="Consumer Segmentation"
                                score={(evaluationData?.scores as Record<string, number>)["Consumer Segmentation"]}
                                feedback={(evaluationData?.feedback as Record<string, string>)["Consumer Segmentation"]}
                                recommendation={(evaluationData?.recommendations as Record<string, string>)["Consumer Segmentation"]}
                              />
                              <ResultDetailItem
                                title="Competitive Analysis"
                                score={(evaluationData?.scores as Record<string, number>)["Competitive Analysis"]}
                                feedback={(evaluationData?.feedback as Record<string, string>)["Competitive Analysis"]}
                                recommendation={(evaluationData?.recommendations as Record<string, string>)["Competitive Analysis"]}
                              />
                              <ResultDetailItem
                                title="Problem-Solution Fit"
                                score={(evaluationData?.scores as Record<string, number>)["Problem-Solution Fit"]}
                                feedback={(evaluationData?.feedback as Record<string, string>)["Problem-Solution Fit"]}
                                recommendation={(evaluationData?.recommendations as Record<string, string>)["Problem-Solution Fit"]}
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
                              <ResultDetailItem
                                title="Brand Positioning"
                                score={(evaluationData?.scores as Record<string, number>)["Brand Positioning"]}
                                feedback={(evaluationData?.feedback as Record<string, string>)["Brand Positioning"]}
                                recommendation={(evaluationData?.recommendations as Record<string, string>)["Brand Positioning"]}
                              />
                              <ResultDetailItem
                                title="Product Development"
                                score={(evaluationData?.scores as Record<string, number>)["Product Development"]}
                                feedback={(evaluationData?.feedback as Record<string, string>)["Product Development"]}
                                recommendation={(evaluationData?.recommendations as Record<string, string>)["Product Development"]}
                              />
                              <ResultDetailItem
                                title="Marketing Effectiveness"
                                score={(evaluationData?.scores as Record<string, number>)["Marketing Effectiveness"]}
                                feedback={(evaluationData?.feedback as Record<string, string>)["Marketing Effectiveness"]}
                                recommendation={(evaluationData?.recommendations as Record<string, string>)["Marketing Effectiveness"]}
                              />
                              <ResultDetailItem
                                title="Customer Experience"
                                score={(evaluationData?.scores as Record<string, number>)["Customer Experience"]}
                                feedback={(evaluationData?.feedback as Record<string, string>)["Customer Experience"]}
                                recommendation={(evaluationData?.recommendations as Record<string, string>)["Customer Experience"]}
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
                              <ResultDetailItem
                                title="Performance Tracking"
                                score={(evaluationData?.scores as Record<string, number>)["Performance Tracking"]}
                                feedback={(evaluationData?.feedback as Record<string, string>)["Performance Tracking"]}
                                recommendation={(evaluationData?.recommendations as Record<string, string>)["Performance Tracking"]}
                              />
                              <ResultDetailItem
                                title="Consumer Sentiment"
                                score={(evaluationData?.scores as Record<string, number>)["Consumer Sentiment"]}
                                feedback={(evaluationData?.feedback as Record<string, string>)["Consumer Sentiment"]}
                                recommendation={(evaluationData?.recommendations as Record<string, string>)["Consumer Sentiment"]}
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.div>
                </TabsContent>
                
                <TabsContent value="answers" className="mt-6">
                  <motion.div
                    className="bg-[#13101C] rounded-xl p-6 shadow-lg border border-purple-primary/20 space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    {evaluationData && evaluationData.answers ? (
                      <>
                        {/* Assess Section Answers */}
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
                              Assess - User Answers
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
                                  {evaluationData.answers.assess && (
                                    <>
                                      <UserAnswerItem
                                        title="Market Research Quality"
                                        answer={
                                          typeof evaluationData.answers.assess.marketResearch === 'object'
                                            ? evaluationData.answers.assess.marketResearch.main
                                            : evaluationData.answers.assess.marketResearch
                                        }
                                      />
                                      <UserAnswerItem
                                        title="Consumer Segmentation"
                                        answer={
                                          typeof evaluationData.answers.assess.consumerSegmentation === 'object'
                                            ? evaluationData.answers.assess.consumerSegmentation.main
                                            : evaluationData.answers.assess.consumerSegmentation
                                        }
                                      />
                                      <UserAnswerItem
                                        title="Competitive Analysis"
                                        answer={
                                          typeof evaluationData.answers.assess.competitiveAnalysis === 'object'
                                            ? evaluationData.answers.assess.competitiveAnalysis.main
                                            : evaluationData.answers.assess.competitiveAnalysis
                                        }
                                      />
                                      <UserAnswerItem
                                        title="Problem-Solution Fit"
                                        answer={
                                          typeof evaluationData.answers.assess.problemSolutionFit === 'object'
                                            ? evaluationData.answers.assess.problemSolutionFit.main
                                            : evaluationData.answers.assess.problemSolutionFit
                                        }
                                      />
                                    </>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        {/* Implement Section Answers */}
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
                              Implement - User Answers
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
                                  {evaluationData.answers.implement && (
                                    <>
                                      <UserAnswerItem
                                        title="Brand Positioning"
                                        answer={
                                          typeof evaluationData.answers.implement.brandPositioning === 'object'
                                            ? evaluationData.answers.implement.brandPositioning.main
                                            : evaluationData.answers.implement.brandPositioning
                                        }
                                      />
                                      <UserAnswerItem
                                        title="Product Development"
                                        answer={
                                          typeof evaluationData.answers.implement.productDevelopment === 'object'
                                            ? evaluationData.answers.implement.productDevelopment.main
                                            : evaluationData.answers.implement.productDevelopment
                                        }
                                      />
                                      <UserAnswerItem
                                        title="Marketing Effectiveness"
                                        answer={
                                          typeof evaluationData.answers.implement.marketingEffectiveness === 'object'
                                            ? evaluationData.answers.implement.marketingEffectiveness.main
                                            : evaluationData.answers.implement.marketingEffectiveness
                                        }
                                      />
                                      <UserAnswerItem
                                        title="Customer Experience"
                                        answer={
                                          typeof evaluationData.answers.implement.customerExperience === 'object'
                                            ? evaluationData.answers.implement.customerExperience.main
                                            : evaluationData.answers.implement.customerExperience
                                        }
                                      />
                                    </>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>

                        {/* Monitor Section Answers */}
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
                              Monitor - User Answers
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
                                  {evaluationData.answers.monitor && (
                                    <>
                                      <UserAnswerItem
                                        title="Performance Tracking"
                                        answer={
                                          typeof evaluationData.answers.monitor.performanceTracking === 'object'
                                            ? evaluationData.answers.monitor.performanceTracking.main
                                            : evaluationData.answers.monitor.performanceTracking
                                        }
                                      />
                                      <UserAnswerItem
                                        title="Consumer Sentiment"
                                        answer={
                                          typeof evaluationData.answers.monitor.consumerSentiment === 'object'
                                            ? evaluationData.answers.monitor.consumerSentiment.main
                                            : evaluationData.answers.monitor.consumerSentiment
                                        }
                                      />
                                    </>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </>
                    ) : (
                      <div className="text-center text-gray-400 p-8">
                        <p>No user answers available for this evaluation.</p>
                      </div>
                    )}
                  </motion.div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface UserAnswerItemProps {
  title: string;
  answer: string;
}

function UserAnswerItem({ title, answer }: UserAnswerItemProps) {
  return (
    <div className="border-b border-purple-primary/20 pb-4 last:border-b-0 last:pb-0">
      <h3 className="font-medium text-white mb-2">{title}</h3>
      <div className="bg-[#0F0A19] p-3 rounded-lg text-sm text-white/80 border border-purple-primary/10">
        {answer || "No answer provided"}
      </div>
    </div>
  );
}
