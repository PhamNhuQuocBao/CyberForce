#!/usr/bin/env bash
set -euo pipefail
cert_dir="$(cd "$(dirname "$0")/.." && pwd)/.local-certificates"
mkdir -p "$cert_dir"
if [[ -e "$cert_dir/dev-ca.p12" ]]; then
  echo "Development certificate already exists: $cert_dir/dev-ca.p12"
else
  openssl req -x509 -newkey rsa:4096 -sha256 -nodes -days 365 \
    -subj '/CN=CyberForce Development Certificate Authority/O=CyberForce Development' \
    -keyout "$cert_dir/dev-ca.key" -out "$cert_dir/dev-ca.crt"
  openssl pkcs12 -export -inkey "$cert_dir/dev-ca.key" -in "$cert_dir/dev-ca.crt" \
    -out "$cert_dir/dev-ca.p12" -passout "pass:${CERT_P12_PASSWORD:-cyberforce_local_dev_ca_password}"
  chmod 600 "$cert_dir/dev-ca.key" "$cert_dir/dev-ca.p12"
  echo "Development-only CA created: $cert_dir/dev-ca.p12"
fi
mkdir -p "$cert_dir/public"
cp "$cert_dir/dev-ca.crt" "$cert_dir/public/${CERT_SIGNING_KEY_ID:-cyberforce-dev-ca-2026}.crt"
