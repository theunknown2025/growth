const generatePrompt = (answers) => {
  const evaluationCriteria = {
    assess: require('../actions/criteria/assess_evaluation'),
    implement: require('../actions/criteria/implement_evaluation'),
    monitor: require('../actions/criteria/monitor_evaluation'),
  };

  const actionRecommendations = {
    assess: require('../actions/recommandation/assess_action'),
    implement: require('../actions/recommandation/implement_action'),
    monitor: require('../actions/recommandation/monitor_action'),
  };

  return `
    Please evaluate the following test answers based on the provided criteria and return your analysis in JSON format:

    EVALUATION CRITERIA:
    ${JSON.stringify(evaluationCriteria, null, 2)}

    ACTION RECOMMENDATIONS:
    ${JSON.stringify(actionRecommendations, null, 2)}

    USER'S ANSWERS:
    ${JSON.stringify(answers, null, 2)}

    Please provide your evaluation strictly in the following JSON structure:
    {
        "scores": {
            "Market Research Quality": 7,
            "Consumer Segmentation": 5
        },
        "feedback": {
            "Market Research Quality": "Detailed feedback about this metric...",
            "Consumer Segmentation": "Detailed feedback about this metric..."
        },
        "recommendations": {
            "Market Research Quality": "Specific recommendations for improvement...",
            "Consumer Segmentation": "Specific recommendations for improvement..."
        },
        "overall": "Overall assessment summary that provides a comprehensive evaluation..."
    }

    Your response must be a valid JSON object that can be parsed directly. Do not include any markdown, code blocks, or additional text before or after the JSON structure. The response should start with '{' and end with '}'.
  `;
};

module.exports = {
    generatePrompt,
};