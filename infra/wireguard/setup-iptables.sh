#!/bin/sh
set -eu

# This runs inside the gateway network namespace, never on the Docker host.
iptables -P FORWARD DROP
iptables -N CF_VPN_FORWARD 2>/dev/null || true
iptables -F CF_VPN_FORWARD
iptables -C FORWARD -j CF_VPN_FORWARD 2>/dev/null || iptables -I FORWARD 1 -j CF_VPN_FORWARD
iptables -t nat -N CF_VPN_SNAT 2>/dev/null || true
iptables -t nat -F CF_VPN_SNAT
iptables -t nat -C POSTROUTING -j CF_VPN_SNAT 2>/dev/null || \
  iptables -t nat -I POSTROUTING 1 -j CF_VPN_SNAT

# The peer may ping the gateway, but cannot call its control API or other services.
iptables -C INPUT -i wg0 -j CF_VPN_INPUT 2>/dev/null || {
  iptables -N CF_VPN_INPUT 2>/dev/null || true
  iptables -I INPUT 1 -i wg0 -j CF_VPN_INPUT
}
iptables -F CF_VPN_INPUT
iptables -A CF_VPN_INPUT -p icmp -d 100.127.240.1 -j ACCEPT
iptables -A CF_VPN_INPUT -j DROP

# Lab containers cannot address the gateway itself through an attached lab network.
iptables -C INPUT -s 100.64.0.0/10 ! -i wg0 -j DROP 2>/dev/null || \
  iptables -I INPUT 1 -s 100.64.0.0/10 ! -i wg0 -j DROP
