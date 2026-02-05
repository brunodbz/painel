# 🚀 CORREÇÃO ERRO 400 TENABLE - GUIA RÁPIDO

## 🔴 Problema
```
Erro: Request failed with status code 400
URL: https://cloud.tenable.com/workbenches/vulnerabilities?filter=severity:critical,high&limit=10
Causa: API do Tenable rejeita o formato do parâmetro 'filter'
```

## ✅ Solução Aplicada
Arquivo corrigido: `backend/src/services/tenable.ts`
- Removido parâmetro `filter` inválido da query
- Filtragem por severidade agora é feita localmente após buscar os dados

## 📋 DEPLOY NO SERVIDOR - ESCOLHA UMA OPÇÃO

---

### 🎯 OPÇÃO 1: Script Automatizado (Recomendado)

**No Windows PowerShell (como Administrador):**

```powershell
cd C:\Users\Bruno\OneDrive\Documentos2\painel

# Ajuste o IP e usuário do seu servidor
.\deploy-fix.ps1 -ServerIP "SEU_IP" -Username "kryptus"
```

O script fará:
1. ✅ Comprimir o arquivo corrigido
2. ✅ Transferir via SCP para o servidor
3. ✅ Mostrar comandos para executar no servidor
4. ✅ Opção de conectar via SSH automaticamente

---

### 🎯 OPÇÃO 2: Manual com SCP

**No Windows PowerShell:**

```powershell
cd C:\Users\Bruno\OneDrive\Documentos2\painel

# Criar zip apenas do arquivo corrigido
Compress-Archive -Path backend\src\services\tenable.ts -DestinationPath tenable-fix.zip -Force

# Transferir para servidor (ajuste IP e usuário)
scp tenable-fix.zip kryptus@SEU_IP:/tmp/
```

**No Servidor Ubuntu (via SSH):**

```bash
ssh kryptus@SEU_IP

cd /tmp
unzip -o tenable-fix.zip -d /opt/painel/
cd /opt/painel

# Rebuild e restart
docker compose build backend --no-cache
docker compose down
docker compose up -d

# Ver logs
docker compose logs backend --tail 50
```

---

### 🎯 OPÇÃO 3: Copiar e Colar Arquivo Manualmente

**1. No Servidor, criar backup do arquivo atual:**

```bash
ssh kryptus@SEU_IP
cd /opt/painel/backend/src/services
cp tenable.ts tenable.ts.backup
```

**2. No Windows, abrir o arquivo:**

```powershell
notepad C:\Users\Bruno\OneDrive\Documentos2\painel\backend\src\services\tenable.ts
```

**3. No Servidor, editar o arquivo:**

```bash
nano /opt/painel/backend/src/services/tenable.ts
```

**4. Substituir o conteúdo e salvar (Ctrl+O, Enter, Ctrl+X)**

**5. Rebuild e restart:**

```bash
cd /opt/painel
docker compose build backend --no-cache
docker compose down
docker compose up -d
docker compose logs backend --tail 50
```

---

## 🧪 TESTES APÓS DEPLOY

### 1. Verificar Status dos Containers

```bash
docker compose ps
```

✅ Todos devem estar **Up (healthy)**

### 2. Verificar Logs (Não deve ter erro 400)

```bash
docker compose logs backend | grep -i tenable
```

✅ Deve mostrar: `Fetched X vulnerabilities from Tenable`  
❌ Não deve mostrar: `Request failed with status code 400`

### 3. Testar API

```bash
curl http://localhost:3001/api/dashboard | jq .tenable
```

✅ Deve retornar array com vulnerabilidades (ou array vazio se não houver)  
❌ Não deve retornar erro

### 4. Testar no Browser

Acesse: `http://SEU_IP/`

✅ Dashboard carrega  
✅ Card "Tenable.io Vulnerabilities" mostra dados (ou mensagem de vazio)  
❌ Não deve mostrar erro no console do browser (F12)

---

## 🔧 TROUBLESHOOTING

### Ainda mostra erro 400

**Verificar se o arquivo foi atualizado:**

```bash
cat /opt/painel/backend/src/services/tenable.ts | grep -A 5 "params:"
```

✅ Deve mostrar: `params: { }`  (vazio)
❌ Não deve mostrar: `filter: 'severity:critical,high'`

**Se não foi atualizado, rebuild forçado:**

```bash
cd /opt/painel
docker compose build backend --no-cache --pull
docker compose down
docker compose up -d --force-recreate
```

### Erro 401 Unauthorized

**Causa:** Chaves do Tenable inválidas

**Solução:**

1. Acesse: https://cloud.tenable.com/
2. Settings → API Keys → Generate new keys
3. No painel: `http://SEU_IP/settings`
4. Atualize as chaves
5. Salve

**Testar chaves manualmente:**

```bash
curl -H "X-ApiKeys: accessKey=SUA_KEY; secretKey=SUA_SECRET" \
     https://cloud.tenable.com/workbenches/vulnerabilities
```

### Dashboard vazio

**1. Verificar se configurações foram salvas:**

```bash
docker compose exec postgres psql -U admin -d soc_dashboard \
  -c "SELECT service_name, config_data FROM api_settings WHERE service_name='tenable';"
```

**2. Forçar rebuild do frontend também:**

```bash
docker compose build frontend --no-cache
docker compose down
docker compose up -d
```

**3. Limpar cache do browser:**

- Pressione Ctrl+Shift+Delete
- Limpar cache
- Recarregar página (Ctrl+F5)

---

## 📊 EXEMPLO DE LOG CORRETO

### Antes da correção (ERRO):
```
soc_backend  | Erro ao buscar vulnerabilidades do Tenable: AxiosError: Request failed with status code 400
soc_backend  |     url: 'https://cloud.tenable.com/workbenches/vulnerabilities',
soc_backend  |     params: { filter: 'severity:critical,high', limit: 10 },
```

### Depois da correção (SUCESSO):
```
soc_backend  | ✓ Fetched 5 vulnerabilities from Tenable
```

Ou se não houver vulnerabilidades:
```
soc_backend  | ✓ Fetched 0 vulnerabilities from Tenable
```

---

## ✅ CHECKLIST FINAL

- [ ] Arquivo `tenable.ts` atualizado no servidor
- [ ] Backend rebuilded: `docker compose build backend --no-cache`
- [ ] Containers restartados: `docker compose up -d`
- [ ] Logs SEM erro 400: `docker compose logs backend | grep 400`
- [ ] API retorna dados: `curl http://localhost:3001/api/dashboard`
- [ ] Dashboard funciona no browser
- [ ] Chaves do Tenable configuradas
- [ ] Vulnerabilidades aparecem (se houver)

---

## 🎉 RESULTADO ESPERADO

### Dashboard:
✅ Card "Tenable.io Vulnerabilities" populado com dados reais  
✅ Atualização automática a cada 30 segundos  
✅ Severidade (Critical/High) exibida corretamente  

### Logs:
✅ Sem erros HTTP 400  
✅ Mensagem de sucesso na busca  

### API:
✅ Endpoint `/api/dashboard` retorna JSON válido  
✅ Array `tenable` com vulnerabilidades  

---

## 📞 COMANDOS DE SUPORTE

Se precisar enviar logs para análise:

```bash
# No servidor
cd /opt/painel

docker compose ps > /tmp/status.txt
docker compose logs backend > /tmp/backend.log
docker compose logs frontend > /tmp/frontend.log
docker compose exec postgres psql -U admin -d soc_dashboard \
  -c "SELECT * FROM api_settings;" > /tmp/config.txt

# Ver arquivos
cat /tmp/status.txt
cat /tmp/backend.log | tail -100
cat /tmp/config.txt
```

---

**Arquivo corrigido:** `backend/src/services/tenable.ts`  
**Status:** ✅ Pronto para deploy  
**Ação:** Escolha uma das opções acima e execute no servidor
