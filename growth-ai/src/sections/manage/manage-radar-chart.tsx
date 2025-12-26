"use client"

import { useRef } from "react"
import { Chart, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js"
import { Radar } from "react-chartjs-2"
import React from "react"
import { AdvancedTestResult, TestResult } from "@/types/evaluation"

Chart.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface Metric {
  name: string
  value: number
}

interface AssignmentRadarChartProps {
  evaluationData : TestResult | AdvancedTestResult
}

export function AssignmentRadarChart({ evaluationData }: AssignmentRadarChartProps) {

  const metrics = [
    { name: "Market Research Quality", value: (evaluationData?.scores as Record<string, number>)["Market Research Quality"] || 0 },
    { name: "Consumer Segmentation", value: (evaluationData?.scores as Record<string, number>)["Consumer Segmentation"] || 0 },
    { name: "Competitive Analysis", value: (evaluationData?.scores as Record<string, number>)["Competitive Analysis"] || 0 },
    { name: "Problem-Solution Fit", value: (evaluationData?.scores as Record<string, number>)["Problem-Solution Fit"] || 0 },
    { name: "Brand Positioning", value: (evaluationData?.scores as Record<string, number>)["Brand Positioning"] || 0 },
    { name: "Product Development", value: (evaluationData?.scores as Record<string, number>)["Product Development"] || 0 },
    { name: "Marketing Effectiveness", value: (evaluationData?.scores as Record<string, number>)["Marketing Effectiveness"] || 0 },
    { name: "Customer Experience", value: (evaluationData?.scores as Record<string, number>)["Customer Experience"] || 0 },
    { name: "Performance Tracking", value: (evaluationData?.scores as Record<string, number>)["Performance Tracking"] || 0 },
    { name: "Consumer Sentiment", value: (evaluationData?.scores as Record<string, number>)["Consumer Sentiment"] || 0 },
  ]

  const data = {
    labels: metrics.map((metric) => metric.name),
    datasets: [
      {
        label: "Performance",
        data: metrics.map((metric) => metric.value),
        backgroundColor: "rgba(147, 51, 234, 0.2)",
        borderColor: "rgba(147, 51, 234, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(147, 51, 234, 1)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgba(147, 51, 234, 1)",
      },
    ],
  }

  const options = {
    scales: {
      r: {
        angleLines: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
        pointLabels: {
          color: "rgba(255, 255, 255, 0.7)",
          font: {
            size: 12,
          },
        },
        ticks: {
          backdropColor: "transparent",
          color: "rgba(255, 255, 255, 0.7)",
          z: 100,
        },
        min: 0,
        max: 10,
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(26, 21, 37, 0.9)",
        titleColor: "rgba(255, 255, 255, 1)",
        bodyColor: "rgba(255, 255, 255, 0.8)",
        borderColor: "rgba(147, 51, 234, 0.3)",
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          title: (context: any) => context[0].label,
          label: (context: any) => `Score: ${context.raw}/10`,
        },
      },
    },
    elements: {
      line: {
        tension: 0.2,
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  }

  return (
    <div className="h-[300px] w-full">
      <Radar data={data} options={options as any} />
    </div>
  )
}

