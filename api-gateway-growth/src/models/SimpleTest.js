const mongoose = require('mongoose');

const SimpleTestSchema = new mongoose.Schema({
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
            marketResearch: { type: String, default: '' },
            consumerSegmentation: { type: String, default: '' },
            competitiveAnalysis: { type: String, default: '' },
            problemSolutionFit: { type: String, default: '' }
        },
        implement: {
            brandPositioning: { type: String, default: '' },
            productDevelopment: { type: String, default: '' },
            marketingEffectiveness: { type: String, default: '' },
            customerExperience: { type: String, default: '' }
        },
        monitor: {
            performanceTracking: { type: String, default: '' },
            consumerSentiment: { type: String, default: '' }
        }
    },
    progress: { type: Number, default: 0 }, // Progress as a percentage
    overall: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['in progress', 'reviewed', 'completed'], default: 'in progress' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SimpleTest', SimpleTestSchema);
