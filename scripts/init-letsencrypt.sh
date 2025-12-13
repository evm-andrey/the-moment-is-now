#!/usr/bin/env sh
set -eu

DOMAIN="${LETSENCRYPT_DOMAIN:-uzhemozhno.ru}"
EMAIL="${LETSENCRYPT_EMAIL:-}"
EXTRA_DOMAINS="${LETSENCRYPT_EXTRA_DOMAINS:-}"

if [ -z "$EMAIL" ]; then
  echo "ERROR: set LETSENCRYPT_EMAIL (e.g. you@example.com)" >&2
  exit 1
fi

domains="-d $DOMAIN"
if [ -n "$EXTRA_DOMAINS" ]; then
  for d in $EXTRA_DOMAINS; do
    domains="$domains -d $d"
  done
fi

docker compose --profile prod-ssl up -d --build web-http

docker compose --profile prod-ssl run --rm certbot \
  certonly --webroot -w /var/www/certbot \
  --email "$EMAIL" --agree-tos --no-eff-email \
  $domains

docker compose --profile prod-ssl stop web-http

docker compose --profile prod-ssl up -d --build web-ssl certbot-renew
