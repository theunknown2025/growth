const mongoose = require('mongoose');

const AdvancedTestSchema = new mongoose.Schema({
    scores: {
        type: Map,
        of: Number,
        required: true
    },
    feedback: {
        type: Map,
        of: String,
        required: true
    },
    recommendations: {
        type: Map,
        of: String,
        required: true
    },
    answers: {
        assess: {
            marketResearch: {
                main: { type: String, default: '' },
                researchSources: { type: String, default: '' },
                validatedFindings: { type: String, default: '' },
                aiTools: { type: String, default: '' }
            },
            consumerSegmentation: {
                main: { type: String, default: '' },
                updatingSegments: { type: String, default: '' },
                behavioralPatterns: { type: String, default: '' },
                targetingCriteria: { type: String, default: '' }
            },
            competitiveAnalysis: {
                main: { type: String, default: '' },
                competitorStrengths: { type: String, default: '' },
                marketTrends: { type: String, default: '' },
                competitiveAdvantage: { type: String, default: '' }
            },
            problemSolutionFit: {
                main: { type: String, default: '' },
                validatedAssumptions: { type: String, default: '' },
                customerProblems: { type: String, default: '' },
                customerDissatisfaction: { type: String, default: '' }
            }
        },
        implement: {
            brandPositioning: {
                main: { type: String, default: '' },
                brandValues: { type: String, default: '' },
                brandPerception: { type: String, default: '' },
                brandConsistency: { type: String, default: '' }
            },
            productDevelopment: {
                main: { type: String, default: '' },
                customerInsights: { type: String, default: '' },
                productRoadmap: { type: String, default: '' },
                usabilityTesting: { type: String, default: '' }
            },
            marketingEffectiveness: {
                main: { type: String, default: '' },
                targetedMessages: { type: String, default: '' },
                campaignPerformance: { type: String, default: '' },
                channelStrategy: { type: String, default: '' }
            },
            customerExperience: {
                main: { type: String, default: '' },
                omniChannelExperience: { type: String, default: '' },
                customerService: { type: String, default: '' },
                continuousImprovement: { type: String, default: '' }
            }
        },
        monitor: {
            performanceTracking: {
                main: { type: String, default: '' },
                kpiAlignment: { type: String, default: '' },
                metricsReview: { type: String, default: '' },
                trackingSystems: { type: String, default: '' }
            },
            consumerSentiment: {
                main: { type: String, default: '' },
                feedbackCollection: { type: String, default: '' },
                sentimentAnalysis: { type: String, default: '' },
                socialMediaMonitoring: { type: String, default: '' }
            }
        }
    },
    progress: { type: Number, default: 0 }, // Progress as a percentage
    overall: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['in progress', 'reviewed', 'completed'], default: 'in progress' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdvancedTest', AdvancedTestSchema);