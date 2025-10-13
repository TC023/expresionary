#!/bin/bash
APP_DIR="/home/expresionary/backend"
NODE_BIN="$APP_DIR/node/node-v20.18.0-linux-x64/bin/node"
START_FILE="server.js"
LOG="$APP_DIR/node.log"

cd "$APP_DIR" || exit 1

# Si no hay proceso corriendo, arrancar
pgrep -f "$NODE_BIN .*${START_FILE}" > /dev/null 2>&1
if [ $? -ne 0 ]; then
  nohup "$NODE_BIN" "$APP_DIR/$START_FILE" >> "$LOG" 2>&1 &
fi