const express = require('express');
const bodyParser = require('body-parser');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

app.use(bodyParser.json());

// Rotas
app.use('/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Puppeteer DeepSeek API is running (MVC)' });
});

module.exports = app;
