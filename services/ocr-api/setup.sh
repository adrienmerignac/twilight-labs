#!/usr/bin/env bash
set -euo pipefail

SERVICE_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$SERVICE_DIR/.venv"
PYTHON_BIN="$(command -v python3.12)"

rm -rf "$VENV_DIR"
"$PYTHON_BIN" -m venv "$VENV_DIR"

"$VENV_DIR/bin/python" -m pip install --upgrade pip wheel setuptools

"$VENV_DIR/bin/python" -m pip install \
  paddlepaddle==3.2.0 \
  -i https://www.paddlepaddle.org.cn/packages/stable/cpu/

"$VENV_DIR/bin/python" -m pip install \
  -r "$SERVICE_DIR/requirements.txt"

echo "OCR service installed with $("$VENV_DIR/bin/python" --version)."
