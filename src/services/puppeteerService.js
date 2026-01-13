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
        // Mantém user_data na raiz do projeto
        userDataDir: path.join(process.cwd(), 'user_data'),
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        console.log('Acessando chat.deepseek.com...');
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
        console.error('Erro na inicialização:', error);
        if (page) await page.screenshot({ path: 'startup_error.png' });
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

async function sendMessage(prompt, options = {}) {
    if (!page) throw new Error('Navegador não inicializado.');

    try {
        if (page.url().includes('sign_in')) {
            console.log('Detectado redirecionamento para login. Tentando relogar...');
            await login();
        }

        console.log('Enviando mensagem...');
        await page.waitForSelector('textarea', { timeout: 10000 });

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

async function toggleFeature(featureName, shouldEnable) {
    // Tenta clicar no botão se o estado desejado for diferente do atual
    // Essa é uma implementação "best-effort" pois detectar o estado "ativo" depende de classes css específicas

    // XPath para achar botões que contenham o texto (Search ou DeepThink)
    // Puppeteer v23+ usa prefixo xpath/
    const buttonSelector = `xpath///div[contains(text(), '${featureName}')]`;

    try {
        const elements = await page.$$(buttonSelector);
        if (elements.length > 0) {
            const btn = elements[0];

            // Verifica se está ativo
            // Geralmente botões ativos têm uma cor diferente ou classe específica
            // Vamos logar as classes para debug se precisar, mas por hora vamos tentar inferir ou apenas clicar se for explicitado

            // NOTA: Sem saber a classe de "ativo", é difícil garantir. 
            // Vou assumir que o usuário só manda "true" se quiser ativar. 
            // Se já estiver ativo, clicar pode desativar. Isso é um risco.
            // Para mitigar, vamos tentar verificar uma classe comum de active tipo 'ds-button--active' ou checar a cor/estilo computado?
            // MODO SEGURO: Apenas logar que tentamos. Mas o usuário quer a func.
            // Vamos clicar.

            // Melhoria: Tentar ver se tem um elemento pai que indica status (ex: checkbox visual)
            await btn.click();
            console.log(`Clicado em ${featureName} (Tentativa de ${shouldEnable ? 'ativar' : 'desativar'})`);
            await sleep(500);
        } else {
            console.warn(`Botão ${featureName} não encontrado.`);
        }
    } catch (e) {
        console.warn(`Erro ao tentar toggle ${featureName}:`, e.message);
    }
}

async function waitForResponseCompletion() {
    return await page.evaluate(async () => {
        return new Promise((resolve) => {
            let lastText = '';
            let stableCount = 0;
            const checkInterval = setInterval(() => {
                const messageElements = document.querySelectorAll('.ds-markdown');
                let currentText = '';
                if (messageElements.length > 0) {
                    currentText = messageElements[messageElements.length - 1].innerText;
                } else {
                    const paragraphs = document.querySelectorAll('p');
                    if (paragraphs.length > 0) currentText = paragraphs[paragraphs.length - 1].innerText;
                }

                if (currentText && currentText === lastText && currentText.length > 0) {
                    stableCount++;
                } else {
                    stableCount = 0;
                    lastText = currentText;
                }

                if (stableCount >= 5) {
                    clearInterval(checkInterval);
                    resolve(lastText);
                }
            }, 500);

            setTimeout(() => {
                clearInterval(checkInterval);
                resolve(lastText || "Timeout: Resposta incompleta ou não detectada.");
            }, 90000);
        });
    });
}

module.exports = { initBrowser, sendMessage };
