const app = require('./src/app');
const { initBrowser } = require('./src/services/puppeteerService');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
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
