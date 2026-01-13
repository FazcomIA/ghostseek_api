const axios = require('axios');

async function testFeatures() {
    console.log('Testando endpoint /chat com toggles...');
    try {
        // Teste com DeepThink ativado e Search desativado
        console.log('Enviando request com deepThink: true, search: false');
        const response = await axios.post('http://localhost:3000/chat', {
            prompt: 'Explique a teoria da relatividade resumidamente.',
            deepThink: true,
            search: false
        });
        console.log('Resposta (DeepThink ON):', response.data);

        // Teste com Search ativado
        console.log('\nEnviando request com search: true');
        const response2 = await axios.post('http://localhost:3000/chat', {
            prompt: 'Quem ganhou a copa do mundo de 2022?',
            search: true
        });
        console.log('Resposta (Search ON):', response2.data);

    } catch (error) {
        console.error('Erro no teste de features:', error.message);
        if (error.response) {
            console.error('Dados:', error.response.data);
        }
    }
}

testFeatures();
