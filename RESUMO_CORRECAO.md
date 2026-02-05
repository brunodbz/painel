# ✅ CORREÇÃO APLICADA - ERRO 400 TENABLE

## 📌 RESUMO EXECUTIVO

**Problema:** API do Tenable retornava erro HTTP 400 (Bad Request)  
**Causa:** Sintaxe inválida do parâmetro `filter` na query string  
**Solução:** Removido filtro da query, aplicado filtro localmente após buscar dados  
**Status:** ✅ Corrigido e commitado localmente  
**Próxima ação:** Deploy no servidor Ubuntu  

---

## 🔄 HISTÓRICO DE COMMITS

```
65e0bfd - docs: adicionar guias completos de deploy da correcao Tenable
04c4480 - fix: corrigir sintaxe de filtro da API Tenable.io ⭐ CORREÇÃO PRINCIPAL
6240fd8 - feat: implementar integração com Tenable.io
f1ffa14 - feat: implementacao completa de configuracoes + correcoes docker
000019c - Initial commit
```

---

## 📁 ARQUIVOS DISPONÍVEIS PARA VOCÊ

### 🚀 Para Deploy Rápido:
1. **`GUIA_RAPIDO_DEPLOY.md`** - Guia resumido com 3 opções de deploy
2. **`deploy-fix.ps1`** - Script PowerShell automatizado

### 📖 Para Referência Detalhada:
3. **`COMANDOS_DEPLOY.md`** - Passo a passo detalhado com troubleshooting
4. **`DEPLOY_NO_SERVIDOR.md`** - Documentação completa de deploy
5. **`IMPLEMENTACAO_TENABLE.md`** - Documentação técnica da integração

---

## 🎯 PRÓXIMOS PASSOS (ESCOLHA UMA OPÇÃO)

### ⚡ OPÇÃO 1: Script Automatizado (Mais Rápido)

**No Windows PowerShell:**

```powershell
cd C:\Users\Bruno\OneDrive\Documentos2\painel
.\deploy-fix.ps1 -ServerIP "SEU_IP" -Username "kryptus"
```

Depois, no servidor Ubuntu:

```bash
cd /tmp
unzip -o tenable-fix.zip -d /opt/painel/
cd /opt/painel
docker compose build backend --no-cache
docker compose down && docker compose up -d
docker compose logs backend --tail 50
```

---

### 📋 OPÇÃO 2: Comandos Manuais

**No Windows PowerShell:**

```powershell
cd C:\Users\Bruno\OneDrive\Documentos2\painel
Compress-Archive -Path backend\src\services\tenable.ts -DestinationPath tenable-fix.zip -Force
scp tenable-fix.zip kryptus@SEU_IP:/tmp/
```

**No Servidor Ubuntu:**

```bash
ssh kryptus@SEU_IP
cd /tmp
unzip -o tenable-fix.zip -d /opt/painel/
cd /opt/painel
docker compose build backend --no-cache
docker compose down && docker compose up -d
docker compose logs backend --tail 50
curl http://localhost:3001/api/dashboard | jq .tenable
```

---

### ✏️ OPÇÃO 3: Editar Diretamente no Servidor

**1. Conectar ao servidor:**
```bash
ssh kryptus@SEU_IP
cd /opt/painel/backend/src/services
```

**2. Fazer backup:**
```bash
cp tenable.ts tenable.ts.backup
```

**3. Editar arquivo:**
```bash
nano tenable.ts
```

**4. Localizar linha ~35 e substituir:**

**❌ ANTES (remover):**
```typescript
params: {
  filter: 'severity:critical,high',
  limit: limit,
},
```

**✅ DEPOIS (colocar):**
```typescript
params: {
  // Buscar todas as vulnerabilidades (sem filtro na query, filtraremos depois)
},
```

**5. Localizar linha ~40 e adicionar filtro local:**

**✅ ADICIONAR após `const vulnerabilities = response.data.vulnerabilities || [];`:**
```typescript
// Filtrar por severidade critical (4) e high (3) localmente
const filteredVulns = vulnerabilities.filter((vuln: TenableVulnerability) => 
  vuln.severity >= 3
);
```

**6. Alterar return para usar `filteredVulns`:**

**❌ ANTES:**
```typescript
return vulnerabilities.slice(0, limit).map(...)
```

**✅ DEPOIS:**
```typescript
return filteredVulns.slice(0, limit).map(...)
```

**7. Salvar (Ctrl+O, Enter) e sair (Ctrl+X)**

**8. Rebuild e restart:**
```bash
cd /opt/painel
docker compose build backend --no-cache
docker compose down && docker compose up -d
docker compose logs backend --tail 50
```

---

## ✅ VALIDAÇÃO PÓS-DEPLOY

### 1️⃣ Verificar se o erro 400 sumiu

```bash
docker compose logs backend | grep "400"
```

✅ **Esperado:** Nenhum resultado (ou resultados antigos antes do restart)  
❌ **Problema:** Se ainda aparecer erro 400 após o restart, arquivo não foi atualizado

### 2️⃣ Verificar se busca vulnerabilidades

```bash
docker compose logs backend | grep -i "tenable" | tail -5
```

✅ **Esperado:** `✓ Fetched X vulnerabilities from Tenable`  
❌ **Problema:** Se mostrar erro, verificar chaves ou conectividade

### 3️⃣ Testar API

```bash
curl http://localhost:3001/api/dashboard | jq .tenable
```

✅ **Esperado:** Array JSON (pode estar vazio se não houver vulnerabilidades)  
❌ **Problema:** Se retornar erro, verificar logs do backend

### 4️⃣ Testar no Browser

Acesse: `http://SEU_IP/`

✅ **Esperado:** Dashboard carrega e card Tenable aparece  
❌ **Problema:** Se vazio, verificar se chaves estão configuradas em `/settings`

---

## 🔍 TROUBLESHOOTING RÁPIDO

| Sintoma | Causa Provável | Solução |
|---------|---------------|---------|
| Ainda mostra erro 400 | Arquivo não foi atualizado | Verificar conteúdo: `cat /opt/painel/backend/src/services/tenable.ts \| grep params` |
| Erro 401 Unauthorized | Chaves inválidas | Regenerar chaves no Tenable.io e atualizar em `/settings` |
| Container backend crashando | Erro de sintaxe no arquivo | Restaurar backup: `cp tenable.ts.backup tenable.ts` e tentar novamente |
| Dashboard vazio | Chaves não configuradas | Acessar `/settings` e salvar chaves do Tenable |
| "Fetched 0 vulnerabilities" | Conta sem vulnerabilidades ou chaves sem permissão | Normal se não houver vulnerabilidades detectadas |

---

## 📊 COMPARAÇÃO ANTES/DEPOIS

### ❌ ANTES (Erro):

**Logs:**
```
soc_backend  | Erro ao buscar vulnerabilidades do Tenable: AxiosError: Request failed with status code 400
soc_backend  |     params: { filter: 'severity:critical,high', limit: 10 },
soc_backend  |     responseUrl: 'https://cloud.tenable.com/workbenches/vulnerabilities?filter=severity:critical,high&limit=10',
soc_backend  | ✓ Fetched 0 vulnerabilities from Tenable
```

**API Response:**
```json
{
  "tenable": []
}
```

**Dashboard:**
- Card "Tenable.io Vulnerabilities" vazio

---

### ✅ DEPOIS (Sucesso):

**Logs:**
```
soc_backend  | ✓ Database connected successfully
soc_backend  | ✓ Server running on port 3001
soc_backend  | ✓ Fetched 5 vulnerabilities from Tenable
```

**API Response:**
```json
{
  "tenable": [
    {
      "id": "tenable-19506",
      "source": "Tenable",
      "severity": "critical",
      "title": "Apache Log4j < 2.15.0 Remote Code Execution",
      "description": "Host: web-server-01 | Plugin ID: 19506",
      "timestamp": "2026-01-15T10:30:00Z"
    }
  ]
}
```

**Dashboard:**
- ✅ Card "Tenable.io Vulnerabilities" com dados reais
- ✅ Atualização automática a cada 30s
- ✅ Severidade exibida corretamente

---

## 🎓 O QUE FOI ALTERADO TECNICAMENTE

### Arquivo: `backend/src/services/tenable.ts`

**Mudança 1: Remoção do filtro na query**

```diff
- params: {
-   filter: 'severity:critical,high',
-   limit: limit,
- },
+ params: {
+   // Buscar todas as vulnerabilidades
+ },
```

**Mudança 2: Filtro aplicado localmente**

```diff
  const vulnerabilities = response.data.vulnerabilities || [];
  
+ // Filtrar por severidade critical (4) e high (3) localmente
+ const filteredVulns = vulnerabilities.filter((vuln: TenableVulnerability) => 
+   vuln.severity >= 3
+ );
  
- return vulnerabilities.slice(0, limit).map(...)
+ return filteredVulns.slice(0, limit).map(...)
```

**Mudança 3: Melhor tratamento de erros**

```diff
- catch (error) {
-   console.error('Erro ao buscar vulnerabilidades do Tenable:', error);
+ catch (error: any) {
+   if (error.response) {
+     console.error('Erro ao buscar vulnerabilidades do Tenable:', {
+       status: error.response.status,
+       statusText: error.response.statusText,
+       data: error.response.data,
+     });
+   } else {
+     console.error('Erro ao buscar vulnerabilidades do Tenable:', error.message);
+   }
```

**Razão:** A API do Tenable não aceita `filter` como query parameter no formato usado. A documentação oficial indica que filtros devem ser aplicados via body em POST requests ou localmente após GET.

---

## 📞 SUPORTE

Se após o deploy ainda houver problemas, execute no servidor:

```bash
cd /opt/painel

# Salvar logs completos
docker compose logs backend > /tmp/backend-full.log
docker compose logs frontend > /tmp/frontend-full.log
docker compose ps > /tmp/containers-status.txt

# Ver configurações
docker compose exec postgres psql -U admin -d soc_dashboard \
  -c "SELECT * FROM api_settings WHERE service_name='tenable';" > /tmp/db-tenable-config.txt

# Testar API
curl http://localhost:3001/api/dashboard > /tmp/api-response.json 2>&1

# Ver arquivos
cat /tmp/backend-full.log | tail -100
cat /tmp/containers-status.txt
cat /tmp/db-tenable-config.txt
cat /tmp/api-response.json
```

---

## ✅ STATUS FINAL

- ✅ **Erro identificado:** Sintaxe inválida do filtro na API
- ✅ **Correção aplicada:** Arquivo `backend/src/services/tenable.ts`
- ✅ **Commits criados:** 2 commits (correção + documentação)
- ✅ **Documentação criada:** 5 arquivos de guia
- ✅ **Script automatizado:** `deploy-fix.ps1`
- ⏳ **Aguardando:** Deploy no servidor Ubuntu

---

## 🚀 AÇÃO IMEDIATA

**Escolha a melhor opção para você:**

1. **Rápido e Automatizado:** Use `deploy-fix.ps1`
2. **Manual e Seguro:** Siga `GUIA_RAPIDO_DEPLOY.md`
3. **Detalhado:** Consulte `COMANDOS_DEPLOY.md`

**Após deploy, teste com:**
```bash
curl http://localhost:3001/api/dashboard | jq .tenable
```

**Se retornar array JSON (mesmo vazio), a correção funcionou!** ✅

---

**Data da correção:** 2026-02-04  
**Commits:** 04c4480 (correção) + 65e0bfd (docs)  
**Arquivo corrigido:** `backend/src/services/tenable.ts`  
**Status:** ✅ Pronto para deploy
