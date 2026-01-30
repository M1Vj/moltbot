#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
<<<<<<< HEAD
SMOKE_IMAGE="${MOLTBOT_INSTALL_SMOKE_IMAGE:-moltbot-install-smoke:local}"
NONROOT_IMAGE="${MOLTBOT_INSTALL_NONROOT_IMAGE:-moltbot-install-nonroot:local}"
INSTALL_URL="${MOLTBOT_INSTALL_URL:-https://molt.bot/install.sh}"
CLI_INSTALL_URL="${MOLTBOT_INSTALL_CLI_URL:-https://molt.bot/install-cli.sh}"
SKIP_NONROOT="${MOLTBOT_INSTALL_SMOKE_SKIP_NONROOT:-0}"
=======
SMOKE_IMAGE="${OPENCLAW_INSTALL_SMOKE_IMAGE:-${CLAWDBOT_INSTALL_SMOKE_IMAGE:-openclaw-install-smoke:local}}"
NONROOT_IMAGE="${OPENCLAW_INSTALL_NONROOT_IMAGE:-${CLAWDBOT_INSTALL_NONROOT_IMAGE:-openclaw-install-nonroot:local}}"
INSTALL_URL="${OPENCLAW_INSTALL_URL:-${CLAWDBOT_INSTALL_URL:-https://openclaw.bot/install.sh}}"
CLI_INSTALL_URL="${OPENCLAW_INSTALL_CLI_URL:-${CLAWDBOT_INSTALL_CLI_URL:-https://openclaw.bot/install-cli.sh}}"
SKIP_NONROOT="${OPENCLAW_INSTALL_SMOKE_SKIP_NONROOT:-${CLAWDBOT_INSTALL_SMOKE_SKIP_NONROOT:-0}}"
>>>>>>> upstream/main
LATEST_DIR="$(mktemp -d)"
LATEST_FILE="${LATEST_DIR}/latest"

echo "==> Build smoke image (upgrade, root): $SMOKE_IMAGE"
docker build \
  -t "$SMOKE_IMAGE" \
  -f "$ROOT_DIR/scripts/docker/install-sh-smoke/Dockerfile" \
  "$ROOT_DIR/scripts/docker/install-sh-smoke"

echo "==> Run installer smoke test (root): $INSTALL_URL"
docker run --rm -t \
  -v "${LATEST_DIR}:/out" \
<<<<<<< HEAD
  -e MOLTBOT_INSTALL_URL="$INSTALL_URL" \
  -e MOLTBOT_INSTALL_LATEST_OUT="/out/latest" \
  -e MOLTBOT_INSTALL_SMOKE_PREVIOUS="${MOLTBOT_INSTALL_SMOKE_PREVIOUS:-}" \
  -e MOLTBOT_INSTALL_SMOKE_SKIP_PREVIOUS="${MOLTBOT_INSTALL_SMOKE_SKIP_PREVIOUS:-0}" \
  -e MOLTBOT_NO_ONBOARD=1 \
=======
  -e OPENCLAW_INSTALL_URL="$INSTALL_URL" \
  -e OPENCLAW_INSTALL_LATEST_OUT="/out/latest" \
  -e OPENCLAW_INSTALL_SMOKE_PREVIOUS="${OPENCLAW_INSTALL_SMOKE_PREVIOUS:-${CLAWDBOT_INSTALL_SMOKE_PREVIOUS:-}}" \
  -e OPENCLAW_INSTALL_SMOKE_SKIP_PREVIOUS="${OPENCLAW_INSTALL_SMOKE_SKIP_PREVIOUS:-${CLAWDBOT_INSTALL_SMOKE_SKIP_PREVIOUS:-0}}" \
  -e OPENCLAW_NO_ONBOARD=1 \
>>>>>>> upstream/main
  -e DEBIAN_FRONTEND=noninteractive \
  "$SMOKE_IMAGE"

LATEST_VERSION=""
if [[ -f "$LATEST_FILE" ]]; then
  LATEST_VERSION="$(cat "$LATEST_FILE")"
fi

if [[ "$SKIP_NONROOT" == "1" ]]; then
<<<<<<< HEAD
  echo "==> Skip non-root installer smoke (MOLTBOT_INSTALL_SMOKE_SKIP_NONROOT=1)"
=======
  echo "==> Skip non-root installer smoke (OPENCLAW_INSTALL_SMOKE_SKIP_NONROOT=1)"
>>>>>>> upstream/main
else
  echo "==> Build non-root image: $NONROOT_IMAGE"
  docker build \
    -t "$NONROOT_IMAGE" \
    -f "$ROOT_DIR/scripts/docker/install-sh-nonroot/Dockerfile" \
    "$ROOT_DIR/scripts/docker/install-sh-nonroot"

  echo "==> Run installer non-root test: $INSTALL_URL"
  docker run --rm -t \
<<<<<<< HEAD
    -e MOLTBOT_INSTALL_URL="$INSTALL_URL" \
    -e MOLTBOT_INSTALL_EXPECT_VERSION="$LATEST_VERSION" \
    -e MOLTBOT_NO_ONBOARD=1 \
=======
    -e OPENCLAW_INSTALL_URL="$INSTALL_URL" \
    -e OPENCLAW_INSTALL_EXPECT_VERSION="$LATEST_VERSION" \
    -e OPENCLAW_NO_ONBOARD=1 \
>>>>>>> upstream/main
    -e DEBIAN_FRONTEND=noninteractive \
    "$NONROOT_IMAGE"
fi

<<<<<<< HEAD
if [[ "${MOLTBOT_INSTALL_SMOKE_SKIP_CLI:-0}" == "1" ]]; then
  echo "==> Skip CLI installer smoke (MOLTBOT_INSTALL_SMOKE_SKIP_CLI=1)"
=======
if [[ "${OPENCLAW_INSTALL_SMOKE_SKIP_CLI:-${CLAWDBOT_INSTALL_SMOKE_SKIP_CLI:-0}}" == "1" ]]; then
  echo "==> Skip CLI installer smoke (OPENCLAW_INSTALL_SMOKE_SKIP_CLI=1)"
>>>>>>> upstream/main
  exit 0
fi

if [[ "$SKIP_NONROOT" == "1" ]]; then
  echo "==> Skip CLI installer smoke (non-root image skipped)"
  exit 0
fi

echo "==> Run CLI installer non-root test (same image)"
docker run --rm -t \
  --entrypoint /bin/bash \
<<<<<<< HEAD
  -e MOLTBOT_INSTALL_URL="$INSTALL_URL" \
  -e MOLTBOT_INSTALL_CLI_URL="$CLI_INSTALL_URL" \
  -e MOLTBOT_NO_ONBOARD=1 \
=======
  -e OPENCLAW_INSTALL_URL="$INSTALL_URL" \
  -e OPENCLAW_INSTALL_CLI_URL="$CLI_INSTALL_URL" \
  -e OPENCLAW_NO_ONBOARD=1 \
>>>>>>> upstream/main
  -e DEBIAN_FRONTEND=noninteractive \
  "$NONROOT_IMAGE" -lc "curl -fsSL \"$CLI_INSTALL_URL\" | bash -s -- --set-npm-prefix --no-onboard"
