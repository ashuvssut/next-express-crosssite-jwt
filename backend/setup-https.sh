#!/usr/bin/env bash
set -e

: "${API_URL:?API_URL is required but not set in environment}"

# Extract hostname from API_URL (strip protocol + port)
API_DOMAIN=$(echo "$API_URL" | sed -E 's#^https?://([^:/]+).*#\1#')

echo "🔑 Generating cert for $API_DOMAIN"
rm -rf certs && mkdir -p certs
mkcert -install
mkcert -cert-file certs/backend-cert.pem -key-file certs/backend-key.pem "$API_DOMAIN" localhost 127.0.0.1
