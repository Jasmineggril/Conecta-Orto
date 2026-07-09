#!/usr/bin/env bash
# ============================================================
# start-local.sh — Inicia o ambiente de desenvolvimento local
# ============================================================
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Conecta Orto — Ambiente Local${NC}"
echo "==========================================="

# 1. Banco de dados
echo -e "\n${YELLOW}[1/3] Banco de dados PostgreSQL...${NC}"
if docker ps --filter "name=conecta-orto-db" --format "{{.Names}}" | grep -q conecta-orto-db; then
  echo "  ✅ Container 'conecta-orto-db' já está rodando"
else
  docker start conecta-orto-db 2>/dev/null || \
  docker run -d \
    --name conecta-orto-db \
    -e POSTGRES_USER=conecta \
    -e POSTGRES_PASSWORD=conecta123 \
    -e POSTGRES_DB=conecta_orto \
    -p 5433:5432 \
    postgres:16-alpine
  echo "  ⏳ Aguardando banco inicializar..."
  sleep 4
fi

# 2. API Server
echo -e "\n${YELLOW}[2/3] API Server (porta 3001)...${NC}"
pkill -f "dist/index.mjs" 2>/dev/null || true
sleep 1

cd "$ROOT/artifacts/api-server"
nohup env \
  DATABASE_URL=postgresql://conecta:conecta123@localhost:5433/conecta_orto \
  PORT=3001 \
  ADMIN_PASSWORD=admin \
  NODE_ENV=development \
  node --enable-source-maps ./dist/index.mjs \
  >> /tmp/api-server.log 2>&1 &
API_PID=$!

sleep 2
if curl -s http://localhost:3001/api/minicourses > /dev/null; then
  echo "  ✅ API rodando em http://localhost:3001"
else
  echo "  ⚠️  API pode ainda estar iniciando. Veja logs: tail -f /tmp/api-server.log"
fi

# 3. Frontend
echo -e "\n${YELLOW}[3/3] Frontend (porta 5173)...${NC}"
cd "$ROOT/artifacts/conecta-orto"
echo "  ✅ Iniciando Vite em http://localhost:5173"
echo ""
echo -e "${GREEN}==========================================="
echo "  🌐 Acesse: http://localhost:5173"
echo "  🔐 Admin senha: admin"
echo "  📦 DB: postgresql://conecta:conecta123@localhost:5433/conecta_orto"
echo -e "===========================================${NC}"
echo ""

PORT=5173 BASE_PATH=/ \
VITE_SUPABASE_URL=http://localhost:3001 \
VITE_SUPABASE_ANON_KEY=local-dev-key \
pnpm exec vite --config vite.config.ts
