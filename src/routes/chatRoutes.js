const express = require('express');
const router = express.Router();
const { handleChat } = require('../controllers/chatController');

// Rota POST / (será montada em /chat)
router.post('/', handleChat);

module.exports = router;
