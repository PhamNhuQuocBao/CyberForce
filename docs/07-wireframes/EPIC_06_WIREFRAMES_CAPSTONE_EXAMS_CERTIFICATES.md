# 🖥️ EPIC 6: Wireframe Architecture & Low-Fidelity UI Specifications
## Practical Capstone Exams & Verifiable Digital Certificates

* **Project:** CyberForce (CyberForge) Cloud Cyber Range
* **Reference User Flow:** [`docs/06-user-flow/EPIC_06_USER_FLOW_CAPSTONE_EXAMS_CERTIFICATES.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/06-user-flow/EPIC_06_USER_FLOW_CAPSTONE_EXAMS_CERTIFICATES.md)
* **Design Philosophy:** Tactical Cyber-HUD, High-Stakes Certification & Cryptographic Verification
* **Version:** 1.0.0

---

## 🎨 Design System Foundation & Certification Tokens

| Thành phần / Trạng thái | Quy chuẩn hiển thị | Mục đích kỹ thuật & Trải nghiệm (UX) |
| :--- | :--- | :--- |
| **Chứng chỉ Hợp lệ (Verified)** | `#10B981` (Cyber Emerald) + Dấu mộc số | Khẳng định chứng chỉ chính hãng có chữ ký số RSA-4096 và mã QR tra cứu công khai. |
| **Đồng hồ Đếm lùi Giờ thi** | Kỹ thuật số lớn, viền Electric Cyan | Đếm lùi 12:00:00 hoặc 24:00:00; chuyển sang Amber/Red trong 60 phút cuối. |
| **Chưa Đạt / Thu Hồi** | `#EF4444` (Crimson Alert) + Lời giải thích | Cảnh báo chứng chỉ giả mạo/thu hồi, hoặc phân tích kỹ năng cần cải thiện cho thí sinh thi lại. |
| **Giãn cách Thi lại (Cooldown)**| `#F59E0B` (Amber Timer) 14 Ngày | Đồng hồ đếm lùi thời gian chờ thi lại, tích hợp nút đăng ký nhắc hẹn qua Email. |
| **Bán kính Bo góc** | `0px` – `2px` (Góc cạnh sắc nhọn, trang trọng) | Thể hiện sự nghiêm túc, uy tín của chứng chỉ khảo thí thực hành chuyên nghiệp. |

---

## 📐 Wireframe Index (8 Màn hình Trọng yếu)

1. [Wireframe 6.1: Capstone Exam Overview & Prerequisite Progress Gate](#wireframe-61-capstone-exam-overview--prerequisite-progress-gate)
2. [Wireframe 6.2: Exam Honor Code & Exam Lockdown Consent Dialog](#wireframe-62-exam-honor-code--lockdown-consent-dialog)
3. [Wireframe 6.3: High-Stakes Exam Workspace (12-Hour Timer, Isolated Target & Task List)](#wireframe-63-high-stakes-exam-workspace)
4. [Wireframe 6.4: Early Exam Submission Confirmation & Auto-Submit Timeout Screen](#wireframe-64-early-exam-submission-confirmation--timeout-screen)
5. [Wireframe 6.5: Exam Passed & Official Digital Certificate Showcase (QR & RSA Signature)](#wireframe-65-exam-passed--digital-certificate-showcase)
6. [Wireframe 6.6: Exam Not Passed Remediation & 14-Day Cooldown Retake Scheduler](#wireframe-66-exam-not-passed-remediation--14-day-cooldown)
7. [Wireframe 6.7: Public Certificate Verification Portal (`verify.cyberforce.io`)](#wireframe-67-public-certificate-verification-portal)
8. [Wireframe 6.8: Verification Results Display: Verified Authentic vs Revoked / Fraudulent](#wireframe-68-verification-results-display)

---

## Wireframe 6.1: Capstone Exam Overview & Prerequisite Progress Gate
> **Tương ứng User Flow:** Sub-flow 1.1 (US-06.01)  
> **URL:** `/paths/offensive-web-associate/exam`  
> **Topology:** High-Stakes Qualification Gatekeeper

### State A: Chưa hoàn thành 100% Lộ trình (Nút thi bị khóa)
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [← Back to Path]  CAPSTONE PRACTICAL EXAM // OFFENSIVE WEB ASSOCIATE (CF-OWA)                          │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ EXAM SPECIFICATION & ACCREDITATION CRITERIA:                                                           │
│ Duration: 12 Hours Continuous Session │ Passing Grade: 70 / 100 Points │ Format: 100% Practical Flags  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🔒 PREREQUISITE ELIGIBILITY AUDIT                                                                      │
│ You must achieve 100% completion on the foundational path curriculum before scheduling your exam.      │
│                                                                                                        │
│ Current Curriculum Progress:                                                                           │
│ [■■■■■■■■■■■■■■■□□□□□] 75% Completed (21/28 Rooms Cleared)                                            │
│                                                                                                        │
│ Missing Prerequisite Rooms (7):                                                                        │
│ • Room 22: Second-Order SQLi & WAF Bypassing                                                           │
│ • Room 23: Out-of-Band (OAST) Exfiltration                                                             │
│ • Room 24: Server-Side Template Injection (SSTI) ... and 4 more.                                       │
│                                                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐                                 │
│ │ [ 🔒 EXAM SESSION LOCKED (Complete 7 remaining rooms first) ]       │                                 │
│ └────────────────────────────────────────────────────────────────────┘                                 │
│ [ 🚀 Continue Learning: Resume Room 22 ]                                                               │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### State B: Đã hoàn thành 100% Lộ trình (Đủ điều kiện dự thi)
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ✅ PREREQUISITE VERIFIED: 100% CURRICULUM COMPLETED (28/28 ROOMS)                                       │
│ You have unlocked the Official Capstone Examination for Certified Offensive Web Associate (CF-OWA).    │
│                                                                                                        │
│ Exam Rules Overview:                                                                                   │
│ 1. Dedicated Multi-Target Network: Subnet `10.10.99.0/24` with 4 isolated vulnerable hosts.            │
│ 2. Automated Evaluation: Grade calculated dynamically from root and user proof flags.                  │
│ 3. Isolated Environment: Forum, community discussions, and hint systems are locked during exam.      │
│                                                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐                                 │
│ │ [ ⚡ START CAPSTONE EXAM SESSION (12:00:00) ]                      │                                 │
│ └────────────────────────────────────────────────────────────────────┘                                 │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 6.2: Exam Honor Code & Exam Lockdown Consent Dialog
> **Tương ứng User Flow:** Sub-flow 1.1 (US-06.01)  
> **Topology:** Mandatory Academic Integrity Security Modal

```text
┌──────────────────────────────────────────────────────────────────────────┐
│ 📜 CAPSTONE EXAMINATION HONOR CODE & LOCKDOWN CONSENT                [X] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ By launching this 12-hour practical examination session, you agree to:   │
│                                                                          │
│ [✓] 1. Independent Work:                                                 │
│        You will exploit targets independently without assistance from    │
│        third parties, shared answer sheets, or live collaboration.       │
│                                                                          │
│ [✓] 2. Environment Lockdown:                                             │
│        All hint tiers, public walkthroughs, and platform chat channels   │
│        will be disabled until the exam session is concluded.             │
│                                                                          │
│ [✓] 3. Timer Irreversibility:                                            │
│        The 12-hour countdown runs continuously. Pausing or stopping the  │
│        exam clock is strictly impossible once initiated.                 │
│                                                                          │
│ Please confirm when you are in a quiet, uninterrupted environment.       │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ [ Cancel - I Will Take It Later ]      [ I AGREE & INITIATE 12H EXAM → ] │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 6.3: High-Stakes Exam Workspace
> **Tương ứng User Flow:** Sub-flow 1.2 (US-03.01)  
> **URL:** `/exam/session/:sessionId`  
> **Topology:** Dedicated Exam HUD (Timer, Target Grid, Tasks & Submissions)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]  OFFICIAL EXAM SESSION: CF-OWA-2026-9912   TIME REMAINING: [ ⏱️ 11 : 42 : 18 ]   VPN: [🟢 10.8.0.42]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ CURRENT EXAM SCORE: 40 / 100 PTS  (Minimum to Pass: 70 PTS)          PROGRESS: [■■■■□□□□□□] 40%        │
├─────────────────────────────────────────────┬──────────────────────────────────────────────────────────┤
│ EXAM TARGETS & NETWORK MAP                  │ OBJECTIVES & FLAG SUBMISSION                             │
├─────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│ TARGET 1: DMZ Web Server (10.10.99.10)      │ ┌──────────────────────────────────────────────────────┐ │
│ Hostname: dmz-portal.exam.internal          │ │ TASK 1.1: Web User Shell [ 20 PTS ]                  │ │
│ Vulnerability Scope: Web exploitation       │ │ Obtain local user shell on Target 1 (10.10.99.10).    │ │
│ Status: EXPLOITED ✓                         │ │ Flag: CF{user_dmz_web_99182}                         │ │
│                                             │ │ Status: [ SOLVED ✓ (+20 PTS) ]                       │ │
│ TARGET 2: Database Server (10.10.99.20)     │ ├──────────────────────────────────────────────────────┤ │
│ Hostname: db-vault.exam.internal            │ │ TASK 1.2: Root Privilege Escalation [ 20 PTS ]       │ │
│ Vulnerability Scope: Privilege Escalation   │ │ Elevate privileges to root on Target 1.              │ │
│ Status: EXPLOITED ✓                         │ │ Flag: CF{root_dmz_svr_00192}                         │ │
│                                             │ │ Status: [ SOLVED ✓ (+20 PTS) ]                       │ │
│ TARGET 3: Internal Admin Host (10.10.99.30) │ ├──────────────────────────────────────────────────────┤ │
│ Hostname: corp-admin.exam.internal          │ │ TASK 2.1: Internal Pivoting [ 30 PTS ]               │ │
│ Status: PROBING IN PROGRESS...              │ │ Pivot through DMZ to compromise Target 2 DB Host.    │ │
│                                             │ │ Flag: [ CF{____________________________________} ]   │ │
│ TARGET 4: Core Domain Controller            │ │ [ SUBMIT OBJECTIVE FLAG ]                            │ │
│ Hostname: dc01.corp.exam.internal           │ ├──────────────────────────────────────────────────────┤ │
│ Status: LOCKED (Requires Target 3 access)   │ │ TASK 3.1: Active Directory Compromise [ 30 PTS ]     │ │
│                                             │ │ Extract domain admin ntds.dit database from DC01.    │ │
│ ─────────────────────────────────────────── │ │ Flag: [ CF{____________________________________} ]   │ │
│ [ ⚡ Web Terminal ]  [ 🖥️ Kali AttackBox ]   │ │ [ SUBMIT OBJECTIVE FLAG ]                            │ │
│ [ 📋 Copy Target IPs ]  [ Report Tech Issue]│ └──────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────┴──────────────────────────────────────────────────────────┤
│ [ 🚩 FINISH & SUBMIT EXAM EARLY ]                                         [ Lockdown Mode Active 🔒 ]  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

* **Điểm nhấn UX/UI:**
  * **Thanh trạng thái điểm tức thì:** Hiển thị rõ số điểm đã ghi được (`40/100 PTS`) so với ngưỡng đậu `70 PTS`.
  * **Bản đồ mục tiêu phân cấp:** Hướng dẫn luồng khai thác tuần tự từ DMZ $\rightarrow$ Database $\rightarrow$ Internal Admin $\rightarrow$ Domain Controller.
  * **Chấm điểm Flag tự động 100%:** Nộp cờ là điểm số cập nhật ngay, không cần chờ chấm báo cáo thủ công.

---

## Wireframe 6.4: Early Exam Submission Confirmation & Auto-Submit Timeout Screen
> **Tương ứng User Flow:** Sub-flow 1.2 (US-06.01)  
> **Topology:** Dual Exit Flow (Chủ động nộp sớm vs Tự động thu bài khi hết giờ)

### State A: Hộp thoại xác nhận khi học viên bấm "Nộp bài thi sớm"
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ⚠️ CONFIRM EARLY EXAM SUBMISSION                                     [X] │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ You still have 04 hours 15 minutes remaining on your exam clock.         │
│                                                                          │
│ Current Performance Summary:                                             │
│ • Scored Points:   80 / 100 PTS (Exceeds Passing Threshold of 70 PTS)   │
│ • Completed Tasks: 3 of 4 Target Objectives Solved                       │
│                                                                          │
│ If you submit now, your exam session will immediately terminate and your │
│ official digital credential will be generated based on this score.       │
│                                                                          │
├──────────────────────────────────────────────────────────────────────────┤
│ [ ← Return to Exam & Keep Working ]           [ CONFIRM & SUBMIT NOW ]   │
└──────────────────────────────────────────────────────────────────────────┘
```

### State B: Màn hình tự động thu bài khi đồng hồ chạm `00:00:00`
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ ⏱️ EXAM CLOCK ELAPSED // AUTO-SUBMISSION COMPLETE                         │
├──────────────────────────────────────────────────────────────────────────┤
│ The 12-hour session limit has concluded. The exam lab has terminated.    │
│ All submitted flags have been permanently verified in the database.     │
│                                                                          │
│ Final Grade: 80 / 100 PTS (STATUS: PASSED ✅)                            │
│ Generating cryptographically signed digital certificate... [ Spinner ● ] │
│                                                                          │
│ [ Proceeding to Certificate Showcase in 3 seconds... ]                   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 6.5: Exam Passed & Official Digital Certificate Showcase
> **Tương ứng User Flow:** Sub-flow 2.1 (US-06.02)  
> **URL:** `/certificates/CF-CERT-2026-8891A`  
> **Topology:** Digital Credential Showcase with Cryptographic Badges & Sharing Tools

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [LOGO]  Paths   Rooms   CTF Arena   Certifications [ACTIVE]                          [AVT Alex Nguyen] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🎉 CONGRATULATIONS ALEX NGUYEN! YOU PASSED THE CAPSTONE EXAM WITH 80/100 PTS                          │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  CYBERFORCE INSTITUTE OF PRACTICAL CYBERSECURITY                                                │  │
│  │                                                                                                  │  │
│  │  THIS IS TO OFFICIALLY CERTIFY THAT                                                              │  │
│  │                                ALEX NGUYEN                                                       │  │
│  │                                                                                                  │  │
│  │  HAS SUCCESSFULLY DEMONSTRATED PRACTICAL MASTERY IN OFFENSIVE SECURITY & HANDS-ON EXPLOITATION:  │  │
│  │                                                                                                  │  │
│  │               CERTIFIED OFFENSIVE WEB ASSOCIATE (CF-OWA)                                         │  │
│  │                                                                                                  │  │
│  │  Certificate ID:  CF-CERT-2026-8891A            Issue Date: September 20, 2026                   │  │
│  │  Practical Score: 80 / 100 PTS (Distinction)    Verification Status: Cryptographically Signed ✓ │  │
│  │                                                                                                  │  │
│  │  ┌──────────┐   Key Signature: SHA-256 / RSA-4096 Validated                                      │  │
│  │  │  QR CODE │   Accreditation Authority: CyberForce Examination Board                            │  │
│  │  │  VERIFY  │                                                                                    │  │
│  │  └──────────┘   Scan QR or verify at: https://cyberforce.io/verify/CF-CERT-2026-8891A            │  │
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                        │
│ SHARING & CREDENTIAL ACTIONS:                                                                          │
│ ┌───────────────────────────┐  ┌───────────────────────────┐  ┌──────────────────────────────────────┐ │
│ │ [ 📥 DOWNLOAD PDF (4K) ]  │  │ [ 🔗 ADD TO LINKEDIN ]    │  │ [ 📋 COPY PUBLIC VERIFICATION LINK ] │ │
│ └───────────────────────────┘  └───────────────────────────┘  └──────────────────────────────────────┘ │
│                                                                                                        │
│ Verified Practical Competencies:                                                                       │
│ • Advanced SQL Injection & Second-Order Exploitation    • Server-Side Template Injection (SSTI)        │
│ • Internal Network Lateral Movement & Port Forwarding   • Linux Privilege Escalation via SUID & Sudo   │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

* **Điểm nhấn UX/UI:**
  * **Chứng chỉ PDF 4K sắc nét:** Tải về để in ấn hoặc nộp hồ sơ xin việc.
  * **Nút `[Add to LinkedIn]` 1-Click:** Điền sẵn Organization Name, Credential Name, Issue Date, và Credential URL.
  * **Mã QR trực quan:** Quét bằng điện thoại dẫn thẳng tới cổng tra cứu công khai.

---

## Wireframe 6.6: Exam Not Passed Remediation & 14-Day Cooldown Retake Scheduler
> **Tương ứng User Flow:** Sub-flow 2.2 (US-06.02)  
> **Topology:** Constructive Skill-Gap Analysis & Cooldown Timer

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ CAPSTONE EXAMINATION RESULTS // CF-OWA-2026-9912                                                       │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ STATUS: NOT PASSED THIS ATTEMPT                                                                        │
│ Scored: 55 / 100 PTS (Passing Threshold: 70 PTS)                                                       │
│                                                                                                        │
│ "Practical cybersecurity is demanding. Every attempt sharpens your tradecraft."                        │
├─────────────────────────────────────────────┬──────────────────────────────────────────────────────────┤
│ SKILL GAP ANALYSIS // KNOWLEDGE DEBRIEF     │ 14-DAY COOLDOWN RETAKE POLICY                            │
├─────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│ [✓] Web Application Reconnaissance (20/20)  │ RETAKE REGISTRATION OPENS IN:                            │
│     Mastered finding hidden endpoints.      │ ┌────────────────────────┐                               │
│                                             │ │   ⏱️ 13 DAYS 22 HOURS   │ (Available: Oct 04, 2026)     │
│ [✓] Initial Foothold & User Access (20/20)  │ └────────────────────────┘                               │
│     Flawless execution on DMZ Target.       │                                                          │
│                                             │ Policy: 14-day interval ensures candidates have adequate │
│ [✗] Linux Privilege Escalation (0/20)       │ time to remediate skills before re-evaluating.           │
│     Struggled with SUID misconfigurations.  │                                                          │
│     Recommended: Review Room 22 & Room 24.  │ Reminder Notification:                                   │
│                                             │ ┌──────────────────────────────────────────────────────┐ │
│ [✗] Lateral Movement & Internal Pivot (15/40│ │ [ 🔔 Email Me as Soon as Retake Window Opens ]       │ │
│     SSH tunnel broke before DC conquest.    │ └──────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────┴──────────────────────────────────────────────────────────┤
│ [ 🚀 Launch Targeted Remediation Room: Room 22 ]                     [ ← Return to Learning Dashboard ]│
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
* **No Dead End:** Học viên không bị bỏ rơi khi thi trượt; được chỉ rõ mảng kiến thức yếu (Privilege Escalation & Lateral Movement), cung cấp link ôn tập tức thì và nút đăng ký email nhắc ngày thi lại.

---

## Wireframe 6.7: Public Certificate Verification Portal
> **Tương ứng User Flow:** Sub-flow 3.1 (US-06.03)  
> **URL:** `https://cyberforce.io/verify`  
> **Topology:** Universal Public Credential Lookup (No Login Required)

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [CYBERFORCE LOGO]  ACCREDITATION PORTAL                         [ For Employers & Academic Partners ]  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                        │
│                     OFFICIAL CREDENTIAL VERIFICATION ENGINE                                            │
│                                                                                                        │
│       Verify the authenticity, practical exam score, and cryptographic signature of any                │
│       CyberForce Certified Practitioner in real-time.                                                  │
│                                                                                                        │
│       ENTER CERTIFICATE ID (E.G. CF-CERT-2026-8891A):                                                  │
│       ┌────────────────────────────────────────────────────────────────────────┐                       │
│       │ CF-CERT-2026-8891A                                                     │                       │
│       └────────────────────────────────────────────────────────────────────────┘                       │
│       ┌────────────────────────────────────────────────────────────────────────┐                       │
│       │ [ 🔍 VERIFY CREDENTIAL AUTHENTICITY ]                                  │                       │
│       └────────────────────────────────────────────────────────────────────────┘                       │
│                                                                                                        │
│       Or simply scan the QR code located on the bottom left of any official PDF certificate.           │
│                                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 6.8: Verification Results Display (Authentic vs Revoked)
> **Tương ứng User Flow:** Sub-flow 3.2 (US-06.03)  
> **Topology:** Dual State Result Cards (Official Green vs Warning Red)

### Result A: Chứng chỉ Chính hãng & Hợp lệ (Verified Authentic)
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🟢 CERTIFICATE AUTHENTICITY CONFIRMED // CYBERFORCE VERIFICATION REGISTRY                              │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Status: ACTIVE & VALID CREDENTIAL ✓                             Accreditation Hash: sha256:e83921...   │
│                                                                                                        │
│ CANDIDATE & ACCREDITATION DETAILS:                                                                     │
│ • Credential Title:     Certified Offensive Web Associate (CF-OWA)                                     │
│ • Recipient Name:       Alex Nguyen                                                                    │
│ • Certificate Code:     CF-CERT-2026-8891A                                                             │
│ • Issue Date:           September 20, 2026 (Valid Indefinitely)                                        │
│ • Exam Evaluation:      80 / 100 Points (12-Hour Hands-on Practical Lab)                               │
│ • Cryptographic Anchor: RSA-4096 Signature Verified against CyberForce Root CA                         │
│                                                                                                        │
│ [ 📥 Download Verified Audit Copy (PDF) ]                                [ Share Verification Link ]   │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Result B: Chứng chỉ Không hợp lệ hoặc Bị thu hồi (Revoked / Fraudulent)
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🔴 WARNING: INVALID OR REVOKED CREDENTIAL // REGISTRY ALERT                                            │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Status: REVOKED / UNVERIFIED ✗                                  Alert Code: ERR_CERT_INVALID_OR_REVOKED│
│                                                                                                        │
│ REASON FOR REVOCATION / FAILURE:                                                                       │
│ The credential code "CF-CERT-2026-FAKE1" either does not exist in our central database, or was         │
│ permanently REVOKED by the CyberForce Examination Board due to an Academic Integrity Violation         │
│ (Flag Sharing / Plagiarism).                                                                           │
│                                                                                                        │
│ If you are an employer reviewing an applicant's CV with this credential, please contact our           │
│ verification registry immediately:                                                                     │
│ 📧 Email: verification@cyberforce.io   │   📞 Hotline: +84 (0) 28 8899 7788                             │
│                                                                                                        │
│ [ 🔍 Search Another Certificate Code ]                                      [ Return to Home ]         │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Verification & Hand-off Checklist cho Epic 6

- [x] **Trực quan hóa điều kiện tiên quyết:** Cổng kiểm tra 100% Lộ trình trước khi mở nút thi.
- [x] **Cam kết Honor Code:** Modal quy chế phòng thi bắt buộc xác nhận trước khi bộ đếm 12h kích hoạt.
- [x] **Chấm điểm tự động 100%:** Giao diện thi chấm trực tiếp qua cờ, cập nhật tức thì thanh điểm `40/100 PTS`.
- [x] **Cấp chứng chỉ & Tra cứu công khai:** Chứng chỉ số có mã `CF-CERT-YYYY-XXXXX`, mã QR quét thẳng vào cổng tra cứu `verify.cyberforce.io` mà không cần tài khoản đăng nhập.
- [x] **Xử lý trượt văn minh:** Phân tích lỗ hổng kỹ năng chi tiết, bộ đếm lùi 14 ngày thi lại và nút đăng ký nhắc email.
- [x] **Tài liệu lưu trữ chính thức:** Đã ghi nhận đầy đủ tại [`docs/06-user-flow/EPIC_06_WIREFRAMES_CAPSTONE_EXAMS_CERTIFICATES.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/06-user-flow/EPIC_06_WIREFRAMES_CAPSTONE_EXAMS_CERTIFICATES.md).
