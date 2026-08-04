\
#!/usr/bin/env bash
set -euo pipefail

SERVICE_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$SERVICE_DIR/.venv"

if [[ ! -x "$VENV_DIR/bin/uvicorn" ]]; then
  echo "Run services/ocr-api/setup.sh first." >&2
  exit 1
fi

cd "$SERVICE_DIR"
exec "$VENV_DIR/bin/uvicorn" \
  app.main:app \
  --host 127.0.0.1 \
  --port 8001 \
  --reload
