const axios = require('axios');

async function testChat() {
    console.log('Testando endpoint /chat...');
    try {
        const response = await axios.post('http://localhost:3000/chat', {
            prompt: 'Olá! Quanto é 2+2? Responda apenas com o número.'
        });

        console.log('Resposta recebida:', response.data);
    } catch (error) {
        console.error('Erro no teste:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Dados:', error.response.data);
        }
    }
}

testChat();
