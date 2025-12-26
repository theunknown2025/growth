const { evaluateAnswers } = require('../service/answer');
const SimpleTest  = require('../models/SimpleTest');
const AdvancedTest = require('../models/AdvancedTest');

const getCountTestByMonth = async (req, res) => {
    try {
        const simpleTestCount = await SimpleTest.aggregate([
            {
                $group: {
                    _id: { month: { $month: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    count: 1
                }
            },
            { $sort: { month: 1 } }
        ]);

        const advancedTestCount = await AdvancedTest.aggregate([
            {
                $group: {
                    _id: { month: { $month: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    count: 1
                }
            },
            { $sort: { month: 1 } }
        ]);

        res.json({ simpleTestCount, advancedTestCount });
    } catch (error) {
        console.error("Error fetching test counts:", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllTests = async (req, res) => {
    try {
        // Get enriched simple tests with user and company details
        const simpleTests = await SimpleTest.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDoc"
                }
            },
            { $unwind: "$userDoc" },
            {
                $lookup: {
                    from: "companydetails",
                    localField: "user",
                    foreignField: "user",
                    as: "companyDoc"
                }
            },
            { 
                $unwind: {
                    path: "$companyDoc",
                    preserveNullAndEmptyArrays: true
                } 
            },
            {
                $project: {
                    userId: "$userDoc._id",
                    userFirstName: "$userDoc.firstName",
                    userLastName: "$userDoc.lastName",
                    companyName: "$companyDoc.companyName",
                    sectorOfActivity: "$companyDoc.sectorOfActivity",
                    status: 1,
                    createdAt: 1
                }
            }
        ]);

        // Get enriched advanced tests with user and company details
        const advancedTests = await AdvancedTest.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDoc"
                }
            },
            { $unwind: "$userDoc" },
            {
                $lookup: {
                    from: "companydetails",
                    localField: "user",
                    foreignField: "user",
                    as: "companyDoc"
                }
            },
            { 
                $unwind: {
                    path: "$companyDoc",
                    preserveNullAndEmptyArrays: true
                } 
            },
            {
                $project: {
                    userId: "$userDoc._id",
                    userFirstName: "$userDoc.firstName",
                    userLastName: "$userDoc.lastName",
                    companyName: "$companyDoc.companyName",
                    sectorOfActivity: "$companyDoc.sectorOfActivity",
                    status: 1,
                    createdAt: 1
                }
            }
        ]);
        res.json({ simpleTests, advancedTests });
    } catch (error) {
        console.error("Error fetching tests:", error);
        res.status(500).json({ error: error.message });
    }
};
 
// Modified simpletestanswer function to check for existing test
const simpletestanswer = async (req, res) => {
    try {
        const { _id } = req.body;
        
        // If an ID is provided, check for an existing test
        if (_id) {
            // If test exists, use completeSimpleTest logic instead
            const existingTest = await SimpleTest.findOne({ _id, user: req.user.id });
            
            if (existingTest) {
                // Update the existing test instead of creating a new one
                const evaluation = await evaluateAnswers(req.body);
                
                existingTest.scores = evaluation.scores;
                existingTest.feedback = evaluation.feedback;
                existingTest.recommendations = evaluation.recommendations;
                existingTest.overall = evaluation.overall;
                existingTest.answers = req.body;
                existingTest.progress = 100;
                existingTest.status = 'completed';
                
                const savedEvaluation = await existingTest.save();
                return res.json(savedEvaluation);
            }
        }
        
        // No existing test found, create a new one
        const evaluation = await evaluateAnswers(req.body);
        const simpleTest = new SimpleTest({
            scores: evaluation.scores,
            feedback: evaluation.feedback,
            recommendations: evaluation.recommendations,
            overall: evaluation.overall,
            answers: req.body,
            progress: 100, // Completed test
            status: 'completed',
            user: req.user.id 
        });

        const savedEvaluation = await simpleTest.save();
        res.json(savedEvaluation);
    } catch (error) {
        console.error("Evaluation error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Modified advancedtestanswer function to check for existing test
const advancedtestanswer = async (req, res) => {
    try {
        const { _id } = req.body;
        
        // If an ID is provided, check for an existing test
        if (_id) {
            // If test exists, use completeAdvancedTest logic instead
            const existingTest = await AdvancedTest.findOne({ _id, user: req.user.id });
            
            if (existingTest) {
                // Update the existing test instead of creating a new one
                const evaluation = await evaluateAnswers(req.body);
                
                existingTest.scores = evaluation.scores;
                existingTest.feedback = evaluation.feedback;
                existingTest.recommendations = evaluation.recommendations;
                existingTest.overall = evaluation.overall;
                existingTest.answers = req.body;
                existingTest.progress = 100;
                existingTest.status = 'completed';
                
                const savedEvaluation = await existingTest.save();
                return res.json(savedEvaluation);
            }
        }
        
        // No existing test found, create a new one
        const evaluation = await evaluateAnswers(req.body);
        const advancedTest = new AdvancedTest({
            scores: evaluation.scores,
            feedback: evaluation.feedback,
            recommendations: evaluation.recommendations,
            overall: evaluation.overall,
            answers: req.body,
            progress: 100, // Completed test
            status: 'completed',
            user: req.user.id 
        });

        const savedEvaluation = await advancedTest.save();
        res.json(savedEvaluation);
    } catch (error) {
        console.error("Evaluation error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Fixed function to save progress for simple test
const saveSimpleTestProgress = async (req, res) => {
    try {
        const { _id, ...answers } = req.body;
        
        // Calculate progress based on filled answers
        let totalFields = 0;
        let filledFields = 0;
        
        // Count assess fields
        Object.values(answers.assess || {}).forEach(value => {
            totalFields++;
            if (value && value.trim() !== '') filledFields++;
        });
        
        // Count implement fields
        Object.values(answers.implement || {}).forEach(value => {
            totalFields++;
            if (value && value.trim() !== '') filledFields++;
        });
        
        // Count monitor fields
        Object.values(answers.monitor || {}).forEach(value => {
            totalFields++;
            if (value && value.trim() !== '') filledFields++;
        });
        
        const progress = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
        
        let test;
        
        if (_id) {
            console.log("Updating existing test with ID:", _id);
            
            // Update existing test - IMPORTANT: Convert string ID to ObjectId if needed
            test = await SimpleTest.findOneAndUpdate(
                { _id: _id, user: req.user.id },
                { 
                    $set: {
                        answers,
                        progress,
                        status: 'in progress'
                    }
                },
                { new: true }
            ).populate('user', 'firstName lastName email role');
            
            if (!test) {
                console.log("Test not found with ID:", _id);
                return res.status(404).json({ 
                    message: 'Test not found or you do not have permission to update it',
                    requestedId: _id,
                    userId: req.user.id
                });
            }
            
            console.log("Test updated successfully:", test._id);
        } else {
            console.log("Creating new test for user:", req.user.id);
            
            // Create new test
            test = new SimpleTest({
                user: req.user.id,
                answers,
                progress,
                status: 'in progress',
                scores: {},
                feedback: {},
                recommendations: {},
                overall: ''
            });
            
            await test.save();
            test = await SimpleTest.findById(test._id).populate('user', 'firstName lastName email role');
            console.log("New test created with ID:", test._id);
        }
        
        res.json(test);
    } catch (error) {
        console.error("Error saving progress:", error);
        res.status(500).json({ error: error.message });
    }
};

// New function to save progress for advanced test
const saveAdvancedTestProgress = async (req, res) => {
    try {
        const { _id, ...answers } = req.body;
        
        // Calculate progress based on filled answers
        let totalFields = 0;
        let filledFields = 0;
        
        // Helper function to count fields in nested objects
        const countFields = (obj) => {
            if (!obj) return;
            
            Object.entries(obj).forEach(([key, value]) => {
                if (typeof value === 'object' && value !== null) {
                    countFields(value);
                } else {
                    totalFields++;
                    if (value && typeof value === 'string' && value.trim() !== '') {
                        filledFields++;
                    }
                }
            });
        };
        
        countFields(answers);
        
        const progress = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
        
        let test;
        
        if (_id) {
            // Update existing test
            test = await AdvancedTest.findOneAndUpdate(
                { _id, user: req.user.id },
                { 
                    answers,
                    progress,
                    status: 'in progress'
                },
                { new: true }
            );
            
            if (!test) {
                return res.status(404).json({ message: 'Test not found or you do not have permission to update it' });
            }
        } else {
            // Create new test
            test = new AdvancedTest({
                user: req.user.id,
                answers,
                progress,
                status: 'in progress',
                scores: {},
                feedback: {},
                recommendations: {},
                overall: ''
            });
            
            await test.save();
        }
        
        res.json(test);
    } catch (error) {
        console.error("Error saving progress:", error);
        res.status(500).json({ error: error.message });
    }
};

const getAllSimpleTests = async (req, res) => {
    try {
        const tests = await SimpleTest.find({ user: req.user.id });
        res.json(tests);
    } catch (error) {
        console.error("Error fetching tests:", error);
        res.status(500).json({ error: error.message });
    }
}

const getAllAdvancedTests = async (req, res) => {
    try {
        const tests = await AdvancedTest.find({ user: req.user.id });
        res.json(tests);
    } catch (error) {
        console.error("Error fetching tests:", error);
        res.status(500).json({ error: error.message });
    }
}

const getSimpletestById = async (req, res) => {
    try {
        const test = await SimpleTest.findById(req.params.id)
            .populate('user', 'firstName lastName email role');
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.json(test);
    } catch (error) {
        console.error("Error fetching test:", error);
        res.status(500).json({ error: error.message });
    }
}

const getAdvancedTestById = async (req, res) => {
    try {
        const test = await AdvancedTest.findById(req.params.id)
            .populate('user', 'firstName lastName email role');
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.json(test);
    } catch (error) {
        console.error("Error fetching test:", error);
        res.status(500).json({ error: error.message });
    }
}

// New function to complete a simple test
const completeSimpleTest = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find the test
        const test = await SimpleTest.findOne({ _id: id, user: req.user.id });
        
        if (!test) {
            return res.status(404).json({ message: 'Test not found or you do not have permission to update it' });
        }
        
        // Only process if the test is in progress
        if (test.status === 'in progress') {
            // If there are no scores yet (test was only saved, not evaluated)
            // we need to evaluate the answers
            if (!test.scores || test.scores.size === 0) {
                const evaluation = await evaluateAnswers(test.answers);
                
                test.scores = evaluation.scores;
                test.feedback = evaluation.feedback;
                test.recommendations = evaluation.recommendations;
                test.overall = evaluation.overall;
            }
            
            test.status = 'completed';
            test.progress = 100;
            await test.save();
        }
        
        res.json(test);
    } catch (error) {
        console.error("Error completing test:", error);
        res.status(500).json({ error: error.message });
    }
};

// New function to complete an advanced test
const completeAdvancedTest = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find the test
        const test = await AdvancedTest.findOne({ _id: id, user: req.user.id });
        
        if (!test) {
            return res.status(404).json({ message: 'Test not found or you do not have permission to update it' });
        }
        
        // Only process if the test is in progress
        if (test.status === 'in progress') {
            // If there are no scores yet (test was only saved, not evaluated)
            // we need to evaluate the answers
            if (!test.scores || test.scores.size === 0) {
                const evaluation = await evaluateAnswers(test.answers);
                
                test.scores = evaluation.scores;
                test.feedback = evaluation.feedback;
                test.recommendations = evaluation.recommendations;
                test.overall = evaluation.overall;
            }
            
            test.status = 'completed';
            test.progress = 100;
            await test.save();
        }
        
        res.json(test);
    } catch (error) {
        console.error("Error completing test:", error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    simpletestanswer,
    advancedtestanswer,
    saveSimpleTestProgress,
    saveAdvancedTestProgress,
    getSimpletestById,
    getAdvancedTestById,
    getAllSimpleTests,
    getAllAdvancedTests,
    getAllTests,
    getCountTestByMonth,
    completeSimpleTest,
    completeAdvancedTest,
};