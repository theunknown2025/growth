// MonitorEvaluation.js
// This file contains the evaluation criteria for the "Monitor" component.

const monitorEvaluation = {
    performanceTracking: {
      title: "Performance Tracking",
      indicators: [
        "Number of performance reviews per quarter",
        "Dashboard update frequency",
        "KPI alignment and trend analysis"
      ],
      scale: {
        10: "Exceptional: Fully automated tracking, real-time insights, proactive decisions.",
        1: "Critical Failure: No structured performance tracking in place."
      }
    },
    consumerSentiment: {
      title: "Consumer Sentiment Analysis",
      indicators: [
        "Sentiment analysis score",
        "Volume and diversity of feedback",
        "Net Promoter Score (NPS) trends"
      ],
      scale: {
        10: "Exceptional: Comprehensive, real-time monitoring with direct response strategies.",
        1: "Critical Failure: No active sentiment analysis or response strategy."
      }
    }
  };
  
module.exports = {
    monitorEvaluation
};
  