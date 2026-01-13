const express = require('express');
const bodyParser = require('body-parser');
const { initBrowser, sendMessage } = require('./browser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Endpoint de teste de saúde
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Puppeteer DeepSeek API is running' });
});

// Endpoint para enviar mensagem
app.post('/chat', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const response = await sendMessage(prompt);
        res.json({ response });
    } catch (error) {
        console.error('Erro no chat:', error);
        res.status(500).json({ error: 'Failed to process message', details: error.message });
    }
});

// Inicializa o servidor e o navegador
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    await initBrowser();
});
