const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
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
    completeAdvancedTest
} = require('../controllers/evaluationController');

// Get all tests (for admin)
router.get('/alltests', auth, getAllTests);

// Get count of tests by month
router.get('/counttestbymonth', auth, getCountTestByMonth);

// Simple test routes - important to have specific routes before parameterized routes
router.get('/allsimpletests', auth, getAllSimpleTests);
router.post('/simpletest/progress', auth, saveSimpleTestProgress);
router.post('/simpletest/:id/complete', auth, completeSimpleTest);
router.get('/simpletest/:id', auth, getSimpletestById);
router.post('/simpletest', auth, simpletestanswer);

// Advanced test routes - important to have specific routes before parameterized routes
router.get('/alladvancedtests', auth, getAllAdvancedTests);
router.post('/advancedtest/progress', auth, saveAdvancedTestProgress);
router.post('/advancedtest/:id/complete', auth, completeAdvancedTest);
router.get('/advancedtest/:id', auth, getAdvancedTestById);
router.post('/advancedtest', auth, advancedtestanswer);

module.exports = router;