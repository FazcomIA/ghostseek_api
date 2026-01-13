const { sendMessage } = require('../services/puppeteerService');
const { cleanText } = require('../utils/textFormatter');

async function handleChat(req, res) {
    const { prompt, deepThink, search } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        console.log(`Recebido pedido de chat. DeepThink: ${deepThink}, Search: ${search}`);
        const rawResponse = await sendMessage(prompt, { deepThink, search });
        const response = cleanText(rawResponse);

        res.json({ response });
    } catch (error) {
        console.error('Erro no controller de chat:', error);
        res.status(500).json({ error: 'Failed to process message', details: error.message });
    }
}

module.exports = { handleChat };
