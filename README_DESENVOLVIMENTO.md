# ⚠️ IMPORTANTE - Leia Isto Agora!

## 🔴 Problema Atual

Você está vendo **"Configurações salvas com sucesso! (Simulação)"** porque o **backend não está rodando**.

As alterações foram feitas no código, mas você precisa **iniciar o backend** para funcionar.

---

## ✅ Solução Rápida (3 Passos)

### **Passo 1: Setup Inicial** (apenas na primeira vez)

```powershell
.\setup-dev.ps1
```

Este script vai:
- ✅ Verificar Node.js, npm, Yarn
- ✅ Configurar banco de dados (local ou online)
- ✅ Criar arquivo `.env` no backend
- ✅ Instalar todas as dependências

**Tempo:** ~5 minutos

---

### **Passo 2: Iniciar Backend** (sempre)

**Abra um terminal PowerShell e execute:**

```powershell
.\start-backend.ps1
```

Você deve ver:
```
✓ Database connected successfully
✓ Database tables initialized
✓ Server running on port 3001
```

**Deixe este terminal aberto!**

---

### **Passo 3: Iniciar Frontend** (sempre)

**Abra OUTRO terminal PowerShell e execute:**

```powershell
.\start-frontend.ps1
```

O navegador deve abrir automaticamente em `http://localhost:5173`

---

## 🎯 Como Testar

1. Acesse: `http://localhost:5173/settings`
2. Preencha qualquer campo
3. Clique em "Salvar Configurações"
4. **Resultado:** "Configurações salvas com sucesso!" (SEM "Simulação")
5. Recarregue a página (F5)
6. **Resultado:** Campos continuam preenchidos ✅

---

## 🐛 Problemas Comuns

### "setup-dev.ps1 não pode ser carregado"

Execute primeiro:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "Node.js não encontrado"

Baixe e instale: https://nodejs.org/ (versão LTS 20+)

### "Banco de dados não conecta"

**Opção mais fácil:** Use ElephantSQL (online, grátis)
1. Acesse: https://www.elephantsql.com/
2. Crie conta gratuita
3. Copie a URL de conexão
4. Cole no script quando perguntado

### "Porta 3001 já em uso"

```powershell
netstat -ano | findstr :3001
# Anote o PID e mate o processo
Stop-Process -Id PID -Force
```

---

## 📁 Estrutura de Arquivos

```
painel/
├── setup-dev.ps1          ← Execute primeiro (setup)
├── start-backend.ps1      ← Terminal 1 (backend)
├── start-frontend.ps1     ← Terminal 2 (frontend)
├── COMO_RODAR_LOCAL.md    ← Instruções detalhadas
└── backend/
    └── .env               ← Criado pelo setup
```

---

## 🔄 Fluxo de Trabalho Diário

```powershell
# Terminal 1
.\start-backend.ps1

# Terminal 2 (novo terminal)
.\start-frontend.ps1

# Acessar no navegador
# http://localhost:5173
```

---

## 📊 Verificação de Funcionamento

### Backend OK:
```powershell
curl http://localhost:3001/api/health
```
Resposta: `{"status":"ok","database":"connected"}`

### Frontend OK:
- Abra: `http://localhost:5173`
- DevTools (F12) → Console
- Sem erros de conexão

### Configurações Funcionando:
1. Vá em Configurações
2. Salve algo
3. **NÃO deve aparecer "(Simulação)"**
4. Recarregue a página
5. Valores devem persistir

---

## 🎓 O Que Foi Implementado

- ✅ Tabela `api_settings` no PostgreSQL
- ✅ Endpoints REST completos
- ✅ Frontend conectado à API real
- ✅ Persistência no banco de dados
- ✅ Carregamento automático
- ✅ Mensagens de feedback visual

**Tudo está implementado! Só precisa rodar o backend.**

---

## 🚀 Para Produção

Quando tudo funcionar localmente, faça deploy no servidor:

```bash
# No servidor Ubuntu com Docker
git pull origin master
docker compose build --no-cache
docker compose up -d
```

Consulte: `GUIA_IMPLANTACAO.md`

---

**Criado em:** 2026-02-04  
**Status:** ✅ Código pronto, precisa rodar backend  
**Próxima ação:** Execute `.\setup-dev.ps1`
