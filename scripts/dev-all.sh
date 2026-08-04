\
#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OCR_DIR="$ROOT_DIR/services/ocr-api"
OCR_START="$OCR_DIR/start.sh"
OCR_SETUP="$OCR_DIR/setup.sh"
OCR_HEALTH_URL="http://127.0.0.1:8001/health"

OCR_PID=""
WEB_PID=""

cleanup() {
  echo
  echo "Stopping Twilight Labs..."
  [[ -n "$WEB_PID" ]] && kill "$WEB_PID" 2>/dev/null || true
  [[ -n "$OCR_PID" ]] && kill "$OCR_PID" 2>/dev/null || true
  wait "$WEB_PID" 2>/dev/null || true
  wait "$OCR_PID" 2>/dev/null || true
}

trap cleanup EXIT INT TERM

if [[ ! -x "$OCR_START" || ! -x "$OCR_SETUP" ]]; then
  echo "OCR service scripts are missing in services/ocr-api." >&2
  exit 1
fi

if [[ ! -x "$OCR_DIR/.venv/bin/uvicorn" ]]; then
  echo "First run: installing the local OCR service..."
  "$OCR_SETUP"
fi

echo "Starting PaddleOCR service..."
"$OCR_START" > "$ROOT_DIR/.ocr-api.log" 2>&1 &
OCR_PID=$!

echo -n "Waiting for OCR"
for _ in $(seq 1 120); do
  if curl --silent --fail "$OCR_HEALTH_URL" >/dev/null 2>&1; then
    echo " ready."
    break
  fi

  if ! kill -0 "$OCR_PID" 2>/dev/null; then
    echo
    echo "OCR service stopped unexpectedly." >&2
    echo "Last logs:" >&2
    tail -n 80 "$ROOT_DIR/.ocr-api.log" >&2 || true
    exit 1
  fi

  echo -n "."
  sleep 1
done

if ! curl --silent --fail "$OCR_HEALTH_URL" >/dev/null 2>&1; then
  echo
  echo "OCR service did not become ready after 120 seconds." >&2
  tail -n 80 "$ROOT_DIR/.ocr-api.log" >&2 || true
  exit 1
fi

echo "Starting Next.js..."
cd "$ROOT_DIR"
pnpm dev &
WEB_PID=$!

echo
echo "Twilight Labs: http://localhost:3000"
echo "OCR API:       http://127.0.0.1:8001"
echo "OCR logs:      $ROOT_DIR/.ocr-api.log"
echo
echo "Press Ctrl+C once to stop everything."

wait "$WEB_PID"
