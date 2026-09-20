# 🖥️ EPIC 4: Wireframe Architecture & Low-Fidelity UI Specifications
## Secure VPN Access Gateway

* **Project:** CyberForce (CyberForge) Cloud Cyber Range
* **Reference User Flow:** [`docs/06-user-flow/EPIC_04_USER_FLOW_VPN_GATEWAY.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/06-user-flow/EPIC_04_USER_FLOW_VPN_GATEWAY.md)
* **Design Philosophy:** Tactical Cyber-HUD, Zero-Trust Defense & Client Isolation Ergonomics
* **Version:** 1.0.0

---

## 🎨 Design System Foundation & VPN Topology Tokens

| Thành phần / Trạng thái | Quy chuẩn hiển thị | Mục đích kỹ thuật & Trải nghiệm |
| :--- | :--- | :--- |
| **Đã kết nối (Connected)** | `#10B981` (Cyber Emerald) + IP nội bộ `10.8.x.y` | Báo hiệu đường hầm VPN an toàn đã thiết lập xong, sẵn sàng ping máy lab. |
| **Chưa kết nối / Ngắt** | `#64748B` (Slate Gray) / Chấm rỗng | Thông báo người học đang sử dụng mạng ngoài, chưa vào dải VPN thực hành. |
| **Đang bắt tay (Handshake)** | `#F59E0B` (Amber Pulse) | Hiển thị trong quá trình đàm phán khóa mã hóa (thường $< 100\text{ms}$). |
| **Cảnh báo Lệch Phạm vi** | `#EF4444` (Crimson Alert) + Viền kỹ thuật | Nhắc nhở thân thiện khi học viên quét nhầm IP của học viên khác trong dải mạng. |
| **Bán kính Bo góc** | `0px` – `2px` (Sắc nhọn, góc vuông dứt khoát) | Mang phong cách giao diện an ninh mạng chuyên nghiệp, không bo tròn kiểu app tiêu dùng. |

---

## 📐 Wireframe Index (8 Màn hình Trọng yếu)

1. [Wireframe 4.1: VPN Management Hub & Dual-Profile Selector (WireGuard vs OpenVPN)](#wireframe-41-vpn-management-hub--dual-profile-selector)
2. [Wireframe 4.2: 3-Step Visual Setup & Configuration Drawer](#wireframe-42-3-step-visual-setup--configuration-drawer)
3. [Wireframe 4.3: Cryptographic Key Invalidation & Profile Regeneration Modal](#wireframe-43-cryptographic-key-invalidation--profile-regeneration-modal)
4. [Wireframe 4.4: Live VPN Health Indicator on Global Nav (Disconnected, Handshake, Connected)](#wireframe-44-live-vpn-health-indicator-on-global-nav)
5. [Wireframe 4.5: 1-Click Connection Diagnostic Tool (Success vs Failure Remediation)](#wireframe-45-1-click-connection-diagnostic-tool)
6. [Wireframe 4.6: Lab Scope Card & Assigned Target Verification Panel](#wireframe-46-lab-scope-card--assigned-target-verification-panel)
7. [Wireframe 4.7: Client-to-Client Isolation Notice & Safe Practice Code of Conduct Modal](#wireframe-47-client-to-client-isolation-notice--code-of-conduct)
8. [Wireframe 4.8: Out-of-Scope Traffic Detection Warning & Quick Target Re-aligner](#wireframe-48-out-of-scope-traffic-detection-warning)

---

## Wireframe 4.1: VPN Management Hub & Dual-Profile Selector
> **Tương ứng User Flow:** Sub-flow 1.1 (US-04.01)  
> **URL:** `/settings/vpn`  
> **Topology:** Split Configuration Selector with Protocol Comparison

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]  Paths   Rooms   CTF Arena   Certifications       [ VPN: DISCONNECTED ● ]  [Search]  [AVT Alex] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ SETTINGS // SECURE VPN GATEWAY ACCESS                                       SERVER REGION: ASIA-SG-01  │
│ Connect your personal penetration testing machine (Kali Linux / Parrot OS) to the lab overlay network.│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐  ┌──────────────────────────────────────────────┐     │
│ │ ⚡ OPTION A: STANDARD PROFILE (WIREGUARD)    │  │ 🛡️ OPTION B: COMPATIBILITY PROFILE (OPENVPN)  │     │
│ │ Recommended for speed and modern OS          │  │ For restricted campus or corporate firewalls │     │
│ ├──────────────────────────────────────────────┤  ├──────────────────────────────────────────────┤     │
│ │ Protocol: WireGuard (Kernel UDP)             │  │ Protocol: OpenVPN over TCP Port 443          │     │
│ │ Performance: High Throughput (Sub-20ms)      │  │ Performance: Standard Encapsulation          │     │
│ │ Client IP:   10.8.0.42 / 16                  │  │ Client IP:   10.8.0.42 / 16                  │     │
│ │ Status:      Profile Generated (Valid)       │  │ Status:      Profile Generated (Valid)       │     │
│ │                                              │  │                                              │     │
│ │ Features:                                    │  │ Features:                                    │     │
│ │ • Instant handshake (< 100ms)                │  │ • Bypasses strict campus NAT firewalls       │     │
│ │ • Minimal battery/CPU footprint              │  │ • Emulates HTTPS SSL/TLS traffic             │     │
│ │                                              │  │                                              │     │
│ │ ┌──────────────────────────────────────────┐ │  │ ┌──────────────────────────────────────────┐ │     │
│ │ │ [ 📥 DOWNLOAD WIREGUARD CONFIG (.conf) ] │ │  │ │ [ 📥 DOWNLOAD OPENVPN CONFIG (.ovpn) ]  │ │ │     │
│ │ └──────────────────────────────────────────┘ │  │ └──────────────────────────────────────────┘ │ │     │
│ │ [ View WireGuard Setup Guide ]               │  │ [ View OpenVPN Setup Guide ]                 │     │
│ └──────────────────────────────────────────────┘  └──────────────────────────────────────────────┘     │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ SECURITY HYGIENE CONTROLS                                                                              │
│ Suspect your configuration file was leaked or compromised?                                             │
│ [ 🔄 Invalidate & Regenerate New Cryptographic Keys ]                  [ View Safe Connection Policy ] │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 4.2: 3-Step Visual Setup & Configuration Drawer
> **Tương ứng User Flow:** Sub-flow 1.1 (US-04.01)  
> **Topology:** Slide-out Guided Setup Drawer

```text
┌──────────────────────────────────────────────────────────────────────────────────────────┬─────────────┐
│ [ Background Workspace ]                                                                 │ SETUP GUIDE │
│                                                                                          │ WIREGUARD [X│
│                                                                                          ├─────────────┤
│                                                                                          │ STEP 1:     │
│                                                                                          │ Install app │
│                                                                                          │ [Ubuntu/Mac]│
│                                                                                          │ $ sudo apt  │
│                                                                                          │   install   │
│                                                                                          │   wireguard │
│                                                                                          │             │
│                                                                                          │ STEP 2:     │
│                                                                                          │ Import Conf │
│                                                                                          │ Move file:  │
│                                                                                          │ /etc/wire-  │
│                                                                                          │ guard/wg0.  │
│                                                                                          │ conf        │
│                                                                                          │             │
│                                                                                          │ STEP 3:     │
│                                                                                          │ Up Tunnel   │
│                                                                                          │ $ sudo wg-  │
│                                                                                          │   quick up  │
│                                                                                          │   wg0       │
│                                                                                          │             │
│                                                                                          │ [✓ Test Now]│
│                                                                                          │             │
│                                                                                          │ [Close]     │
└──────────────────────────────────────────────────────────────────────────────────────────┴─────────────┘
```

---

## Wireframe 4.3: Cryptographic Key Invalidation & Profile Regeneration Modal
> **Tương ứng User Flow:** Sub-flow 1.2 (US-04.01)  
> **Topology:** Centered Destructive Confirmation Security Guard

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ⚠️ REGENERATE VPN CREDENTIALS & KEYS                                 [X] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ This action will IMMEDIATELY REVOKE your current WireGuard and OpenVPN   │
│ cryptographic keypairs on the central VPN gateway.                       │
│                                                                          │
│ Consequences:                                                            │
│ • Any active tunnel session on your laptop/PC will drop instantly.       │
│ • Previous `.conf` and `.ovpn` files will become permanently invalid.     │
│ • You must import the newly generated configuration file to reconnect.  │
│                                                                          │
│ Assigned IP Address: Will remain preserved (10.8.0.42).                  │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ [ Cancel - Keep Existing Profile ]      [ CONFIRM REVOKE & REGENERATE ]  │
└──────────────────────────────────────────────────────────────────────────┘

[ TRẠNG THÁI SAU KHI REGENERATE THÀNH CÔNG ]
┌──────────────────────────────────────────────────────────────────────────┐
│ ✅ CREDENTIALS REGENERATED SUCCESSFULLY                               [X] │
├──────────────────────────────────────────────────────────────────────────┤
│ Old cryptographic keys have been destroyed across all gateway nodes.     │
│ Your new secure WireGuard and OpenVPN profiles are ready for download.   │
│                                                                          │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ [ 📥 DOWNLOAD NEW WIREGUARD CONFIG (.conf) ]                         │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────┤
│ [ Done & Return to Settings ]                                            │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 4.4: Live VPN Health Indicator on Global Nav
> **Tương ứng User Flow:** Sub-flow 2.1 (US-04.02)  
> **Topology:** Top Navigation Badge States & Quick Diagnostics Popover

### State 1: Chưa kết nối (Chấm xám)
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]  Paths   Rooms   CTF Arena        [ ⚪ VPN: DISCONNECTED ]                 [Search]  [AVT Alex] │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### State 2: Đang bắt tay kết nối (Chấm vàng nhấp nháy)
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]  Paths   Rooms   CTF Arena        [ 🟡 VPN: HANDSHAKING... ]               [Search]  [AVT Alex] │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### State 3: Đã kết nối thành công (Chấm xanh lá cây)
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]  Paths   Rooms   CTF Arena        [ 🟢 VPN: 10.8.0.42 (ACTIVE) ]           [Search]  [AVT Alex] │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Quick Flyout Popover khi Click vào Huy hiệu:
```text
┌──────────────────────────────────────────────────────────┐
│ VPN GATEWAY TELEMETRY // WIREGUARD                   [X] │
├──────────────────────────────────────────────────────────┤
│ Tunnel Status:    CONNECTED ●                            │
│ Client Overlay IP:10.8.0.42                              │
│ Gateway Endpoint: sg01.vpn.cyberforce.io:51820           │
│ Current Latency:  18 ms (Sub-20ms Optimal)               │
│ Last Handshake:   24 seconds ago                         │
│ Transferred:      14.2 MB Down / 3.8 MB Up               │
├──────────────────────────────────────────────────────────┤
│ [ ⚡ Run Connectivity Ping Test ]   [ Download Config ]  │
└──────────────────────────────────────────────────────────┘
```

---

## Wireframe 4.5: 1-Click Connection Diagnostic Tool
> **Tương ứng User Flow:** Sub-flow 2.2 (US-04.02)  
> **Topology:** In-room Diagnostic Test & Remediation Modal

### State A: Kết nối thông suốt (All Signals Green)
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ⚡ VPN CONNECTIVITY DIAGNOSTICS                                      [X] │
├──────────────────────────────────────────────────────────────────────────┤
│ Target Probe: 10.10.42.18 (Assigned Room Lab Instance)                   │
│                                                                          │
│ Diagnostic Pipeline:                                                     │
│ [✓] Local Interface Handshake ............ OK (10.8.0.42 bound)          │
│ [✓] Gateway WireGuard Ping ............... OK (Latency: 14ms)            │
│ [✓] Lab Overlay Route (10.10.0.0/16) ..... OK (Route established)        │
│ [✓] Target Machine Response .............. OK (TCP Port 80/22 Listening) │
│                                                                          │
│ STATUS: TUNNEL IS 100% OPERATIONAL. You are ready to attack!             │
├──────────────────────────────────────────────────────────────────────────┤
│ [ Close & Continue Practicing ]                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### State B: Kết nối thất bại (Failure Remediation Paths)
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ⚠️ VPN CONNECTIVITY TEST FAILED                                      [X] │
├──────────────────────────────────────────────────────────────────────────┤
│ Target Probe: 10.10.42.18                                                │
│                                                                          │
│ Diagnostic Pipeline:                                                     │
│ [✓] Local Interface Handshake ............ OK                            │
│ [✗] Gateway WireGuard Ping ............... TIMEOUT (No echo reply)       │
│ [✗] Lab Overlay Route .................... UNREACHABLE                   │
│                                                                          │
│ Possible Root Causes:                                                    │
│ 1. Your campus/office network is blocking UDP port 51820.                │
│ 2. The WireGuard client is paused or disconnected on your laptop.        │
│                                                                          │
│ Recommended Escape Routes:                                               │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ [ 🛡️ Switch to OpenVPN (TCP 443 Compatibility Profile) ]             │ │
│ ├──────────────────────────────────────────────────────────────────────┤ │
│ │ [ 🖥️ Use In-Browser Kali AttackBox (Zero Setup Required) ]          │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────┤
│ [ Cancel ]                                         [ Re-run Test Now ]   │
└──────────────────────────────────────────────────────────────────────────┘
```
* **No Dead End:** Cung cấp ngay 2 giải pháp thay thế tức thì: Đổi sang OpenVPN vượt tường lửa, hoặc chuyển sang dùng Kali AttackBox ngay trên tab trình duyệt mà không cần sửa card mạng cá nhân.

---

## Wireframe 4.6: Lab Scope Card & Assigned Target Verification Panel
> **Tương ứng User Flow:** Sub-flow 3.1 (US-04.03)  
> **Topology:** In-room Scope Manifest Card

```text
┌────────────────────────────────────────────────────────────────────────┐
│ LAB ENGAGEMENT SCOPE // RULES OF ENGAGEMENT                            │
├────────────────────────────────────────────────────────────────────────┤
│ YOUR DEDICATED TARGET:                                                 │
│ Target Hostname:  sqli-app-node04.internal                             │
│ Target IPv4:      [ 10.10.42.18 ] [ 📋 Copy Target IP ]                │
│ Allowed Ports:    22 (SSH), 80 (HTTP), 8080 (Admin Console)            │
│ Subnet Boundary:  10.10.42.0/24 only                                   │
│                                                                        │
│ ⚠️ RULES OF ENGAGEMENT:                                                 │
│ • Client-to-Client communication is STRICTLY DROPPED by eBPF firewall. │
│ • Do NOT scan external IP addresses (Traffic will be logged & blocked).│
│ • Treat fellow students' sandboxes as strictly out of scope.           │
│                                                                        │
│ [ View Full Code of Conduct ]            [ ✓ Acknowledged & Ready ]    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 4.7: Client-to-Client Isolation Notice & Code of Conduct Modal
> **Tương ứng User Flow:** Sub-flow 3.1 (US-04.03)  
> **Topology:** Security & Ethical Conduct Verification Dialog

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ 🛡️ SAFE PRACTICING CODE OF CONDUCT & CLIENT ISOLATION                 [X] │
├──────────────────────────────────────────────────────────────────────────┤
│ CyberForce enforces strict network isolation to protect all students:    │
│                                                                          │
│ 1. Zero Peer-to-Peer Interaction:                                        │
│    All VPN clients (`10.8.0.0/16`) are cryptographically isolated.       │
│    Direct packets between student devices (`wg0 -> wg0`) are discarded. │
│                                                                          │
│ 2. Isolated Target Sandboxes:                                            │
│    You have full authorization to exploit your assigned `10.10.x.y`      │
│    machine only. Probing other lab subnets triggers an automated warning.│
│                                                                          │
│ 3. Professional Ethics:                                                  │
│    No denial of service (DoS) attacks against platform gateways.         │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ [ Close ]                                  [ I Agree & Return to Lab ]   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 4.8: Out-of-Scope Traffic Detection Warning
> **Tương ứng User Flow:** Sub-flow 3.2 (US-04.03)  
> **Topology:** Non-disruptive Realignment Banner with 1-Click Target Re-anchor

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ SCOPE DRIFT DETECTED: You attempted to probe 10.10.19.42, which belongs to another student's lab.   │
│ This packet was dropped by the gateway firewall. Your assigned lab machine is: [ 10.10.42.18 ].        │
│ [ 📋 Copy Correct Target IP: 10.10.42.18 ]                               [ Dismiss Scope Warning ]     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

* **Điểm nhấn UX/UI:**
  * Không khóa màn hình hay ngắt mạng khiến người dùng hoảng loạn.
  * Cảnh báo nhẹ nhàng nhưng rõ ràng: Thông báo lệnh gõ nhầm IP, đồng thời cung cấp nút copy lại IP chuẩn của mình để tiếp tục làm bài.

---

## 🎯 Verification & Hand-off Checklist cho Epic 4

- [x] **Đầy đủ 2 loại cấu hình:** WireGuard (Tối ưu tốc độ) và OpenVPN TCP 443 (Vượt tường lửa trường học).
- [x] **Huy hiệu Live VPN Nav:** Tự động bắt sự kiện kết nối của người dùng mà không cần reload trang web.
- [x] **Tiện ích chẩn đoán 1-click:** Báo cáo chi tiết từng bước (Interface $\rightarrow$ Gateway $\rightarrow$ Route $\rightarrow$ Target), có phương án thoát hiểm sang Web AttackBox nếu không thể kết nối VPN.
- [x] **Kiểm soát phạm vi an toàn:** Nhắc nhở quy tắc ứng xử và cảnh báo thân thiện khi gõ nhầm IP sang máy bạn học khác.
- [x] **Đồng bộ tuyệt đối:** Khớp 100% với [`docs/06-user-flow/EPIC_04_USER_FLOW_VPN_GATEWAY.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/06-user-flow/EPIC_04_USER_FLOW_VPN_GATEWAY.md) và TDD Section 8 (Zero-Trust Network Isolation).
