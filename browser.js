const puppeteer = require('puppeteer');
const path = require('path');
require('dotenv').config();

let browser;
let page;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function initBrowser() {
    console.log('Iniciando navegador...');
    const isHeadless = process.env.HEADLESS === 'true';

    browser = await puppeteer.launch({
        headless: isHeadless,
        userDataDir: path.join(__dirname, 'user_data'), // Persistência de sessão (cookies, local storage)
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        console.log('Acessando chat.deepseek.com...');

        // Navega para a raiz. Se o cookie de sessão existir, deve carregar o chat.
        // Se não, o site provavelmente redirecionará para /sign_in ou mostrará o botão de login.
        await page.goto('https://chat.deepseek.com/', { waitUntil: 'networkidle2', timeout: 60000 });

        console.log('URL atual:', page.url());

        // Aguarda estabilização
        await sleep(3000);

        // Verifica se precisa de login
        if (page.url().includes('sign_in') || page.url().includes('login')) {
            console.log('Sessão expirada ou não existente. Realizando Login...');
            await login();
        } else {
            console.log('Sessão restaurada com sucesso! (Já estamos no chat)');

            // Validação visual opcional
            try {
                // Tenta achar textarea ou algum elemento de chat
                await page.waitForSelector('textarea', { timeout: 5000 });
                console.log('Chat pronto para uso.');
            } catch (e) {
                console.warn('Aviso: Textarea não detectado imediatamente, mas URL parece correta.');
            }
        }

    } catch (error) {
        console.error('Erro na inicialização:', error);
        if (page) {
            await page.screenshot({ path: 'startup_error.png' });
        }
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

        // Aguarda sair da página de login
        await page.waitForFunction(() => !window.location.href.includes('sign_in'), { timeout: 30000 })
            .catch(e => console.log('Timeout aguardando mudança de URL (pode ser CAPTCHA).'));

        console.log('Login submetido.');

    } catch (error) {
        console.error('Erro no login:', error);
        await page.screenshot({ path: 'login_error.png' });
        throw error; // Propaga erro para saber que falhou
    }
}

async function sendMessage(prompt) {
    if (!page) {
        throw new Error('Navegador não inicializado.');
    }

    try {
        // Assegurar que estamos na página de chat (pode ter navegado ou recarregado)
        if (page.url().includes('sign_in')) {
            console.log('Detectado redirecionamento para login durante envio. Tentando relogar...');
            await login();
        }

        console.log('Enviando mensagem...');

        await page.waitForSelector('textarea', { timeout: 10000 });
        await page.click('textarea');

        // Limpa e digita
        await page.keyboard.down('Meta');
        await page.keyboard.press('a');
        await page.keyboard.up('Meta');
        await page.keyboard.press('Backspace');

        await page.type('textarea', prompt);
        await sleep(500);

        await page.keyboard.press('Enter');

        console.log('Mensagem enviada. Aguardando resposta...');

        await sleep(2000); // Aguarda inicio

        const response = await waitForResponseCompletion();
        return response;

    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        if (page) {
            await page.screenshot({ path: 'chat_error.png' });
            console.log('Screenshot de erro salvo em chat_error.png');
        }
        throw error;
    }
}

async function waitForResponseCompletion() {
    // Melhoria na robustez: Captura o texto do último markdown renderizado
    return await page.evaluate(async () => {
        return new Promise((resolve) => {
            let lastText = '';
            let stableCount = 0;
            const checkInterval = setInterval(() => {
                // Seletores comuns do DeepSeek
                // Tenta pegar o container de mensagens e o último item
                // Observação: DeepSeek usa divs com classes como "ds-markdown" para o conteúdo da resposta

                const messageElements = document.querySelectorAll('.ds-markdown');

                let currentText = '';
                if (messageElements.length > 0) {
                    // Pega o último
                    currentText = messageElements[messageElements.length - 1].innerText;
                } else {
                    // Fallback
                    const paragraphs = document.querySelectorAll('p');
                    if (paragraphs.length > 0) currentText = paragraphs[paragraphs.length - 1].innerText;
                }

                // Verifica estabilidade (se parou de escrever)
                if (currentText && currentText === lastText && currentText.length > 0) {
                    // Adicional: verificar se o botão de "Stop" sumiu ou virou "Regenerate"? 
                    // Simplificação: estabilidade de texto
                    stableCount++;
                } else {
                    stableCount = 0;
                    lastText = currentText;
                }

                // Espera 2.5s de silêncio (5 checks de 500ms)
                if (stableCount >= 5) {
                    clearInterval(checkInterval);
                    resolve(lastText);
                }
            }, 500);

            // Timeout 90s (respostas longas)
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve(lastText || "Timeout: Resposta incompleta ou não detectada.");
            }, 90000);
        });
    });
}

module.exports = { initBrowser, sendMessage };
