#!/bin/bash

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <port>"
  exit 1
fi

PORT="$1"

# Find the PID using the specified port
PID=$(lsof -t -i :$PORT)

if [[ -z "$PID" ]]; then
  echo "No process found on port $PORT"
else
  # Kill the process
  echo "Killing process with PID: $PID"
  kill -9 $PID
fi