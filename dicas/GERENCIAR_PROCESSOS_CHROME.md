# Gerenciamento de Processos Chrome (Puppeteer)

Quando o Puppeteer não é fechado corretamente (por exemplo, após um crash), processos do Chrome podem continuar rodando "zumbis" e travando a pasta de dados do usuário (`user_data_real`), causando erros como `ECONNREFUSED` ao tentar iniciar novamente.

Aqui estão os comandos para identificar e limpar esses processos no terminal do macOS.

## 1. Listar Processos Zumbis

Para ver se há processos do Chrome ou Puppeteer rodando em segundo plano:

```bash
ps aux | grep -E "chrome|puppeteer" | grep -v grep
```

Isso listará todos os processos. Se você vir várias linhas de comando do Google Chrome, especialmente aquelas com `--headless` ou `user_data_real`, eles são os culpados.

## 2. Matar Processos

### Opção A: Matar tudo automaticamente (Mais rápido)
Este comando encerra forçadamente todos os processos que tenham "Chrome" ou "puppeteer" no nome.

```bash
pkill -f "Chrome" && pkill -f "puppeteer"
```

### Opção B: Matar por ID (Mais seguro se você tiver outros Chromes abertos)
Se você tem seu navegador Chrome pessoal aberto e não quer fechá-lo, use o comando de listar (passo 1), pegue o número do **PID** (segunda coluna) e mate um por um:

```bash
kill -9 <PID>
```
Exemplo:
```bash
kill -9 12345
```

## Resumo do Problema
O erro `ECONNREFUSED 127.0.0.1:...` acontece porque o "dono" anterior da pasta de perfil (o processo antigo) ainda está segurando o arquivo de "Lock", impedindo que o novo processo do servidor assuma o controle.
