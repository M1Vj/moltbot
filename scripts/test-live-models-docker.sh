#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
<<<<<<< HEAD
IMAGE_NAME="${MOLTBOT_IMAGE:-moltbot:local}"
CONFIG_DIR="${MOLTBOT_CONFIG_DIR:-$HOME/.moltbot}"
WORKSPACE_DIR="${MOLTBOT_WORKSPACE_DIR:-$HOME/clawd}"
PROFILE_FILE="${MOLTBOT_PROFILE_FILE:-$HOME/.profile}"
=======
IMAGE_NAME="${OPENCLAW_IMAGE:-${CLAWDBOT_IMAGE:-openclaw:local}}"
CONFIG_DIR="${OPENCLAW_CONFIG_DIR:-${CLAWDBOT_CONFIG_DIR:-$HOME/.openclaw}}"
WORKSPACE_DIR="${OPENCLAW_WORKSPACE_DIR:-${CLAWDBOT_WORKSPACE_DIR:-$HOME/.openclaw/workspace}}"
PROFILE_FILE="${OPENCLAW_PROFILE_FILE:-${CLAWDBOT_PROFILE_FILE:-$HOME/.profile}}"
>>>>>>> upstream/main

PROFILE_MOUNT=()
if [[ -f "$PROFILE_FILE" ]]; then
  PROFILE_MOUNT=(-v "$PROFILE_FILE":/home/node/.profile:ro)
fi

echo "==> Build image: $IMAGE_NAME"
docker build -t "$IMAGE_NAME" -f "$ROOT_DIR/Dockerfile" "$ROOT_DIR"

echo "==> Run live model tests (profile keys)"
docker run --rm -t \
  --entrypoint bash \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e HOME=/home/node \
  -e NODE_OPTIONS=--disable-warning=ExperimentalWarning \
<<<<<<< HEAD
  -e MOLTBOT_LIVE_TEST=1 \
  -e MOLTBOT_LIVE_MODELS="${MOLTBOT_LIVE_MODELS:-all}" \
  -e MOLTBOT_LIVE_PROVIDERS="${MOLTBOT_LIVE_PROVIDERS:-}" \
  -e MOLTBOT_LIVE_MODEL_TIMEOUT_MS="${MOLTBOT_LIVE_MODEL_TIMEOUT_MS:-}" \
  -e MOLTBOT_LIVE_REQUIRE_PROFILE_KEYS="${MOLTBOT_LIVE_REQUIRE_PROFILE_KEYS:-}" \
  -v "$CONFIG_DIR":/home/node/.moltbot \
  -v "$WORKSPACE_DIR":/home/node/clawd \
=======
  -e OPENCLAW_LIVE_TEST=1 \
  -e OPENCLAW_LIVE_MODELS="${OPENCLAW_LIVE_MODELS:-${CLAWDBOT_LIVE_MODELS:-all}}" \
  -e OPENCLAW_LIVE_PROVIDERS="${OPENCLAW_LIVE_PROVIDERS:-${CLAWDBOT_LIVE_PROVIDERS:-}}" \
  -e OPENCLAW_LIVE_MODEL_TIMEOUT_MS="${OPENCLAW_LIVE_MODEL_TIMEOUT_MS:-${CLAWDBOT_LIVE_MODEL_TIMEOUT_MS:-}}" \
  -e OPENCLAW_LIVE_REQUIRE_PROFILE_KEYS="${OPENCLAW_LIVE_REQUIRE_PROFILE_KEYS:-${CLAWDBOT_LIVE_REQUIRE_PROFILE_KEYS:-}}" \
  -v "$CONFIG_DIR":/home/node/.openclaw \
  -v "$WORKSPACE_DIR":/home/node/.openclaw/workspace \
>>>>>>> upstream/main
  "${PROFILE_MOUNT[@]}" \
  "$IMAGE_NAME" \
  -lc "set -euo pipefail; [ -f \"$HOME/.profile\" ] && source \"$HOME/.profile\" || true; cd /app && pnpm test:live"
