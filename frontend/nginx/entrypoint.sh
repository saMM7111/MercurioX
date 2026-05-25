#!/usr/bin/env sh
set -eu

: "${PORT:=3000}"
: "${GATEWAY_URL:=http://gateway.railway.internal:8080}"

# Only substitute the env vars we expect (keeps nginx variables like $host intact)
envsubst '$PORT $GATEWAY_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
