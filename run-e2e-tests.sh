#!/usr/bin/env bash
# Roda a suíte e2e (Cypress) headless, de ponta a ponta, num ambiente 100%
# isolado do dev normal (ver e2e-env.sh e e2e-config.sh pra detalhes de
# portas/projeto). Sobe o ambiente, roda o Cypress, e derruba tudo sozinho
# no final — não importa se os testes passaram, falharam, ou se o script
# foi interrompido no meio.
#
# Pra rodar de forma interativa (abrir a janela do Cypress), use o
# e2e-env.sh diretamente em vez deste script (veja o README).
set -uo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

# shellcheck disable=SC1091
source ./e2e-config.sh

log() {
  echo "[e2e] $1"
}

cleanup() {
  log "Derrubando ambiente de teste..."
  ./e2e-env.sh down
}
trap cleanup EXIT

./e2e-env.sh up || exit 1

log "Rodando o Cypress (headless)..."
(
  cd trella-front
  unset ELECTRON_RUN_AS_NODE
  CYPRESS_BASE_URL="http://localhost:${FRONT_PORT}" CYPRESS_API_URL="http://localhost:${API_PORT}" npx cypress run "$@"
)
EXIT_CODE=$?

exit $EXIT_CODE
