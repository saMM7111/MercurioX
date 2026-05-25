#!/usr/bin/env sh
set -eu

: "${PORT:=3000}"
: "${GATEWAY_URL:=http://gateway.railway.internal:8080}"

# Substitute ONLY $PORT and $GATEWAY_URL — leaves nginx's $upstream, $host, etc. intact
envsubst '${PORT} ${GATEWAY_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'