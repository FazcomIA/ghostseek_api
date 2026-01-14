const app = require('./src/app');
const { initBrowser, closeBrowser } = require('./src/services/puppeteerService');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
  console.log(`
   ____ _               _   ____            _           _    ____ ___ 
  ╱ ___│ │__   ___  ___│ │_╱ ___│  ___  ___│ │ __      ╱ ╲  │  _ ╲_ _│
 │ │  _│ '_ ╲ ╱ _ ╲╱ __│ __╲___ ╲ ╱ _ ╲╱ _ ╲ │╱ ╱____ ╱ _ ╲ │ │_) │ │ 
 │ │_│ │ │ │ │ (_) ╲__ ╲ │_ ___) │  __╱  __╱   <_____╱ ___ ╲│  __╱│ │ 
  ╲____│_│ │_│╲___╱│___╱╲__│____╱ ╲___│╲___│_│╲_╲   ╱_╱   ╲_╲_│  │___│
                                                                      
    `);
  console.log(`Server running on http://localhost:${PORT}`);
  // Inicializa o browser ao arrancar
  await initBrowser();
});

async function gracefulShutdown(signal) {
  console.log(`\nRecebido sinal ${signal}. Encerrando graciosamente...`);
  await closeBrowser();
  server.close(() => {
    console.log('Servidor HTTP fechado.');
    process.exit(0);
  });

  // Força encerramento se travar
  setTimeout(() => {
    console.error('Timeout no encerramento. Forçando saída.');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
