#!/bin/sh
set -e

# Allows the backend URL to be set at container runtime, e.g.:
#   docker run -e BACKEND_URL=https://api.flamerestaurant.com/api ...
BACKEND_URL="${BACKEND_URL:-http://localhost:8000/api}"

cat > /usr/share/nginx/html/js/config.js <<EOF
window.FLAME_API_BASE = "${BACKEND_URL}";
EOF

exec nginx -g "daemon off;"
