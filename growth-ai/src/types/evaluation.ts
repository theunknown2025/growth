export type TestAnswers = {
  _id: string
  assess: {
    marketResearch: string
    consumerSegmentation: string
    competitiveAnalysis: string
    problemSolutionFit: string
  }
  implement: {
    brandPositioning: string
    productDevelopment: string
    marketingEffectiveness: string
    customerExperience: string
  }
  monitor: {
    performanceTracking: string
    consumerSentiment: string
  }
  status: string
  createdAt: string
}

export type AdvancedTestAnswers = {
  _id: string
  assess: {
    marketResearch: {
      main: string
      researchSources: string
      validatedFindings: string
      aiTools: string
    }
    consumerSegmentation: {
      main: string
      updatingSegments: string
      behavioralPatterns: string
      targetingCriteria: string
    }
    competitiveAnalysis: {
      main: string
      competitorStrengths: string
      marketTrends: string
      competitiveAdvantage: string
    }
    problemSolutionFit: {
      main: string
      validatedAssumptions: string
      customerProblems: string
      customerDissatisfaction: string
    }
  }
  implement: {
    brandPositioning: {
      main: string
      brandValues: string
      brandPerception: string
      brandConsistency: string
    }
    productDevelopment: {
      main: string
      customerInsights: string
      productRoadmap: string
      usabilityTesting: string
    }
    marketingEffectiveness: {
      main: string
      targetedMessages: string
      campaignPerformance: string
      channelStrategy: string
    }
    customerExperience: {
      main: string
      omniChannelExperience: string
      customerService: string
      continuousImprovement: string
    }
  }
  monitor: {
    performanceTracking: {
      main: string
      kpiAlignment: string
      metricsReview: string
      trackingSystems: string
    }
    consumerSentiment: {
      main: string
      feedbackCollection: string
      sentimentAnalysis: string
      socialMediaMonitoring: string
    }
  }
  status: string
  createdAt: string
}


export type TestResult = {
  _id: string
  scores: object
  feedback: object
  recommendations: object
  answers?: TestAnswers | any
  progress?: number
  createdAt: string
  status: string
  overall: string
  user? : {
    _id : string
    firstName : string
    lastName : string
    email : string
    role : string
  }
}

export type AdvancedTestResult = {
  _id: string
  scores: object
  feedback: object
  recommendations: object
  answers?: AdvancedTestAnswers | any
  progress?: number
  createdAt: string
  status: string
  overall: string
  user? : {
    _id : string
    firstName : string
    lastName : string
    email : string
    role : string
  }
}

export type AllTestResult = {
  simpleTests: [{
    _id: string
    status: string
    createdAt: string
    userId: string
    userFirstName: string
    userLastName: string
    companyName: string
    sectorOfActivity: string
  }]
  advancedTests: [{
    _id: string
    status: string
    createdAt: string
    userId: string
    userFirstName: string
    userLastName: string
    companyName: string
    sectorOfActivity: string
  }]
}

export type CountEvaluation = {
  simpleTestCount : [{
     count : string 
     month : string
  }] 
  advancedTestCount : [{
    count : string 
    month : string 
  }]

}

export type TestStep = "assess" | "implement" | "monitor" | "review" | "submit" | "result"