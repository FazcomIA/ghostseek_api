FROM node:22-slim

# Instala dependências necessárias para o Chrome e Xvfb
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
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Porta
EXPOSE 3000

# Script de inicialização customizado para rodar xvfb
CMD ["sh", "-c", "xvfb-run --auto-servernum --server-args='-screen 0 1280x960x24' node server.js"]
