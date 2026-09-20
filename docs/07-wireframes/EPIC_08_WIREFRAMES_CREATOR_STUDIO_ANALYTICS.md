# 🖥️ EPIC 8: Wireframe Architecture & Low-Fidelity UI Specifications
## Lab Creator Studio & University/Enterprise Analytics

* **Project:** CyberForce (CyberForge) Cloud Cyber Range
* **Reference User Flow:** [`docs/06-user-flow/EPIC_08_USER_FLOW_CREATOR_STUDIO_ANALYTICS.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/06-user-flow/EPIC_08_USER_FLOW_CREATOR_STUDIO_ANALYTICS.md)
* **Reference Epic Spec:** [`docs/05-epics/EPIC_08_LAB_CREATOR_STUDIO_ANALYTICS.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/05-epics/EPIC_08_LAB_CREATOR_STUDIO_ANALYTICS.md)
* **Design Philosophy:** Tactical Cyber-HUD, High Information Density, Content Integrity & Workforce Analytics
* **Color Tokens & Aesthetic Rules:**
  - `Background`: Obsidian Void (`#070A0F`), Slate Surface (`#0D121D`, `#131B2B`)
  - `Primary Accent`: Cyber Emerald (`#10B981`) - Verification Passed, High Competency, Published Status
  - `Secondary Accent`: Electric Cyan (`#00F0FF`) - Live Preview, Code syntax, Active filters
  - `Warning / Gap`: Solar Amber (`#F59E0B`) - Pending Review, Moderate Skill Gap, Staging Dry-Run
  - `Hazard / Critical Weakness`: Crimson Alert (`#EF4444`) - Validation Error, Critical Skill Gap, Flag Mismatch
  - `Border Radius`: `0px` - `2px` (Strictly sharp tactical edges)
  - `Typography`: `JetBrains Mono` / `Inter` (Tabular figures, monospace code)
  - `Strict PURPLE BAN`: ZERO purple/violet hues anywhere.
* **Version:** 1.0.0

---

## 🎨 Design System Foundation & Administrative Tokens

| Thành phần / Token | Quy chuẩn hiển thị | Ý nghĩa kỹ thuật & Trải nghiệm (UX) |
| :--- | :--- | :--- |
| **Published / Approved** | `#10B981` (Cyber Emerald) + Icon Đĩa mềm / Tick | Trạng thái phòng học đã xác thực và phát hành công khai trên danh mục thư viện. |
| **Pending Review** | `#F59E0B` (Solar Amber) + Đồng hồ cát | Bài lab đã qua bước chạy thử nghiệm (Dry-Run), đang nằm trong hàng đợi Admin kiểm duyệt. |
| **Draft / In Progress** | Khung viền Slate `#64748B` + Đèn tín hiệu xám | Bài giảng đang được soạn thảo cục bộ, chưa gửi duyệt và được lưu tự động (Auto-draft). |
| **Dry-Run Staging Pass** | Huy hiệu Emerald `✅ Dry-Run Passed (N/N Flags)` | Đã khởi chạy máy ảo staging và tự giải đúng 100% flags; điều kiện tiên quyết để mở khóa nút gửi duyệt. |
| **Heatmap Proficiency** | Xanh `#10B981` (Vững), Vàng `#F59E0B` (Trung bình), Đỏ `#EF4444` (Lỗ hổng) | Trực quan hóa ma trận kỹ năng 8 trục cho toàn bộ nhân sự doanh nghiệp hoặc sinh viên đại học. |
| **No Dead End Escape** | Tối thiểu 2 nút điều hướng hành động | Luôn có đường thoát: lưu bản nháp, sửa cờ, giao bài tập bổ sung, hoặc xuất báo cáo. |

---

## 📐 Wireframe Index (8 Màn hình Trọng yếu)

1. [Wireframe 8.1: Platform Admin Content CMS — Room & Task Configuration Hub](#wireframe-81-platform-admin-content-cms--room--task-configuration-hub)
2. [Wireframe 8.2: Docker Container Registry Verification & Port Mapping Drawer](#wireframe-82-docker-container-registry-verification--port-mapping-drawer)
3. [Wireframe 8.3: Lab Creator Studio — Split-Pane MDX Editor & Real-Time Student View](#wireframe-83-lab-creator-studio--split-pane-mdx-editor--real-time-student-view)
4. [Wireframe 8.4: Creator Sandbox Dry-Run & Staging Verification Modal](#wireframe-84-creator-sandbox-dry-run--staging-verification-modal)
5. [Wireframe 8.5: Lab Submission Confirmation & Admin Review Queue Dashboard](#wireframe-85-lab-submission-confirmation--admin-review-queue-dashboard)
6. [Wireframe 8.6: Enterprise & University B2B Skill Gap Heatmap Matrix](#wireframe-86-enterprise--university-b2b-skill-gap-heatmap-matrix)
7. [Wireframe 8.7: Skill Gap Automated Insight Card & 1-Click Remediation Assignment Dialog](#wireframe-87-skill-gap-automated-insight-card--1-click-remediation-assignment-dialog)
8. [Wireframe 8.8: Zero-Activity Empty State for Newly Imported Cohorts](#wireframe-88-zero-activity-empty-state-for-newly-imported-cohorts)

---

## Wireframe 8.1: Platform Admin Content CMS — Room & Task Configuration Hub
> **Tương ứng User Flow:** Sub-flow 1.1 (US-08.01)  
> **URL:** `/admin/cms/rooms/new` hoặc `/admin/cms/rooms/[id]/edit`  
> **Topology:** Administrative CRUD & Validation Control Center  

### Giao diện Soạn thảo & Cấu hình Phòng học (Admin View)
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [← Back to CMS Rooms]  ADMIN CMS // CREATE PRACTICAL TRAINING ROOM                                     │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ STATUS: [ ⚪ DRAFT ] │ Last Auto-Saved: 14:22:08 │ Target Release: Phase 1 MVP Catalog                │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [1] ROOM METADATA & ACADEMIC ATTRIBUTES:                                                               │
│ Room Title:     [ Directory Traversal & LFI Exploitation                                             ] │
│ Target Path:    [ Offensive Web Associate ▼ ]    Module: [ Server-Side Vulnerabilities ▼ ]             │
│ Difficulty:     [ Medium ▼ ]                     Est. Time: [ 45 min ]    Author: [ SecOps Core Team ] │
│ Skill Tags:     [x] Web Security  [x] Linux Systems  [ ] Cloud/DevSecOps  [ ] Active Directory         │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [2] LAB INFRASTRUCTURE CONTAINER SPECIFICATION:                                                        │
│ Container Image: [ cyberforce/lab-dirtraversal:v1             ] [ 🔍 Verify Registry Image ]            │
│ Registry Status: [ ✅ Verified in ECR (Digest: sha256:7f8a...c4) ]                                     │
│ Resource Limit:  CPU: [ 1.0 Core ▼ ]  RAM: [ 1024 MB ▼ ]  Storage: [ 5 GB Eph ]                        │
│ Network Access:  Ingress: Port [ 80 ] (HTTP), Port [ 22 ] (SSH) │ Egress: [ 🔒 Zero Outbound Access ]  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [3] TASKS & FLAG VALIDATION ENGINE:                                                                    │
│                                                                                                        │
│ ┌─ Task 1: Basic Path Traversal ─────────────────────────────────────────────────────────────────────┐ │
│ │ Question: Extract the root system user list via `/etc/passwd`.                                     │ │
│ │ Flag Type: [ Static String ▼ ]  Value: [ CF{dir_trav_success_991}                                ] │ │
│ │ EXP Reward: [ 50 ] EXP   Hint 1: [ Look for `../../../../` in param ] (Penalty: -10 EXP)           │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ ┌─ Task 2: Null Byte Bypass on Legacy PHP ───────────────────────────────────────────────────────────┐ │
│ │ Question: Bypass `.php` file extension filtering using the null-byte character `%00`.              │ │
│ │ Flag Type: [ Regex Match ▼ ]    Value: [ CF\{nullbyte_[a-f0-9]{16}\}                            ] │ │
│ │ EXP Reward: [ 75 ] EXP   Hint 1: [ Use URL-encoded %00 before extension ] (Penalty: -15 EXP)       │ │
│ └────────────────────────────────────────────────────────────────────────────────────────────────────┘ │
│ [ + Add Another Task ]                                                                                 │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐  ┌────────────────────────────┐  ┌─────────────────────────┐ │
│ │ [ 💾 Save as Draft ]                 │  │ [ 🚀 Publish Room to Live ]│  │ [ ❌ Discard Changes ]   │ │
│ └──────────────────────────────────────┘  └────────────────────────────┘  └─────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Trạng thái Lỗi Kiểm tra Dữ liệu (Validation Error State):
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ VALIDATION FAILED: 2 CRITICAL ERRORS PREVENTING PUBLICATION                                         │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Container Image: [                                         ] ◄ ❌ [ Required: Docker image cannot be empty]
│ Task 1 EXP:      [ -10 ] ◄ ❌ [ EXP points must be a positive integer greater than 0 ]                 │
│                                                                                                        │
│ [ All your other entered text and configurations are 100% preserved. Correct errors to publish. ]      │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 8.2: Docker Container Registry Verification & Port Mapping Drawer
> **Tương ứng User Flow:** Sub-flow 1.1 (US-08.01)  
> **Topology:** Infrastructure Pre-flight Check Flyout Drawer  

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│ 🐳 CONTAINER IMAGE REGISTRY AUDIT & INGRESS CONFIG                          [X] │
├─────────────────────────────────────────────────────────────────────────────────┤
│ Image Query: `cyberforce/lab-dirtraversal:v1`                                   │
│ Target Registry: `us-central1-docker.pkg.dev/cyberforce-prod/labs`              │
├─────────────────────────────────────────────────────────────────────────────────┤
│ REGISTRY PROBE RESULTS:                                                         │
│ • Image Exists:     [ ✅ YES - Located in Private ECR/Artifact Registry ]       │
│ • Architecture:     [ linux/amd64 ] (Compatible with worker nodes)              │
│ • Image Size:       [ 142.4 MB (Compressed) / 380 MB (Uncompressed) ]           │
│ • Manifest Digest:  `sha256:7f8a91b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6...`        │
│ • Vulnerability:    [ Clean - Base image Alpine 3.19 hardened ]                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│ PORT INGRESS & EXPOSURE MAPPING:                                                │
│                                                                                 │
│ Container Port   Protocol    Service Mapping     Access Type                    │
│ 80               TCP         HTTP (Target Web)   In-Browser Sandbox Tab         │
│ 22               TCP         SSH (Debug Shell)   Internal Range VPN Only        │
│                                                                                 │
│ EGRESS NETWORK SECURITY POLICY:                                                 │
│ [x] Restrict all outbound traffic (Deny all egress to Public Internet)         │
│ [x] Isolate within tenant bridge network `10.10.x.0/24`                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐  ┌───────────────────────────────────┐ │
│ │ [ ✅ Confirm & Bind Image Spec ]      │  │ [ ❌ Cancel & Choose Different ]  │ │
│ └──────────────────────────────────────┘  └───────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 8.3: Lab Creator Studio — Split-Pane MDX Editor & Real-Time Student View
> **Tương ứng User Flow:** Sub-flow 2.1 (US-08.02)  
> **URL:** `/creator/studio/[lab-id]`  
> **Topology:** Real-Time Split-Pane Content Studio (Left: MDX Code / Right: Rendered Student View)  

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [← Creator Dashboard]  LAB CREATOR STUDIO // ADVANCED SSTI LAB                     │ [Auto-Saved: 14:30] [DRY-RUN: REQUIRED] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Toolbar: [ **B** ] [ *I* ] [ `Code` ] [ ```Terminal ] [ 💡 Callout ] [ 🎯 Task Block ] [ 🖼️ Upload Media ] │ [ ⟷ Reset Split ] │
├───────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────┤
│ 📝 MDX SOURCE EDITOR (LEFT COLUMN)                        │ 👁️ LIVE STUDENT PREVIEW (RIGHT COLUMN - REAL TIME)         │
├───────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ # Task 1: Jinja2 Template Injection Analysis              │ # Task 1: Jinja2 Template Injection Analysis               │
│                                                           │                                                            │
│ Server-Side Template Injection occurs when user input is  │ Server-Side Template Injection occurs when user input is   │
│ concatenated directly into a template rather than passed  │ concatenated directly into a template rather than passed   │
│ as data.                                                  │ as data.                                                   │
│                                                           │                                                            │
│ ```python                                                 │ ┌─ Python Code ──────────────────────────────────────────┐ │
│ # Vulnerable pattern in Flask                             │ │ # Vulnerable pattern in Flask                          │ │
│ output = render_template_string("Hello " + user_input)    │ │ output = render_template_string("Hello " + user_input) │ │
│ ```                                                       │ └────────────────────────────────────────────────────────┘ │
│                                                           │                                                            │
│ <Callout type="warning">                                  │ ⚠️ WARNING                                                  │
│ Never concatenate raw untrusted input into Jinja2!        │ Never concatenate raw untrusted input into Jinja2!         │
│ </Callout>                                                │                                                            │
│                                                           │ ┌─ Question 1 ───────────────────────────────────────────┐ │
│ <Task id="1" exp="100" flag="CF{jinja2_ssti_exec_491}">   │ │ Identify the template engine version running on port   │ │
│ What is the Jinja2 engine version?                        │ │ 5000.                                                  │ │
│ </Task>                                                   │ │ Flag: [ Enter flag: CF{...}             ] [ Submit ]   │ │
│                                                           │ └────────────────────────────────────────────────────────┘ │
├───────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────┤
│ ACTION CONTROLS:                                                                                                       │
│ ┌──────────────────────────┐  ┌───────────────────────────────────────┐  ┌───────────────────────────────────────────┐ │
│ │ [ 💾 Save Draft ]        │  │ [ ⚡ TEST RUN LAB (Required Sandbox) ] │  │ [ 🔒 Submit for Review (Dry-Run Req) ]    │ │
│ └──────────────────────────┘  └───────────────────────────────────────┘  └───────────────────────────────────────────┘ │
│                                                                           ▲                                            │
│                                              [Disabled & Tooltip: "You must run a test session and solve all flags"]   │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 8.4: Creator Sandbox Dry-Run & Staging Verification Modal
> **Tương ứng User Flow:** Sub-flow 2.2 (US-08.02)  
> **Topology:** Mandatory Sandbox Testing Modal (Quality & Solvability Enforcement)  

### State A: Đang chạy máy thử nghiệm & Giải cờ (In-Progress Dry-Run)
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ 🧪 CREATOR SANDBOX DRY-RUN // MANDATORY QUALITY GATE                 [X] │
├──────────────────────────────────────────────────────────────────────────┤
│ Staging Lab: `cyberforce/lab-ssti-jinja:v1` (Isolated Staging Pod)       │
│ Machine Status: [ 🟢 RUNNING (Assigned IP: 10.10.88.14) ]                 │
├──────────────────────────────────────────────────────────────────────────┤
│ CRITICAL SOLVABILITY CHECKLIST:                                          │
│ You must personally exploit your target and verify all 2 flags before    │
│ your lab can be submitted for Platform Admin review.                     │
│                                                                          │
│ ┌─ Task 1 Verification ────────────────────────────────────────────────┐ │
│ │ Expected Flag: `CF{jinja2_ssti_exec_491}`                            │ │
│ │ Input Test Flag: [ CF{jinja2_ssti_exec_491}         ] [ Verify Flag] │ │
│ │ Status: [ ✅ VERIFIED - FLAG MATCHES REGISTERED SPECIFICATION ]       │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ ┌─ Task 2 Verification ────────────────────────────────────────────────┐ │
│ │ Expected Flag: Regex `CF\{rce_bypass_[a-z0-9]{8}\}`                  │ │
│ │ Input Test Flag: [ CF{wrong_test_flag}              ] [ Verify Flag] │ │
│ │ Status: [ ❌ MISMATCH - Input string does not match regex rule ]      │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────┤
│ Overall Verification: 1 / 2 Flags Verified (Incomplete)                  │
│ [■■■■■■■■■■■■■■■■■■■■■■■■■■□□□□□□□□□□□□□□□□□□□□□□□] 50% Verified         │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐  ┌────────────────────────────┐ │
│ │ [ 🔄 Re-test Task 2 Flag ]           │  │ [ ✏️ Edit Flag Config ]    │ │
│ └──────────────────────────────────────┘  └────────────────────────────┘ │
│                    [ Terminate Sandbox Session ]                         │
└──────────────────────────────────────────────────────────────────────────┘
```

### State B: Hoàn thành kiểm thử 100% (Mở khóa nút Submit for Review)
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ 🎉 DRY-RUN QUALITY ASSURANCE PASSED! (2/2 FLAGS VERIFIED)            [X] │
├──────────────────────────────────────────────────────────────────────────┤
│ Staging Audit Log:                                                       │
│ • Container boot time: 2.8 seconds                                       │
│ • Port 5000 HTTP responsiveness: 200 OK (Clean)                          │
│ • All task proofs solved and cryptographically checked                   │
├──────────────────────────────────────────────────────────────────────────┤
│ ✅ QUALITY SEAL GRANTED:                                                 │
│ Your lab has proven solvable and stable in the isolated sandbox.         │
│ The "Submit for Review" button has been UNLOCKED on your editor.         │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────────────┐ │
│ │ [ 🚀 SUBMIT LAB TO ADMIN REVIEW QUEUE ]                              │ │
│ └──────────────────────────────────────────────────────────────────────┘ │
│                   [ Keep Editing / Return to Studio ]                    │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 8.5: Lab Submission Confirmation & Admin Review Queue Dashboard
> **Tương ứng User Flow:** Sub-flow 2.2 & Sub-flow 1.1 (US-08.02)  
> **URL:** `/creator/labs` & `/admin/cms/queue`  
> **Topology:** Submission Receipt Modal & Admin Operational Review Queue  

### Creator View: Xác nhận gửi bài thành công
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ 📬 LAB SUBMITTED FOR CURRICULUM REVIEW                               [X] │
├──────────────────────────────────────────────────────────────────────────┤
│ Lab Title: Advanced Jinja2 SSTI & RCE Bypasses                           │
│ Submission ID: `SUB-2026-0920-881` │ Status: [ 🟡 PENDING_REVIEW ]       │
├──────────────────────────────────────────────────────────────────────────┤
│ REVIEW WORKFLOW TIMELINE:                                                │
│ 1. Automated Syntax & Container Security Scan   [ ✅ Passed (0 sec ago) ]│
│ 2. Platform Admin Rigor & Pedagogy Review       [ ⏳ In Queue (Est: 48h)]│
│ 3. Published to Public Catalog                  [ ⚪ Pending Approval ]  │
├──────────────────────────────────────────────────────────────────────────┤
│ Notification Preference:                                                 │
│ You will receive an email and system notification once our technical     │
│ review team completes evaluation.                                        │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐  ┌────────────────────────────┐ │
│ │ [ 📊 Return to Creator Dashboard ]   │  │ [ ➕ Create Another Lab ]  │ │
│ └──────────────────────────────────────┘  └────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### Admin View: Hàng đợi Phê duyệt Bài giảng (`/admin/cms/queue`)
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🛡️ PLATFORM ADMIN CMS // LAB CURRICULUM REVIEW QUEUE                                                   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Filter Queue: [ All Pending (3) ▼ ]  [ High Priority ▼ ]  Search: [ Search author, lab title...      ] │
├───────┬───────────────────────────────┬──────────────┬──────────────┬──────────────┬───────────────────┤
│ ID    │ Lab Title                     │ Creator      │ Dry-Run Pass │ Submitted    │ Actions           │
├───────┼───────────────────────────────┼──────────────┼──────────────┼──────────────┼───────────────────┤
│ #104  │ Advanced Jinja2 SSTI & RCE    │ @quocbao_sec │ ✅ 2/2 Flags │ 14 mins ago  │ [ Review Lab → ]  │
│ #103  │ Active Directory Kerberoasting│ @hacker_pro  │ ✅ 3/3 Flags │ 2 hours ago  │ [ Review Lab → ]  │
│ #102  │ AWS IAM Privilege Escalation  │ @cloud_guru  │ ✅ 1/1 Flags │ 1 day ago    │ [ Review Lab → ]  │
├───────┴───────────────────────────────┴──────────────┴──────────────┴──────────────┴───────────────────┤
│ MODERATION DETAIL PANEL (SELECTED: #104):                                                              │
│ • Container Digest: `sha256:7f8a91b2c3d4...` [ Clean / Vulnerability Free ]                            │
│ • MDX Content Word Count: 1,420 words │ Tasks: 2 │ Total EXP: 175 EXP                                  │
│                                                                                                        │
│ ┌─────────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────────────────────────┐ │
│ │ [ ✅ APPROVE & PUBLISH ] │  │ [ 💬 REQUEST REVISIONS ]│  │ [ ❌ REJECT WITH DETAILED REASONS ]        │ │
│ └─────────────────────────┘  └─────────────────────────┘  └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 8.6: Enterprise & University B2B Skill Gap Heatmap Matrix
> **Tương ứng User Flow:** Sub-flow 3.1 (US-08.03)  
> **URL:** `/b2b/analytics/skills`  
> **Topology:** Enterprise 8-Axis Competency Heatmap & Departmental Matrix  

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏢 ENTERPRISE TALENT INTELLIGENCE // VIETCOMBANK CYBER DEFENSE ACADEMY                                 │ [Phase 3 B2B] │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Organization: Vietcombank Head Office │ Plan: Enterprise Tier │ Active Seats: 42 / 50 │ Contract Renewal: Dec 2027    │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Scope Selector:                                                                                                        │
│ Division: [ Cyber Security Center (CSC) ▼ ]  Team: [ SOC Tier 1 Analysts (15 Members) ▼ ]  Cohort: [ Q3-2026 Batch ]   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 🗺️ 8-AXIS SKILL GAP HEATMAP MATRIX (15 ANALYSTS):                                                                     │
│ Legend:  [ ■ High: 75-100 ] Cyber Emerald    [ ■ Mod: 40-74 ] Solar Amber    [ ■ Critical Gap: 0-39 ] Crimson Alert    │
├────────────────────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬───────────────┬──────────────────────────┤
│ Member Name        │ Web  │ Net  │ Pwn  │ Cryp │ DFIR │ WinAD│ Blue │Cloud │ Overall Avg   │ Certification Status     │
├────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼───────────────┼──────────────────────────┤
│ 1. Nguyen Van A    │  85  │  78  │  32  │  60  │  92  │  80  │  88  │  25  │ 67.5 (Mod)    │ CF-SOC Certified         │
│ 2. Tran Thi B      │  90  │  82  │  45  │  70  │  95  │  85  │  92  │  20  │ 72.3 (High)   │ CF-SOC Certified         │
│ 3. Le Hoang C      │  65  │  60  │  20  │  40  │  70  │  62  │  75  │  15  │ 50.8 (Mod)    │ Enrolled in CF-OWA       │
│ 4. Pham Duc D      │  75  │  70  │  25  │  55  │  80  │  74  │  82  │  30  │ 61.3 (Mod)    │ None                     │
│ ... (11 more)      │  ..  │  ..  │  ..  │  ..  │  ..  │  ..  │  ..  │  ..  │ ...           │ ...                      │
├────────────────────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼──────┼───────────────┼──────────────────────────┤
│ 📊 TEAM AVERAGE    │  78  │  72  │  28  │  58  │  88  │  76  │  84  │  24  │ 63.5 / 100    │ Team Read: High Blue/DFIR│
│ Benchmark Delta    │ +8%  │ +2%  │ -22% │ -2%  │ +18% │ +6%  │ +14% │ -46% │ Target: ≥75   │ ⚠️ Severe Cloud Deficit  │
├────────────────────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴──────┴───────────────┴──────────────────────────┤
│ ┌──────────────────────────────────────┐  ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ [ 📥 Export Executive PDF Report ]   │  │ [ 📊 Export Raw Matrix CSV (Compatible with Workday / SAP SuccessFactors)]│ │
│ └──────────────────────────────────────┘  └──────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 8.7: Skill Gap Automated Insight Card & 1-Click Remediation Assignment Dialog
> **Tương ứng User Flow:** Sub-flow 3.1 (US-08.03)  
> **Topology:** AI/Rule-based Insight Callout & Cohort Bulk Assignment Modal  

### Thẻ Phân tích Lỗ hổng Kỹ năng Tự động (Insight Card on Dashboard)
```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ ⚠️ CRITICAL SKILL GAP DETECTED // AUTOMATED TALENT INTELLIGENCE                                        │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Finding: `Cloud & DevSecOps` is currently the severe vulnerability spot for SOC Tier 1 Analysts.       │
│ Metrics: Team Average: 24 / 100 │ 73.3% of team members (11/15) score below the Enterprise Baseline.  │
│ Business Risk: Unable to triage AWS GuardDuty and Kubernetes API anomaly alerts effectively.           │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ 💡 RECOMMENDED REMEDIATION CURRICULUM:                                                                 │
│ Path: "Cloud Penetration Testing & Defense Associate (CF-CPTD)"                                        │
│ • Modules: AWS IAM Exploits, Kubernetes RBAC, Serverless Auditing (Est: 20 Hours per analyst)          │
│                                                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐                                 │
│ │ [ ⚡ ASSIGN REMEDIATION PATH TO ENTIRE TEAM (15 ANALYSTS) ]          │                                 │
│ └────────────────────────────────────────────────────────────────────┘                                 │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Hộp thoại Phân bổ Lộ trình Đào tạo Bổ sung (Bulk Assignment Modal)
```text
┌──────────────────────────────────────────────────────────────────────────┐
│ 🎯 ASSIGN REMEDIATION CURRICULUM TO COHORT                           [X] │
├──────────────────────────────────────────────────────────────────────────┤
│ Curriculum: Cloud Penetration Testing & Defense (CF-CPTD)                │
│ Target Cohort: SOC Tier 1 Analysts (15 Seats)                            │
├──────────────────────────────────────────────────────────────────────────┤
│ ASSIGNMENT PARAMETERS:                                                   │
│ Due Date:             [ 31 / 10 / 2026 ▼ ] (6 Weeks Duration)            │
│ Mandatory Level:      [ (•) Required Compliance   ( ) Recommended Study ]│
│ Passing Benchmark:    [ 80% Room Clear Rate Required ]                   │
│ Notification:         [x] Dispatch personalized email to 15 analysts     │
│ Manager Weekly Digest:[x] Send progress summary to secops-leads@vcb.com  │
├──────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐  ┌────────────────────────────┐ │
│ │ [ 🚀 Confirm & Assign to 15 Seats ]  │  │ [ ❌ Cancel ]              │ │
│ └──────────────────────────────────────┘  └────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Wireframe 8.8: Zero-Activity Empty State for Newly Imported Cohorts
> **Tương ứng User Flow:** Sub-flow 3.2 (US-08.03)  
> **Topology:** Friendly Empty State with Zero-Division Mathematical Protection  

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏢 ENTERPRISE TALENT INTELLIGENCE // COHORT DASHBOARD                                                  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Selected Cohort: [ HUST Cyber Security Class 2026-A (30 Students) ▼ ]                                  │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                        │
│                                      ╔═════════════════════════╗                                       │
│                                      ║        🎓 🛡️ 🎓        ║                                       │
│                                      ║    COHORT INITIALIZED   ║                                       │
│                                      ╚═════════════════════════╝                                       │
│                                                                                                        │
│                     NO ACTIVITY DATA RECORDED YET FOR THIS COHORT (30 SEATS)                           │
│     All 30 student accounts have been provisioned successfully, but no lab tasks have been             │
│     submitted yet. All 8 skill axes safely initialize at 0/100 without mathematical distortion.        │
│                                                                                                        │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ZERO-ACTIVITY RADAR / HEATMAP INTEGRITY PREVIEW:                                                       │
│ • Web: 0/100  • Net: 0/100  • Pwn: 0/100  • Cryp: 0/100                                                │
│ • DFIR: 0/100 • WinAD: 0/100• Blue: 0/100 • Cloud: 0/100                                               │
│ Status: Mathematical Guard Active (Zero-Division Safe / Zero NaN Glitches Guarantee)                   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ GET STARTED WITH THIS COHORT:                                                                          │
│                                                                                                        │
│ ┌──────────────────────────────────────┐  ┌──────────────────────────────────────────────────────────┐ │
│ │ [ 🎯 Assign Foundational Onboarding ]│  │ [ ✉️ Dispatch Welcome & Login Emails to 30 Students ]   │ │
│ └──────────────────────────────────────┘  └──────────────────────────────────────────────────────────┘ │
│                 [ 📁 Import More Students via CSV ]    [ ← Back to Cohorts List ]                      │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 UX & Accessibility Verification Matrix (No Dead End & Reliability)

| Màn hình / Tính năng | Trường hợp biên & Rủi ro | Giải pháp thiết kế & Xử lý | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- |
| **Admin Room CMS** | Admin gõ nhầm điểm âm hoặc để trống Docker Image rồi nhấn Publish. | Form validation chặn submit, bôi đỏ các ô bị lỗi kèm giải thích ngắn gọn; toàn bộ văn bản MDX và câu hỏi đã soạn được giữ nguyên 100% trong bộ nhớ nháp. | Nút "Save as Draft" cho phép lưu lại để tìm tên Docker image sau. |
| **Creator Studio Split-Pane** | Giảng viên có màn hình máy tính nhỏ hoặc độ phân giải thấp. | Khung soạn thảo và khung preview hỗ trợ nút chuyển đổi thu gọn (1-column toggle) hoặc thanh trượt điều chỉnh tỷ lệ độ rộng (`⟷ Reset Split`). | Luôn có thể phóng to toàn màn hình khung preview để kiểm tra giao diện học viên. |
| **Sandbox Dry-Run Gate** | Creator cố tình bấm nút "Submit for Review" khi chưa hoàn thành giải thử nghiệm. | Nút Submit bị disabled mờ; khi hover vào hiển thị tooltip giải thích rõ: Cần bấm "Test Run Lab" và nộp đúng cờ 100% trước. | Có nút "Test Run Lab" màu cam nổi bật ngay cạnh để kích hoạt thử nghiệm tức thì. |
| **B2B Skill Gap Heatmap** | Lớp học mới tinh (30 sinh viên) chưa giải bài nào $\rightarrow$ Nguy cơ lỗi chia cho 0 (`NaN / ZeroDivisionError`). | Xử lý an toàn tại cấp độ dữ liệu: render trạng thái mặc định `0/100` gọn gàng; đồ họa biểu đồ hiển thị polygon tối giản. | Màn hình Empty State truyền cảm hứng kèm 2 nút hành động trực tiếp: "Giao lộ trình nhập môn" và "Gửi email kích hoạt". |
| **Enterprise B2B Export** | Doanh nghiệp yêu cầu định dạng dữ liệu tương thích hệ thống quản trị nhân sự nội bộ (HRIS / LMS). | Cung cấp song song 2 định dạng: Bản PDF in màu cao cấp để trình Ban Giám Đốc và tệp CSV thô chứa định danh nhân viên để import vào SAP/Workday. | Luôn có bản xem trước báo cáo trên trình duyệt trước khi tải xuống. |
