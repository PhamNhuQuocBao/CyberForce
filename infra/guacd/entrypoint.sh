#!/bin/sh
set -eu

# guacd has no authentication. Bind only to the Compose service network IP,
# before the orchestrator attaches lab networks to this trusted proxy.
set -- $(hostname -i)
[ "$#" -eq 1 ] || { echo "guacd requires one startup network address" >&2; exit 1; }
printf '%s' "$1" >/tmp/guacd-bind-ip
exec /opt/guacamole/sbin/guacd -f -b "$1" -L "${LOG_LEVEL:-info}"
