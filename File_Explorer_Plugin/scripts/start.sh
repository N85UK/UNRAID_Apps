#!/bin/bash
set -e

PIDFILE=/var/run/file-explorer.pid
BIN=/usr/local/bin/filebrowser
DB=/boot/config/plugins/file-explorer/filebrowser.db

if [ -f "$PIDFILE" ] && kill -0 "$(cat $PIDFILE)" 2>/dev/null; then
  echo "Already running"
  exit 0
fi

if [ ! -x "$BIN" ]; then
  echo "Binary not found: $BIN"
  exit 1
fi

# Start FileBrowser as sidecar with proxy-auth header disabled; proxy will handle auth
nohup "$BIN" --database "$DB" --noauth -r /mnt/user > /var/log/file-explorer.log 2>&1 &
PID=$!
echo $PID > $PIDFILE

echo "Started (pid=$PID)"
