#! /bin/bash
set -e

# setup your dev machine for local SSL
echo "[Local SSL Setup] Installing dependencies"
brew install mkcert nss
mkcert -install

echo "[Local SSL Setup] Creating certificate and key"
mkdir -p ./certs
mkcert -key-file certs/key.pem -cert-file certs/cert.pem local.dev.frame.io