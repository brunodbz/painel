# ✅ SOLUÇÃO FINAL - Dockerfile Simplificado

## 🔧 O Que Foi Alterado

Mudei `node:20-slim` para `node:20` (imagem padrão) porque:
- Mais estável
- Menos problemas de rede
- Rollup funciona sem configurações extras
- Já deve estar em cache no servidor

---

## 🚀 Como Fazer o Build Agora

### No Servidor Ubuntu:

```bash
# 1. Commitar as alterações do Dockerfile
git add Dockerfile.frontend
git commit -m "fix: usar node:20 padrão ao invés de slim"
git push origin master

# 2. No servidor, fazer pull
cd /opt/painel
git pull origin master

# 3. Build completo
docker compose down
docker compose build --no-cache
docker compose up -d

# 4. Ver logs
docker compose logs -f
```

---

## 🔍 Se Der Erro de Rede Novamente

### Opção 1: Tentar novamente (pode ser temporário)

```bash
docker compose build --no-cache
```

### Opção 2: Limpar cache do Docker

```bash
docker system prune -a -f
docker compose build --no-cache
```

### Opção 3: Usar imagens locais (se já existirem)

```bash
# Ver imagens disponíveis
docker images | grep node

# Build usando cache
docker compose build
```

### Opção 4: Usar mirror alternativo do Docker Hub

```bash
# Editar daemon do Docker para usar mirror
sudo nano /etc/docker/daemon.json
```

Adicionar:
```json
{
  "registry-mirrors": ["https://mirror.gcr.io"]
}
```

Reiniciar Docker:
```bash
sudo systemctl restart docker
docker compose build --no-cache
```

---

## 📊 Verificação Após Build

```bash
# 1. Ver status
docker compose ps

# Todos devem estar Up (healthy):
# - soc_postgres
# - soc_backend  
# - soc_frontend

# 2. Testar backend
curl http://localhost:3001/api/health

# 3. Testar salvamento
curl -X POST http://localhost:3001/api/settings \
  -H "Content-Type: application/json" \
  -d '{"elasticUrl":"https://test.com","elasticKey":"abc123"}'

# 4. Ver no banco
docker compose exec postgres psql -U admin -d soc_dashboard \
  -c "SELECT * FROM api_settings;"
```

---

## 🌐 Testar no Browser

1. **Limpar cache**: Ctrl+Shift+Delete
2. Acessar: `http://SEU_IP/settings`
3. Preencher campos
4. Salvar
5. **Resultado:** "Configurações salvas com sucesso!" (SEM "Simulação")
6. Recarregar página (F5)
7. **Resultado:** Dados permanecem preenchidos ✅

---

## 🎯 Resumo das Mudanças

| Componente | Antes | Agora |
|------------|-------|-------|
| Backend | node:20-alpine | node:20-alpine (sem mudança) |
| Frontend Stage 1 | node:20-slim | **node:20** (padrão) |
| Frontend Stage 2 | nginx:alpine | nginx:alpine (sem mudança) |

**Motivo:** node:20 padrão é mais compatível e estável.

---

## 📝 Checklist Final

- [ ] Código commitado e pushed
- [ ] Git pull no servidor
- [ ] Docker build completado sem erros
- [ ] 3 containers Up (healthy)
- [ ] API backend responde
- [ ] Tabelas criadas no banco
- [ ] POST na API salva dados
- [ ] Cache do browser limpo
- [ ] Frontend não mostra "(Simulação)"
- [ ] Dados persistem ao recarregar

---

## 💡 Comandos Rápidos

```bash
# Tudo de uma vez no servidor
cd /opt/painel && \
git pull origin master && \
docker compose down && \
docker compose build --no-cache && \
docker compose up -d && \
echo "Aguarde 30 segundos..." && sleep 30 && \
docker compose ps && \
echo -e "\nTestando backend:" && \
curl -s http://localhost:3001/api/health | jq .
```

---

**Status:** Dockerfile simplificado  
**Próxima ação:** Commitar e fazer build no servidor  
**Tempo estimado:** 5-10 minutos (build)
