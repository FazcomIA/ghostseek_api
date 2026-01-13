# Relatório Técnico: Puppeteer DeepSeek API (Não-Oficial)

**Data:** 13/01/2026
**Versão:** 1.1.0

## Visão Geral
Este projeto é uma API não-oficial que encapsula a interação com o chat web do DeepSeek (`chat.deepseek.com`) utilizando automação de navegador via **Puppeteer**. A API permite enviar mensagens programaticamente e receber respostas processadas, mantendo a sessão do usuário persistente.

## Estado Atual da Aplicação

### Arquitetura (MVC)
A aplicação passou por uma refatoração recente e agora segue uma arquitetura modular MVC (Model-View-Controller) para melhor organização e escalabilidade:

```
.
├── src/
│   ├── controllers/
│   │   └── chatController.js  # Lógica de recebimento e validação de requests
│   ├── routes/
│   │   └── chatRoutes.js      # Definição das rotas HTTP
│   ├── services/
│   │   └── puppeteerService.js # Serviço core de automação do browser
│   ├── utils/
│   │   └── textFormatter.js   # Utilitário de limpeza e tratamento de texto
│   └── app.js                 # Configuração da aplicação Express
├── relatorio/                 # Relatórios técnicos
├── user_data/                 # Persistência de sessão do Chrome
├── server.js                  # Ponto de entrada (Entry point)
└── ...arquivos de configuração
```

### Funcionalidades Implementadas
1.  **Bypass de Anti-Bot (Cloudflare)**: Migração para `puppeteer-real-browser`, garantindo acesso estável mesmo com verificações de integridade.
2.  **Persistência de Sessão**: Utiliza o diretório `user_data_real` para manter cookies e login, evitando reautenticação e erros de conexão.
3.  **Toggle de DeepThink e Search**: Capacidade de ativar ou desativar funcionalidades via API.
4.  **Formatação de Resposta**: Higienização automática do texto retornado.
5.  **Recuperação de Erros**: Sistema robusto de reconexão e login automático.

## Detalhes da API

### Endpoint Principal
**POST** `/chat`

#### Corpo da Requisição (Request Body)
```json
{
  "prompt": "Sua pergunta ou comando aqui",
  "deepThink": true,  // (Opcional) true para ativar, false para desativar DeepThink
  "search": false     // (Opcional) true para ativar, false para desativar Search
}
```

#### Resposta de Sucesso (Response Body)
```json
{
  "response": "Texto processado e limpo retornado pelo DeepSeek..."
}
```

### Exemplo de Fluxo da Resposta
1.  O **Puppeteer** captura o texto bruto do navegador (ex: `\n\nTexto...\n\n\n`).
2.  O **textFormatter** remove espaços iniciais/finais e normaliza quebras de linha múltiplas.
3.  O JSON final é entregue limpo para o cliente.

## Scripts Utilitários
-   `node interactive_chat.js`: Interface CLI para testar o chat interativamente.
-   `node test_features.js`: Script de validação para os toggles DeepThink/Search.
-   `node server.js`: Inicia a API.

## Considerações Finais
O projeto está estável e funcional. A mudança para MVC facilita a adição de novos endpoints no futuro (como histórico de conversas ou múltiplos chats). A adição dos toggles torna a API equiparável à interface web em termos de recursos.

## Histórico de Commits
- **00ba7d4** - 2026-01-13 01:29:34 - Refactor: MVC structure, DeepThink/Search toggles, and response formatter
- **2caf81d** - 2026-01-13 01:01:45 - Initial commit: working DeepSeek Puppeteer API with interactive chat


   ____ _               _   ____            _           _    ____ ___ 
  ╱ ___│ │__   ___  ___│ │_╱ ___│  ___  ___│ │ __      ╱ ╲  │  _ ╲_ _│
 │ │  _│ '_ ╲ ╱ _ ╲╱ __│ __╲___ ╲ ╱ _ ╲╱ _ ╲ │╱ ╱____ ╱ _ ╲ │ │_) │ │ 
 │ │_│ │ │ │ │ (_) ╲__ ╲ │_ ___) │  __╱  __╱   <_____╱ ___ ╲│  __╱│ │ 
  ╲____│_│ │_│╲___╱│___╱╲__│____╱ ╲___│╲___│_│╲_╲   ╱_╱   ╲_╲_│  │___│
                                                                      