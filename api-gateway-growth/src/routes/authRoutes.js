const express = require('express');
const { 
    register, 
    login, 
    me, 
    updateUser, 
    updateUserPassword, 
    createCompanyDetails,
    getCompanyDetails,
    updateCompanyDetails
} = require('../controllers/authController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/current' ,auth, me);
router.put('/update', auth, updateUser);
router.put('/updatepassword', auth, updateUserPassword);
router.post('/createcompany', auth, createCompanyDetails);
router.get('/companydetails', auth, getCompanyDetails);
router.put('/updatecompany', auth, updateCompanyDetails);

module.exports = router;