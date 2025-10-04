#!/bin/bash
set -e

PIDFILE=/var/run/file-explorer.pid
if [ -f "$PIDFILE" ]; then
  PID=$(cat $PIDFILE)
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID"
    rm -f "$PIDFILE"
    echo "Stopped $PID"
    exit 0
  else
    echo "Process not running"
    rm -f "$PIDFILE"
    exit 1
  fi
else
  echo "No PID file"
  exit 1
fi
