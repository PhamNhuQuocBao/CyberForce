# 🖥️ EPIC 3: Wireframe Architecture & Low-Fidelity UI Specifications
## Zero-Setup Cloud Lab & In-Browser Practice

* **Project:** CyberForce (CyberForge) Cloud Cyber Range
* **Reference User Flow:** [`docs/06-user-flow/EPIC_03_USER_FLOW_CLOUD_LAB.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/06-user-flow/EPIC_03_USER_FLOW_CLOUD_LAB.md)
* **Design Philosophy:** Tactical Cyber-HUD, Sandboxing Ergonomics & Zero Egress Isolation
* **Version:** 1.0.0

---

## 🎨 Design System Foundation & Lab Virtualization Tokens

| Token / Thành phần | Quy chuẩn hiển thị | Mục đích kỹ thuật & Trải nghiệm |
| :--- | :--- | :--- |
| **Trạng thái Máy chạy** | `#10B981` (Cyber Emerald) + Pulse Indicator | Thông báo máy Docker/MicroVM đã sẵn sàng nhận kết nối, hiển thị IP nội bộ `10.10.x.y`. |
| **Cảnh báo Ân hạn (Grace)**| `#EF4444` (Crimson Pulse) + Đếm ngược `03:00` | Kích hoạt khi đồng hồ về `00:00`, cảnh báo âm thanh và thị giác trước khi Reaper thu hồi máy. |
| **Trạng thái Chờ / Busy** | `#F59E0B` (Amber Spinner / Progress Bar) | Thể hiện quá trình kéo image/khởi tạo container (<3s) hoặc boot microVM (<60s). |
| **Thanh Clipboard ảo** | Drawer bên phải màn hình Guacamole | Đồng bộ dữ liệu hai chiều (Host $\leftrightarrow$ Kali AttackBox) an toàn và tiện lợi. |
| **Chính sách Zero Egress** | Banner hướng dẫn `#334155` + Viền Amber | Giải thích thân thiện khi lệnh kết nối ra ngoài Internet bị eBPF/iptables chặn đứng. |

---

## 📐 Wireframe Index (8 Màn hình Trọng yếu)

1. [Wireframe 3.1: Target Machine Launchpad (1-Click Docker & Deep VM Progress)](#wireframe-31-target-machine-launchpad)
2. [Wireframe 3.2: Concurrent Machine Conflict Modal (Giới hạn 1 Máy/Tài khoản)](#wireframe-32-concurrent-machine-conflict-modal)
3. [Wireframe 3.3: Active Machine HUD & Lease Extension Tracker (+1 Hour, Max 3/3)](#wireframe-33-active-machine-hud--lease-extension-tracker)
4. [Wireframe 3.4: 3-Minute Grace Period Urgent Alert & Auto-Reap Screen](#wireframe-34-3-minute-grace-period-urgent-alert--auto-reap-screen)
5. [Wireframe 3.5: In-Browser Kali AttackBox Workspace & Two-Way Clipboard Drawer](#wireframe-35-in-browser-kali-attackbox-workspace)
6. [Wireframe 3.6: AttackBox Reconnection Overlay & Network Degradation Fallback](#wireframe-36-attackbox-reconnection-overlay)
7. [Wireframe 3.7: Embedded xterm.js Web Terminal & 15-Minute Inactivity Screen](#wireframe-37-embedded-xtermjs-web-terminal)
8. [Wireframe 3.8: Zero-Egress Network Isolation Banner & Policy Explanation](#wireframe-38-zero-egress-network-isolation-banner)

---

## Wireframe 3.1: Target Machine Launchpad (1-Click Docker & Deep VM Progress)
> **Tương ứng User Flow:** Sub-flow 1.1 (US-03.01)  
> **Topology:** Compact Sandbox Control Bar & State Transitions

### State A: Trước khi khởi động (Idle State)
```text
┌────────────────────────────────────────────────────────────────────────┐
│ TARGET SANDBOX // INSTANCE: NONE                                       │
├────────────────────────────────────────────────────────────────────────┤
│ Target Environment: Linux Web Exploitation (Docker Container)          │
│ Specifications: 2 vCPU │ 2GB RAM │ Zero-Egress Network Subnet          │
│ Initial Lease: 60 Minutes (Extendable up to 4 Hours)                   │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [ ⚡ START TARGET MACHINE ]                                        │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### State B: Khởi tạo nhanh dưới 3s (Standard Docker Lab)
```text
┌────────────────────────────────────────────────────────────────────────┐
│ TARGET SANDBOX // PROVISIONING...                                      │
├────────────────────────────────────────────────────────────────────────┤
│ [ Spinner ● ] Allocating isolated ephemeral container (Subnet 10.10.x) │
│ Injected Salt: HMAC Verified │ Securing cgroup memory limits...        │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [ PROVISIONING TARGET... (Estimated: < 3s) ]                       │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### State C: Khởi tạo máy ảo sâu dưới 60s (Active Directory / Kernel MicroVM)
```text
┌────────────────────────────────────────────────────────────────────────┐
│ TARGET SANDBOX // BOOTING MICROVM / KVM HYPERVISOR                     │
├────────────────────────────────────────────────────────────────────────┤
│ Target Environment: Windows Server 2022 Active Directory Domain        │
│ Status: Booting kernel image & initial domain services (38s / 60s)     │
│ Progress: [■■■■■■■■■■■■■■■■■■□□□□□□] 65%                               │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [ BOOTING ENVIRONMENT... (Please wait ~20s) ]   [ Cancel Launch ]  │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 3.2: Concurrent Machine Conflict Modal
> **Tương ứng User Flow:** Sub-flow 1.2 (US-03.01)  
> **Topology:** Centered Conflict Resolution Guard Dialog

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ⚠️ CONCURRENT LAB LIMIT REACHED                                      [X] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ Each operator account is allocated resources for 1 target machine at     │
│ a time to ensure optimal platform compute capacity.                      │
│                                                                          │
│ You currently have an active target machine running in another room:     │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ Active Room: "Linux Fundamentals Part 2"                             │ │
│ │ Target IP:   10.10.15.88  │  Time Remaining: 38:45                  │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ Would you like to terminate the previous machine and spawn this new one? │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ [ Cancel & Return to Linux Lab ]   [ TERMINATE PREVIOUS & SPAWN NEW → ]  │
└──────────────────────────────────────────────────────────────────────────┘
```
* **No Dead End:** Cho phép người dùng hủy thao tác và bấm quay về thẳng phòng lab cũ `[Return to Linux Lab]`, hoặc chuyển phòng 1-click tự động tắt máy cũ mà không phải chuyển trang thủ công.

---

## Wireframe 3.3: Active Machine HUD & Lease Extension Tracker
> **Tương ứng User Flow:** Sub-flow 2.1 (US-03.02)  
> **Topology:** Telemetry Card with In-line Lease Controller

```text
┌────────────────────────────────────────────────────────────────────────┐
│ TARGET MACHINE // ACTIVE ●                            STATUS: HEALTHY  │
├────────────────────────────────────────────────────────────────────────┤
│ INTERNAL IP: [ 10.10.42.18 ] [ 📋 Copy IP ]   (Subnet: 10.10.0.0/16)   │
│                                                                        │
│ SESSION LEASE COUNTDOWN:                                               │
│ ┌───────────────────────┐                                              │
│ │   ⏱️ 52 : 14 REMAINING │   [ +1 HOUR EXTENSION ] (Used: 1/3 Max)     │
│ └───────────────────────┘                                              │
│                                                                        │
│ Extension Status: 2 extensions remaining (Max total lease: 4 hours)    │
│                                                                        │
│ Controls:                                                              │
│ [ 🔄 Reboot Target OS ]                     [ 🛑 Terminate Instance ]  │
└────────────────────────────────────────────────────────────────────────┘

[ TRẠNG THÁI KHI ĐÃ SỬ DỤNG HẾT 3/3 LẦN GIA HẠN ]
┌────────────────────────────────────────────────────────────────────────┐
│ SESSION LEASE COUNTDOWN:                                               │
│ ┌───────────────────────┐                                              │
│ │   ⏱️ 18 : 30 REMAINING │   [ +1 HOUR (DISABLED) ] (Used: 3/3 Max)    │
│ └───────────────────────┘                                              │
│ ℹ️ Maximum lease limit reached (4 hours total). Please wrap up tasks.   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 3.4: 3-Minute Grace Period Urgent Alert & Auto-Reap Screen
> **Tương ứng User Flow:** Sub-flow 2.2 (US-03.02)  
> **Topology:** High-Priority Pulsing Alert Bar & Auto-Terminated Summary Screen

### State A: Cảnh báo thời gian ân hạn 3 phút (Timer chạm 00:00)
```text
┌────────────────────────────────────────────────────────────────────────┐
│ 🚨 LEASE EXPIRED // 3-MINUTE GRACE PERIOD ENGAGED                      │
├────────────────────────────────────────────────────────────────────────┤
│ Your 60-minute standard lease has elapsed. The Reaper worker will      │
│ permanently destroy this target instance in:                           │
│                                                                        │
│                           ┌──────────────┐                             │
│                           │   02 : 45    │                             │
│                           └──────────────┘                             │
│                                                                        │
│ Need to keep working? Click below immediately to rescue your instance: │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [ ⚡ RESCUE SESSION (+1 HOUR EXTENSION) ]                          │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### State B: Màn hình kết thúc phiên sau khi bị thu hồi (Auto-reaped)
```text
┌────────────────────────────────────────────────────────────────────────┐
│ 🛑 INSTANCE REAPED // RESOURCES FREED                                  │
├────────────────────────────────────────────────────────────────────────┤
│ The target machine was safely terminated because the 3-minute grace    │
│ period expired without extension.                                      │
│                                                                        │
│ All temporary files were wiped in accordance with zero-trust policies. │
│ Your question answers and earned EXP are permanently preserved.        │
│                                                                        │
│ Ready to restart?                                                      │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [ ⚡ START FRESH TARGET MACHINE ]                                  │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 3.5: In-Browser Kali AttackBox Workspace & Clipboard Drawer
> **Tương ứng User Flow:** Sub-flow 3.1 (US-03.03)  
> **URL:** `/room/:id/attackbox`  
> **Topology:** Full-Bleed Remote Desktop Stream (Guacamole HTML5 Canvas) with Tactical Toolbar

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [← Back to Split View]  KALI ATTACKBOX // DESKTOP CANVAS (guacd stream)   FPS: 45 │ LATENCY: 28ms      │
├──────────────────────────────────────────────────────────────────────────────────────────┬─────────────┤
│ ┌── Kali Menu ── Application Finder ──────────────────────── 20:30 Mon ── [Audio: Off]─┐ │ TOOLBAR     │
│ │                                                                                       │ │             │
│ │  ┌───────────── Terminal: root@attackbox:~ ─────────────────────────────────────────┐ │ │ [ ⛶ Full ]  │
│ │  │ root@attackbox:~# nmap -sC -sV 10.10.42.18                                       │ │ │ [ 🔄 Sync ] │
│ │  │ Starting Nmap 7.94 ( https://nmap.org ) at 2026-09-20 20:30 UTC                  │ │ │ [ ⚙️ Qual ] │
│ │  │ Nmap scan report for 10.10.42.18                                                 │ │ ├─────────────┤
│ │  │ PORT   STATE SERVICE VERSION                                                     │ │ │ CLIPBOARD   │
│ │  │ 22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu                                        │ │ │ TWO-WAY     │
│ │  │ 80/tcp open  http    Apache httpd 2.4.52                                         │ │ │ ┌─────────┐ │
│ │  │ |_http-title: VulnApp Login                                                      │ │ │ │CF{flag_ │ │
│ │  │ root@attackbox:~# █                                                              │ │ │ │0x992a}  │ │
│ │  │                                                                                  │ │ │ └─────────┘ │
│ │  └──────────────────────────────────────────────────────────────────────────────────┘ │ │ [ Paste → │
│ │                                                                                       │ │   to Kali]  │
│ │  ┌── Burp Suite Community Edition v2026 ────────────────────────────────────────────┐ │ │             │
│ │  │ [Target] [Proxy] [Intruder] [Repeater]                                           │ │ │ [ ← Copy   │
│ │  │ HTTP history: GET /admin/dashboard.php HTTP/1.1 (200 OK)                          │ │ │   to Host]  │
│ │  └──────────────────────────────────────────────────────────────────────────────────┘ │ ├─────────────┤
│ └───────────────────────────────────────────────────────────────────────────────────────┘ │ SEND KEYS:  │
│                                                                                           │ [Ctrl+Alt+D]│
│                                                                                           │ [Tab] [Esc] │
└──────────────────────────────────────────────────────────────────────────────────────────┴─────────────┘
```

* **Điểm nhấn UX/UI:**
  * **Chạy 100% không cài đặt:** HTML5 Canvas tương tác chuột và bàn phím mượt mà, độ trễ $< 50\text{ms}$.
  * **Thanh Clipboard Drawer 2 chiều:** Giải quyết triệt để rào cản sao chép lệnh dài hoặc dán Flag ra ngoài để nộp bài.
  * **Phím tắt ảo:** Nút bấm nhanh các phím khó bấm trên trình duyệt (Ctrl, Alt, Tab, Esc).

---

## Wireframe 3.6: AttackBox Reconnection Overlay & Fallback
> **Tương ứng User Flow:** Sub-flow 3.2 (US-03.03)  
> **Topology:** Non-destructive WebSocket Reconnection Veil

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [ Background Kali Desktop remains visually frozen but protected underneath ]                          │
│                                                                                                        │
│ ┌──────────────────────────────────────────────────────────────────────────┐                           │
│ │ 🔄 RECONNECTING ATTACKBOX STREAM...                                      │                           │
│ ├──────────────────────────────────────────────────────────────────────────┤                           │
│ │ Network latency hiccup detected. Re-establishing secure WebSocket tunnel │                           │
│ │ to Guacamole proxy daemon (guacd)...                                     │                           │
│ │                                                                          │                           │
│ │ Attempt 2 of 3 [ Spinner ● ]                                             │                           │
│ │                                                                          │                           │
│ │ Your background scans (Nmap / Metasploit) continue running on server.   │
│ │ No data or terminal buffers will be lost upon reconnection.              │
│ │                                                                          │
│ ├──────────────────────────────────────────────────────────────────────────┤
│ │ [ Cancel Reconnect & Exit ]                       [ Reconnect Manually ] │                           │
│ └──────────────────────────────────────────────────────────────────────────┘                           │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 3.7: Embedded xterm.js Web Terminal & 15-Minute Inactivity Screen
> **Tương ứng User Flow:** Sub-flow 4.1 (US-03.04)  
> **Topology:** Lightweight Embedded Terminal Container with Idle Guard

### State A: Đang gõ lệnh thực hành (Active Shell)
```text
┌────────────────────────────────────────────────────────────────────────┐
│ WEB TERMINAL // SHELL: BASH (xterm.js)               STATUS: CONNECTED │
├────────────────────────────────────────────────────────────────────────┤
│ student@cyberforce:~$ uname -a                                         │
│ Linux sandbox-node-42 6.5.0-generic #42-Ubuntu SMP x86_64 GNU/Linux   │
│ student@cyberforce:~$ ls -la /var/www/html                             │
│ total 16                                                               │
│ drwxr-xr-x 2 root root 4096 Sep 20 18:00 .                            │
│ -rw-r--r-- 1 root root  420 Sep 20 18:00 index.php                    │
│ -rw-r--r-- 1 root root  112 Sep 20 18:00 config.php                   │
│ student@cyberforce:~$ cat /var/www/html/config.php                     │
│ <?php $db_pass = "s3cr3t_p@ss_2026"; ?>                                │
│ student@cyberforce:~$ █                                                │
├────────────────────────────────────────────────────────────────────────┤
│ Shortcuts: [Ctrl+C] [Ctrl+L (Clear)] [Tab (Complete)] [↑ History]      │
└────────────────────────────────────────────────────────────────────────┘
```

### State B: Tự ngắt phiên khi không hoạt động suốt 15 phút (Inactivity Timeout)
```text
┌────────────────────────────────────────────────────────────────────────┐
│ WEB TERMINAL // SESSION DISCONNECTED                                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ [!] Session closed due to inactivity (No keystrokes for 15 minutes).   │
│     Target machine remains running and intact.                         │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ [ ⚡ RECONNECT TERMINAL SESSION ]                                   │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                        │
│ (Or press any key on your keyboard to instantly reconnect)             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 3.8: Zero-Egress Network Isolation Banner & Policy Explanation
> **Tương ứng User Flow:** Sub-flow 4.2 (US-03.04)  
> **Topology:** In-terminal Policy Violation Feedback & Explanatory Toast

```text
┌────────────────────────────────────────────────────────────────────────┐
│ WEB TERMINAL // SHELL: BASH                                            │
├────────────────────────────────────────────────────────────────────────┤
│ student@cyberforce:~$ curl -I https://google.com                       │
│ curl: (7) Failed to connect to google.com port 443: Network unreachable│
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ 🛡️ LAB SECURITY POLICY: OUTBOUND INTERNET ACCESS RESTRICTED        │ │
│ │                                                                    │ │
│ │ All lab sandboxes operate under a strict "Zero Outbound Egress"    │ │
│ │ firewall policy. External Internet traffic is blocked to prevent   │ │
│ │ network misuse and infrastructure abuse.                           │ │
│ │                                                                    │ │
│ │ Approved Targets: Only scan & attack local subnet: 10.10.0.0/16     │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ student@cyberforce:~$ █                                                │
├────────────────────────────────────────────────────────────────────────┤
│ [ Dismiss Tip ]                                     [ Lab Network FAQ ]│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Verification & Hand-off Checklist cho Epic 3

- [x] **Phân tách thời gian khởi chạy:** Phản ánh rõ SLA khởi động máy: Docker Container $< 3$ giây và MicroVM VM $< 60$ giây.
- [x] **Quy tắc Concurrency:** Xử lý triệt để giới hạn 1 máy/tài khoản, cung cấp modal xác nhận chuyển phòng 1-click không gây bế tắc.
- [x] **Thời gian ân hạn 3 phút (Reaper Rule):** Cảnh báo nổi bật khi chạm `00:00`, nút cứu phiên `+1 Hour` giúp không mất bài dở dang.
- [x] **Khay nhớ tạm Guacamole hai chiều:** Có thanh công cụ chuyên dụng giải quyết vấn đề copy/paste giữa trình duyệt và máy ảo Kali.
- [x] **Khớp 100% tài liệu kiến trúc:** Đồng bộ hoàn hảo với [`docs/06-user-flow/EPIC_03_USER_FLOW_CLOUD_LAB.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/06-user-flow/EPIC_03_USER_FLOW_CLOUD_LAB.md) và TDD Section 6 & 7.
