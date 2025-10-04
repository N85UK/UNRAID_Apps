#!/bin/bash
# Simple integration test: create a dummy binary that sleeps and verify start/stop write/remove PID
set -e
TMPDIR=$(mktemp -d)
DUMMY_BIN=$TMPDIR/dummy_bin.sh
cat > "$DUMMY_BIN" <<'BASH'
#!/bin/bash
sleep 300
BASH
chmod +x "$DUMMY_BIN"

export FILEBROWSER_BIN="$DUMMY_BIN"
export PIDFILE="$TMPDIR/file-explorer.pid"
export DB_PATH="$TMPDIR/filebrowser.db"
export FILE_EXPLORER_LOG="$TMPDIR/file-explorer.log"

# Start
bash ../start.sh
if [ ! -f "$PIDFILE" ]; then
  echo "FAIL: PID file missing"
  exit 2
fi
PID=$(cat "$PIDFILE")
if ! kill -0 "$PID" 2>/dev/null; then
  echo "FAIL: process not running"
  exit 3
fi

# Stop
bash ../stop.sh
if [ -f "$PIDFILE" ]; then
  echo "FAIL: PID file still present"
  exit 4
fi

echo "OK"
rm -rf "$TMPDIR"
