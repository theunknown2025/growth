// ImplementEvaluation.js
// This file contains the evaluation criteria for the "Implement" component.

const implementEvaluation = {
    brandPositioning: {
      title: "Brand Positioning",
      indicators: [
        "Brand awareness surveys",
        "Net Promoter Score (NPS)",
        "Social listening metrics",
        "Brand consistency scores"
      ],
      scale: {
        10: "Exceptional: Clear, unique brand differentiation fully understood by consumers.",
        1: "Critical Failure: No brand differentiation; consumers confused about identity."
      }
    },
    productDevelopment: {
      title: "Product Development",
      indicators: [
        "Customer satisfaction scores",
        "Product adoption rate",
        "Iteration cycle time",
        "Qualitative feedback ratings"
      ],
      scale: {
        10: "Exceptional: Continuous innovation driven by deep consumer insights.",
        1: "Critical Failure: No link between product development and consumer needs."
      }
    },
    marketingEffectiveness: {
      title: "Marketing Effectiveness",
      indicators: [
        "Engagement rates",
        "Click-through rates (CTR)",
        "Conversion rates",
        "Marketing ROI"
      ],
      scale: {
        10: "Exceptional: Highly engaging, targeted campaigns with outstanding ROI.",
        1: "Critical Failure: Marketing completely misaligned with audience needs."
      }
    },
    customerExperience: {
      title: "Customer Experience",
      indicators: [
        "Customer retention rate",
        "Customer satisfaction (CSAT) scores",
        "Average response/resolution time",
        "Net sentiment from customer reviews"
      ],
      scale: {
        10: "Exceptional: Seamless, high-quality customer experience across all channels.",
        1: "Critical Failure: Poor customer experience causing high churn and dissatisfaction."
      }
    }
  };
  
module.exports = {
  implementEvaluation
}