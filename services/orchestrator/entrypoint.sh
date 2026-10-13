#!/bin/sh
set -eu

socket_gid=$(stat -c '%g' /var/run/docker.sock)
socket_group=$(awk -F: -v gid="$socket_gid" '$3 == gid {print $1; exit}' /etc/group)
if [ -z "$socket_group" ]; then
  socket_group=docker-socket
  addgroup -S -g "$socket_gid" "$socket_group"
fi
addgroup app "$socket_group"
exec su app -s /bin/sh -c 'exec /usr/local/bin/orchestrator'
