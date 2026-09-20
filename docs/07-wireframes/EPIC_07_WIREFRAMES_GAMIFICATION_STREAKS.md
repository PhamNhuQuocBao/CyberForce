# 🖥️ EPIC 7: Wireframe Architecture & Low-Fidelity UI Specifications
## Gamification, Daily Streaks & 8-Axis Cyber Skill Radar

* **Project:** CyberForce (CyberForge) Cloud Cyber Range
* **Reference User Flow:** [`docs/06-user-flow/EPIC_07_USER_FLOW_GAMIFICATION_STREAKS.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/06-user-flow/EPIC_07_USER_FLOW_GAMIFICATION_STREAKS.md)
* **Reference Epic Spec:** [`docs/05-epics/EPIC_07_GAMIFICATION_STREAKS_SKILL_RADAR.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/05-epics/EPIC_07_GAMIFICATION_STREAKS_SKILL_RADAR.md)
* **Design Philosophy:** Tactical Cyber-HUD, High Information Density, Habit Motivation & Skill Transparency
* **Color Tokens & Aesthetic Rules:**
  - `Background`: Obsidian Void (`#070A0F`), Slate Surface (`#0D121D`, `#131B2B`)
  - `Primary Accent`: Cyber Emerald (`#10B981`) - Progress, Streak Flame & Success
  - `Secondary Accent`: Electric Cyan (`#00F0FF`) - Tech details, Radar polygon, Active multipliers
  - `Warning / Multiplier`: Solar Amber (`#F59E0B`) - Streak warnings, countdowns, 1.2x/1.5x active buffs
  - `Hazard / Danger`: Crimson Alert (`#EF4444`) - Streak breakage risk, point deductions
  - `Border Radius`: `0px` - `2px` (Strictly sharp tactical edges)
  - `Typography`: `JetBrains Mono` / `Inter` (High legibility, tabular numerals)
  - `Strict PURPLE BAN`: ZERO purple/violet hues anywhere.
* **Version:** 1.0.0

---

## 🎨 Design System Foundation & Gamification Tokens

| Thành phần / Token | Quy chuẩn hiển thị | Ý nghĩa kỹ thuật & Trải nghiệm (UX) |
| :--- | :--- | :--- |
| **Streak Flame Active** | `#10B981` (Cyber Emerald) + Biểu tượng Lửa bốc cháy | Đã giải ít nhất 01 bài tập mới lần đầu trong ngày trước 23:59 theo Local Timezone. |
| **Streak Warning State** | `#F59E0B` (Solar Amber) / `#EF4444` (Crimson) + Đếm lùi | Cảnh báo chưa giải bài mới nào trong ngày; đếm lùi thời gian đến nửa đêm 23:59:59. |
| **EXP Multiplier Buff** | Khung viền Neon Cyan `#00F0FF` / Amber `#F59E0B` (`1.2x` / `1.5x`) | Đang kích hoạt hiệu ứng nhân điểm EXP khi đạt cột mốc 7 ngày (24h) hoặc 30 ngày (48h). |
| **8-Axis Skill Polygon** | Đa giác 8 đỉnh viền `#00F0FF`, diện tích đổ bóng `#00F0FF15` | Trực quan hóa năng lực tích lũy tuyệt đối (Cumulative EXP); tự động co giãn theo điểm số. |
| **Rank Invariant Badge** | Huy hiệu cấp bậc kim loại dập nổi viền Emerald/Cyan | Cấp bậc chỉ thăng tiến, không bao giờ bị giáng cấp (Rank Invariant Guarantee) dù bị trừ điểm. |
| **No Dead End Escape** | Luôn có tối thiểu 2 nút điều hướng hành động | Không bao giờ bế tắc; luôn gợi ý bài tập mới, nút quay về dashboard, hoặc tiếp tục ôn tập. |

---

## 📐 Wireframe Index (8 Màn hình & Trạng thái Trọng yếu)

1. [Wireframe 7.1: Navbar Gamification HUD & Daily Streak Popover Drawer](#wireframe-71-navbar-gamification-hud--daily-streak-popover-drawer)
2. [Wireframe 7.2: Daily Streak Milestone Unlocks (7-Day 1.2x & 30-Day 1.5x Multiplier Modals)](#wireframe-72-daily-streak-milestone-unlocks)
3. [Wireframe 7.3: Review Mode Feedback & Streak Expiry Warning Modal (No Dead End)](#wireframe-73-review-mode-feedback--streak-expiry-warning-modal)
4. [Wireframe 7.4: Interactive 8-Axis Cyber Skill Radar (Profile & Dashboard View)](#wireframe-74-interactive-8-axis-cyber-skill-radar)
5. [Wireframe 7.5: Multi-Tag Parallel Scoring Live Expansion Screen](#wireframe-75-multi-tag-parallel-scoring-live-expansion-screen)
6. [Wireframe 7.6: Rank Tier Progression Ladder & Fullscreen Rank-Up Celebration Modal](#wireframe-76-rank-tier-progression-ladder--fullscreen-rank-up-modal)
7. [Wireframe 7.7: Hint Deduction Confirmation & Permanent Rank Protection Guarantee Modal](#wireframe-77-hint-deduction-confirmation--rank-protection-modal)
8. [Wireframe 7.8: Achievement Showcase & Trophy Cabinet (Badges & Milestones)](#wireframe-78-achievement-showcase--trophy-cabinet)

---

## Wireframe 7.1: Navbar Gamification HUD & Daily Streak Popover Drawer
> **Tương ứng User Flow:** Sub-flow 1.1 (US-07.01)  
> **URL:** Tất cả trang thuộc nền tảng (`/dashboard`, `/rooms/*`, `/profile/*`)  
> **Vị trí:** Header Navigation Bar (Top Right) & Dropdown Flyout Drawer  

### Giao diện Navbar Gamification Bar
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [CYBERFORCE]   Labs   Paths   KotH Arena   Compete   Certifications │ [🔍 Search]   [🔥 6 Days] [⚡ 1.2x] [🛡️ Hacker] [@user]│
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                                               ▲
                                                                  [Click or Hover Streak]
```

### Chi tiết Dropdown Popover Drawer: Daily Streak Monitor & Activity Heatmap
```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🔥 DAILY STREAK MONITOR // LOCAL TIMEZONE                                   [X] │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Current Streak: 6 CONSECUTIVE DAYS               Best Record: 14 Days           │
│ Local Timezone: Asia/Ho_Chi_Minh (GMT+7)         Daily Reset: 23:59:59 (04h 12m)│
├─────────────────────────────────────────────────────────────────────────────────┤
│ WEEKLY ACTIVITY TRACKER (FIRST-TIME TASK SOLVES ONLY):                          │
│                                                                                 │
│   Mon      Tue      Wed      Thu      Fri      Sat      Sun (Today)             │
│  [ ✅ ]   [ ✅ ]   [ ✅ ]   [ ✅ ]   [ ✅ ]   [ ✅ ]   [ ⏳ ]                   │
│  12/09    13/09    14/09    15/09    16/09    17/09    18/09                    │
│  Solved   Solved   Solved   Solved   Solved   Solved   Pending Solve            │
│                                                                                 │
│ ⚠️ TODAY'S STATUS: PENDING SOLVE                                                │
│ You haven't solved a brand-new task today! Solve at least 1 new task before     │
│ 23:59:59 (in 04h 12m) to extend your streak to 7 Days and unlock 1.2x EXP!      │
├─────────────────────────────────────────────────────────────────────────────────┤
│ UPCOMING REWARD MILESTONE:                                                      │
│ 🛡️ 7-Day Warrior Badge + 1.2x EXP Multiplier (Next solve unlocks this!)        │
│ [■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■□□□□□□] 6 / 7 Days (85%)                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐  ┌───────────────────────────────────┐ │
│ │ [ ⚡ Find Quick Task to Keep Streak ] │  │ [ 📖 View Streaks FAQ & Rules ]   │ │
│ └──────────────────────────────────────┘  └───────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Các trạng thái linh hoạt (Dynamic States):
* **State 1: Chưa giải bài mới trong ngày (Pending)**: Biểu tượng ngọn lửa màu Amber nhấp nháy chậm; đồng hồ đếm lùi thời gian đến `23:59:59` theo múi giờ cá nhân.
* **State 2: Đã giải bài mới trong ngày (Secured)**: Biểu tượng ngọn lửa màu Emerald bốc cháy mạnh; hiển thị nhãn: `✅ Streak Secured for Today (7 Days)`.
* **State 3: Đang có hiệu ứng nhân điểm (Buff Active)**: Tag `[⚡ 1.2x EXP Active: 18h 42m remaining]` phát sáng Cyan.

---

## Wireframe 7.2: Daily Streak Milestone Unlocks
### (7-Day 1.2x & 30-Day 1.5x Multiplier Modals)
> **Tương ứng User Flow:** Sub-flow 1.1 (US-07.01)  
> **Topology:** Modal Vinh danh Cột mốc & Kích hoạt Buff Hệ số nhân điểm  

### State A: Đạt mốc 7 Ngày (Mở khóa Huy hiệu & 1.2x EXP trong 24h)
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ 🎉 STREAK MILESTONE UNLOCKED: 7 CONSECUTIVE DAYS!                    [X] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                             ╔═════════════════╗                          │
│                             ║    🛡️ 🔥 🛡️    ║                          │
│                             ║  7-DAY WARRIOR  ║                          │
│                             ╚═════════════════╝                          │
│                                                                          │
│   CONGRATULATIONS, OPERATOR! YOUR DISCIPLINE FORGES ELITE CAPABILITY.    │
│                                                                          │
│ You have solved at least one new practical security challenge every day   │
│ for 7 straight days in Asia/Ho_Chi_Minh timezone.                        │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ 🎁 REWARDS ACTIVATED IMMEDIATELY:                                        │
│ • Badge Unlocked: "7-Day Warrior" (Permanently pinned to Profile)        │
│ • Multiplier Buff: 1.2x EXP Multiplier on all solved tasks & labs        │
│ • Duration: Active for exactly 24 Hours (Expires: 19/09 22:30 GMT+7)     │
├──────────────────────────────────────────────────────────────────────────┤
│ Next Target: 30-Day "Cyber Habit Master" (Unlocks 1.5x EXP for 48 Hours) │
│ Progress: [■■■■■■■□□□□□□□□□□□□□□□□□□□□□□□] 7 / 30 Days (23%)             │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐  ┌────────────────────────────┐ │
│ │ [ 🚀 Capitalize Buff: Solve Next Lab]│  │ [ 🔗 Share Achievement ]    │ │
│ └──────────────────────────────────────┘  └────────────────────────────┘ │
│                [ Dismiss & Continue Current Session ]                    │
└──────────────────────────────────────────────────────────────────────────┘
```

### State B: Đạt mốc 30 Ngày (Mở khóa Huy hiệu Huyền thoại & 1.5x EXP trong 48h)
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ 👑 LEGENDARY MILESTONE: 30 DAYS UNBROKEN HABIT!                      [X] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│                             ╔═════════════════╗                          │
│                             ║    👑 🔥 👑    ║                          │
│                             ║  HABIT MASTER   ║                          │
│                             ╚═════════════════╝                          │
│                                                                          │
│            AN UNBROKEN MONTH OF CONTINUOUS DEFENSE & OFFENSE!            │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ 🎁 PRESTIGE REWARDS ACTIVATED:                                           │
│ • Legendary Badge: "Cyber Habit Master"                                  │
│ • Cyber-Armor Avatar Frame: Neon Emerald Obsidian Shroud                │
│ • Multiplier Buff: 1.5x EXP Multiplier Active for 48 Hours!             │
│ • Buffer Immunity Shield: 1x Streak Freeze auto-granted to inventory     │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐  ┌────────────────────────────┐ │
│ │ [ 🚀 Dive Into High-EXP Challenges ] │  │ [ 📸 Generate Trophy Card] │ │
│ └──────────────────────────────────────┘  └────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 7.3: Review Mode Feedback & Streak Expiry Warning Modal
> **Tương ứng User Flow:** Sub-flow 1.2 (US-07.01)  
> **Topology:** Phân biệt Ôn tập vs Giải mới & Hướng dẫn cứu vãn Streak (Strict No Dead End)  

### State A: Hoàn thành nộp lại Flag của một bài cũ (Review Mode)
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ 📖 TASK REVIEW COMPLETED // KNOWLEDGE REFRESH                        [X] │
├──────────────────────────────────────────────────────────────────────────┤
│ Room: SQL Injection Fundamentals // Task 3: Union-Based Data Extraction  │
│ Flag: `CYBERFORCE{sqli_union_mastery_cleared}` [✅ VERIFIED CORRECT]     │
├──────────────────────────────────────────────────────────────────────────┤
│ REWARD BREAKDOWN:                                                        │
│ • Review Practice Bonus: +15 EXP (Recorded to Total Cumulative Score)    │
│                                                                          │
│ ℹ️ STREAK ACCREDITATION NOTICE:                                           │
│ This task was previously completed on 04/09/2026. In accordance with     │
│ platform rigor, solving repeated tasks awards Review EXP but DOES NOT    │
│ count towards advancing your Daily Streak.                               │
├──────────────────────────────────────────────────────────────────────────┤
│ 🔥 CURRENT STREAK STATUS: 5 DAYS (AT RISK OF RESET AT 23:59:59)          │
│ Countdown remaining today: 03 Hours 18 Minutes (GMT+7)                   │
│ To protect your 5-day streak, solve any brand-new task before midnight!  │
├──────────────────────────────────────────────────────────────────────────┤
│ 🎯 RECOMMENDED QUICK NEW TASKS TO SAVE YOUR STREAK:                      │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ 1. [Web] JWT None-Algorithm Bypass (Est: 8 min)       [ Solve Now →] │ │
│ │ 2. [Network] Analyzing PCAP FTP Plaintext (Est: 6 min)[ Solve Now →] │ │
│ │ 3. [Linux] SUID Privilege Check (Est: 5 min)          [ Solve Now →] │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐  ┌────────────────────────────┐ │
│ │ [ ⚡ Launch Quickest Task (#3) ]      │  │ [ Return to Learning Path] │ │
│ └──────────────────────────────────────┘  └────────────────────────────┘ │
│                  [ Dismiss Alert (I Will Solve Later) ]                  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 7.4: Interactive 8-Axis Cyber Skill Radar
### (Profile & Dashboard View)
> **Tương ứng User Flow:** Sub-flow 2.1 (US-07.02)  
> **URL:** `/profile/[username]` & `/dashboard`  
> **Topology:** Absolute Cumulative EXP Spider Radar Visualizer  

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🌐 CYBER DEFENSE COMPETENCY RADAR // 8 SPECIALIZATION AXES                                             │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Total Cumulative EXP: 18,450 EXP │ Platform Rank: #142 (Top 3%) │ Active Multiplier: None              │
├────────────────────────────────────────────────────────────────────┬───────────────────────────────────┤
│                       [1] Web Security                             │ AXIS DRILLDOWN INSPECTOR:         │
│                           (3,800)                                  │ Selected Axis:                    │
│                              ▲                                     │ [6] Windows & Active Directory    │
│                              │                                     │                                   │
│       [8] Cloud & DevSec     │       [2] Network Pentest           │ Current Score: 2,950 EXP          │
│           (1,650)   \        │        /    (2,400)                 │ Competency Level: Proficient (Lvl 4)
│                      \       │       /                             │ Global Percentile: Top 6.4%       │
│                       \      │      /                              │ Completed Tasks: 24 Labs Cleared  │
│                        \  ┌──┴──┐  /                               │ Capstone Exam Cleared: Yes (CF-AD)│
│                         \ │ 80% │ /                                │                                   │
│   [7] Blue Team / SOC ───┼┼─────┼┼─── [3] Binary Exploit / Pwn     │ Recent Solves on this Axis:       │
│         (1,200)         / │ 40% │ \         (850)                  │ • Kerberoasting & SPN Extract     │
│                        /  └──┬──┘  \                               │ • BloodHound Pathing Analysis     │
│                       /      │      \                              │ • DCSync Mimikatz Replication     │
│                      /       │       \                             │                                   │
│        [6] Windows & AD      │       [4] Cryptography & PKI        │ 💡 RECOMMENDATION FOR GROWTH:     │
│            (2,950)           ▼           (1,400)                   │ Your Binary Exploitation score is │
│                       [5] DFIR / Incident                          │ low (850 EXP). Balance radar by   │
│                            (4,200)                                 │ solving Buffer Overflow Basics!   │
│                                                                    │                                   │
│ [ 🔘 Cumulative EXP Mode ]  [ ○ Relative Percentile Mode ]         │ ┌───────────────────────────────┐ │
│ [ 🔘 Show Global Top 10% Overlay ]                                 │ │ [ 🎯 Train Windows & AD Path ]│ │
│                                                                    │ └───────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┴───────────────────────────────────┘
```

### Chi tiết Tooltip khi Hover vào từng cánh biểu đồ:
```text
┌──────────────────────────────────────────────────┐
│ 🔍 AXIS METRICS: [1] Web Application Security    │
├──────────────────────────────────────────────────┤
│ Total EXP: 3,800 EXP (20.6% of overall profile)  │
│ Rank Tier: Elite Web Specialist                  │
│ Solved Rooms: 32 Rooms (14 Easy, 12 Med, 6 Hard) │
│ Strengths: SQLi, SSTI, Broken Access Control     │
│ Opportunities: GraphQL Injections, Deserialization│
├──────────────────────────────────────────────────┤
│ [ ⚡ Filter Catalog for Web Security Rooms → ]    │
└──────────────────────────────────────────────────┘
```

---

## Wireframe 7.5: Multi-Tag Parallel Scoring Live Expansion Screen
> **Tương ứng User Flow:** Sub-flow 2.2 (US-07.02)  
> **Topology:** Task Solve Celebration Modal with Dynamic Dual-Axis Polygon Expansion  

### State A: Giải thành công Task đa kỹ năng (Cloud & DevSecOps + Network Pentest)
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ 🎯 TASK CLEARED: KUBERNETES API EXPLOITATION & PIVOT                 [X] │
├──────────────────────────────────────────────────────────────────────────┤
│ Flag Submitted: `CYBERFORCE{k8s_service_account_token_hijack}`           │
│ Result: [ ✅ CORRECT FLAG - FIRST BLOOD BONUS ELIGIBLE ]                  │
├──────────────────────────────────────────────────────────────────────────┤
│ 💠 MULTI-TAG PARALLEL EXP ALLOCATION:                                    │
│ Base Task Value: +150 EXP                                                │
│ Associated Skill Tags (2):                                               │
│   • Tag 1: [Cloud & DevSecOps]           ───► +150 EXP added to Axis [8] │
│   • Tag 2: [Network Penetration Testing] ───► +150 EXP added to Axis [2] │
│ Total Account EXP Delta: +150 EXP                                        │
├──────────────────────────────────────────────────────────────────────────┤
│ 📈 LIVE RADAR RE-CALCULATION PREVIEW:                                    │
│                                                                          │
│   Axis [8] Cloud & DevSecOps:      1,650 EXP  ──►  1,800 EXP (+150) ▲    │
│   [■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■□□□□□□□□□□]                   │
│                                                                          │
│   Axis [2] Network Pentest:        2,400 EXP  ──►  2,550 EXP (+150) ▲    │
│   [■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■□□□]                   │
│                                                                          │
│   Polygon Visual Area Delta: +4.2% Geometric Expansion                   │
├──────────────────────────────────────────────────────────────────────────┤
│ 🔥 DAILY STREAK IMPACT:                                                  │
│ First solve of the day! Streak increased: 6 Days ──► 7 Days! [1.2x BUFF] │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐  ┌────────────────────────────┐ │
│ │ [ 🚀 Proceed to Next Challenge ]     │  │ [ 🌐 Inspect Radar Profile]│ │
│ └──────────────────────────────────────┘  └────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### State B: Giải bài tập lý thuyết tổng quát (General Theory Task - No Skill Tags)
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ 📖 LESSON CLEARED: CYBER LAW & ETHICAL DISCLOSURE                    [X] │
├──────────────────────────────────────────────────────────────────────────┤
│ Knowledge Check Passed (100% Score)                                      │
├──────────────────────────────────────────────────────────────────────────┤
│ EXP ALLOCATION:                                                          │
│ Total Account EXP: +30 EXP                                               │
│ Tags: [General Theory / Compliance] (Non-Radar Specialization)           │
│                                                                          │
│ ℹ️ RADAR INTEGRITY NOTICE:                                               │
│ All 8 technical specialization axes retain their existing values and     │
│ proportions. Biểu đồ Radar giữ nguyên vẹn hình dáng không bị méo lệch    │
│ hay lỗi hiển thị (Zero NaN/Null Error Guarantee).                         │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐  ┌────────────────────────────┐ │
│ │ [ Continue Learning Module ]         │  │ [ Return to Path Overview ]│ │
│ └──────────────────────────────────────┘  └────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 7.6: Rank Tier Progression Ladder & Fullscreen Rank-Up Modal
> **Tương ứng User Flow:** Sub-flow 3.1 (US-07.03)  
> **URL:** `/ranks` & Fullscreen Overlay Triggered on Milestone  
> **Topology:** Standardized 6-Tier Hierarchy & Full-Screen Prestige Celebration  

### Thang Cấp bậc Danh vọng Chuẩn hóa (Tier Ladder Overview)
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏆 CYBERFORCE RANK TIER PROGRESSION LADDER                                                             │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Standardized by Cumulative Lifetime EXP Earned │ Protected by Permanent Rank Invariant Guarantee       │
├───────────────┬───────────────────┬──────────────┬─────────────────────────────┬───────────────────────┤
│ Tier Name     │ EXP Threshold     │ Color Token  │ Avatar Shroud / Frame       │ Current User Status   │
├───────────────┼───────────────────┼──────────────┼─────────────────────────────┼───────────────────────┤
│ Novice        │ 0 – 999 EXP       │ Slate #64748B│ Raw Iron Grid               │ [ Completed ]         │
│ Script Kiddie │ 1,000 – 4,999 EXP │ Bronze#D97706│ Copper Circuit Wire         │ [ Completed ]         │
│ Hacker        │ 5,000 – 14,999 EXP│ Emerald#10B981│ Reinforced Neon Carbon Fiber│ [ Current Rank (74%) ]│
│ Pro Hacker    │ 15,000 – 34,999 EXP│ Cyan #00F0FF│ Dual Plasma Ring            │ [ Locked (2,550 left)]│
│ Elite Hacker  │ 35,000 – 69,999 EXP│ Amber #F59E0B│ Gold Holographic HUD        │ [ Locked ]            │
│ Cyber Guru    │ ≥ 70,000 EXP      │ Red/White    │ Quantum Obsidian Core       │ [ Pinnacle Rank ]     │
├───────────────┴───────────────────┴──────────────┴─────────────────────────────┴───────────────────────┤
│ CURRENT PROGRESS TO NEXT TIER (PRO HACKER):                                                            │
│ Current: 12,450 / 15,000 EXP                                                                           │
│ [■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■□□□□□□□□□□] 83.0% (Need 2,550 EXP)                     │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Màn hình Vinh danh Lên Cấp Toàn Màn hình (Fullscreen Rank-Up Modal)
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                                    [X] │
│                                                                                                        │
│                                      ⚡ RANK PROMOTION ACHIEVED ⚡                                     │
│                                                                                                        │
│                                      ╔═════════════════════════╗                                       │
│                                      ║      🛡️ ⚡ 🛡️          ║                                       │
│                                      ║      H A C K E R        ║                                       │
│                                      ║    LEVEL 3 OPERATOR     ║                                       │
│                                      ╚═════════════════════════╝                                       │
│                                                                                                        │
│                           YOU HAVE CROSSED THE 5,000 LIFETIME EXP THRESHOLD!                           │
│                 No longer a spectator or script-runner. You now dissect and conquer.                   │
│                                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🎁 ASSETS UNLOCKED & APPLIED:                                                                          │
│   • Prestige Title: `Hacker` updated across Global Leaderboards, KotH Match HUD, and Forum             │
│   • Avatar Frame: Reinforced Neon Carbon Fiber Shroud equipped automatically                           │
│   • Rank Invariant Guarantee: This rank is now PERMANENTLY LOCKED to your identity.                    │
│     Points spent on hints or KotH tactical penalties will NEVER demote your rank tier.                 │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐  ┌──────────────────────────────────────────────────────────┐ │
│ │ [ 🚀 Continue Learning as Hacker ]   │  │ [ 📸 Generate Social Share Card (Twitter/LinkedIn/Discord)]│ │
│ └──────────────────────────────────────┘  └──────────────────────────────────────────────────────────┘ │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 7.7: Hint Deduction Confirmation & Permanent Rank Protection Guarantee Modal
> **Tương ứng User Flow:** Sub-flow 3.2 (US-07.03)  
> **Topology:** Hộp thoại Mở Gợi ý kèm Cam kết Bảo toàn Cấp bậc Tuyệt đối  

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ 💡 UNLOCK PROGRESSION HINT // PENALTY AUDIT                          [X] │
├──────────────────────────────────────────────────────────────────────────┤
│ Room: Buffer Overflow Mastery // Task 4: Crafting ROP Gadget Chain       │
│ Selected Hint: Hint #2 — "Locating Clean `pop rdi; ret` Gadget"          │
├──────────────────────────────────────────────────────────────────────────┤
│ 💰 EXP TRANSACTION PREVIEW:                                              │
│ Current Account EXP: 5,010 EXP (Rank: Hacker)                            │
│ Cost to Unlock Hint: -20 EXP                                             │
│ New Account EXP:     4,990 EXP                                           │
├──────────────────────────────────────────────────────────────────────────┤
│ 🛡️ STRICT RANK INVARIANT GUARANTEE:                                      │
│ Notice: Your points will temporarily adjust to 4,990 EXP (which is       │
│ below the nominal 5,000 EXP threshold for the Hacker rank).              │
│                                                                          │
│ ✅ ZERO-DEMOTION COMMITMENT:                                             │
│ In CyberForce, rank tiers are historical achievements, NOT volatile      │
│ balances. You will REMAIN a "Hacker" with your unlocked avatar frame     │
│ and prestige badges 100% intact. You will NEVER be demoted to            │
│ "Script Kiddie"!                                                         │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐  ┌────────────────────────────┐ │
│ │ [ 💡 Confirm & Unlock Hint (-20 EXP)]│  │ [ ❌ Cancel & Keep Solving]│ │
│ └──────────────────────────────────────┘  └────────────────────────────┘ │
│                     [ No Points Deducted if Cancelled ]                  │
└──────────────────────────────────────────────────────────────────────────┘
```

### Trạng thái Giao diện sau khi Mở Gợi ý (Điểm < 5,000 nhưng Cấp bậc Hacker được giữ nguyên):
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [CYBERFORCE]   Labs   Paths   KotH Arena   Compete   Certifications │ [🔍]  [🔥 6 Days] [🛡️ Hacker] [@user]│
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                                               ▲
                                                                  [Rank Tier Intact: Hacker]
                                                                  [Score: 4,990 EXP]
```

---

## Wireframe 7.8: Achievement Showcase & Trophy Cabinet
### (Badges & Milestones)
> **Tương ứng User Flow:** Toàn bộ Epic 7 & US-07.01/02/03  
> **URL:** `/profile/[username]/achievements`  
> **Topology:** Tactical Trophy Cabinet Grid with Categorized Filter Tabs  

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏆 ACHIEVEMENTS & TROPHY CABINET // OPERATOR PROFILE                                                   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Total Badges Earned: 18 / 36 (50%) │ Achievement Score: 4,250 Pts │ Rare & Legendary: 4 Badges         │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ Filter: ALL (36) ]  [ 🔥 Streaks & Habits (6) ]  [ ⚔️ Combat & KotH (10) ]  [ 📜 Certifications (8) ]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                        │
│ ┌──────────────────────────┐ ┌──────────────────────────┐ ┌──────────────────────────┐                │
│ │ 🛡️ 🔥 [ UNLOCKED ]       │ │ 👑 🔥 [ UNLOCKED ]       │ │ 🩸 ⚔️ [ UNLOCKED ]       │                │
│ │ 7-Day Warrior            │ │ Habit Master             │ │ First Blood Hunter       │                │
│ │ Solved tasks 7 days      │ │ Maintained unbroken      │ │ First solver on a live   │                │
│ │ in a row.                │ │ 30-day streak.           │ │ CTF Jeopardy room.       │                │
│ │ Unlocked: 12/08/2026     │ │ Unlocked: 14/09/2026     │ │ Unlocked: 02/09/2026     │                │
│ │ Rarity: 14.2% of users   │ │ Rarity: 3.1% of users    │ │ Rarity: 1.8% of users    │                │
│ └──────────────────────────┘ └──────────────────────────┘ └──────────────────────────┘                │
│                                                                                                        │
│ ┌──────────────────────────┐ ┌──────────────────────────┐ ┌──────────────────────────┐                │
│ │ 👑 ⚔️ [ UNLOCKED ]       │ │ 📜 🎓 [ UNLOCKED ]       │ │ 🕸️ 🕷️ [ LOCKED ]         │                │
│ │ King of the Hill Champ   │ │ Capstone Certified       │ │ Octa-Master              │                │
│ │ Held King status for >10 │ │ Scored 100% on practical │ │ Achieve >5,000 EXP on all│                │
│ │ ticks in KotH match.     │ │ 12h certification exam.  │ │ 8 radar axes.            │                │
│ │ Unlocked: 16/09/2026     │ │ Unlocked: 10/09/2026     │ │ Progress: [■■■■□□□□] 4/8 │                │
│ │ Rarity: 4.5% of users    │ │ Rarity: 2.2% of users    │ │ Rarity: 0.4% (Ultra Rare)│                │
│ └──────────────────────────┘ └──────────────────────────┘ └──────────────────────────┘                │
│                                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ 🔘 Display Top 3 Featured Badges on Public Profile Card ]                                           │
│ Current Featured: [ 7-Day Warrior ] [ King of the Hill Champ ] [ Capstone Certified ]                  │
│ [ ✏️ Edit Featured Badges ]                                                                            │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 UX & Accessibility Verification Matrix (No Dead End & Performance)

| Màn hình | Điều kiện biên & Rủi ro | Giải pháp thiết kế xử lý | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- |
| **Streak Counter** | Người dùng giải bài tập lúc 23:58:30 (sát giờ nửa đêm). | Client đồng bộ NTP time với server; tính theo múi giờ `Asia/Ho_Chi_Minh`; hoàn thành nộp cờ trước 23:59:59 được ghi nhận streak ngay lập tức. | Không mất điểm nếu server phản hồi trễ; có log timestamp bảo lưu. |
| **Review Task** | Người dùng tưởng làm lại bài cũ sẽ được tính streak rồi bỏ qua. | Banner thông báo màu Amber rõ ràng ngay sau khi nộp flag cũ: "Ôn tập thành công, không tính streak"; đồng thời gợi ý ngay 3 bài tập mới tương đương để giải tiếp. | Nút 1-click mở ngay 1 trong 3 bài tập gợi ý để duy trì streak trước nửa đêm. |
| **8-Axis Radar** | Người học mới tạo tài khoản có 0 điểm trên tất cả các trục hoặc giải bài không có nhãn. | Hệ thống render khung lưới 8 trục mặc định hình bát giác chuẩn; diện tích = 0 hoặc render tâm điểm nhỏ. Tuyệt đối không sinh lỗi `NaN`, `DivideByZero` hay crash SVG. | Có nút "Bắt đầu bài học nhập môn" để mở rộng cánh đầu tiên. |
| **Multi-Tag Parallel** | Task có nhiều hơn 2 nhãn chuyên môn (ví dụ vừa Web, vừa Cloud, vừa Linux). | Phân bổ trọn vẹn điểm cho toàn bộ các trục tương ứng song song (Multi-Tag Parallel) mà không chia nhỏ điểm. | Hiển thị delta trực quan từng cánh mở rộng kèm nút xem hồ sơ năng lực. |
| **Rank Demotion Fear** | Người dùng sợ bị trừ điểm khi mở gợi ý sẽ làm mất huy hiệu cấp bậc. | Banner cam kết "Rank Invariant Guarantee" ghi rõ cấp bậc là vĩnh viễn không bao giờ bị hạ xuống. | Nút "Hủy bỏ" luôn khả dụng nếu học viên muốn tự nghiên cứu thêm mà không tốn EXP. |
| **Mobile Responsiveness** | Màn hình điện thoại nhỏ khó tương tác trên biểu đồ Radar 8 trục. | Biểu đồ tự động chuyển sang giao diện danh sách tiến trình 8 thanh ngang kèm nút chạm để zoom phóng to radar. | Luôn dễ dàng theo dõi và không che khuất thông tin quan trọng. |
