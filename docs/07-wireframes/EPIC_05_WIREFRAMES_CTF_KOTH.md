> **Thiết kế cũ — chỉ dùng đối chiếu nghiệp vụ.** Bố cục và style trong file này đã được thay thế bởi [bộ Modern Minimal](modern-minimal/README.md). Xem [bảng đối chiếu](modern-minimal/TRACEABILITY.md) để tìm màn hình mới; không dùng token, emoji hay hiệu ứng của bản cũ để triển khai.

# 🖥️ EPIC 5: Wireframe Architecture & Low-Fidelity UI Specifications
## CTF Competitions & Real-Time King of the Hill (KotH) Arena

* **Project:** CyberForce (CyberForge) Cloud Cyber Range
* **Reference User Flow:** [`docs/06-user-flow/EPIC_05_USER_FLOW_CTF_KOTH.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/06-user-flow/EPIC_05_USER_FLOW_CTF_KOTH.md)
* **Design Philosophy:** Tactical Cyber-HUD, Live Combat Esports & Anti-Sabotage Arena
* **Version:** 1.0.0

---

## 🎨 Design System Foundation & Arena Telemetry Tokens

| Trạng thái / Phần tử | Quy chuẩn hiển thị | Mục đích kỹ thuật & Esports UX |
| :--- | :--- | :--- |
| **Vị trí King Tối thượng** | `#F59E0B` (Amber Gold) + Vương miện 👑 | Vinh danh đấu thủ đang nắm giữ `/root/king.txt`, hiển thị banner toàn sàn đấu. |
| **Chu kỳ Tick 60 Giây** | Vòng đồng hồ điện tử viền Electric Cyan | Đếm lùi thời gian đến mốc tính điểm `ZINCRBY +10` kế tiếp của Game Engine. |
| **SLA Dịch vụ (Health)** | `#10B981` (SLA 100%) / `#EF4444` (SLA FAILED) | Kiểm tra heartbeat port 22/80; đóng băng điểm nếu dịch vụ sập, đếm lùi Auto-Heal 15s. |
| **Đóng băng Bảng điểm** | `#06B6D4` (Glacial Cyan / Ice Freeze ❄️) | Kích hoạt trong 60 phút cuối giải đấu để giữ bí mật kết quả chặng đua nước rút. |
| **Bục Vinh Quang (Podium)** | Vàng 🥇, Bạc 🥈, Đồng 🥉 viền kim loại sắc | Tôn vinh Top 3 chung cuộc khi Unfreeze, kèm nút tải chứng nhận số. |
| **Bán kính Bo góc** | `0px` – `2px` (Sắc nhọn, góc cạnh chiến thuật) | Mang phong cách esport tác chiến mạng chuyên nghiệp, dứt khoát không bo tròn mềm. |

---

## 📐 Wireframe Index (8 Màn hình Trọng yếu)

1. [Wireframe 5.1: KotH Arena Lobby & Queue Matchmaker](#wireframe-51-koth-arena-lobby--queue-matchmaker)
2. [Wireframe 5.2: KotH Pre-Match Staging Lounge & 3-Minute Countdown](#wireframe-52-koth-pre-match-staging-lounge)
3. [Wireframe 5.3: KotH Live Combat HUD (45:00 Match, 60s Tick Ring, King Crown)](#wireframe-53-koth-live-combat-hud)
4. [Wireframe 5.4: KotH SLA Service Outage Alert & 15-Second Auto-Heal Daemon HUD](#wireframe-54-koth-sla-service-outage-alert--auto-heal-hud)
5. [Wireframe 5.5: Anti-Sabotage Disciplinary Penalty Modal (Phạt Trừ Điểm & Khóa 3 Ngày)](#wireframe-55-anti-sabotage-disciplinary-penalty-modal)
6. [Wireframe 5.6: Jeopardy CTF Fixed Points & Time Tie-break](#wireframe-56-jeopardy-ctf-fixed-points--time-tie-break)
7. [Wireframe 5.7: Late-Game Scoreboard Freeze Banner & Personal Progress View](#wireframe-57-late-game-scoreboard-freeze-banner)
8. [Wireframe 5.8: Grand Finale Unfreeze Ceremony, Top 3 Podium & Trophy Card](#wireframe-58-grand-finale-unfreeze-ceremony-top-3-podium)

---

## Wireframe 5.1: KotH Arena Lobby & Queue Matchmaker
> **Tương ứng User Flow:** Sub-flow 1.1 (US-05.01)  
> **URL:** `/arena/koth`  
> **Topology:** Real-time Arena Browser with Match Capacity & Queueing

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]  Paths   Rooms   CTF & KotH [ACTIVE]   Certifications         [ VPN: CONNECTED ● ]  [AVT Alex]  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ KING OF THE HILL // REAL-TIME COMBAT ARENA                                    TOTAL LIVE ARENAS: 8     │
│ 45-Minute Free-for-All: Infiltrate, capture root, defend services, and accumulate points per tick.     │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ ARENA: ALPHA-SECTOR (Debian 12 Target)       │ PLAYERS: 8/10 [ OPEN ]   │ MATCH TIME: 45:00        │ │
│ │ Focus: Web RCE + Kernel Privilege Escalation │ Tick Reward: +10 pts/min │ Current King: ShadowByte │ │
│ │ ┌──────────────────────────────────────────┐ │                                                     │ │
│ │ │ [ ⚡ ENTER WAITING LOUNGE (2 Slots Left) ]│ │ [ View Target Tech Specs ]  [ Read Arena Rules ]    │ │
│ │ └──────────────────────────────────────────┘ │                                                     │ │
│ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │ ARENA: BRAVO-FORTRESS (Active Directory)     │ PLAYERS: 10/10 [ FULL ]  │ STATUS: IN PROGRESS      │ │
│ │ Focus: Kerberoasting + Domain Controller     │ Time Left: 18:42         │ Current King: CyberWolf  │ │
│ │ ┌──────────────────────────────────────────┐ │                                                     │ │
│ │ │ [ ⏳ JOIN AUTO-MATCH QUEUE (Position: 2) ]│ │ [ Spectate Live Scoreboard ]                         │ │
│ │ └──────────────────────────────────────────┘ │                                                     │ │
│ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │ ARENA: CHARLIE-VAULT (Hardened Ubuntu 24)    │ PLAYERS: 4/10 [ OPEN ]   │ MATCH TIME: 45:00        │ │
│ │ Focus: SUID Misconfig & Docker Socket Escape │ Starts In: 02:15         │ Status: Pre-Match Lounge │ │
│ │ ┌──────────────────────────────────────────┐ │                                                     │ │
│ │ │ [ ⚡ ENTER WAITING LOUNGE ]               │ │                                                     │ │
│ │ └──────────────────────────────────────────┘ │                                                     │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ ➕ Create Private Custom Match (Creator/Org) ]                      [ 🛡️ View Anti-Sabotage Policy ] │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 5.2: KotH Pre-Match Staging Lounge
> **Tương ứng User Flow:** Sub-flow 1.1 (US-05.01)  
> **Topology:** Operator Staging Deck with Synchronized Countdown Clock

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [← Leave Lounge]  KOTH ARENA // CHARLIE-VAULT: PRE-MATCH STAGING                SERVER: SG-KOTH-02     │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ MATCH COMMENCES IN:                                                                                    │
│ ┌────────────────────────┐                                                                             │
│ │   ⏱️ 02 : 15 COUNTDOWN  │   Target IP will be revealed automatically at 00:00.                       │
│ └────────────────────────┘                                                                             │
├─────────────────────────────────────────────┬──────────────────────────────────────────────────────────┤
│ ROSTER // OPERATORS READY (6/10)            │ RULES OF ENGAGEMENT (KOTH PROTOCOL)                      │
│ ┌─────────────────────────────────────────┐ │ • Claim Root: Write valid callsign into `/root/king.txt` │
│ │ [✓] alex_cyber       (Tier IV Guardian) │ │ • Tick Rate: Arbiter engine tallies points every 60s.   │
│ │ [✓] shadow_byte      (Tier V Sentinel)  │ │ • SLA Requirement: Web (Port 80) & SSH (22) must stay UP│
│ │ [✓] hex_phantom      (Tier III Adept)   │ │ • Anti-Sabotage: DO NOT delete system binaries or use    │
│ │ [✓] red_viper        (Tier IV Guardian) │ │   `chattr +i` on king token (3-Day Ban penalty).         │
│ │ [✓] null_pointer     (Tier II Novice)   │ │                                                          │
│ │ [✓] byte_hunter      (Tier III Adept)   │ │ Target Specs:                                            │
│ │ [ ] Waiting for operator...             │ │ Hostname: charlie-vault.koth.internal                    │
│ │ [ ] Waiting for operator...             │ │ OS: Hardened Linux 6.5 Kernel (SUID/Docker vectors)      │
│ └─────────────────────────────────────────┘ │                                                          │
│ Minimum Players Met (6 >= 4). Game Locked.  │ Current WireGuard VPN Status: [ 🟢 CONNECTED: 10.8.0.42 ] │
├─────────────────────────────────────────────┴──────────────────────────────────────────────────────────┤
│ [ ⚡ TOGGLE READY: CONFIRMED ✓ ]                                  [ Audio Cue Check: [🔊 Beep Tested] ]│
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 5.3: KotH Live Combat HUD
> **Tương ứng User Flow:** Sub-flow 1.2 (US-05.01)  
> **URL:** `/arena/koth/match/:id`  
> **Topology:** Esports Combat Split (Match Timer, 60s Tick Ring, King Banner & Live Scoreboard)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ KOTH COMBAT ARENA // CHARLIE-VAULT              MATCH TIME LEFT: [ ⏱️ 32:45 ]     SLA: [ 100% HEALTHY ]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 👑 CURRENT MONARCH OF THE HILL:                                                                        │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │   👑 KING: alex_cyber   │   CLAIM TIME: 04 mins 12 secs   │   REWARD: +10 pts / tick               │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────┬─────────────────────────────────────────────────────────────┤
│ 🎯 LIVE ARENA TELEMETRY                  │ 🏆 REAL-TIME SCOREBOARD (REDIS SORTED SET)                  │
├──────────────────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ NEXT SCORING TICK IN:                    │ RANK  OPERATOR       SCORE    KING HELD   STATUS               │
│ ┌────────────────────────┐               │ ────  ───────────    ─────    ─────────   ──────               │
│ │   ⏳ 00 : 18 (TICK #13) │               │ #1 👑 alex_cyber      180 pts  18 ticks    [DEFENDING ●]       │
│ └────────────────────────┘               │ #2    shadow_byte     120 pts  12 ticks    [ATTACKING]          │
│                                          │ #3    hex_phantom      80 pts   8 ticks    [ATTACKING]          │
│ TARGET INSTANCE ACCESS:                  │ #4    red_viper        40 pts   4 ticks    [IDLE]               │
│ Target Host IP: [ 10.10.42.100 ] [📋]    │ #5    null_pointer     10 pts   1 tick     [PROBING]            │
│ Target Portals: HTTP:80 │ SSH:22         │ #6    byte_hunter       0 pts   0 ticks    [PROBING]            │
│                                          ├─────────────────────────────────────────────────────────────┤
│ King Claim Syntax Reminder:              │ LIVE TICK ARBITER FEED:                                     │
│ ```bash                                  │ [20:31:00] Tick #12: SLA Checked OK. King verified: alex    │
│ echo "alex_cyber" > /root/king.txt       │ [20:31:42] Alert: SSH failed login burst from shadow_byte   │
│ ```                                      │ [20:32:00] Tick #13: Pending evaluation in 18s...          │
│                                          │                                                             │
│ [ ⚡ In-Browser AttackBox ] [ Web Term ]  │ [ ⚙️ Mute Match Audio ]           [ 🚩 Surrender / Exit ]   │
└──────────────────────────────────────────┴─────────────────────────────────────────────────────────────┘
```

* **Điểm nhấn UX/UI:**
  * **Bộ đếm Tick 60s:** Hiển thị thời gian đến lần quét token kế tiếp (`⏳ 00:18`).
  * **King Crown Banner:** Nổi bật màu vàng Amber, tôn vinh đấu thủ đang giữ quyền root.
  * **Bảng điểm xếp hạng trực tiếp:** Tự động nhảy số theo WebSocket sau mỗi tick, kèm nhãn trạng thái tác chiến (`[DEFENDING]`, `[ATTACKING]`).

---

## Wireframe 5.4: KotH SLA Service Outage Alert & Auto-Heal Daemon HUD
> **Tương ứng User Flow:** Sub-flow 1.3 (US-05.02)  
> **Topology:** Full-Width Crisis Banner with 15-Second Recovery Progress

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🚨 SLA BREACH: ESSENTIAL SERVICE DOWN (PORT 80 UNREACHABLE) // SCORING TICKS FROZEN                   │
│ The web service has failed automated health probes. No points awarded while services are down!        │
│ Auto-Heal Daemon Status: Restoring default Apache configuration... (08s / 15s) [■■■■■■■■□□□□] 60%      │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ Combat HUD remains active but scoring tick counter displays: "TICK #14: SUSPENDED (SLA_FAILED)" ]   │
│                                                                                                        │
│ SLA Probe Diagnostic Panel:                                                                            │
│ • SSH Service (Port 22):  [ 🟢 OPERATIONAL ]                                                           │
│ • HTTP Service (Port 80): [ 🔴 FAILING (Connection Refused / Firewall Blocked) ]                       │
│ • `/root/king.txt` Token: [ 🟡 RESTRICTED PERMISSION ]                                                 │
│                                                                                                        │
│ System Notice: Auto-heal daemon will purge unauthorized iptables rules and restore service in < 7s.   │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

[ KHI PHỤC HỒI THÀNH CÔNG (TỰ ĐỘNG CHUYỂN XANH) ]
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ✅ SLA RESTORED: All essential services back online. Normal 60s scoring ticks resumed!                 │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 5.5: Anti-Sabotage Disciplinary Penalty Modal
> **Tương ứng User Flow:** Sub-flow 1.4 (US-05.03)  
> **Topology:** Strict Disciplinary Violation Modal

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ 🛑 ANTI-SABOTAGE PENALTY ISSUED                                      [X] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ Target Arbiter has intercepted an intentional system sabotage action:    │
│                                                                          │
│ Detected Violation:                                                      │
│ • Attempted execution of `chattr +i /root/king.txt` (Immutable lock).    │
│ • Attempted deletion of critical system utility `/usr/bin/passwd`.       │
│                                                                          │
│ Disciplinary Measures Applied:                                           │
│ 1. Instant Score Penalty: -50 Points deducted from match score.          │
│ 2. Disciplinary Suspension: 3-Day restriction from all KotH Arenas.     │
│ 3. Automated Reversal: System files restored to original pristine state. │
│                                                                          │
│ Philosophy: Defense must be achieved via legitimate patching, iptables   │
│ policies, and process monitoring—never by breaking the operating system. │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ [ View Arena Code of Conduct ]                 [ I UNDERSTAND & ACCEPT ] │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 5.6: Jeopardy CTF Fixed Points & Time Tie-break
> **Tương ứng User Flow:** Sub-flow 2.1 (US-05.04)  
> **URL:** `/arena/[slug]`
> **Topology:** Thử thách cùng bảng điểm theo điểm và thời gian đạt điểm

```text
┌───────────────────────────────────────────────────────────────────────┐
│ TÊN GIẢI CTF · GIỜ BẮT ĐẦU / KẾT THÚC                                │
├──────────────────────────────────┬────────────────────────────────────┤
│ THỬ THÁCH                       │ BẢNG XẾP HẠNG                     │
│ SQLi Mastermind · 500 điểm       │ Hạng  Người chơi  Điểm            │
│ Mô tả và tài nguyên              │ #1    An          900             │
│ Flag [________________] [Nộp]    │       Đạt điểm lúc 14:20          │
│ Phản hồi đúng/sai/đã giải        │ #2    Bình        900             │
│                                  │       Đạt điểm lúc 14:35          │
└──────────────────────────────────┴────────────────────────────────────┘
```

Điểm thử thách không đổi khi có thêm người giải. Trong giai đoạn đóng băng, banner nêu mốc giờ chốt; bài giải cá nhân vẫn được xác nhận nhưng điểm và thời điểm trên bảng công khai giữ tại mốc đó. Tên người chơi và điểm CTF không ảnh hưởng EXP học tập.

---

## Wireframe 5.7: Late-Game Scoreboard Freeze Banner & Personal Progress View
> **Tương ứng User Flow:** Sub-flow 2.2 (US-05.04)  
> **Topology:** Glacial Cyan Freeze Bar (`#06B6D4`) with Dual Scoreboard States

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ❄️ SCOREBOARD IS FROZEN! Public rankings frozen at 16:00:00 UTC to preserve endgame suspense.          │
│ All your flag submissions during freeze hour are safely tallied and will reveal at final unfreeze!    │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ TAB: PUBLIC SCOREBOARD (FROZEN) ]             [ TAB: PERSONAL AUDIT LOG (LIVE FOR YOU) ]             │
│                                                                                                        │
│ PUBLIC SCOREBOARD AT FREEZE (16:00 UTC):        YOUR TEAM AUDIT LOG:                                   │
│ Rank  Team           Points  Last Solve         Time      Challenge          Earned  Verification      │
│ ────  ────────────   ──────  ──────────         ─────     ─────────          ──────  ────────────      │
│ #1    0xPwnSec        3,420  15:58:12           16:15:20  RSA Fault Attack   +320    [Recorded ✓]      │
│ #2    VietCyberSquad  3,280  15:42:09           16:38:10  SQLi Mastermind    +480    [Recorded ✓]      │
│ #3 👤 Team Alex       3,150  15:50:00           ─────────────────────────────────────────────────      │
│ #4    BlackHatVN      2,900  15:30:11           Official Team Points (Post-Freeze): 3,950 pts          │
│                                                 (Projected Rank: #1 or #2 pending final unfreeze!)     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 5.8: Grand Finale Unfreeze Ceremony, Top 3 Podium & Trophy Card
> **Tương ứng User Flow:** Sub-flow 2.3 (US-05.04)  
> **Topology:** Esports Victory Podium with Downloadable Verified Credential

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏆 CYBERFORCE OPEN CTF 2026 // FINAL CEREMONY PODIUM                                                   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                        │
│                                        🥇 1ST PLACE                                                    │
│                                      TEAM ALEX NGUYEN                                                  │
│                                         3,950 PTS                                                      │
│                                    ┌──────────────────┐                                                │
│                 🥈 2ND PLACE       │                  │                                                │
│                   0xPwnSec         │                  │        🥉 3RD PLACE                            │
│                  3,740 PTS         │                  │       VietCyberSquad                           │
│             ┌──────────────────┐   │                  │          3,500 PTS                             │
│             │                  │   │                  │     ┌──────────────────┐                       │
│             │                  │   │                  │     │                  │                       │
│ ────────────┴──────────────────┴───┴──────────────────┴─────┴──────────────────┴────────────────────── │
│                                                                                                        │
│ YOUR FINAL COMPETITION DOSSIER:                                                                        │
│ Team: Team Alex Nguyen (1st of 142 Teams) │ Total Solves: 12 Challenges │ First Bloods: 3 Challenges   │
│                                                                                                        │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ 🎖️ VERIFIED E-CERTIFICATE: 1ST PLACE WINNER - CYBERFORCE OPEN 2026                                 │ │
│ │ Verification ID: CF-CTF-2026-0001 │ Cryptographic Signature: RSA-4096 Signed                       │ │
│ │ [ 📥 Download Certificate (PDF) ]  [ 🔍 Public Verification Link ]  [ 🔗 Add to LinkedIn ]          │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ View Full Official Scoreboard Table ]                              [ ← Return to Platform Dashboard ]│
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Verification & Hand-off Checklist cho Epic 5

- [x] **KotH Tick & King Mechanics:** Mô hình hóa trực quan chu kỳ 60s, banner King vương miện vàng và bảng xếp hạng Redis Sorted Set.
- [x] **SLA Auto-Heal Daemon:** Cảnh báo nổi bật khi rớt port 22/80, hiển thị đếm ngược 15s tự phục hồi và đóng băng điểm an toàn.
- [x] **Anti-Sabotage Protocol:** Modal kỷ luật trừ 50 điểm và cấm đấu trường 3 ngày khi cố ý phá hoại hệ điều hành.
- [x] **Jeopardy Fixed Points:** Điểm mỗi thử thách giữ nguyên; bảng điểm có cột thời điểm đạt điểm để phá hòa.
- [x] **Endgame Freeze & Ceremony:** Thiết kế trạng thái đóng băng tuyết 60 phút cuối và bục vinh quang Top 3 Podium khi Unfreeze.
- [x] **Tài liệu lưu trữ:** Đã lưu trữ đầy đủ tại [`docs/06-user-flow/EPIC_05_WIREFRAMES_CTF_KOTH.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/06-user-flow/EPIC_05_WIREFRAMES_CTF_KOTH.md).
