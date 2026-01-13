const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("=== DeepSeek Puppeteer CLI Chat ===");
console.log("O servidor (server.js) deve estar rodando em outra aba.");
console.log("Digite sua pergunta e pressione Enter. Digite 'sair' para encerrar.\n");

function askQuestion() {
    rl.question('Você: ', async (input) => {
        if (input.toLowerCase() === 'sair') {
            console.log('Encerrando...');
            rl.close();
            return;
        }

        try {
            process.stdout.write('DeepSeek: (Pensando...)');

            const response = await axios.post('http://localhost:3000/chat', {
                prompt: input
            });

            // Limpa a linha do "Thinking..."
            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0);

            console.log(`DeepSeek: ${response.data.response}\n`);
        } catch (error) {
            readline.clearLine(process.stdout, 0);
            readline.cursorTo(process.stdout, 0);
            console.error(`\nErro: Falha ao conectar com a API (${error.message}). Verifique se server.js está rodando.\n`);
        }

        askQuestion();
    });
}

// Inicia o loop
askQuestion();
