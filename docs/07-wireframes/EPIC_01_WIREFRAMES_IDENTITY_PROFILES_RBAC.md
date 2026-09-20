# 🖥️ EPIC 1: Wireframe Architecture & Low-Fidelity UI Specifications
## User Identity, Profiles & Granular RBAC

* **Project:** CyberForce (CyberForge) Cloud Cyber Range
* **Reference User Flow:** [`docs/06-user-flow/EPIC_01_USER_FLOW_IDENTITY_PROFILES_RBAC.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/06-user-flow/EPIC_01_USER_FLOW_IDENTITY_PROFILES_RBAC.md)
* **Design Philosophy:** Tactical Cyber-Minimalism (0–2px sharp radii, high contrast, zero-cliché, strict Purple Ban)
* **Version:** 1.0.0

---

## 🎨 Design System Foundation & Visual Tokens

| Token Category | Value / Specification | Rationale & UX Purpose |
| :--- | :--- | :--- |
| **Canvas Background** | `#070A0F` (Obsidian Base) / `#0E131F` (Surface Layer) | Nền tối sâu chuyên dụng cho an ninh mạng, chống mỏi mắt khi làm bài lab dài. |
| **Border & Divider** | `#1E293B` (Subtle) / `#334155` (Active Grid) | Đường viền kỹ thuật sắc nét, độ bo góc cực thấp (`rounded: 0px` đến `2px`). |
| **Primary Accent** | `#00F0FF` (Electric Cyan) / `#10B981` (Cyber Emerald) | Điểm nhấn chức năng và trạng thái thành công, dứt khoát loại bỏ màu tím AI. |
| **Warning / Lockout** | `#F59E0B` (Amber Alert) / `#EF4444` (Crimson Breach) | Dành cho cảnh báo nhập sai, khóa tài khoản tạm thời và trạng thái vi phạm SLA. |
| **Typography** | `JetBrains Mono` / `Fira Code` (Data/Code), `Inter` (UI Body) | Đảm bảo tính dễ đọc giữa số liệu mật mã và thông tin hướng dẫn. |

---

## 📐 Wireframe Index (8 Màn hình Trọng yếu)

1. [Wireframe 1.1: Authentication Hub (Login / Register / 1-Click OAuth)](#wireframe-11-authentication-hub-login--register)
2. [Wireframe 1.2: Account Conflict & Linking Portal (Xử lý Trùng Email)](#wireframe-12-account-conflict--linking-portal)
3. [Wireframe 1.3: Temporary Account Lockout Screen (Khóa 15 Phút do Brute-force)](#wireframe-13-temporary-account-lockout-screen)
4. [Wireframe 2.1: Public Cyber Portfolio & 8-Axis Skill Radar (`/user/:username`)](#wireframe-21-public-cyber-portfolio--8-axis-skill-radar)
5. [Wireframe 2.2: Private Profile Shield (Chế độ Xem Ẩn Danh & Chủ Sở Hữu)](#wireframe-22-private-profile-shield)
6. [Wireframe 3.1: "Become a Creator" Application Studio](#wireframe-31-become-a-creator-application-studio)
7. [Wireframe 3.2: Admin RBAC & Creator Review Management Panel](#wireframe-32-admin-rbac--creator-review-management-panel)
8. [Wireframe 3.3: 403 Insufficient Security Clearance (Truy cập Trái phép)](#wireframe-33-403-insufficient-security-clearance)

---

## Wireframe 1.1: Authentication Hub (Login / Register)
> **Tương ứng User Flow:** Sub-flow 1.1 & 1.3 (US-01.01, US-01.02)  
> **Topology:** Tactical Asymmetric Split (40% Telemetry Stream - 60% Auth Terminal)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [CYBERFORCE LOGO]                                                                   [STATUS: ONLINE ●] │
├─────────────────────────────────────────────┬──────────────────────────────────────────────────────────┤
│                                             │  [ TAB: SIGN IN ]     [ TAB: CREATE ACCOUNT ]            │
│  CYBER TELEMETRY & LIVE RANGE               │                                                          │
│                                             │  Sign in to access your isolated cyber sandbox           │
│  Active Nodes: 1,420 Pods                   ├──────────────────────────────────────────────────────────┤
│  Live KotH Matches: 14 Arenas               │  [ G  Continue with Google ]                             │
│  Daily Flags Captured: 8,912                │  [ 🐙 Continue with GitHub ]                             │
│                                             │                                                          │
│  "Train like it's a real incident.          │  ────────────── OR CONTINUE WITH EMAIL ───────────────   │
│   From zero to root in < 3s."               │                                                          │
│                                             │  Email Address *                                         │
│  ┌───────────────────────────────────────┐  │  ┌────────────────────────────────────────────────────┐  │
│  │ > sys.init_probe()                    │  │  │ operator@cyberforce.io                             │  │
│  │ > wireguard.handshake: OK (10.8.0.1)  │  │  └────────────────────────────────────────────────────┘  │
│  │ > zero_egress_firewall: ENFORCED      │  │  Password *                             [ Show/Hide ]    │
│  │ > dynamic_salt_engine: READY          │  │  ┌────────────────────────────────────────────────────┐  │
│  │                                       │  │  │ ••••••••••••••••                           │  │
│  └───────────────────────────────────────┘  │  └────────────────────────────────────────────────────┘  │
│                                             │  Live Password Strength Checklist:                       │
│  Need help? [Technical Support Docs]        │  [✓] 8+ Chars   [✓] Uppercase   [✓] Number   [✓] Symbol  │
│                                             │                                                          │
│                                             │  [ ] Keep session active for 30 days    [Forgot pass?]   │
│                                             │                                                          │
│                                             │  ┌────────────────────────────────────────────────────┐  │
│                                             │  │ [>] AUTHENTICATE & ENTER RANGE                     │  │
│                                             │  └────────────────────────────────────────────────────┘  │
│                                             │                                                          │
│                                             │  [!] Network Interrupted? [ Draft preserved ]  [Retry]   │
└─────────────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```

* **Điểm nhấn UX/UI:**
  * Cột trái thể hiện tinh thần nền tảng (Telemetry sống, tạo cảm giác chuyên nghiệp).
  * Checkpoint mật khẩu 4 tiêu chí phản hồi tức thì (xanh khi đạt, đỏ/xám khi thiếu).
  * Cơ chế lưu bản nháp: Nếu mất kết nối mạng, form không bị xóa, có badge báo `[Draft Preserved]`.

---

## Wireframe 1.2: Account Conflict & Linking Portal
> **Tương ứng User Flow:** Sub-flow 1.2 (US-01.01)  
> **Topology:** Centered Security Modal with High-Priority Ambient Border

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ⚠️ IDENTITY CONFLICT DETECTED                                        [X] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ The email "alex.dev@gmail.com" returned by GitHub is already linked to   │
│ an existing CyberForce account created via Email/Password.               │
│                                                                          │
│ To protect your account from takeover, please verify ownership of the    │
│ original account before linking GitHub identity.                         │
│                                                                          │
│ ┌──────────────────────────────────┐  ┌───────────────────────────────┐  │
│ │ [•] OPTION 1: Master Password    │  │ [ ] OPTION 2: 6-Digit Email Code│
│ └──────────────────────────────────┘  └───────────────────────────────┘  │
│                                                                          │
│ [State: Option 1 Selected]                                               │
│ Enter Current Master Password:                                           │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ ••••••••••••••••••••••••••                              [ Show ]     │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│ [!] Incorrect password. 3 attempts remaining before lockout.             │
│                                                                          │
│ [State: Option 2 Selected]                                               │
│ Enter the 6-digit confirmation code sent to a***v@gmail.com:             │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                          │
│ │  4  │ │  8  │ │  1  │ │  9  │ │  0  │ │  2  │   (Expires in 04:32)     │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                          │
│ Didn't receive code? [Resend in 48s]                                     │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ [ Cancel & Return to Login ]                 [ LINK IDENTITY & SIGN IN ] │
└──────────────────────────────────────────────────────────────────────────┘
```

* **Điểm nhấn UX/UI:**
  * Tuyệt đối không tự động gộp tài khoản (chống nguy cơ OAuth Account Takeover).
  * Cung cấp 2 cơ chế mở khóa linh hoạt: Mật khẩu cũ HOẶC mã OTP 6 số.
  * Nút "Cancel & Return to Login" an toàn, không để người dùng rơi vào ngõ cụt.

---

## Wireframe 1.3: Temporary Account Lockout Screen
> **Tương ứng User Flow:** Sub-flow 1.4 (US-01.02)  
> **Topology:** Focused Defense Card / Strict Rate-Limiter Screen

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                          🛡️ RATE-LIMIT ENGAGED                           │
│                                                                          │
│                [ 5 CONSECUTIVE FAILED LOGIN ATTEMPTS ]                   │
│                                                                          │
│       This terminal session has been temporarily quarantined to          │
│       prevent credential brute-forcing.                                  │
│                                                                          │
│                      TIME REMAINING UNTIL UNLOCK:                        │
│                           ┌──────────────┐                               │
│                           │   14 : 38    │                               │
│                           └──────────────┘                               │
│                                                                          │
│       A security notice has been dispatched to the account email.        │
│                                                                          │
│       ────────────────────────────────────────────────────────           │
│                                                                          │
│       Need urgent access?                                                │
│       ┌──────────────────────────────────────────────────────┐           │
│       │ [✉️ Send Instant Unlock Link to Email]                │           │
│       └──────────────────────────────────────────────────────┘           │
│                                                                          │
│       Or return safely to the platform entry point:                      │
│       [ ← Return to Platform Homepage ]                                  │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

* **Điểm nhấn UX/UI:**
  * Đồng hồ kỹ thuật số đếm ngược thời gian thực, tự động mở khóa khi về `00:00`.
  * Đường thoát khẩn cấp: "Send Instant Unlock Link" gửi magic-link về hòm thư chủ nhân.
  * Nút "Return to Homepage" giúp người dùng không bị kẹt chết trên màn hình đỏ.

---

## Wireframe 2.1: Public Cyber Portfolio & 8-Axis Skill Radar
> **Tương ứng User Flow:** Sub-flow 2.1 (US-01.03)  
> **URL:** `https://cyberforce.io/user/alex_cyber`  
> **Topology:** Operator HUD / Asymmetric Showcase Layout

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]  Rooms   Learning Paths   CTF Arena   Rankings                  [Search Ops]    [Sign In/Join] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ OPERATOR DOSSIER // CALLSIGN: alex_cyber                                     [ 🔗 Copy CV Share Link ] │
│ ┌───────┐  Alex Nguyen [VERIFIED OPERATOR ✓]                  [PUBLIC DOSSIER]                         │
│ │ [AVT] │  Rank Tier: GUARDIAN (Tier IV)  │  EXP: 14,850 pts  │  Streak: 🔥 18 Days  │ Labs: 42 Cleared│
│ └───────┘  Specialty: Web Penetration & Cloud Sec             │  Member Since: Oct 2026                 │
├─────────────────────────────────────────────┬──────────────────────────────────────────────────────────┤
│ 8-AXIS CYBER RADAR TELEMETRY                │ CAPSTONE CREDENTIALS & ACHIEVEMENTS                      │
│                                             │                                                          │
│                 Web Exploit [92]            │ Verified Practical Certificates (2)                      │
│                      ▲                      │ ┌──────────────────────────────────────────────────────┐ │
│         Binary [45] / \ Cloud Sec [88]      │ │ 🎖️ CAPSTONE EXAM: OFFENSIVE WEB ASSOCIATE (CF-OWA)  │ │
│                   /     \                   │ │ Issued: Dec 2026 │ Score: 94% │ Signed RSA-4096      │ │
│      OSINT [60] <    ●    > Net Pentest [75]│ │ [ View Signed PDF ]  [ 🔍 Verify Online ] [LinkedIn] │ │
│                   \     /                   │ └──────────────────────────────────────────────────────┘ │
│         Crypto [50] \ / Reverse Eng [40]    │ ┌──────────────────────────────────────────────────────┐ │
│                      ▼                      │ │ 🎖️ CAPSTONE EXAM: JUNIOR PENETRATION TESTER (CF-JPT) │ │
│                 DevSecOps [70]              │ │ Issued: Nov 2026 │ Score: 88% │ Signed RSA-4096      │ │
│                                             │ └──────────────────────────────────────────────────────┘ │
│ Radar Metrics:                              │                                                          │
│ • Web Exploitation: 1,840 pts (Master)      │ Operator Badges Cabinet (4/12)                           │
│ • Cloud & Containers: 1,420 pts (Adept)     │ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐        │
│ • Network Pentest: 1,150 pts (Adept)        │ │  1ST  │ │ KOTH  │ │ 7-DAY │ │ ROOT  │ │   ?   │ (Locked) │
│ • DevSecOps Pipeline: 890 pts (Skilled)     │ │ BLOOD │ │ KING  │ │ STREAK│ │ SHELL │ │ LOCKED│        │
│                                             │ └───────┘ └───────┘ └───────┘ └───────┘ └───────┘        │
│ Note: Private details (Email, billing,      │                                                          │
│ failed submissions) are permanently hidden. │ Completed Learning Paths:                                │
│                                             │ [■■■■■■■■■■] 100% Web Fundamentals (24/24 Rooms)          │
│                                             │ [■■■■■■□□□□]  60% Advanced Privilege Escalation (6/10)   │
└─────────────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```

* **Điểm nhấn UX/UI:**
  * Biểu đồ Radar 8 trục trực quan hóa điểm mạnh/yếu của ứng viên cho nhà tuyển dụng.
  * Chứng chỉ Capstone có nút kiểm định `[Verify Online]` dẫn thẳng tới trang xác thực mật mã.
  * Tôn trọng bảo mật: Ẩn 100% email, nhật ký làm bài sai và thông tin nhạy cảm.

---

## Wireframe 2.2: Private Profile Shield
> **Tương ứng User Flow:** Sub-flow 2.2 (US-01.03)  
> **Topology:** Two-Perspective State Matrix (Chế độ Người Ngoài vs Chế độ Chính Chủ)

### Perspective A: Khách ngoài / Nhà tuyển dụng truy cập
```text
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                     🔒 DOSSIER CLASSIFIED (PRIVATE)                      │
│                                                                          │
│       The operator "alex_cyber" has marked their dossier as private.     │
│       Skill telemetry, radar charts, and badges are restricted.          │
│                                                                          │
│       Are you this operator?                                             │
│       [ Sign In to Access Your Dashboard ]                               │
│                                                                          │
│       Looking to practice cybersecurity?                                 │
│       [ 🚀 Explore Public Labs ]       [ 🏆 View Global Leaderboard ]    │
│                                                                          │
│       [ ← Return to CyberForce Home ]                                    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

### Perspective B: Chính chủ đang đăng nhập xem hồ sơ của mình
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ NOTICE: Your profile is currently set to PRIVATE. Visitors cannot view your radar or badges.        │
│ [ ⚙️ Privacy Settings ]                                            [ Switch to Public Mode Now ]       │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ Standard Profile HUD renders normally with an amber watermark: "PREVIEWING AS SELF - HIDDEN" ]       │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 3.1: "Become a Creator" Application Studio
> **Tương ứng User Flow:** Sub-flow 3.1 (US-01.04)  
> **Topology:** Guided Application Editor with Exit Guard Modal

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [← Back to Dashboard]             CREATOR CANDIDACY PROGRAM // APPLICATION                            │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Join the CyberForce Creator Guild to author interactive rooms, build sandboxes, and earn bounties.    │
│                                                                                                        │
│ 1. Professional Background & Security Domain *                                                         │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │ Senior Security Researcher with 4 years experience in Web App Pentesting & Cloud Security...       │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                        │
│ 2. Public Verification & Portfolio Links *                                                             │
│ GitHub:    ┌─────────────────────────────────────────────────────────────────────────────────────────┐ │
│            │ https://github.com/alex-researcher                                                      │ │
│            └─────────────────────────────────────────────────────────────────────────────────────────┘ │
│ Blog/CVE:  ┌─────────────────────────────────────────────────────────────────────────────────────────┐ │
│            │ https://alexsec.io/cve-2026-analysis                                                    │ │
│            └─────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                        │
│ 3. Sample Lab Outline & Architecture Specification (.md / .pdf, max 10MB) *                            │
│ ┌────────────────────────────────────────────────────────────────────────────────────────────────────┐ │
│ │   📁 Drag & drop lab syllabus / Docker architecture proposal here                                  │ │
│ │   [ Click to browse files from computer ]                                                          │ │
│ │   Selected: lab_sqli_advanced_proposal.md (142 KB)                                     [ Remove ]  │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [ Cancel & Return ]                                                [ SUBMIT CANDIDACY APPLICATION ]    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

[ EXIT GUARD CONFIRMATION DIALOG (KHI BẤM CANCEL) ]
┌──────────────────────────────────────────────────────────┐
│ DISCARD UNSAVED APPLICATION?                             │
│ You have unsaved progress in this application. Exiting   │
│ now will clear your uploaded outline.                    │
│                                                          │
│ [ Continue Editing ]              [ Discard & Return ]   │
└──────────────────────────────────────────────────────────┘
```

---

## Wireframe 3.2: Admin RBAC & Creator Review Management Panel
> **Tương ứng User Flow:** Sub-flow 3.2 (US-01.04)  
> **URL:** `/admin/roles`  
> **Topology:** Master-Detail Review Workbench (Split 35/65)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ADMIN CONSOLE // ROLE PRIVILEGE MANAGEMENT                                        [ADMIN: super_quoc]  │
├─────────────────────────────────────────────┬──────────────────────────────────────────────────────────┤
│ CANDIDACY QUEUE [ PENDING: 3 ]              │ CANDIDATE DOSSIER: alex_cyber                            │
│                                             │ Applied: 2026-09-18 14:20 │ Role: Student (Tier IV)      │
│ ┌─────────────────────────────────────────┐ │ ──────────────────────────────────────────────────────── │
│ │ ● alex_cyber              Pending (2d)  │ │ Focus: Web Pentest, Cloud Security                       │
│ │   Web Pentesting / 4 yrs experience     │ │ GitHub: github.com/alex-researcher                       │
│ ├─────────────────────────────────────────┤ │ Blog: alexsec.io (Verified 2 published CVE writeups)     │
│ │ ○ shadow_byte             Pending (4d)  │ │                                                          │
│ │   Reverse Eng / Binary Exploit          │ │ Sample Lab Proposal:                                     │
│ ├─────────────────────────────────────────┤ │ ┌──────────────────────────────────────────────────────┐ │
│ │ ○ elena_soc               Pending (5d)  │ │ │ Name: AWS IAM Privilege Escalation Lab               │ │
│ │   Blue Team SIEM & Threat Hunting       │ │ │ Architecture: 1 Web Container + LocalStack Mock      │ │
│ └─────────────────────────────────────────┘ │ │ Flags: Dynamic HMAC Flag in /root/proof.txt          │ │
│                                             │ │ [ 📥 Download Syllabus (.md) ]  [ 👁️ Live Preview ]   │ │
│ Filter: [All] [Pending] [Approved] [Rejected│ └──────────────────────────────────────────────────────┘ │
│                                             ├──────────────────────────────────────────────────────────┤
│                                             │ [ ❌ REJECT WITH FEEDBACK ]        [ ✅ APPROVE CREATOR ] │
└─────────────────────────────────────────────┴──────────────────────────────────────────────────────────┘

[ MANDATORY REJECTION REASON DIALOG ]
┌──────────────────────────────────────────────────────────────────────────┐
│ REJECTION REASON & MENTORSHIP FEEDBACK                                   │
│ Provide constructive feedback for the applicant to improve and reapply. │
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ The proposal looks promising, but please specify the memory/CPU limits│ │
│ │ and provide the Dockerfile for the LocalStack container...           │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│ [ Cancel ]                                   [ Confirm Rejection Email ] │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 3.3: 403 Insufficient Security Clearance
> **Tương ứng User Flow:** Sub-flow 3.3 (US-01.04)  
> **Topology:** High-Fidelity Cyber Defense 403 Incident Screen

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│                  🛑 SEC_CLEARANCE_DENIED (CODE: 403)                     │
│                                                                          │
│               [ ACCESS RESTRICTED TO PLATFORM ADMINS ]                   │
│                                                                          │
│       Zone: /admin/roles/permissions                                     │
│       Current Identity: alex_cyber (Role: student)                       │
│       Required Identity: org_admin or superadmin                         │
│                                                                          │
│       Your attempt has been logged for system auditing purposes.         │
│                                                                          │
│       ────────────────────────────────────────────────────────           │
│                                                                          │
│       Options to proceed:                                                │
│                                                                          │
│       ┌──────────────────────────────────────────────────────┐           │
│       │ [ ← Return to Student Learning Dashboard ]           │ (Primary) │
│       └──────────────────────────────────────────────────────┘           │
│                                                                          │
│       Need admin access?                                                 │
│       [ Switch Account / Re-authenticate with Admin Privileges ]         │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Verification & Hand-off Checklist cho UI Developer

- [x] **Không màn hình bế tắc (No Dead End):** Tất cả các màn hình lỗi (403, Account Locked, Linking Conflict, Private Dossier) đều có ít nhất 2 nút thoát an toàn.
- [x] **Tuân thủ Purple Ban:** 100% sử dụng bảng màu Obsidian, Cyan (`#00F0FF`), Cyber Emerald (`#10B981`), Amber (`#F59E0B`), và Crimson (`#EF4444`). Không sử dụng bất kỳ sắc tím/indigo nào.
- [x] **Bo góc kỹ thuật:** Bán kính góc từ `0px` đến `2px` tạo cảm giác HUD quân sự/an ninh mạng chuyên nghiệp.
- [x] **Traceability:** Khớp 1-1 với các kịch bản trong [`docs/06-user-flow/EPIC_01_USER_FLOW_IDENTITY_PROFILES_RBAC.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/06-user-flow/EPIC_01_USER_FLOW_IDENTITY_PROFILES_RBAC.md).
