const app = require('./src/app');
const { initBrowser } = require('./src/services/puppeteerService');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    // Inicializa o browser ao arrancar
    await initBrowser();
});
