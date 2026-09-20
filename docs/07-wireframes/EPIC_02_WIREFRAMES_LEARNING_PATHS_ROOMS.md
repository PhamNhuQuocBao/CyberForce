# 🖥️ EPIC 2: Wireframe Architecture & Low-Fidelity UI Specifications
## Structured Learning Paths & Interactive Rooms

* **Project:** CyberForce (CyberForge) Cloud Cyber Range
* **Reference User Flow:** [`docs/06-user-flow/EPIC_02_USER_FLOW_LEARNING_PATHS_ROOMS.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/06-user-flow/EPIC_02_USER_FLOW_LEARNING_PATHS_ROOMS.md)
* **Design Philosophy:** Tactical Cyber-HUD & Technical Split-Pane (0–2px sharp edges, high information density, strict Purple Ban)
* **Version:** 1.0.0

---

## 🎨 Design System Foundation & Workspace Layout Guidelines

| Thành phần giao diện | Quy chuẩn kỹ thuật | Mục đích trải nghiệm (UX) |
| :--- | :--- | :--- |
| **Workspace Bố cục 3 Cột** | Left: Theory MDX (35%) \| Mid: Questions & Flags (30%) \| Right: Terminal & GUI (35%) | Toàn bộ học tập, gõ lệnh và nộp bài trong 1 màn hình duy nhất, không phải chuyển tab trình duyệt. |
| **Bán kính Bo góc (Radius)** | `0px` – `2px` (Sắc nhọn, dứt khoát) | Mang lại phong cách bảng điều khiển tác chiến mạng quân sự, chống cảm giác "SaaS chung chung". |
| **Trạng thái Hoàn thành** | `#10B981` (Cyber Emerald) | Phản hồi tức thì khi nộp cờ đúng, dấu tick xanh và thanh tiến độ nhảy số. |
| **Cảnh báo & Khóa tạm thời** | `#F59E0B` (Amber Alert) / `#EF4444` (Crimson Lock) | Dùng cho đồng hồ đếm ngược 3 phút nộp sai, cảnh báo trừ điểm khi mở gợi ý / walkthrough. |
| **Bảo toàn Dữ liệu** | Toast / Banner màu vàng đất `#B45309` | Giữ nguyên 100% nội dung đang nhập khi rớt mạng đột ngột. |

---

## 📐 Wireframe Index (8 Màn hình Trọng yếu)

1. [Wireframe 2.1: Learning Paths Catalog & Career Tracks](#wireframe-21-learning-paths-catalog--career-tracks)
2. [Wireframe 2.2: Learning Path Overview & Prerequisite Room Lock Modal](#wireframe-22-learning-path-overview--prerequisite-room-lock-modal)
3. [Wireframe 2.3: Path Content Update & Recalibrated Progress Banner](#wireframe-23-path-content-update--recalibrated-progress-banner)
4. [Wireframe 2.4: All-in-One Interactive Room Workspace (Default 3-Pane HUD)](#wireframe-24-all-in-one-interactive-room-workspace)
5. [Wireframe 2.5: Network Interruption & Offline Answer Preservation Banner](#wireframe-25-network-interruption--offline-answer-preservation-banner)
6. [Wireframe 2.6: Real-time Flag Submission, EXP Reward & Room Celebration Modal](#wireframe-26-real-time-flag-submission-exp-reward--room-celebration-modal)
7. [Wireframe 2.7: Brute-force Mitigation & 3-Minute Question Lockout HUD](#wireframe-27-brute-force-mitigation--3-minute-question-lockout-hud)
8. [Wireframe 2.8: Tiered Hint & Full Walkthrough Trade-off Modals](#wireframe-28-tiered-hint--full-walkthrough-trade-off-modals)

---

## Wireframe 2.1: Learning Paths Catalog & Career Tracks
> **Tương ứng User Flow:** Sub-flow 1.1 (US-02.01)  
> **URL:** `/paths`  
> **Topology:** Career Roadmaps Grid with Progress Telemetry

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]  Paths [ACTIVE]   Rooms   CTF Arena   Certifications       [Search paths/skills...]  [AVT Alex] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CAREER ROADMAPS // STRUCTURED LEARNING PATHS                                   FILTER: [All] [Offense] │
│ Master real-world cyber roles through verified hands-on progression tracks.           [Defense] [Cloud]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────┐  ┌──────────────────────────────────────────────┐     │
│ │ [ICON: SHIELD] OFFENSIVE WEB ASSOCIATE       │  │ [ICON: RADAR] SOC ANALYST LEVEL 1            │     │
│ │ Track: Red Team Web Exploitation             │  │ Track: Incident Response & Threat Hunting    │     │
│ │ Level: Beginner to Intermediate              │  │ Level: Beginner                              │     │
│ │ Modules: 6 Modules │ 28 Interactive Rooms    │  │ Modules: 5 Modules │ 22 Interactive Rooms    │     │
│ │                                              │  │                                              │     │
│ │ PROGRESS: [■■■■■■■■■■■■■■■□□□□□] 75%         │  │ PROGRESS: [□□□□□□□□□□□□□□□□□□□□] 0%          │     │
│ │ Status: In Progress (21/28 Rooms Cleared)    │  │ Status: Not Started                          │     │
│ │ Next Up: Room 22 - Advanced SQL Injection    │  │ Estimated Time: 32 Hours                     │     │
│ │                                              │  │                                              │     │
│ │ [ > RESUME LEARNING TRACK ]                  │  │ [ ENROLL & START PATH ]                      │     │
│ └──────────────────────────────────────────────┘  └──────────────────────────────────────────────┘     │
│ ┌──────────────────────────────────────────────┐  ┌──────────────────────────────────────────────┐     │
│ │ [ICON: CLOUD] CLOUD DEFENSE & DEVSECOPS      │  │ [ICON: TERMINAL] JUNIOR PENETRATION TESTER   │     │
│ │ Track: AWS Security, Containers & CI/CD      │  │ Track: Network & Active Directory Pentest    │     │
│ │ Level: Advanced                              │  │ Level: Intermediate                          │     │
│ │ Modules: 8 Modules │ 34 Rooms                │  │ Modules: 7 Modules │ 30 Rooms                │     │
│ │ PROGRESS: [■■■■■■■■■■■■■■■■■■■■] 100%        │  │ PROGRESS: [■■■■■■□□□□□□□□□□□□□□] 30%         │     │
│ │ Status: Mastered [🎖️ Capstone Cert Issued]  │  │ Next Up: Room 10 - Kerberos Roasting         │     │
│ │                                              │  │                                              │     │
│ │ [ VIEW CERTIFICATE ]  [ REVIEW ROOMS ]       │  │ [ > RESUME LEARNING TRACK ]                  │     │
│ └──────────────────────────────────────────────┘  └──────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 2.2: Learning Path Overview & Prerequisite Room Lock Modal
> **Tương ứng User Flow:** Sub-flow 1.1 (US-02.01)  
> **URL:** `/paths/offensive-web-associate`  
> **Topology:** Vertical Modular Path with Visual Prerequisite Gates

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [← Back to Catalog]  PATH: OFFENSIVE WEB ASSOCIATE                      TOTAL TRACK EXP: +4,200 EXP    │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ OVERALL PROGRESS: [■■■■■■■■■■■■■■■□□□□□] 75% (21/28 Rooms Completed)              [CAPSTONE: LOCKED 🔒]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                        │
│ ▼ MODULE 4: ADVANCED DATABASE EXPLOITATION                                               [3/4 Rooms]  │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ [✓] Room 20: SQL Injection Fundamentals           │ 4 Tasks │ 150 EXP │ COMPLETED 100%             │ │
│ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │ [✓] Room 21: Blind & Time-Based SQLi              │ 5 Tasks │ 200 EXP │ COMPLETED 100%             │ │
│ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │ [●] Room 22: Second-Order SQLi & WAF Bypassing     │ 6 Tasks │ 250 EXP │ [ IN PROGRESS - RESUME ]   │ │
│ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │ [🔒] Room 23: Out-of-Band (OAST) Exfiltration      │ 4 Tasks │ 250 EXP │ PREREQUISITE LOCKED        │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                        │
│ ▶ MODULE 5: INSECURE DESERIALIZATION & SSRF [LOCKED 🔒]                                  [0/5 Rooms]  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

[ MODAL KHI HỌC VIÊN CLICK VÀO ROOM 23 ĐANG BỊ KHÓA ]
┌──────────────────────────────────────────────────────────────────────────┐
│ 🔒 PREREQUISITE CONTENT RESTRICTED                                   [X] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ Room 23: "Out-of-Band (OAST) Exfiltration" requires completion of all    │
│ prerequisite foundational tasks to ensure a solid learning progression.  │
│                                                                          │
│ Missing Prerequisite Room:                                               │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ [●] Room 22: Second-Order SQLi & WAF Bypassing                       │ │
│ │ Current Status: 3/6 Tasks Completed (50%)                            │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ [ Close / Stay on Path ]          [ JUMP TO ROOM 22 & FINISH TASKS → ]   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 2.3: Path Content Update & Recalibrated Progress Banner
> **Tương ứng User Flow:** Sub-flow 1.2 (US-02.01)  
> **Topology:** Status Banner informing students of newly added rooms in a mastered track

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 📢 CONTENT UPDATE DETECTED: 2 new advanced rooms have been added to this curriculum!                  │
│ Your progress has been recalibrated to 85%. Complete the new rooms to restore 100% Mastered status.   │
│ [ 🚀 Jump to First New Room ]                                                    [ Remind Me Later ]   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ PATH: CLOUD DEFENSE & DEVSECOPS                                            RECALIBRATED: 85% (32/34)   │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ [✓] Room 32: Kubernetes Network Policies         │ 4 Tasks │ Completed                            │ │
│ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │ [NEW ★] Room 33: AWS EKS Pod Identity Escapes    │ 5 Tasks │ 300 EXP │ [ START NEW ROOM ]         │ │
│ ├────────────────────────────────────────────────────────────────────────────────────────────────────┤ │
│ │ [NEW ★] Room 34: Supply Chain CI/CD Tampering    │ 4 Tasks │ 250 EXP │ [ START NEW ROOM ]         │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 2.4: All-in-One Interactive Room Workspace
> **Tương ứng User Flow:** Sub-flow 2.1 (US-02.02)  
> **URL:** `/room/sqli-second-order`  
> **Topology:** Tri-Pane Responsive Workspace (Split-Pane 35% Theory / 35% Tasks / 30% Sandbox)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [← Exit Room]  Room 22: Second-Order SQLi & Bypasses │ Progress: [■■■□□□] 3/6 Tasks │ EXP: 14,850 pts │
├─────────────────────────────────────────┬─────────────────────────────┬────────────────────────────────┤
│ 📖 THEORY & LAB GUIDE (35%)             │ 🎯 TASKS & QUESTIONS (35%)  │ 🖥️ TARGET & TERMINAL (30%)     │
├─────────────────────────────────────────┼─────────────────────────────┼────────────────────────────────┤
│ Task 4: Exploiting Second-Order SQLi    │ TASK 4 QUESTIONS:           │ TARGET MACHINE CONTROLS        │
│                                         │                             │ Status: RUNNING ●              │
│ # Understanding Second-Order Vulnerable │ Question 1 [100 EXP]        │ Target IP: 10.10.42.18         │
│ Data Flow:                              │ Locate the administrative   │ Time Left: 54:20 [ +1 Hour ]   │
│                                         │ credentials stored in the   │ [ 🔄 Restart ] [ 🛑 Terminate ]│
│ 1. Malicious input is stored safely     │ backend database.           │ ────────────────────────────── │
│    inside DB without immediate syntax   │                             │ EMBEDDED WEB TERMINAL (xterm)  │
│    error.                               │ Answer:                     │ ┌────────────────────────────┐ │
│ 2. The second application query reads   │ ┌─────────────────────────┐ │ │$ ping -c 2 10.10.42.18     │ │
│    this data and concatenates it into   │ │ CF{sqli_2nd_0x992a}     │ │ │PING 10.10.42.18: 56 bytes  │ │
│    an unsafe secondary query.           │ └─────────────────────────┘ │ │64 bytes: icmp_seq=1 ttl=64 │ │
│                                         │ [ SUBMIT ANSWER ]           │ │$ curl -s http://10.10.42.18│ │
│ ```sql                                  │                             │ │<title>Vulnerable App</title│ │
│ -- Secondary Query Example:             │ Need assistance?            │ │$ sqlmap -u "http://..."    │ │
│ SELECT * FROM logs WHERE user = '$user' │ [💡 Hint 1 (-10%)] [Hint 2] │ │                            │ │
│ ```                                     │                             │ └────────────────────────────┘ │
│                                         │ ─────────────────────────── │ [ ] View In-Browser Kali Box   │
│ [ Collapse Guide ]   [ Reset Layout ]   │ Question 2 [100 EXP]        │ (Opens Guacamole Canvas)       │
│                                         │ What is the admin password? │                                │
│                                         │ [_________________] [Submit]│ [ Clipboard Sync: Active ]     │
└─────────────────────────────────────────┴─────────────────────────────┴────────────────────────────────┘
```

* **Điểm nhấn UX/UI:**
  * **Toàn năng trong 1 cửa sổ:** Học viên vừa đọc lý thuyết bên trái, gõ lệnh terminal bên phải và nộp cờ ở giữa.
  * **Điều khiển Sandbox tức thì:** Hiển thị IP mục tiêu, đồng hồ đếm ngược thuê máy, nút gia hạn `[+1 Hour]` và nút hủy máy `[Terminate]`.
  * **Thanh phân chia linh hoạt (Draggable Dividers):** Cho phép kéo co giãn độ rộng giữa 3 khung tùy nhu cầu học tập.

---

## Wireframe 2.5: Network Interruption & Offline Answer Preservation Banner
> **Tương ứng User Flow:** Sub-flow 2.2 (US-02.02)  
> **Topology:** Top Persistent Alert Bar with Draft Lock Mechanism

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ INTERNET CONNECTION LOST: Offline mode activated. Your answers and terminal history are preserved. │
│ Submissions will automatically sync as soon as connectivity is restored.               [ Retrying... ] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ Standard Room Workspace remains fully interactive with inputs locked against accidental resets ]      │
│                                                                                                        │
│ Input State during Offline:                                                                            │
│ Answer: ┌──────────────────────────────────────────────────┐                                           │
│         │ CF{sqli_2nd_0x992a}                              │ (Draft safely cached in browser memory)   │
│         └──────────────────────────────────────────────────┘                                           │
│         [ ⏳ WAITING FOR CONNECTION... ] (Button disabled, prevents form clearing)                      │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

[ KHI PHỤC HỒI MẠNG THÀNH CÔNG (TỰ ĐỘNG BIẾN MẤT SAU 3 GIÂY) ]
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ✅ CONNECTION RESTORED: All local buffers synced with platform. You may now submit your answers!       │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 2.6: Real-time Flag Submission, EXP Reward & Room Celebration Modal
> **Tương ứng User Flow:** Sub-flow 3.1 (US-02.03)  
> **Topology:** Question Card State Morphing & End-of-Room Achievement Modal

### Trạng thái Câu hỏi sau khi Nộp đúng:
```text
┌────────────────────────────────────────────────────────────────────────┐
│ Question 1: Locate administrative credentials in DB. [ 100 EXP ]       │
│                                                                        │
│ Answer:                                                                │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ CF{sqli_2nd_0x992a}                                            [✓] │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ✅ CORRECT ANSWER! +100 EXP AWARDED                           [SOLVED] │
│ (Input locked. View solution walkthrough for this question: [Free Review])
└────────────────────────────────────────────────────────────────────────┘
```

### Modal Chúc mừng khi Hoàn thành 100% Phòng học:
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ 🏆 ROOM CONQUERED: SECOND-ORDER SQL INJECTION                        [X] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                       🎉 OUTSTANDING WORK, ALEX!                        │
│                                                                          │
│        You have successfully solved all 6 tasks in this room.            │
│                                                                          │
│       ┌──────────────────────────────────────────────────────────┐       │
│       │ Total EXP Earned:    +550 EXP                            │       │
│       │ Daily Streak:        🔥 19 Days (Streak Extended!)       │       │
│       │ Radar Growth:        +Web Exploit (+60), +Cloud (+20)    │       │
│       └──────────────────────────────────────────────────────────┘       │
│                                                                          │
│       Next Recommended Step in Path:                                     │
│       Room 23: "Out-of-Band (OAST) Exfiltration" is now UNLOCKED!        │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ [ Review Current Lab ]                  [ CONTINUE TO NEXT ROOM → ]      │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 2.7: Brute-force Mitigation & 3-Minute Question Lockout HUD
> **Tương ứng User Flow:** Sub-flow 3.2 (US-02.03)  
> **Topology:** In-card Rate Limit Shield with Countdown Timer

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Question 2: Crack the password hash for user 'db_admin'. [ 100 EXP ]   │
│                                                                        │
│ [State: Failed 1 to 4 attempts]                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ wrong_flag_attempt_3                                               │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ ❌ INCORRECT ANSWER: 2 submission attempts remaining before lockout.  │
│ [ SUBMIT ANSWER ]                               [ 💡 Open Hint 1 ]     │
│                                                                        │
│ ────────────────────────────────────────────────────────────────────── │
│ [State: 5th Consecutive Failed Submission - Locked Out for 3 Minutes]  │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ 🔒 SUBMISSIONS TEMPORARILY LOCKED                                  │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│ 🛑 Too many incorrect attempts detected. Submissions for this question │
│    are quarantined for 3 minutes to prevent brute-forcing.            │
│                                                                        │
│                      TIME REMAINING UNTIL UNLOCK:                      │
│                                [ 02:44 ]                               │
│                                                                        │
│ Need a hint instead of guessing?                                       │
│ [ 💡 Open Progressive Hint ]    [ Continue solving other questions ↓ ] │
└────────────────────────────────────────────────────────────────────────┘
```
* **No Dead End:** Dù câu hỏi 2 bị tạm khóa 3 phút, học viên vẫn có thể mở Hint hoặc cuộn xuống làm câu hỏi 3 và 4 bình thường, không làm nghẽn tiến độ buổi học.

---

## Wireframe 2.8: Tiered Hint & Full Walkthrough Trade-off Modals
> **Tương ứng User Flow:** Sub-flow 4.1 & 4.2 (US-02.04)  
> **Topology:** Transparent Score Deduction Confirmation Dialogs

### Modal A: Mở Gợi ý Bậc thang (Trừ 10% - 20% EXP)
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ 💡 UNLOCK PROGRESSIVE HINT 1                                         [X] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ Unlocking Hint 1 will deduct 10% of the maximum score for this question. │
│                                                                          │
│ - Question Base Reward:    100 EXP                                       │
│ - Deduction Penalty:       -10 EXP                                       │
│ - Maximum Score Attainable: 90 EXP                                       │
│                                                                          │
│ Are you sure you want to reveal this hint?                               │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ [ Cancel - Keep Thinking ]                      [ REVEAL HINT 1 (-10%) ] │
└──────────────────────────────────────────────────────────────────────────┘
```

### Modal B: Xem Lời giải Chi tiết khi Chưa giải (Đánh đổi 0 EXP)
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ⚠️ VIEW WALKTHROUGH CONFIRMATION                                     [X] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ You have NOT solved Question 2 yet.                                      │
│                                                                          │
│ Viewing the official step-by-step walkthrough before submitting a valid │
│ flag will permanently forfeit all EXP reward for this question (0 EXP).  │
│                                                                          │
│ This action CANNOT be undone.                                            │
│                                                                          │
│ Recommendations:                                                         │
│ • Try opening Hint 1 or Hint 2 first (-10% / -20% only).                 │
│ • Inspect the database logs in the Web Terminal.                         │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ [ Cancel - I Want to Solve It Myself ]        [ ACCEPT 0 EXP & VIEW ]    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Verification & Hand-off Checklist cho Epic 2

- [x] **Split-Pane Ergonomics:** Khung làm việc 3 cột được tối ưu hóa cho màn hình từ 1366px trở lên, có hỗ trợ kéo co giãn và lưu cấu hình layout.
- [x] **Trực quan hóa điều kiện tiên quyết:** Thể hiện rõ ràng biểu tượng khóa `[🔒]` và popup điều hướng trực tiếp sang phòng cần học trước.
- [x] **Đồng hồ đếm ngược tại chỗ:** Ô nộp cờ bị khóa có đồng hồ đếm lùi `03:00` tại chỗ, tự động mở khóa mà không bắt người dùng F5 tải lại trang.
- [x] **Minh bạch điểm số:** Mọi thao tác mở gợi ý đều có dialog xác nhận hiển thị rõ công thức trừ điểm (`Max: 90 EXP`).
- [x] **Toàn bộ thông số thiết kế khớp 100% với:** [`docs/06-user-flow/EPIC_02_USER_FLOW_LEARNING_PATHS_ROOMS.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/06-user-flow/EPIC_02_USER_FLOW_LEARNING_PATHS_ROOMS.md).
