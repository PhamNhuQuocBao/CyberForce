# CF-403 — Live VPN status proposal

## Goal
Show each signed-in learner's WireGuard handshake status in the desktop navigation without a page reload.

## Implemented
- [x] Read `wg show wg0 latest-handshakes` every second in the gateway; map public keys to the current peer and return one peer's status to API Core. Missing and rotated peers are disconnected.
- [x] Add an authenticated API Core WebSocket with a one-use ticket. Send an initial snapshot and `VPN_STATUS_CHANGE` only on change; check session revocation and peer identity on each sample.
- [x] Add `VpnStatusBadge.tsx` to the desktop Navbar, with assigned VPN IP, `/access/vpn` link, loading/error state, and reconnect.
- [x] Run Go tests, 118 API tests, 14 web tests, lint, typecheck, and builds. Isolated Compose smoke confirmed a real handshake and two-peer status separation. Browser showed disconnected, connected with `100.127.240.2`, disconnected after key rotation, then connected again and removed the badge on logout. A timed run from starting the disposable client to receiving `VPN_STATUS_CHANGE` took 1005 ms.

## Approved decision and limit
WireGuard does not emit an immediate disconnect signal. A latest-handshake timestamp proves recent authentication, not that the client's tunnel remains up. Proposed rule: connected when a handshake occurred within the last 180 seconds; otherwise disconnected. Connection should appear within 2 seconds under normal local conditions with 1-second sampling, but shutdown may take up to 180 seconds to appear. An active reachability probe would provide a stronger disconnect signal but requires separate routing, client firewall, and security design.

## Scope
This covers the CF-403 badge and event. The US-04.02 target ping diagnostic and latency/traffic popover are separate work because the task's specified output is the badge and event. The timed 1005 ms result covers client activation through the WebSocket event; browser rendering was visually verified but its exact paint time was not instrumented.
