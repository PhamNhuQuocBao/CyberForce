#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_dir"

project="cf903-e2e-$(date +%s)-$RANDOM"
port_base="${CF_E2E_PORT_BASE:-23000}"
export COMPOSE_RESOURCE_PREFIX="$project"
export CF_E2E_PROJECT="$project"
export POSTGRES_DB=cf903_e2e
export POSTGRES_PORT="$port_base"
export REDIS_PORT="$((port_base + 1))"
export MINIO_PORT="$((port_base + 2))"
export MINIO_CONSOLE_PORT="$((port_base + 3))"
export VPN_PORT="$((port_base + 4))"
export API_PORT="$((port_base + 5))"
export WEB_PORT="$((port_base + 6))"
export TRAEFIK_HTTP_PORT="$((port_base + 7))"
export TRAEFIK_DASHBOARD_PORT="$((port_base + 8))"
export API_BASE_URL="http://localhost:$API_PORT"
export NEXT_PUBLIC_API_URL="$API_BASE_URL/api/v1"
export WEB_ORIGIN="http://localhost:$WEB_PORT"
export CF_E2E_WEB_URL="$WEB_ORIGIN"

cert_dir="$(mktemp -d)"
mkdir -p "$cert_dir/public"
openssl req -x509 -newkey rsa:4096 -nodes -keyout "$cert_dir/key.pem" -out "$cert_dir/public/ca.crt" -subj '/CN=CF-903 E2E CA' -days 1 >/dev/null 2>&1
openssl pkcs12 -export -inkey "$cert_dir/key.pem" -in "$cert_dir/public/ca.crt" -out "$cert_dir/ca.p12" -passout pass:cf903-e2e-password
chmod 644 "$cert_dir/ca.p12"
export CERT_P12_FILE="$cert_dir/ca.p12"
export CERT_PUBLIC_CERTS_DIR="$cert_dir/public"
export CERT_P12_PASSWORD=cf903-e2e-password

compose() { docker compose -p "$project" "$@"; }
cleanup() {
  result=$?
  if (( result != 0 )); then
    compose logs --no-color api orchestrator > /tmp/cf903-e2e-services.log 2>&1 || true
  fi
  ids="$(compose exec -T postgres psql -U cyberforce -d cf903_e2e -Atc 'SELECT id FROM lab_instances' 2>/dev/null || true)"
  while IFS= read -r id; do
    [[ "$id" =~ ^[0-9a-f-]{36}$ ]] || continue
    docker container ls -aq --filter "label=cyberforce.lab.instance=$id" | xargs -r docker rm -f >/dev/null
    docker network rm "cf-lab-net-$id" >/dev/null 2>&1 || true
  done <<< "$ids"
  compose down -v --remove-orphans
  while IFS= read -r image; do
    [[ "$image" == "$project-"* ]] || continue
    docker image rm "$image" >/dev/null 2>&1 || true
  done < <(docker image ls --format '{{.Repository}}:{{.Tag}}')
  rm -rf "$cert_dir"
}
trap cleanup EXIT

echo "Starting isolated E2E project $project on web port $WEB_PORT"
docker build -t cyberforce/cf903-e2e:local tests/e2e/fixture
compose build api db-init web cert-signer orchestrator vpn-gateway guacd
compose up -d --no-build --wait web
compose run --rm -T -e "CF_E2E_PROJECT=$project" db-init pnpm exec tsx prisma/seed-e2e.ts
pnpm exec playwright test
