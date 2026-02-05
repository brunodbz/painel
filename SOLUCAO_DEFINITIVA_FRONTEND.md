# 🔴 SOLUÇÃO DEFINITIVA - Rebuild Completo

## ⚠️ Situação Atual

✅ Backend atualizado (tabelas criadas)  
❌ **Frontend NÃO atualizado** (ainda mostra "Simulação")

---

## ✅ SOLUÇÃO - Rebuild do Frontend

No servidor Ubuntu, execute:

```bash
# 1. Parar todos os containers
docker compose down

# 2. Rebuild COMPLETO (backend + frontend)
docker compose build --no-cache

# 3. Iniciar tudo
docker compose up -d

# 4. Ver logs
docker compose logs -f
```

Aguarde o build completar (pode demorar 3-5 minutos).

---

## 🔍 Verificação

### 1. Ver status dos containers

```bash
docker compose ps
```

Todos devem estar **Up (healthy)**:
- soc_postgres
- soc_backend
- soc_frontend

### 2. Testar backend diretamente

```bash
curl -X POST http://localhost:3001/api/settings \
  -H "Content-Type: application/json" \
  -d '{"elasticUrl":"https://test.com","elasticKey":"abc123"}'
```

Deve retornar:
```json
{"success":true,"message":"Configurações salvas com sucesso!"}
```

### 3. Verificar no banco

```bash
docker compose exec postgres psql -U admin -d soc_dashboard

SELECT * FROM api_settings;
```

Deve mostrar os dados salvos!

### 4. Testar no browser

1. **Limpe o cache do browser** (Ctrl+Shift+Delete)
2. Acesse: `http://SEU_IP/settings`
3. Preencha um campo
4. Salve
5. **Mensagem:** "Configurações salvas com sucesso!" (SEM "Simulação")

---

## 🎯 Se AINDA Aparecer "(Simulação)"

### Opção 1: Limpar Cache do Browser

```
Chrome/Edge:
- Ctrl+Shift+Delete
- Marque "Imagens e arquivos em cache"
- Período: "Todo o período"
- Clique em "Limpar dados"

Ou:
- Ctrl+Shift+R (hard refresh)
```

### Opção 2: Testar em Aba Anônima

```
- Ctrl+Shift+N (Chrome/Edge)
- Acesse: http://SEU_IP/settings
```

### Opção 3: Verificar se Frontend foi Rebuilded

```bash
# Ver logs do build do frontend
docker compose logs frontend | grep -i "build"

# Deve mostrar linhas de build do Vite
```

### Opção 4: Forçar Rebuild do Frontend

```bash
# Remover imagem antiga
docker rmi painel-frontend

# Rebuild forçado
docker compose build frontend --no-cache

# Recriar container
docker compose up -d frontend

# Ver logs
docker compose logs -f frontend
```

---

## 🔧 Diagnóstico Completo

Execute este script para diagnóstico:

```bash
#!/bin/bash
echo "=== Diagnóstico Completo ==="

echo -e "\n1. Status dos Containers:"
docker compose ps

echo -e "\n2. Teste Backend API:"
curl -s http://localhost:3001/api/health | jq .

echo -e "\n3. Tabelas no Banco:"
docker compose exec -T postgres psql -U admin -d soc_dashboard -c "\dt"

echo -e "\n4. Teste POST API:"
curl -s -X POST http://localhost:3001/api/settings \
  -H "Content-Type: application/json" \
  -d '{"elasticUrl":"https://test.com","elasticKey":"test123"}' | jq .

echo -e "\n5. Dados no Banco:"
docker compose exec -T postgres psql -U admin -d soc_dashboard -c "SELECT service_name, config_data FROM api_settings;"

echo -e "\n6. Versão do Frontend (último build):"
docker compose exec frontend ls -lh /usr/share/nginx/html/

echo -e "\n=== Fim do Diagnóstico ==="
```

Salve como `diagnostico.sh`, dê permissão (`chmod +x diagnostico.sh`) e execute (`./diagnostico.sh`).

---

## 📊 Checklist Final

- [ ] Backend rebuilded: `docker compose build backend --no-cache`
- [ ] Frontend rebuilded: `docker compose build frontend --no-cache`
- [ ] Containers reiniciados: `docker compose up -d`
- [ ] Cache do browser limpo
- [ ] Teste em aba anônima
- [ ] Tabelas existem no banco
- [ ] POST na API funciona (curl)
- [ ] Dados aparecem no banco após POST
- [ ] Frontend não mostra "(Simulação)"
- [ ] Dados persistem ao recarregar

---

## 🚀 Comando Único para Tudo

```bash
# Este comando faz tudo de uma vez:
docker compose down && \
docker compose build --no-cache && \
docker compose up -d && \
sleep 10 && \
docker compose logs backend | tail -20
```

Aguarde completar e teste no browser (lembre de limpar cache!).

---

## 💡 Teste Rápido da API

```bash
# Salvar configuração
curl -X POST http://localhost:3001/api/settings \
  -H "Content-Type: application/json" \
  -d '{
    "elasticUrl": "https://elastic.exemplo.com:9200",
    "elasticKey": "minha-chave-secreta"
  }'

# Buscar configuração
curl http://localhost:3001/api/settings | jq .

# Ver no banco
docker compose exec postgres psql -U admin -d soc_dashboard \
  -c "SELECT service_name, config_data FROM api_settings;"
```

---

**Status:** Frontend precisa de rebuild  
**Próxima ação:** `docker compose build --no-cache && docker compose up -d`
