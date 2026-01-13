const { sendMessage } = require('../services/puppeteerService');
const { cleanText } = require('../utils/textFormatter');

async function handleChat(req, res) {
    const { prompt, deepThink, search, chatTitle } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        console.log(`Recebido chat. DT: ${deepThink}, Search: ${search}, Title: ${chatTitle}`);
        const rawResponse = await sendMessage(prompt, { deepThink, search }, chatTitle);
        const response = cleanText(rawResponse);

        res.json({ response });
    } catch (error) {
        console.error('Erro no controller de chat:', error);
        res.status(500).json({ error: 'Failed to process message', details: error.message });
    }
}

async function listChats(req, res) {
    try {
        const { getChatHistory } = require('../services/puppeteerService');
        const chats = await getChatHistory();
        res.json({ chats });
    } catch (error) {
        res.status(500).json({ error: 'Failed to list chats', details: error.message });
    }
}

async function newChat(req, res) {
    try {
        const { startNewChat } = require('../services/puppeteerService');
        await startNewChat();
        res.json({ message: 'Nova conversa iniciada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to start new chat', details: error.message });
    }
}

module.exports = { handleChat, listChats, newChat };
