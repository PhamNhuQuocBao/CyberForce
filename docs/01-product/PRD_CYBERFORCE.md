# 📋 CyberForce (CyberForge) - Product Requirements Document (PRD)

> **Document Owner:** Product Management Team (PM / PO / BA)  
> **Status:** Approved / Ready for Engineering Handoff  
> **Version:** 2.0.0 (Refactored to Standard Separation of Concerns)  
> **Core Focus:** **WHAT** to build and **WHY** (Business & User Voice)  
> **Target Technical Specification:** See [TDD_CYBERFORCE.md](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/02-architecture/TDD_CYBERFORCE.md) for technical architecture, database schemas, and API designs.

---

## 📑 MỤC LỤC (TABLE OF CONTENTS)

1. [Executive Summary & Vision](#1-executive-summary--vision)
2. [Problem Statement & Market Gap](#2-problem-statement--market-gap)
3. [Business Goals, OKRs & Success Metrics (KPIs)](#3-business-goals-okrs--success-metrics-kpis)
4. [Target Personas & Empathy Map](#4-target-personas--empathy-map)
5. [End-to-End User Journeys](#5-end-to-end-user-journeys)
6. [Product Scope & MoSCoW Prioritization](#6-product-scope--moscow-prioritization)
7. [Functional Requirements & Epics (with Gherkin Acceptance Criteria)](#7-functional-requirements--epics)
   - [Epic 1: User Identity, Profiles & Granular RBAC](#epic-1-user-identity-profiles--granular-rbac)
   - [Epic 2: Structured Learning Paths & Interactive Rooms](#epic-2-structured-learning-paths--interactive-rooms)
   - [Epic 3: Zero-Setup Cloud Lab & In-Browser Practice](#epic-3-zero-setup-cloud-lab--in-browser-practice)
   - [Epic 4: Secure VPN Access Gateway](#epic-4-secure-vpn-access-gateway)
   - [Epic 5: CTF Competitions & Real-Time King of the Hill (KotH) Arena](#epic-5-ctf-competitions--real-time-king-of-the-hill-koth-arena)
   - [Epic 6: Practical Capstone Exams & Verifiable Digital Certificates](#epic-6-practical-capstone-exams--verifiable-digital-certificates)
   - [Epic 7: Gamification, Streaks & 8-Axis Skill Radar](#epic-7-gamification-streaks--8-axis-skill-radar)
   - [Epic 8: Lab Creator Studio & University/Enterprise Analytics](#epic-8-lab-creator-studio--universityenterprise-analytics)
8. [Business Rules, Policies & Edge Cases](#8-business-rules-policies--edge-cases)
9. [User Experience (UX) Principles & Information Architecture](#9-user-experience-ux-principles--information-architecture)
10. [Non-Functional Requirements (Product & User Perspective)](#10-non-functional-requirements-product--user-perspective)
11. [Out-of-Scope (Boundaries for v1 Launch)](#11-out-of-scope-boundaries-for-v1-launch)
12. [Assumptions, Risks & Product Dependencies](#12-assumptions-risks--product-dependencies)
13. [Product Release Milestones](#13-product-release-milestones)

---

## 1. Executive Summary & Vision

### 1.1. Tầm nhìn Sản phẩm (Product Vision)

**CyberForce** là nền tảng đào tạo an ninh mạng tương tác toàn diện, tích hợp **Cloud Cyber Range**, đấu trường đối kháng thời gian thực (**KotH/CTF**) và hệ thống **khảo thí cấp chứng chỉ số thực hành**.

Sứ mệnh của CyberForce là **xóa bỏ hoàn toàn rào cản kỹ thuật tiếp cận (Zero-Friction)** cho người học, chuyển hóa việc học lý thuyết an ninh mạng khô khan thành trải nghiệm thực hành trực tiếp, thi đấu đối kháng và công nhận năng lực bằng chứng chỉ có giá trị thực tiễn cao.

```
          ┌─────────────────────────────────────────────────────────┐
          │                    CYBERFORCE PILLARS                   │
          └─────────────────────────────────────────────────────────┘
                    │                      │                      │
        ┌───────────▼──────────┐ ┌─────────▼──────────┐ ┌─────────▼──────────┐
        │  ZERO-SETUP PRACTICE │ │  REAL-TIME ARENA   │ │ VERIFIABLE CERTS   │
        │ - In-browser Kali    │ │ - King of the Hill │ │ - Hands-on Exams   │
        │ - 1-Click Sandbox    │ │ - Dynamic CTF      │ │ - Public Verify    │
        │ - WireGuard Tunnel   │ │ - Live Leaderboard │ │ - LinkedIn Badges  │
        └──────────────────────┘ └────────────────────┘ └────────────────────┘
```

---

## 2. Problem Statement & Market Gap

| Vấn đề Hiện tại (Pain Points)                   | Tác động Tiêu cực                                                                                     | Giải pháp Đột phá của CyberForce                                                                                 |
| :---------------------------------------------- | :---------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **Rào cản cài đặt môi trường (Setup Friction)** | Người mới mất từ 3-6 giờ cài máy ảo, card mạng NAT, ISO Kali $\rightarrow$ 45% bỏ cuộc ngay tuần đầu. | **Thực hành 1-Click:** Khởi chạy Kali Linux & máy mục tiêu trực tiếp trên tab trình duyệt trong $< 3$ giây.      |
| **Học tập thụ động & thiếu lộ trình**           | Học qua video/tài liệu tĩnh, thiếu phản hồi tức thì và không có hướng dẫn từng bước.                  | **Task-Based Interactive Rooms:** Học đến đâu thực hành gõ lệnh đến đó, kèm hệ thống gợi ý và tự động chấm điểm. |
| **Nạn gian lận / Share Flag**                   | Các giải CTF và bài tập thường bị chia sẻ đáp án tĩnh lên mạng/Discord.                               | **Dynamic Flag Engine:** Mỗi người dùng nhận một mã cờ duy nhất được sinh động theo phiên.                       |
| **Thiếu môi trường đối kháng thời gian thực**   | Chỉ có bài tập tĩnh cá nhân, thiếu kỹ năng phản xạ chiến đấu thực tế (Red vs Blue).                   | **King of the Hill (KotH):** Đấu trường đối kháng 45 phút, liên tục tấn công, chiếm quyền và gia cố phòng thủ.   |
| **Chứng chỉ thiếu giá trị thực hành**           | Chứng chỉ trắc nghiệm lý thuyết dễ học vẹt, nhà tuyển dụng khó tin tưởng.                             | **Hands-on Capstone Exams:** Bài thi thực hành thực chiến 6h-24h trong mạng cô lập + Cổng tra cứu công khai.     |

---

## 3. Business Goals, OKRs & Success Metrics (KPIs)

### 3.1. Mục tiêu Kinh doanh & Sản phẩm (OKRs)

```mermaid
mindmap
  root((CyberForce OKRs))
    Objective 1: Tiếp cận & Tăng trưởng
      KR 1.1: Đạt 10,000 học viên đăng ký sau 3 tháng
      KR 1.2: Tỷ lệ kích hoạt lab đạt trên 75%
    Objective 2: Trải nghiệm & Giữ chân
      KR 2.1: Tỷ lệ hoàn thành ít nhất 1 Learning Path đạt 35%
      KR 2.2: Weekly Active Users WAU đạt trên 40%
      KR 2.3: NPS Net Promoter Score trên 60
    Objective 3: Uy tín & Chứng nhận
      KR 3.1: 500+ Chứng chỉ Capstone được chia sẻ trên LinkedIn
      KR 3.2: 5+ Trường Đại học / Doanh nghiệp sử dụng thí điểm
```

### 3.2. Bảng Chỉ số Hiệu quả Trọng yếu (KPIs)

| Chỉ số (Metric)                   | Định nghĩa & Công thức                                        | Mục tiêu MVP      | Mục tiêu 6 Tháng  |
| :-------------------------------- | :------------------------------------------------------------ | :---------------- | :---------------- |
| **Time-to-First-Lab (TTFL)**      | Thời gian từ lúc đăng ký đến khi gõ lệnh đầu tiên trên lab    | $< 2$ phút        | $< 60$ giây       |
| **Lab Start Success Rate**        | Tỷ lệ phiên máy lab khởi chạy thành công không lỗi            | $\ge 99.0\%$      | $\ge 99.8\%$      |
| **Daily Streak Retention**        | Tỷ lệ người học duy trì chuỗi học tập $\ge 7$ ngày            | $\ge 20\%$        | $\ge 35\%$        |
| **KotH Match Engagement**         | Số lượng trận đấu đối kháng được tổ chức mỗi tuần             | $\ge 50$ trận     | $\ge 300$ trận    |
| **Certificate Verification Rate** | Lượt truy cập tra cứu chứng chỉ từ bên ngoài (nhà tuyển dụng) | $\ge 2$ lượt/cert | $\ge 5$ lượt/cert |

---

## 4. Target Personas & Empathy Map

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 CYBERFORCE PERSONAS                                    │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ Alex (Student / Beginner)│ Victor (CTF / Red Team)  │ Elena (SOC Analyst / Blue Team)  │
│ "Em muốn học pentest     │ "Tôi muốn đấu trường đối │ "Tôi cần bài lab thực tế về điều │
│ nhưng máy em yếu không   │ kháng thời gian thực để  │ tra log SIEM, phát hiện mã độc   │
│ cài nổi VMware."         │ thử lửa kỹ năng."        │ và ứng phó sự cố."              │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ David (Lab Creator)      │ Sarah (Enterprise Admin) │                                  │
│ "Tôi muốn công cụ soạn   │ "Tôi cần báo cáo trực    │                                  │
│ bài tập và chấm điểm lab │ quan về năng lực và lỗ   │                                  │
│ tự động cho sinh viên."  │ hổng kỹ năng của team."  │                                  │
└──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```

### Chi tiết Hồ sơ Persona

#### 1. Alex - Người học mới bắt đầu (Primary Persona)

- **Đặc điểm:** Sinh viên CNTT / Người chuyển ngành, máy tính cấu hình cơ bản, kiến thức mạng/Linux còn hạn chế.
- **Mục tiêu:** Học an ninh mạng từ con số 0, có lộ trình bài bản, thực hành ngay trên trình duyệt mà không bị lỗi môi trường.
- **Nỗi sợ:** Lạc trong tài liệu lý thuyết, lỗi cấu hình mạng máy ảo không ai sửa giúp, nản chí khi gặp bài quá khó.

#### 2. Victor - CTF Competitor & Pentester (Secondary Persona)

- **Đặc điểm:** Có kiến thức Web/Binary/Network, thường tham gia các giải CTF, thích leo rank và tranh tài.
- **Mục tiêu:** Chơi các phòng lab thực tế, tham gia phòng đối kháng King of the Hill, rèn luyện kỹ năng tốc độ và leo rank.
- **Nỗi sợ:** Máy lab giật lag, đề thi bị lộ flag từ trước, phòng chơi mất tính công bằng do cheat/bot.

#### 3. Elena - Chuyên viên Phòng thủ SOC / Incident Response

- **Đặc điểm:** Đã đi làm hoặc định hướng Blue Team, quan tâm đến phân tích lưu lượng mạng, log sự kiện và săn tìm mối đe dọa (Threat Hunting).
- **Mục tiêu:** Môi trường lab cung cấp sẵn SIEM (Splunk/ELK), traffic mẫu và kịch bản tấn công thực tế để diễn tập phòng thủ.

#### 4. David - Giảng viên / Chuyên gia Sáng tạo Nội dung

- **Đặc điểm:** Giảng viên đại học hoặc chuyên gia an ninh mạng muốn chia sẻ kiến thức và tạo bài tập cho học viên.
- **Mục tiêu:** Soạn giáo trình bằng Markdown trực quan, cấu hình máy mục tiêu dễ dàng, tự động chấm điểm bài nộp.

#### 5. Sarah - Quản lý Đào tạo Doanh nghiệp & Đại học (B2B Persona)

- **Đặc điểm:** Trưởng phòng nhân sự/đào tạo hoặc Trưởng khoa CNTT cần nâng cao chất lượng nguồn nhân lực an ninh mạng.
- **Mục tiêu:** Quản lý danh sách lớp học/nhân viên, giao bài theo tiến độ và xem ma trận kỹ năng (Skill Gap Analysis).

---

## 5. End-to-End User Journeys

```mermaid
journey
    title Hành trình Người dùng Toàn diện trên CyberForce
    section 1. Onboarding
      Đăng ký tài khoản 1-Click: 5: Alex, Victor
      Làm bài khảo sát trình độ ban đầu: 4: Alex
      Hệ thống đề xuất Lộ trình phù hợp: 5: Alex
    section 2. Thực hành & Tiếp thu
      Mở phòng Lab "Web Exploitation": 5: Alex
      Bật In-Browser Kali AttackBox: 5: Alex
      Thực hiện khai thác & đọc gợi ý khi tắc: 4: Alex
      Nộp Flag & Nhận EXP + Streak: 5: Alex
    section 3. Tranh tài & Đối kháng
      Tải file VPN WireGuard cá nhân: 5: Victor
      Tham gia trận KotH 45 phút: 5: Victor
      Chiếm quyền root & Giữ King Token: 5: Victor
      Xem bảng điểm cập nhật từng 60s: 5: Victor
    section 4. Khảo thí & Công nhận
      Đăng ký thi Capstone Exam 12h: 4: Alex, Victor
      Vượt qua bài thi thực hành: 5: Alex
      Nhận Chứng chỉ số & Mã QR: 5: Alex
      Chia sẻ chứng chỉ lên LinkedIn: 5: Alex
```

---

## 6. Product Scope & MoSCoW Prioritization

### 6.1. Bảng Phân bổ Tính năng theo MoSCoW

| Nhóm Tính năng            | MUST HAVE (Giai đoạn 1 - MVP)                                                                                                       | SHOULD HAVE (Giai đoạn 2)                                                                                               | COULD HAVE (Giai đoạn 3)                                                                                  | WON'T HAVE (v1 Launch)                  |
| :------------------------ | :---------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- | :-------------------------------------- |
| **Xác thực & Người dùng** | - OAuth2 Google/GitHub<br>- Email/Password + JWT<br>- Phân quyền RBAC cơ bản                                                        | - 2FA (TOTP Authenticator)<br>- Quản lý phiên đăng nhập                                                                 | - SSO SAML cho Doanh nghiệp<br>- Đăng nhập qua Web3 ví                                                    | - Đăng nhập bằng sinh trắc học thiết bị |
| **LMS & Nội dung**        | - Lộ trình học (Learning Paths)<br>- Phòng lab tương tác (Rooms/Tasks)<br>- Trình hiển thị Markdown/MDX<br>- Chấm cờ Static & Regex | - Hệ thống gợi ý có trừ điểm<br>- Tự động mở Walkthrough khi xong                                                       | - Tích hợp AI Tutor hỗ trợ học tập<br>- Bình luận & Thảo luận phòng học                                   | - Trình tạo video bài giảng tự động     |
| **Môi trường Thực hành**  | - Khởi tạo Docker Lab 1-Click<br>- Web Terminal nhúng (xterm.js)<br>- Thời hạn thuê lab 60 phút + nút gia hạn                       | - WireGuard VPN Gateway<br>- Kali AttackBox trên trình duyệt<br>- Dynamic Salted Flags<br>- MicroVMs cho Rootkit/Kernel | - Kịch bản mạng đa mục tiêu (Multi-node Range)<br>- Snapshot & Rollback trạng thái máy                    | - Giả lập phần cứng IoT chuyên dụng     |
| **Thi đấu & Arena**       | - Bảng xếp hạng điểm EXP toàn cầu                                                                                                   | - Jeopardy CTF Engine<br>- Dynamic Decay Scoring<br>- Đóng băng Scoreboard giải đấu                                     | - Đấu trường King of the Hill (KotH)<br>- Tick Engine tính điểm thời gian thực<br>- Chế độ Attack-Defense | - Giải đấu thực tế ảo VR Cyber Arena    |
| **Khảo thí & Chứng chỉ**  | - Theo dõi tiến độ hoàn thành lộ trình                                                                                              | - Kỳ thi Capstone thực hành 6h-12h<br>- Sinh chứng chỉ PDF có mã QR<br>- Cổng tra cứu `verify.cyberforce.io`            | - OpenBadges & 1-Click LinkedIn<br>- Thu hồi & Tái cấp chứng chỉ                                          | - Giám thị thi bằng AI quét khuôn mặt   |
| **Quản trị & B2B**        | - Dashboard quản trị viên CRUD nội dung                                                                                             | - Lab Creator Studio cơ bản                                                                                             | - Cổng Doanh nghiệp & Đại học<br>- Skill Gap Analytics Matrix                                             | - Tích hợp hệ thống tính lương HR       |

---

## 7. Functional Requirements & Epics

### Epic 1: User Identity, Profiles & Granular RBAC

#### 1.1. Mục tiêu

Cung cấp giải pháp nhận dạng an toàn, nhanh chóng và phân quyền chặt chẽ theo vai trò người dùng trong hệ sinh thái.

#### 1.2. Danh sách User Stories & Tiêu chuẩn Nghiệm thu (Gherkin)

##### User Story 1.1: Đăng ký & Đăng nhập 1-Click

> **Là một** người dùng mới,  
> **Tôi muốn** đăng ký/đăng nhập nhanh bằng GitHub hoặc Google OAuth2,  
> **Để** tôi có thể truy cập bài học ngay mà không cần qua nhiều bước xác minh email phiền toái.

```
Feature: One-Click Authentication
  Scenario: Đăng ký thành công lần đầu qua GitHub
    Given Người dùng chưa có tài khoản trên CyberForce
    When Người dùng nhấn nút "Continue with GitHub" trên trang Đăng ký
    And Chấp thuận quyền truy cập email và profile từ GitHub
    Then Hệ thống tạo tài khoản mới với vai trò "Student"
    And Tự động khởi tạo hồ sơ học viên (Rank: Novice, EXP: 0, Streak: 1 ngày)
    And Đăng nhập thành công và điều hướng đến Dashboard
```

##### User Story 1.2: Hồ sơ Năng lực Cá nhân (Public Profile)

> **Là một** học viên,  
> **Tôi muốn** có trang hồ sơ cá nhân công khai hiển thị thành tích, huy hiệu, chuỗi ngày học và biểu đồ radar kỹ năng,  
> **Để** tôi có thể đưa vào CV giới thiệu bản thân với nhà tuyển dụng.

```
Feature: Public Profile
  Scenario: Khách truy cập xem hồ sơ công khai của học viên
    Given Học viên "quocbao" đã bật chế độ "Public Profile"
    When Khách truy cập vào đường dẫn "/user/quocbao"
    Then Trang hiển thị Avatar, Cấp bậc (Rank Tier), Tổng điểm EXP
    And Hiển thị Biểu đồ Radar năng lực 8 trục
    And Hiển thị danh sách Huy hiệu (Badges) và Chứng chỉ đã đạt được
```

---

### Epic 2: Structured Learning Paths & Interactive Rooms

#### 2.1. Mục tiêu

Tổ chức nội dung học tập theo lộ trình chuẩn hóa, chia nhỏ bài học thành các Task ngắn gọn kết hợp lý thuyết và câu hỏi thực hành có phản hồi tức thì.

#### 2.2. Danh sách User Stories & Tiêu chuẩn Nghiệm thu

##### User Story 2.1: Duyệt & Theo dõi Lộ trình học (Learning Path Flow)

> **Là một** người học,  
> **Tôi muốn** theo dõi tiến độ hoàn thành lộ trình (ví dụ: "Pre-Security" 65%),  
> **Để** tôi biết mình đang ở đâu và cần làm gì tiếp theo.

```
Feature: Learning Path Progress
  Scenario: Mở khóa phòng học tiếp theo khi hoàn thành phòng tiên quyết
    Given Học viên đã hoàn thành 100% các Task trong Room "Linux Basics 1"
    When Học viên quay lại trang Lộ trình "Linux Fundamentals"
    Then Trạng thái Room "Linux Basics 2" chuyển từ "Locked" sang "Available"
    And Thanh tiến độ của Lộ trình tăng tương ứng theo tỷ lệ trọng số
```

##### User Story 2.2: Hệ thống Gợi ý Bậc thang (Tiered Hint System)

> **Là một** học viên gặp bế tắc khi giải một câu hỏi thực hành,  
> **Tôi muốn** mở gợi ý theo từng nấc với mức trừ điểm minh bạch,  
> **Để** tôi có thể tiếp tục bài học mà vẫn giữ được tính thử thách.

```
Feature: Tiered Hints
  Scenario: Học viên mở gợi ý có trừ điểm
    Given Câu hỏi có giá trị thưởng tối đa là 50 EXP và có 2 mức gợi ý (mỗi mức trừ 10 EXP)
    When Học viên nhấn "Show Hint 1" và xác nhận
    Then Gợi ý mức 1 hiển thị nội dung hướng dẫn
    And Điểm thưởng tối đa của câu hỏi cập nhật còn 40 EXP
    And Gợi ý mức 2 vẫn ở trạng thái ẩn cho đến khi có yêu cầu tiếp theo
```

---

### Epic 3: Zero-Setup Cloud Lab & In-Browser Practice

#### 3.1. Mục tiêu

Cung cấp môi trường thực hành ảo hóa cô lập, khởi tạo tức thì chỉ với 1 cú click chuột và tương tác hoàn toàn trên trình duyệt.

#### 3.2. Danh sách User Stories & Tiêu chuẩn Nghiệm thu

##### User Story 3.1: Khởi chạy Máy mục tiêu tức thì (Instant Target Spawner)

> **Là một** học viên đang làm bài thực hành,  
> **Tôi muốn** nhấn nút "Start Machine" và có máy mục tiêu sẵn sàng trong vòng dưới 3 giây,  
> **Để** tôi bắt đầu thao tác tấn công/khám phá ngay lập tức.

```
Feature: Instant Target Spawner
  Scenario: Khởi chạy thành công máy mục tiêu
    Given Học viên đang ở phòng lab "Web SQL Injection"
    When Nhấn nút "Start Machine"
    Then Nút chuyển sang trạng thái "Starting..." và hoàn tất trong $< 3$ giây
    And Giao diện hiển thị: Địa chỉ IP nội bộ của máy (ví dụ: `10.10.24.5`), thời gian thuê còn lại `60:00`
    And Nút "Start Machine" chuyển thành "Stop Machine" và xuất hiện nút "+1 Hour"
```

##### User Story 3.2: Kali Linux AttackBox trên Trình duyệt

> **Là một** học viên không có máy trạm Linux,  
> **Tôi muốn** mở giao diện đồ họa Kali Linux trực tiếp trên tab trình duyệt,  
> **Để** tôi sử dụng các công cụ Burp Suite, Nmap, Metasploit mà không cần cài đặt phần mềm.

```
Feature: In-Browser AttackBox
  Scenario: Tương tác với AttackBox qua giao diện web
    Given Học viên kích hoạt "Start AttackBox"
    When Giao diện máy Kali Linux hiển thị trên trình duyệt
    Then Học viên có thể gõ lệnh trên Terminal của Kali, thao tác chuột mượt mà (độ trễ $< 80\text{ms}$)
    And Có thể sao chép/dán văn bản giữa máy cá nhân và AttackBox qua Clipboard hỗ trợ hai chiều
```

---

### Epic 4: Secure VPN Access Gateway

#### 4.1. Mục tiêu

Cho phép người dùng sử dụng máy trạm cá nhân kết nối an toàn vào hạ tầng phòng lab thông qua giao thức VPN tốc độ cao (WireGuard) hoặc OpenVPN.

#### 4.2. Danh sách User Stories & Tiêu chuẩn Nghiệm thu

##### User Story 4.1: Tải File Cấu hình VPN Cá nhân hóa

> **Là một** Pentester muốn dùng hệ điều hành máy thật,  
> **Tôi muốn** tải file cấu hình VPN WireGuard (`.conf`) hoặc OpenVPN (`.ovpn`) có chứa thông tin xác thực cá nhân,  
> **Để** tôi kết nối vào dải mạng phòng lab và ping được IP máy mục tiêu.

```
Feature: VPN Profile Download
  Scenario: Tạo và tải cấu hình WireGuard thành công
    Given Học viên đã đăng nhập và vào trang "Access & VPN"
    When Nhấn "Download WireGuard Config"
    Then Trình duyệt tự động tải về file `cyberforce-user.conf`
    And Trạng thái trên web hiển thị hướng dẫn kết nối
    And Khi học viên kích hoạt VPN trên máy cá nhân, biểu tượng trạng thái trên web chuyển sang màu xanh lá "Connected (10.8.0.42)"
```

---

### Epic 5: CTF Competitions & Real-Time King of the Hill (KotH) Arena

#### 5.1. Mục tiêu

Tạo sân chơi tranh tài hấp dẫn với 2 thể loại: Jeopardy CTF (giải câu đố theo chủ đề) và King of the Hill (đối kháng thời gian thực chiếm và giữ máy chủ).

#### 5.2. Danh sách User Stories & Tiêu chuẩn Nghiệm thu

##### User Story 5.1: Thi đấu King of the Hill (KotH Engine)

> **Là một** người chơi CTF đối kháng,  
> **Tôi muốn** tham gia phòng đấu KotH 45 phút, khai thác lỗ hổng leo quyền `root` và ghi mã định danh cá nhân vào tệp `/root/king.txt`,  
> **Để** hệ thống cộng điểm tích lũy cho tôi sau mỗi chu kỳ Tick 60 giây.

```
Feature: King of the Hill Match Lifecycle
  Scenario: Người chơi giữ cờ King và nhận điểm theo chu kỳ Tick
    Given Trận đấu KotH đang diễn ra (còn 25 phút)
    And Người chơi "ZeroDay" đã chiếm root và ghi "ZeroDay" vào `/root/king.txt`
    When Đồng hồ hệ thống chạm mốc Tick (mỗi 60 giây)
    Then Hệ thống xác thực "ZeroDay" đang giữ vị trí King và dịch vụ máy chủ vẫn sống
    And Bảng điểm trực tiếp cộng 10 điểm cho "ZeroDay"
    And Phát thông báo âm thanh và hiệu ứng visual "ZeroDay is the King!" tới tất cả người chơi
```

##### User Story 5.2: Tính điểm Động (Dynamic Decay Scoring) trong Jeopardy CTF

> **Là một** thí sinh tham gia giải CTF,  
> **Tôi muốn** điểm số của bài thi tự động giảm dần khi có nhiều người giải được,  
> **Để** đảm bảo sự công bằng và phản ánh chính xác độ khó thực tế của thử thách.

```
Feature: Dynamic Decay Scoring
  Scenario: Điểm thử thách giảm khi có thêm lượt giải thành công
    Given Thử thách "Binary Pwn 01" có điểm ban đầu là 500 điểm (1 lượt giải)
    When Có thêm 9 người giải thành công thử thách này (tổng 10 lượt)
    Then Điểm số của thử thách tự động tính toán lại giảm còn 340 điểm
    And Điểm số của tất cả 10 người đã giải trước đó tự động cập nhật về mức 340 điểm
```

---

### Epic 6: Practical Capstone Exams & Verifiable Digital Certificates

#### 6.1. Mục tiêu

Tổ chức kỳ thi thực hành toàn diện và cấp chứng chỉ số có tính xác thực cao, ngăn chặn hoàn toàn việc làm giả bằng công nghệ chữ ký số và mã QR.

#### 6.2. Danh sách User Stories & Tiêu chuẩn Nghiệm thu

##### User Story 6.1: Tham gia Kỳ thi Thực hành Độc lập (Hands-on Capstone Exam)

> **Là một** học viên chuẩn bị tốt nghiệp lộ trình,  
> **Tôi muốn** tham gia kỳ thi thực hành 12 tiếng trong môi trường mạng cô lập gồm nhiều máy mục tiêu,  
> **Để** tôi kiểm tra năng lực tổng hợp (Pivoting, Active Directory, Privilege Escalation).

```
Feature: Hands-on Capstone Exam
  Scenario: Học viên bắt đầu kỳ thi Capstone
    Given Học viên đã hoàn thành 100% các phòng học bắt buộc trong Lộ trình
    When Nhấn "Start Capstone Exam" và đồng ý với Quy chế thi
    Then Hệ thống cấp phát mạng thi riêng biệt gồm 3 máy mục tiêu
    And Bắt đầu đếm ngược thời gian làm bài 12:00:00
    And Khóa tính năng xem gợi ý và thảo luận công cộng trong suốt thời gian thi
```

##### User Story 6.2: Cấp & Tra cứu Chứng chỉ Kỹ thuật số

> **Là một** nhà tuyển dụng / Doanh nghiệp,  
> **Tôi muốn** quét mã QR trên chứng chỉ của ứng viên hoặc truy cập `https://cyberforce.io/verify/[CERT_ID]`,  
> **Để** xem chi tiết điểm số, ngày cấp, các kỹ năng đã được kiểm chứng mà không sợ bằng giả.

```
Feature: Certificate Verification Portal
  Scenario: Xác thực chứng chỉ hợp lệ
    Given Chứng chỉ có mã "CF-CERT-2026-8891A" đã được cấp cho "Nguyen Van A"
    When Nhà tuyển dụng truy cập "/verify/CF-CERT-2026-8891A"
    Then Trang hiển thị dấu tích xanh "Verified Authentic"
    And Hiển thị Họ tên: Nguyen Van A, Tên kỳ thi: Certified Offensive Pentester
    And Hiển thị Điểm số: 92/100, Ngày cấp: 08/09/2026, Chữ ký số hợp lệ
```

---

### Epic 7: Gamification, Streaks & 8-Axis Skill Radar

#### 7.1. Mục tiêu

Tạo động lực học tập liên tục thông qua cơ chế trò chơi hóa (Gamification), điểm danh hàng ngày và biểu đồ radar kỹ năng 8 khía cạnh chuyên sâu.

#### 7.2. Danh sách User Stories & Tiêu chuẩn Nghiệm thu

##### User Story 7.1: Chuỗi Ngày Học Liên tục (Daily Streak & Multiplier)

> **Là một** học viên,  
> **Tôi muốn** được ghi nhận Streak mỗi ngày khi giải ít nhất một Task,  
> **Để** tôi duy trì thói quen học tập và nhận hệ số nhân điểm EXP.

```
Feature: Daily Streak System
  Scenario: Học viên học liên tục ngày thứ 7
    Given Học viên đang có chuỗi Streak 6 ngày
    When Học viên hoàn thành ít nhất 1 Task hợp lệ trong ngày hôm nay
    Then Chuỗi Streak tăng lên 7 ngày
    And Mở khóa Huy hiệu "7-Day Warrior"
    And Kích hoạt hệ số thưởng "1.2x EXP Multiplier" cho tất cả bài tập trong 24 giờ tiếp theo
```

##### User Story 7.2: Biểu đồ Năng lực 8 Trục (8-Axis Cyber Radar)

> **Là một** học viên,  
> **Tôi muốn** theo dõi điểm số năng lực phân bổ trên 8 trục chuyên môn:
>
> 1. Web Application Security
> 2. Network Penetration Testing
> 3. Binary Exploitation & Pwn
> 4. Cryptography & PKI
> 5. Digital Forensics & Incident Response (DFIR)
> 6. Windows & Active Directory Attacks
> 7. Defensive & Blue Team / SOC
> 8. Cloud & DevSecOps
>    **Để** tôi biết rõ điểm mạnh và điểm yếu cần bổ sung của mình.

---

### Epic 8: Lab Creator Studio & University/Enterprise Analytics

#### 8.1. Mục tiêu

Cung cấp công cụ cho giảng viên biên soạn bài lab và bảng điều khiển cho doanh nghiệp/trường học quản lý học viên theo tổ chức.

#### 8.2. Danh sách User Stories & Tiêu chuẩn Nghiệm thu

##### User Story 8.1: Soạn thảo Bài Lab bằng Markdown Trực quan (Creator Studio)

> **Là một** Giảng viên / Creator,  
> **Tôi muốn** soạn thảo nội dung phòng học bằng giao diện MDX hỗ trợ xem trước (Live Preview),  
> **Để** tạo ra các bài giảng trực quan, đẹp mắt và dễ hiểu cho học viên.

##### User Story 8.2: Báo cáo Phân tích Lỗ hổng Kỹ năng (Skill Gap Matrix)

> **Là một** Quản lý Đào tạo Doanh nghiệp,  
> **Tôi muốn** xem báo cáo tổng hợp kỹ năng của toàn bộ nhân viên trong phòng ban,  
> **Để** phát hiện các mảng kiến thức còn yếu (ví dụ: Cloud Security yếu) và lên kế hoạch đào tạo bổ sung.

---

## 8. Business Rules, Policies & Edge Cases

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      CYBERFORCE BUSINESS RULES                          │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. LEASE RULE:     1 phòng lab = 60 phút cơ bản, gia hạn tối đa 3 lần   │
│ 2. REAPER RULE:    Hết hạn -> Grace period 3 phút -> Auto kill instance │
│ 3. ANTI-CHEAT:     1 tài khoản chỉ mở tối đa 1 máy lab tại một thời điểm│
│ 4. SUBMIT RATE:    Tối đa 5 lần nộp flag sai / 60 giây (Chống bruteforce│
│ 5. EXAM RULE:      Trong kỳ thi Capstone -> Khóa gợi ý, cấm đổi IP VPN │
│ 6. KOTH RULE:      Tick 60 giây -> Phải Pass SLA Service mới được điểm │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.1. Quy tắc Quản lý Phiên Máy Lab (Lab Lease Lifecycle)

1. **Giới hạn Đồng thời (Concurrency Limit):** Mỗi tài khoản người dùng thông thường chỉ được phép chạy tối đa **01 máy lab mục tiêu** và **01 AttackBox** tại một thời điểm để đảm bảo tài nguyên hệ thống.
2. **Thời hạn Thuê (Lease Duration):**
   - Mặc định mỗi máy cấp phát thời gian sống ban đầu là **60 phút**.
   - Người dùng có thể nhấn nút "+1 Hour" để gia hạn thời gian tối đa **3 lần** (tổng thời gian tối đa cho 1 phiên liên tục là 4 giờ).
3. **Cơ chế Thu hồi (Reaper Policy):**
   - Khi đồng hồ đếm ngược về `00:00`, máy chuyển sang trạng thái cảnh báo trong vòng **3 phút (Grace Period)**.
   - Nếu không có thao tác gia hạn, hệ thống tự động tiêu hủy máy và giải phóng tài nguyên.

### 8.2. Quy tắc Chấm điểm & Gợi ý (Scoring & Hint Policy)

1. **Điểm thưởng cơ bản:** Mỗi câu hỏi có mức điểm thưởng cố định hoặc tính theo Dynamic Decay.
2. **Khấu trừ điểm khi mở gợi ý:**
   - Mở Gợi ý cấp 1: Trừ $10\%$ tổng điểm câu hỏi.
   - Mở Gợi ý cấp 2: Trừ thêm $20\%$ tổng điểm câu hỏi.
   - Xem Lời giải chi tiết (Walkthrough): Điểm thưởng của câu hỏi đó sẽ bằng $0$ (chỉ phục vụ mục đích học tập).
3. **Chống dò đáp án (Brute-force Protection):**
   - Người dùng nộp sai quá 5 lần liên tiếp trong 60 giây sẽ bị tạm khóa quyền nộp bài câu hỏi đó trong 3 phút.

### 8.3. Quy tắc Đấu trường King of the Hill (KotH Arena Policy)

1. **Thời gian trận đấu:** Cố định **45 phút / trận**. Số lượng người chơi từ **4 đến 10 người/đội**.
2. **Quy tắc Tính điểm:**
   - Hệ thống Tick Engine kích hoạt mỗi **60 giây**.
   - Người chơi có tên hợp lệ trong `/root/king.txt` nhận được **+10 điểm / tick**.
3. **Quy tắc Duy trì Dịch vụ (SLA Check):**
   - Nếu người chơi phòng thủ làm sập các dịch vụ thiết yếu (ví dụ: tắt SSH, tắt Web server, chặn toàn bộ cổng mạng bằng firewall sai quy định), Tick đó bị coi là **SLA FAILED** $\rightarrow$ Không ai nhận được điểm trong tick đó.

---

## 9. User Experience (UX) Principles & Information Architecture

```mermaid
graph TD
    Root[CyberForce Platform UI]

    Root --> Nav[Top Navigation Bar]
    Nav --> Learn[Learn & Paths]
    Nav --> Practice[Practice Rooms]
    Nav --> Compete[CTF & KotH Arena]
    Nav --> Cert[Certifications]
    Nav --> Profile[User Profile & Radar]

    Practice --> RoomView[Room Interactive Workspace]
    subgraph Room Interactive Workspace Layout
        RoomView --> LeftPane[Task & Theory MDX Pane]
        RoomView --> MidPane[Questions & Flag Input]
        RoomView --> RightPane[In-Browser AttackBox / Terminal Stream]
        RoomView --> TopControl[Timer, Target IP, Start/Extend Controls]
    end
```

### 9.1. Triết lý Thiết kế UX (UX Principles)

1. **All-in-One Workspace:** Toàn bộ nội dung lý thuyết, câu hỏi nộp bài, terminal điều khiển và màn hình máy ảo đều nằm trong một giao diện duy nhất (Split-pane View), không bắt học viên phải chuyển đổi qua lại giữa nhiều cửa sổ.
2. **Dark-Mode First Cyber Aesthetic:** Giao diện tối hiện đại, đậm chất an ninh mạng với độ tương phản cao, tối ưu cho mắt khi học tập và làm bài lab nhiều giờ liên tục.
3. **Instant Visual Feedback:** Mọi thao tác đúng/sai khi nộp flag, thay đổi trạng thái máy lab, điểm số cập nhật đều có phản hồi tức thì bằng hiệu ứng vi mô (micro-interactions) và âm thanh tinh tế.

---

## 10. Non-Functional Requirements (Product & User Perspective)

| Tiêu chuẩn NFR                           | Yêu cầu từ góc độ Trải nghiệm Người dùng                                                                   | Mức độ Ưu tiên    |
| :--------------------------------------- | :--------------------------------------------------------------------------------------------------------- | :---------------- |
| **Độ trễ Khởi động (Speed)**             | Người dùng không phải chờ quá 3 giây để máy lab Docker sẵn sàng hoạt động.                                 | **P0 (Critical)** |
| **Độ mượt Màn hình (Smoothness)**        | AttackBox stream qua trình duyệt không bị giật, phản hồi chuột và bàn phím tức thì ($< 80\text{ms}$).      | **P0 (Critical)** |
| **Độ sẵn sàng (Availability)**           | Nền tảng hoạt động ổn định với thời gian Uptime tối thiểu **99.9%** (không gián đoạn giữa các giải đấu).   | **P0 (Critical)** |
| **Bảo mật & Cô lập (Safety)**            | Tuyệt đối không cho phép học viên can thiệp vào máy lab của học viên khác hoặc tấn công ra ngoài Internet. | **P0 (Critical)** |
| **Khả năng Tương thích (Compatibility)** | Chạy mượt mà trên tất cả trình duyệt hiện đại (Chrome, Firefox, Safari, Edge) trên Windows, macOS, Linux.  | **P1 (High)**     |
| **Trợ năng & Trực quan (Accessibility)** | Tuân thủ độ tương phản WCAG 2.1 AA, hỗ trợ đầy đủ phím tắt thao tác nhanh trong phòng lab.                 | **P2 (Medium)**   |

---

## 11. Out-of-Scope (Boundaries for v1 Launch)

Để đảm bảo tiến độ ra mắt bản MVP chất lượng cao đúng hạn, các tính năng sau **tạm thời nằm ngoài phạm vi phiên bản v1**:

- ❌ Hỗ trợ thiết bị phần cứng thực tế (Hardware IoT / ICS / SCADA testbeds).
- ❌ Giám thị thi bằng AI quét khuôn mặt / Eye-tracking qua webcam (ở v1 áp dụng giám sát mạng và kiểm tra báo cáo thực hành).
- ❌ Tích hợp sàn tuyển dụng tự động (Job Marketplace matching).
- ❌ Ứng dụng di động Native (iOS/Android) — v1 tập trung 100% trải nghiệm Web Responsive trên máy tính.

---

## 12. Assumptions, Risks & Product Dependencies

### 12.1. Giả định (Assumptions)

- Người dùng có đường truyền Internet ổn định với băng thông tối thiểu $5\text{ Mbps}$ khi sử dụng Web AttackBox.
- Trình duyệt người dùng hỗ trợ WebSockets và HTML5 Canvas.

### 12.2. Rủi ro Sản phẩm & Biện pháp Xử lý

| Rủi ro Sản phẩm                                             |  Khả năng  |    Mức độ    | Biện pháp Phòng ngừa & Xử lý                                                            |
| :---------------------------------------------------------- | :--------: | :----------: | :-------------------------------------------------------------------------------------- |
| **Học viên chia sẻ Flag đề thi lên mạng**                   |    Cao     |     Cao      | Áp dụng **Dynamic Flag Engine** sinh mã cờ riêng theo từng phiên người dùng.            |
| **Chi phí hạ tầng máy chủ tăng vọt do người dùng treo máy** |    Cao     |     Cao      | Triển khai **Reaper Worker** tự động tắt máy sau 60 phút nếu không có hoạt động.        |
| **Hacker lợi dụng máy lab để tấn công mạng ngoài**          | Trung bình | Nghiêm trọng | Thiết lập chính sách mạng **Zero Outbound Egress** chặn 100% traffic ra ngoài Internet. |

---

## 13. Product Release Milestones

```mermaid
gantt
    title Lộ trình Phát hành Tính năng CyberForce
    dateFormat  YYYY-MM-DD
    section Phase 1: MVP Launch
    Auth, LMS Core & Docker Spawner          :milestone, m1, 2026-10-15, 0d
    Web Terminal & Basic Leaderboard         :m2, 2026-10-30, 0d
    section Phase 2: Cloud Range & Gamification
    WireGuard VPN & Guacamole AttackBox      :milestone, m3, 2026-12-15, 0d
    Dynamic Flags & 8-Axis Skill Radar       :m4, 2026-12-30, 0d
    section Phase 3: Arena & Certifications
    King of the Hill (KotH) Live Arena       :milestone, m5, 2027-02-15, 0d
    Capstone Exam & Digital Cert Portal      :milestone, m6, 2027-03-15, 0d
```

---

_Tài liệu PRD này là tài sản chuẩn hóa của CyberForce, làm cơ sở bàn giao cho Đội ngũ Kỹ sư (Engineering) để triển khai chi tiết trong [TDD_CYBERFORCE.md](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/TDD_CYBERFORCE.md)._
