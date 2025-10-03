#!/bin/bash
# File Manager Service Control Script

set -euo pipefail

PLUGIN_NAME="file-manager"
CONFIG_DIR="/boot/config/plugins/$PLUGIN_NAME"
LOG_DIR="/var/log/$PLUGIN_NAME"
PID_FILE="/var/run/file-manager.pid"

# Source configuration
CONFIG_FILE="$CONFIG_DIR/config/settings.ini"
if [ -f "$CONFIG_FILE" ]; then
    # Simple ini parser for bash
    eval "$(grep -E '^[a-zA-Z_][a-zA-Z0-9_]*=' "$CONFIG_FILE" | sed 's/^/export /')"
fi

# Default values
PORT=${port:-8080}
ENABLED=${enabled:-yes}
LOG_LEVEL=${log_level:-info}

# Function to check if service is running
is_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            return 0
        else
            rm -f "$PID_FILE"
            return 1
        fi
    fi
    return 1
}

# Function to start the service
start_service() {
    if [ "$ENABLED" != "yes" ]; then
        echo "File Manager is disabled in configuration"
        return 1
    fi

    if is_running; then
        echo "File Manager is already running"
        return 0
    fi

    echo "Starting File Manager..."
    
    # Ensure directories exist
    mkdir -p "$LOG_DIR"
    mkdir -p "$(dirname "$PID_FILE")"
    
    # Build configuration
    CONFIG_JSON="$CONFIG_DIR/config/filebrowser.json"
    
    # Start FileBrowser
    /usr/local/bin/filebrowser \
        --config "$CONFIG_JSON" \
        --database "$CONFIG_DIR/filebrowser.db" \
        --port "$PORT" \
        --address "127.0.0.1" \
        --no-auth \
        --disable-exec \
        --log "$LOG_DIR/filebrowser.log" \
        > "$LOG_DIR/stdout.log" 2>&1 &
    
    local pid=$!
    echo "$pid" > "$PID_FILE"
    
    # Wait a moment and check if it's still running
    sleep 2
    if kill -0 "$pid" 2>/dev/null; then
        echo "File Manager started successfully (PID: $pid)"
        return 0
    else
        echo "Failed to start File Manager"
        rm -f "$PID_FILE"
        return 1
    fi
}

# Function to stop the service
stop_service() {
    if ! is_running; then
        echo "File Manager is not running"
        return 0
    fi

    echo "Stopping File Manager..."
    local pid=$(cat "$PID_FILE")
    
    # Try graceful shutdown first
    kill -TERM "$pid" 2>/dev/null || true
    
    # Wait up to 10 seconds for graceful shutdown
    local count=0
    while [ $count -lt 10 ] && kill -0 "$pid" 2>/dev/null; do
        sleep 1
        count=$((count + 1))
    done
    
    # Force kill if still running
    if kill -0 "$pid" 2>/dev/null; then
        echo "Force killing File Manager process..."
        kill -KILL "$pid" 2>/dev/null || true
    fi
    
    rm -f "$PID_FILE"
    echo "File Manager stopped"
}

# Function to restart the service
restart_service() {
    stop_service
    sleep 1
    start_service
}

# Function to get service status
get_status() {
    if is_running; then
        local pid=$(cat "$PID_FILE")
        echo "File Manager is running (PID: $pid)"
        echo "Port: $PORT"
        echo "URL: http://localhost:$PORT"
        return 0
    else
        echo "File Manager is not running"
        return 1
    fi
}

# Function to show logs
show_logs() {
    local log_file="$LOG_DIR/filebrowser.log"
    local lines=${1:-50}
    
    if [ -f "$log_file" ]; then
        echo "Showing last $lines lines from $log_file:"
        echo "----------------------------------------"
        tail -n "$lines" "$log_file"
    else
        echo "No log file found at $log_file"
    fi
}

# Main command handling
case "${1:-}" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        restart_service
        ;;
    status)
        get_status
        ;;
    logs)
        show_logs "${2:-50}"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs [lines]}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the File Manager service"
        echo "  stop    - Stop the File Manager service"
        echo "  restart - Restart the File Manager service"
        echo "  status  - Show service status"
        echo "  logs    - Show recent log entries (default: 50 lines)"
        echo ""
        exit 1
        ;;
esac