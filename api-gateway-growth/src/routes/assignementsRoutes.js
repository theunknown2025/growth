// In your routes file (assignementsRoutes.js)
const express = require('express');
const auth = require('../middleware/auth');
const { 
    getAllAsignements,
    getCountAssignement , 
    getAsignementById, 
    createAssignement, 
    updateAsignement, 
    deleteAsignement,
    getAllAssignementsByUserId,
    getCountAssignementsByUserId,
    getAllAsignementsByClientId,
    getAllAsignementsTemplates,
    getAsignementTemplateById,
    createAssignementTemplate,
    updateAssignementTemplate,
    handleAssigneTemplate
} = require('../controllers/assignementsController');
const upload = require('../utils/document');

// Use upload.any() to handle any files with any field names
const router = express.Router();
router.get('/all', auth, getAllAsignements);
router.get('/count', auth, getCountAssignement);
router.post('/create', auth, upload.any(), createAssignement);
router.put('/:id/update', auth, upload.any(), updateAsignement);
router.delete('/:id/delete', auth, deleteAsignement);
router.get('/:id/details', auth, getAsignementById);
router.get('/user/all', auth, getAllAssignementsByUserId);
router.get('/user/count', auth, getCountAssignementsByUserId);
router.get('/client/:id/all', auth, getAllAsignementsByClientId);
router.get('/template/all', auth, getAllAsignementsTemplates);
router.post('/template/create', auth, upload.any(), createAssignementTemplate);
router.get('/template/:id/details', auth, getAsignementTemplateById);
router.put('/template/:id/update', auth, upload.any(), updateAssignementTemplate);
router.get('/template/:id/delete', auth, deleteAsignement);
router.post('/template/assign', auth, upload.any(), handleAssigneTemplate);

module.exports = router;
