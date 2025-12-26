const express = require('express');
const auth = require('../middleware/auth');
const { 
    getDashboardCounts
 } = require('../controllers/analysisController');
const router = express.Router();

router.get('/all' , auth, getDashboardCounts);

module.exports = router;