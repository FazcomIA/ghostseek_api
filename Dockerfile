FROM node:22-slim

# Instala dependências necessárias para o Chrome e Xvfb
# Instala google-chrome-stable para garantir todas as libs e fontes
# Instala dependências e Chromium para garantir libs
# Google Chrome não tem suporte oficial Linux ARM64 (Apple Silicon), então usamos Chromium
# Instala dependências e Google Chrome Stable (x64)
# Para Macs M1/M2, isso exigirá rodar com --platform linux/amd64
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    xvfb \
    fonts-liberation \
    xdg-utils \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia arquivos de definição
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia código fonte
COPY . .

# Cria diretório para dados do usuário
RUN mkdir -p user_data_real

# Variáveis de ambiente
ENV HEADLESS=false
ENV XVFB=true
# ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable (Deixar o puppeteer-real-browser gerenciar ou usar o sistema se configurado)
# Mas vamos garantir que o puppeteer-real-browser baixe o que precisa
# ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Porta
EXPOSE 3000

# Script de inicialização customizado para rodar xvfb
CMD ["sh", "-c", "xvfb-run --auto-servernum --server-args='-screen 0 1280x960x24' node server.js"]
# CMD ["node", "server.js"]
