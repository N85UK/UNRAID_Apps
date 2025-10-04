#!/bin/bash
set -e

PIDFILE=${PIDFILE:-/var/run/file-explorer.pid}
BIN=${FILEBROWSER_BIN:-/usr/local/bin/filebrowser}
DB=${DB_PATH:-/boot/config/plugins/file-explorer/filebrowser.db}
LOG=${FILE_EXPLORER_LOG:-/var/log/file-explorer.log}

if [ -f "$PIDFILE" ] && kill -0 "$(cat $PIDFILE)" 2>/dev/null; then
  echo "Already running"
  exit 0
fi

if [ ! -x "$BIN" ]; then
  echo "Binary not found: $BIN"
  exit 1
fi

nohup "$BIN" --database "$DB" --noauth -r /mnt/user > "$LOG" 2>&1 &
PID=$!
echo $PID > $PIDFILE

echo "Started (pid=$PID)"
