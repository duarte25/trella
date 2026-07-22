#!/usr/bin/env bash
# Sobe (ou derruba) o ambiente de teste isolado e o DEIXA no ar, pra você
# poder abrir o Cypress interativo (cypress open) e ir rodando/escrevendo
# testes à vontade. Diferente do run-e2e-tests.sh, este script NÃO roda o
# Cypress e NÃO derruba nada sozinho — quem controla isso é você:
#
#   ./e2e-env.sh up     # sobe banco de teste + API de teste + front de teste
#   ./e2e-env.sh down   # derruba tudo (banco, API, front de teste)
#
# IMPORTANTE: todo comando "docker compose" usa "-p trella-e2e-test" de
# propósito. Sem isso, o Compose usa o nome da PASTA como projeto, e como
# docker-compose.yml e docker-compose.test.yml estão na mesma pasta, um
# "down --remove-orphans" no banco de teste derrubaria o banco-mongo de
# verdade também. NUNCA remova essa flag.
set -uo pipefail

# `npm run dev` (tsx watch / next dev) cria processos filhos. Sem "set -m"
# (modo de controle de job), um "comando &" num script herda o MESMO grupo
# de processos do próprio script — matar só o PID que o bash devolve não
# mata os filhos (tsx watch sobrevive como órfão). "set -m" faz cada "&"
# virar líder do seu próprio grupo, e killar esse grupo (kill -- -PID) mata
# a árvore inteira de uma vez. Sem isso, cada "up" deixava um zumbi pra
# trás — já vimos isso virar ~10 processos soltos numa sessão só.
set -m

cd "$(dirname "${BASH_SOURCE[0]}")"
ROOT_DIR="$(pwd)"

# shellcheck disable=SC1091
source ./e2e-config.sh

API_PID_FILE=/tmp/e2e-api.pid
FRONT_PID_FILE=/tmp/e2e-front.pid

log() {
  echo "[e2e-env] $1"
}

compose() {
  docker compose -p "$PROJECT" -f docker-compose.test.yml --env-file .env.test "$@"
}

wait_for_http() {
  local url="$1"
  local nome="$2"

  for i in $(seq 1 60); do
    if curl -s -o /dev/null "$url"; then
      log "$nome pronto."
      return 0
    fi
    sleep 1
  done

  log "ERRO: $nome não respondeu em $url a tempo."
  return 1
}

kill_group_from_pid_file() {
  local pid_file="$1"

  if [ -f "$pid_file" ]; then
    local pid
    pid="$(cat "$pid_file")"
    kill -- "-${pid}" >/dev/null 2>&1
    rm -f "$pid_file"
  fi
}

cmd_up() {
  log "Limpando qualquer resíduo de execuções anteriores..."
  kill_group_from_pid_file "$API_PID_FILE"
  kill_group_from_pid_file "$FRONT_PID_FILE"
  fuser -k "${API_PORT}/tcp" >/dev/null 2>&1
  fuser -k "${FRONT_PORT}/tcp" >/dev/null 2>&1
  compose down -v --remove-orphans >/dev/null 2>&1

  log "Subindo banco de teste (Mongo, porta 27201, dados em tmpfs)..."
  compose up -d

  log "Aguardando o Mongo de teste aceitar conexões..."
  for i in $(seq 1 30); do
    if docker exec banco-mongo-test mongosh --quiet --eval "db.runCommand('ping')" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done

  log "Populando o banco de teste (seed)..."
  (
    cd "$ROOT_DIR/api"
    set -a
    # shellcheck disable=SC1091
    source .env.test
    set +a
    npm run seed
  )
  if [ $? -ne 0 ]; then
    log "ERRO: seed falhou."
    exit 1
  fi

  log "Subindo a API de teste (porta ${API_PORT})..."
  (
    cd "$ROOT_DIR/api"
    set -a
    # shellcheck disable=SC1091
    source .env.test
    set +a
    exec npm run dev
  ) > /tmp/e2e-api.log 2>&1 &
  echo "$!" > "$API_PID_FILE"
  disown

  wait_for_http "http://localhost:${API_PORT}" "API de teste" || exit 1

  log "Subindo o front de teste (porta ${FRONT_PORT})..."
  (
    cd "$ROOT_DIR/trella-front"
    set -a
    # shellcheck disable=SC1091
    source .env.test
    set +a
    exec npx next dev -p "${FRONT_PORT}"
  ) > /tmp/e2e-front.log 2>&1 &
  echo "$!" > "$FRONT_PID_FILE"
  disown

  wait_for_http "http://localhost:${FRONT_PORT}" "Front de teste" || exit 1

  echo ""
  log "Ambiente de teste no ar:"
  log "  Front: http://localhost:${FRONT_PORT}"
  log "  API:   http://localhost:${API_PORT}"
  echo ""
  log "Pra abrir o Cypress interativo:"
  log "  cd trella-front && npm run cypress:open:test"
  echo ""
  log "Quando terminar, derrube tudo com: ./e2e-env.sh down"
}

cmd_down() {
  log "Derrubando ambiente de teste..."
  kill_group_from_pid_file "$API_PID_FILE"
  kill_group_from_pid_file "$FRONT_PID_FILE"
  # Fallback defensivo: se por algum motivo o PID salvo não existir mais
  # (ex: script anterior crashou antes de gravar o arquivo), ainda tenta
  # matar quem estiver ocupando a porta.
  fuser -k "${API_PORT}/tcp" >/dev/null 2>&1
  fuser -k "${FRONT_PORT}/tcp" >/dev/null 2>&1
  compose down -v --remove-orphans >/dev/null 2>&1
  log "Ambiente de teste encerrado."
}

case "${1:-}" in
  up) cmd_up ;;
  down) cmd_down ;;
  *)
    echo "Uso: $0 up|down"
    exit 1
    ;;
esac
