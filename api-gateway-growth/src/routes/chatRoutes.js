const express = require('express');
const { getAIanswer , createConversation , getConversation , deleteConversation ,getAllConversations } = require('../controllers/chatController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/conversations/:id/messages' ,auth, getAIanswer);
router.post('/conversation/create', auth, createConversation);
router.get('/conversation/:id', auth, getConversation);
router.delete('/conversation/:id/delete', auth, deleteConversation);
router.get('/conversations/all', auth, getAllConversations);

module.exports = router;