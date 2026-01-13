const express = require('express');
const router = express.Router();
const { handleChat, listChats, newChat } = require('../controllers/chatController');

// Rota POST / (será montada em /chat)
router.post('/', handleChat);
router.get('/list', listChats); // GET /chat/list (já que app.js monta em /chat)
router.post('/new', newChat);   // POST /chat/new

module.exports = router;
