# Guia de Gerenciamento de Processos (macOS)

Este guia contém comandos úteis para identificar e encerrar processos que podem estar travando portas ou rodando em segundo plano no seu terminal.

## 🕐 Verificar Processos por Porta
Se você quer saber **o que** está rodando em uma porta específica (como a `3000` do nosso servidor):

```bash
lsof -i :3000
```
Isso mostrará o `PID` (ID do Processo), o nome do comando (`COMMAND`) e o usuário.

---

## 🔪 Encerrar (Matar) Processos

### 1. Pelo PID (Mais Seguro)
Se você usou o comando acima e descobriu o **PID** (ex: `12345`), use:

```bash
kill 12345
```

Se o processo teimar em não fechar, use a força bruta (`-9`):
```bash
kill -9 12345
```

### 2. Pelo Nome (Cuidado!)
Isso mata **todos** os processos que tenham esse nome.

**Matar todos os processos Node:**
```bash
pkill -f node
```

**Matar todos os processos do Chrome:**
> ⚠️ **Atenção:** Isso fechará também o seu navegador pessoal se ele for o Chrome!
```bash
pkill -f "Chrome"
```

---

## 🔎 Listar Processos Específicos
Para procurar processos rodando pelo nome (sem matar):

```bash
ps aux | grep node
```
O comando `grep` filtra a lista gigante de processos para mostrar apenas o que contém "node".
