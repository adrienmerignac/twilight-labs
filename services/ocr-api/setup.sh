\
#!/usr/bin/env bash
set -euo pipefail

SERVICE_DIR="$(cd "$(dirname "$0")" && pwd)"
VENV_DIR="$SERVICE_DIR/.venv"

python3 -m venv "$VENV_DIR"
"$VENV_DIR/bin/python" -m pip install --upgrade pip wheel setuptools

# Official PaddlePaddle CPU wheel index.
"$VENV_DIR/bin/python" -m pip install \
  paddlepaddle==3.2.0 \
  -i https://www.paddlepaddle.org.cn/packages/stable/cpu/

"$VENV_DIR/bin/python" -m pip install \
  -r "$SERVICE_DIR/requirements.txt"

echo "OCR service installed."
echo "Start it with: services/ocr-api/start.sh"
