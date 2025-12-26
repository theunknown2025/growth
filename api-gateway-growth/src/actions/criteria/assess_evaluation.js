// AssessEvaluation.js
// This file contains the evaluation criteria for the "Assess" component, including measurable indicators and a detailed 10-point scoring scale.

const assessEvaluation = {
    marketResearchQuality: {
      title: "Market Research Quality",
      indicators: [
        "Number of research studies conducted",
        "Use of AI/data analytics for insights",
        "Frequency of research updates"
      ],
      scale: {
        10: "Exceptional: Extensive, real-time, data-driven research with proactive updates.",
        9: "Outstanding: High-quality research with only minor gaps in diversity or update frequency.",
        8: "Strong: Robust research overall, though slight enhancements could be made.",
        7: "Above Average: Adequate research but lacking in depth or consistency in updates.",
        6: "Satisfactory: Basic level of research established, with noticeable inconsistencies.",
        5: "Needs Improvement: Inconsistent or incomplete research efforts with significant gaps.",
        4: "Weak: Poor data gathering, outdated sources, and insufficient actionable insights.",
        3: "Poor: Minimal research, largely anecdotal with little validation.",
        2: "Very Poor: Very little structured research; heavy reliance on assumptions.",
        1: "Critical Failure: No meaningful research conducted; major gaps in consumer insights."
      }
    },
    consumerSegmentation: {
      title: "Consumer Segmentation",
      indicators: [
        "Number of defined personas",
        "Depth of segmentation (demographics, psychographics, behavior)",
        "% of customers fitting into defined segments"
      ],
      scale: {
        10: "Exceptional: Detailed, regularly updated segmentation with deep behavioral insights.",
        9: "Outstanding: Comprehensive segmentation with only minor areas needing refinement.",
        8: "Strong: Clear segmentation that effectively identifies key customer groups.",
        7: "Above Average: Adequate segmentation, though additional data refinement would be beneficial.",
        6: "Satisfactory: Basic segmentation established but lacking regular updates.",
        5: "Needs Improvement: Segmentation exists but is only partially validated with outdated data.",
        4: "Weak: Poorly defined segments with limited relevance or actionable insight.",
        3: "Poor: Minimal segmentation largely based on assumptions.",
        2: "Very Poor: Inadequate segmentation with little to no actionable insight.",
        1: "Critical Failure: No meaningful customer segmentation identified."
      }
    },
    competitiveAnalysis: {
      title: "Competitive Analysis",
      indicators: [
        "Market share comparison",
        "SWOT analysis completion",
        "Competitive positioning score"
      ],
      scale: {
        10: "Exceptional: Comprehensive and proactive competitor analysis with real-time updates.",
        9: "Outstanding: Thorough competitor insights with only minor lapses in frequency.",
        8: "Strong: Solid competitor analysis that is mostly up-to-date.",
        7: "Above Average: Adequate analysis with some areas for improvement in monitoring.",
        6: "Satisfactory: Basic competitive analysis in place, but not fully systematic.",
        5: "Needs Improvement: Inconsistent analysis with notable gaps in competitor data.",
        4: "Weak: Limited competitor insights and largely outdated analysis.",
        3: "Poor: Minimal competitor tracking, relying on sporadic or anecdotal data.",
        2: "Very Poor: Very little competitor analysis with significant blind spots.",
        1: "Critical Failure: No competitive analysis conducted."
      }
    },
    problemSolutionFit: {
      title: "Problem-Solution Fit",
      indicators: [
        "% of customers who see value in our solution",
        "Customer feedback on alternatives",
        "Product-market fit score"
      ],
      scale: {
        10: "Exceptional: Strong, validated alignment between offerings and customer needs.",
        9: "Outstanding: High alignment with only minor areas that could be refined.",
        8: "Strong: Good alignment, though further validation could enhance insights.",
        7: "Above Average: Adequate fit; however, further exploration of customer pain points is needed.",
        6: "Satisfactory: Basic alignment observed, with some customer needs not fully addressed.",
        5: "Needs Improvement: Partial alignment with significant gaps in understanding pain points.",
        4: "Weak: Poorly aligned offerings with little evidence of addressing core customer issues.",
        3: "Poor: Minimal alignment, with significant misinterpretation of customer pain points.",
        2: "Very Poor: Very little alignment between product and customer needs.",
        1: "Critical Failure: No alignment; offerings do not address customer pain points at all."
      }
    }
  };
  
module.exports = {
    assessEvaluation
}
  