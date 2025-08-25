#!/usr/bin/env bash
set -e

: "${APP_URL:?APP_URL is required but not set in environment}"

# Extract hostname (strip protocol + port)
APP_DOMAIN=$(echo "$APP_URL" | sed -E 's#^https?://([^:/]+).*#\1#')

# Extract port if present, else default to 443
APP_PORT=$(echo "$APP_URL" | sed -E 's#^https?://[^:/]+:([0-9]+).*#\1#')
if [ -z "$APP_PORT" ]; then
  APP_PORT=443
fi

echo "🌐 Starting Next.js at https://$APP_DOMAIN:$APP_PORT"
next dev --hostname "$APP_DOMAIN" --port "$APP_PORT" --experimental-https
