# Guia de Deploy no Render.com 🚀

Siga estes passos para colocar sua API GhostSeeK online usando o repositório GitHub.

## 1. Preparação no Render

1.  Acesse [dashboard.render.com](https://dashboard.render.com/).
2.  Clique em **New +** e selecione **Web Service**.
3.  Conecte sua conta do GitHub e selecione o repositório `FazcomIA/ghostseek_api`.

## 2. Configuração do Serviço

Preencha os campos da seguinte forma:

*   **Name**: `ghostseek-api` (ou o que preferir)
*   **Region**: Escolha a mais próxima (ex: Ohio - US East)
*   **Branch**: `main`
*   **Runtime**: **Docker** (Isso é crucial! O Render vai ler nosso Dockerfile).

## 3. Variáveis de Ambiente (Environment Variables)

Esta é a parte mais importante para o login funcionar. Role para baixo até "Environment Variables" e adicione:

| Key | Value | Descrição |
| :--- | :--- | :--- |
| `DS_EMAIL` | `seu_email@gmail.com` | Seu email do DeepSeek (Use as mesmas credenciais do .env) |
| `DS_PASSWORD` | `sua_senha` | Sua senha do DeepSeek |
| `DISABLE_XVFB` | `true` | **Importante:** Mantém a configuração correta do display virtual |
| `PORT` | `3000` | Porta da aplicação (Opcional, o Render costuma detectar) |

> **Nota**: Não precisamos definir `HEADLESS` pois o código já força `headless: false`, o que é suportado pelo Docker com Xvfb.

## 4. Plano (Instance Type)

O Puppeteer consome bastante memória.
*   **Starter (Recomendado)**: O plano gratuito pode funcionar para testes, mas se o navegador cair por "Out of Memory" (Erro 137), considere o plano Starter ($7/mês) que tem mais RAM.

## 5. Finalizar

Clique em **Create Web Service**.

O Render vai iniciar o build:
1.  Clonar seu repo.
2.  Ler o `Dockerfile`.
3.  Instalar o Chrome e dependências (pode demorar uns 3-5 minutos na primeira vez).
4.  Iniciar com `xvfb-run ... node server.js`.

Acompanhe os **Logs**. Você deverá ver o ascii art do **GhostSeeK** e "Iniciando navegador...".

---

### Observação sobre Persistência
O Render tem sistema de arquivos efêmero no plano básico. Isso significa que se o serviço reiniciar, ele pode pedir login novamente na primeira request. Como automatizamos o login via variáveis de ambiente (`DS_EMAIL`/`PW`), isso não será problema, ele logará automaticamente a cada reinício!
