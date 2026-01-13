const { connect } = require('puppeteer-real-browser');
const path = require('path');
require('dotenv').config();

let browser;
let page;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function initBrowser() {
    console.log('Iniciando navegador com puppeteer-real-browser...');
    const userDataDir = path.join(process.cwd(), 'user_data_real');

    try {
        const connectOptions = {
            headless: false, // Recomendado false para melhor bypass
            turnstile: true, // Ativa bypass automático de Turnstile
            disableXvfb: process.env.DISABLE_XVFB === 'true', // Configutável via ENV (True no Mac, False no Docker)
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                `--user-data-dir=${userDataDir}`
            ],
            connectOption: {
                defaultViewport: null
            }
        };

        // if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        //     connectOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        //     console.log('Usando executável customizado:', process.env.PUPPETEER_EXECUTABLE_PATH);
        // }

        const { browser: connectedBrowser, page: connectedPage } = await connect(connectOptions);

        browser = connectedBrowser;
        page = connectedPage;

        await page.setViewport({ width: 1280, height: 800 });

        console.log('Navegador iniciado. Acessando chat.deepseek.com...');
        await page.goto('https://chat.deepseek.com/', { waitUntil: 'networkidle2', timeout: 60000 });
        console.log('URL atual:', page.url());

        await sleep(3000);

        if (page.url().includes('sign_in') || page.url().includes('login')) {
            console.log('Sessão expirada ou não existente. Realizando Login...');
            await login();
        } else {
            console.log('Sessão restaurada com sucesso! (Já estamos no chat)');
            try {
                await page.waitForSelector('textarea', { timeout: 5000 });
                console.log('Chat pronto para uso.');
            } catch (e) {
                console.warn('Aviso: Textarea não detectado imediatamente.');
            }
        }

    } catch (error) {
        console.error('Erro na inicialização do Real Browser:', error);
        if (page) await page.screenshot({ path: 'startup_error.png' });
        throw error;
    }
}

async function login() {
    try {
        console.log('Aguardando input de identificação...');
        await page.waitForSelector('input.ds-input__input[type="text"]', { timeout: 30000 });

        console.log('Preenchendo email...');
        await page.type('input.ds-input__input[type="text"]', process.env.DS_EMAIL);

        console.log('Preenchendo senha...');
        await page.type('input.ds-input__input[type="password"]', process.env.DS_PASSWORD);

        console.log('Clicando em Entrar...');
        await page.waitForSelector('button.ds-basic-button--primary', { timeout: 5000 });
        await page.click('button.ds-basic-button--primary');

        await page.waitForFunction(() => !window.location.href.includes('sign_in'), { timeout: 30000 })
            .catch(e => console.log('Timeout aguardando mudança de URL (pode ser CAPTCHA).'));

        console.log('Login submetido.');

    } catch (error) {
        console.error('Erro no login:', error);
        await page.screenshot({ path: 'login_error.png' });
        throw error;
    }
}

async function sendMessage(prompt, options = {}, specificChatTitle = null) {
    if (!page) throw new Error('Navegador não inicializado.');

    try {
        if (page.url().includes('sign_in')) {
            console.log('Detectado redirecionamento para login. Tentando relogar...');
            await login();
        }

        // Se foi solicitado um chat específico (pelo título), tenta mudar
        if (specificChatTitle) {
            console.log(`Tentando mudar para conversa: "${specificChatTitle}"`);
            const chatFound = await page.evaluate((title) => {
                const elements = Array.from(document.querySelectorAll('div'));
                // Procura exato match ou contém
                const target = elements.find(el => el.innerText === title);
                if (target) {
                    target.click();
                    return true;
                }
                return false;
            }, specificChatTitle);

            if (chatFound) {
                await sleep(2000); // Espera carregar contexto
            } else {
                console.warn(`Conversa "${specificChatTitle}" não encontrada. Continuando no chat atual.`);
            }
        }

        console.log('Enviando mensagem...');
        // Aumentando timeout para 30s para dar tempo de bypass se necessário
        await page.waitForSelector('textarea', { timeout: 30000 });

        // Toggles (DeepThink / Search) - Executar após garantir que a página carregou
        if (typeof options.deepThink !== 'undefined') {
            await toggleFeature('DeepThink', options.deepThink);
        }

        if (typeof options.search !== 'undefined') {
            await toggleFeature('Search', options.search);
        }

        // Foca e limpa
        await page.click('textarea');
        await page.keyboard.down('Meta');
        await page.keyboard.press('a');
        await page.keyboard.up('Meta');
        await page.keyboard.press('Backspace');

        // Digita e envia
        await page.type('textarea', prompt);
        await sleep(500);
        await page.keyboard.press('Enter');

        console.log('Mensagem enviada. Aguardando resposta...');
        await sleep(2000);

        const response = await waitForResponseCompletion();
        return response;

    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        if (page) await page.screenshot({ path: 'chat_error.png' });
        throw error;
    }
}

// Função para alternar funcionalidades (DeepThink/Search)
async function toggleFeature(featureName, isActive) {
    if (!page) return;
    try {
        // Tenta encontrar o botão ou checkbox correspondente
        // Log "best effort" por enquanto para evitar crash
        // console.log(`Tentando ajustar ${featureName} para ${isActive}`);

        // Lógica de implementação futura: encontrar o botão pelo aria-label ou texto e clicar se o estado diferir
        // Por ora, apenas evitamos o ReferenceError

    } catch (error) {
        console.warn(`Erro ao alternar ${featureName}:`, error);
    }
}

async function waitForResponseCompletion() {
    return new Promise(async (resolve, reject) => {
        try {
            let lastText = '';
            let stableChecks = 0;
            const maxStableChecks = 6; // ~3 segundos de estabilidade
            const checkInterval = 500;
            const timeout = 120000; // 2 minutos
            let startTime = Date.now();

            const interval = setInterval(async () => {
                if (Date.now() - startTime > timeout) {
                    clearInterval(interval);
                    resolve(lastText || "Timeout aguardando resposta.");
                    return;
                }

                try {
                    // Seleciona todas as respostas do bot
                    // DeepSeek costuma usar classes como .ds-markdown ou div que contém a resposta
                    // Vamos pegar o último elemento de texto gerado
                    const responses = await page.$$('.ds-markdown, .markdown-body');

                    if (responses.length > 0) {
                        const lastResponse = responses[responses.length - 1];
                        const currentText = await page.evaluate(el => el.innerText, lastResponse);

                        if (currentText && currentText.length > 0) {
                            // Se o texto não mudou desde a última checagem
                            if (currentText === lastText) {
                                stableChecks++;
                            } else {
                                stableChecks = 0;
                                lastText = currentText;
                            }

                            // Se estável e não parece estar "digitando" (cursor piscando seria outra coisa, mas texto estável é bom sinal)
                            if (stableChecks >= maxStableChecks) {
                                clearInterval(interval);
                                resolve(currentText);
                            }
                        }
                    }
                } catch (err) {
                    // Ignora erros transientes de seleção
                }
            }, checkInterval);

        } catch (error) {
            reject(error);
        }
    });
}

async function startNewChat() {
    if (!page) throw new Error('Navegador não inicializado.');
    console.log('Iniciando nova conversa...');

    try {
        // Tenta encontrar o botão "Nova conversa" pelo texto
        const newChatBtn = await page.waitForSelector('xpath///span[contains(text(), "Nova conversa")]/ancestor::div[@role="button" or contains(@class, "ds-icon-button")]', { timeout: 5000 });

        if (newChatBtn) {
            await newChatBtn.click();
            await sleep(1000);
            console.log('Nova conversa iniciada.');
        } else {
            throw new Error('Botão de nova conversa não encontrado.');
        }
    } catch (error) {
        console.warn('Erro ao iniciar nova conversa, tentando recarregar página:', error.message);
        await page.goto('https://chat.deepseek.com/', { waitUntil: 'networkidle2' });
    }
}

async function getChatHistory() {
    if (!page) return [];
    console.log('Extraindo histórico de conversas...');

    try {
        const history = await page.evaluate(() => {
            const chats = [];
            const scrollAreas = document.querySelectorAll('.ds-scroll-area');

            for (const area of scrollAreas) {
                const items = area.querySelectorAll('div');
                for (const item of items) {
                    const text = item.innerText?.trim();
                    if (text && text.length > 0 && text !== 'Nova conversa' && text.length < 50) {
                        if (!chats.find(c => c === text)) {
                            chats.push(text);
                        }
                    }
                }
            }
            return chats.slice(0, 20);
        });

        return history;
    } catch (e) {
        console.error('Erro ao listar chats:', e);
        return [];
    }
}

module.exports = { initBrowser, sendMessage, startNewChat, getChatHistory };
