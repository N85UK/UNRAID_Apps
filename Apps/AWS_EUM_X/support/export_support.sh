#!/usr/bin/env bash
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT_DIR/support-bundle-$(date -u +%Y%m%dT%H%M%SZ).tgz"
cd "$ROOT_DIR"

echo "Collecting logs and config into $OUT"
mkdir -p /tmp/eum-support
cp -a data /tmp/eum-support/ 2>/dev/null || true
cp -a public /tmp/eum-support/ 2>/dev/null || true
cp -a views /tmp/eum-support/ 2>/dev/null || true

tar czf "$OUT" -C /tmp eum-support || true
rm -rf /tmp/eum-support || true

echo "Created support bundle: $OUT"
