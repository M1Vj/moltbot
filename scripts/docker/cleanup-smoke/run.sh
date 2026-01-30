#!/usr/bin/env bash
set -euo pipefail

cd /repo

<<<<<<< HEAD
export MOLTBOT_STATE_DIR="/tmp/moltbot-test"
export MOLTBOT_CONFIG_PATH="${MOLTBOT_STATE_DIR}/moltbot.json"

echo "==> Seed state"
mkdir -p "${MOLTBOT_STATE_DIR}/credentials"
mkdir -p "${MOLTBOT_STATE_DIR}/agents/main/sessions"
echo '{}' >"${MOLTBOT_CONFIG_PATH}"
echo 'creds' >"${MOLTBOT_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${MOLTBOT_STATE_DIR}/agents/main/sessions/sessions.json"
=======
export OPENCLAW_STATE_DIR="/tmp/openclaw-test"
export OPENCLAW_CONFIG_PATH="${OPENCLAW_STATE_DIR}/openclaw.json"

echo "==> Seed state"
mkdir -p "${OPENCLAW_STATE_DIR}/credentials"
mkdir -p "${OPENCLAW_STATE_DIR}/agents/main/sessions"
echo '{}' >"${OPENCLAW_CONFIG_PATH}"
echo 'creds' >"${OPENCLAW_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${OPENCLAW_STATE_DIR}/agents/main/sessions/sessions.json"
>>>>>>> upstream/main

echo "==> Reset (config+creds+sessions)"
pnpm openclaw reset --scope config+creds+sessions --yes --non-interactive

<<<<<<< HEAD
test ! -f "${MOLTBOT_CONFIG_PATH}"
test ! -d "${MOLTBOT_STATE_DIR}/credentials"
test ! -d "${MOLTBOT_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${MOLTBOT_STATE_DIR}/credentials"
echo '{}' >"${MOLTBOT_CONFIG_PATH}"
=======
test ! -f "${OPENCLAW_CONFIG_PATH}"
test ! -d "${OPENCLAW_STATE_DIR}/credentials"
test ! -d "${OPENCLAW_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${OPENCLAW_STATE_DIR}/credentials"
echo '{}' >"${OPENCLAW_CONFIG_PATH}"
>>>>>>> upstream/main

echo "==> Uninstall (state only)"
pnpm openclaw uninstall --state --yes --non-interactive

<<<<<<< HEAD
test ! -d "${MOLTBOT_STATE_DIR}"
=======
test ! -d "${OPENCLAW_STATE_DIR}"
>>>>>>> upstream/main

echo "OK"
