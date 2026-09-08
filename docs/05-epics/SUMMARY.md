# 📚 Danh Mục Epics & User Stories - Nền Tảng Đào Tạo An Ninh Mạng CyberForce

> **Vai trò:** Agile Product Owner & QA Lead  
> **Cơ sở đối soát:** [PRD_CYBERFORCE.md](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/01-product/PRD_CYBERFORCE.md) & [TDD_CYBERFORCE.md](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/02-architecture/TDD_CYBERFORCE.md)  
> **Quy chuẩn kiểm thử:** BDD Acceptance Criteria (Given - When - Then)  
> **Thư mục lưu trữ:** `docs/05-epics/`

---

## 🎯 Tổng quan Backlog Theo Epic

| Mã Epic | Tên Epic | Số Lượng User Stories | Phạm Vi Phát Hành (Milestones) | Tệp Tin Chi Tiết |
| :--- | :--- | :---: | :---: | :--- |
| **Epic 1** | Quản lý Định danh, Hồ sơ Năng lực & Phân quyền (RBAC) | 4 Stories | Phase 1 (MVP Launch) | [EPIC_01_USER_IDENTITY_PROFILES_RBAC.md](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/05-epics/EPIC_01_USER_IDENTITY_PROFILES_RBAC.md) |
| **Epic 2** | Lộ trình Học tập Chuẩn hóa & Phòng học Tương tác | 4 Stories | Phase 1 (MVP Launch) | [EPIC_02_LEARNING_PATHS_INTERACTIVE_ROOMS.md](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/05-epics/EPIC_02_LEARNING_PATHS_INTERACTIVE_ROOMS.md) |
| **Epic 3** | Hạ tầng Cloud Lab Không Cài đặt & Thực hành Trên Web | 4 Stories | Phase 1 (MVP) & Phase 2 | [EPIC_03_ZERO_SETUP_CLOUD_LAB.md](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/05-epics/EPIC_03_ZERO_SETUP_CLOUD_LAB.md) |
| **Epic 4** | Cổng Kết nối Mạng Riêng Ảo An toàn (WireGuard VPN) | 3 Stories | Phase 2 (Cloud Range) | [EPIC_04_SECURE_VPN_ACCESS_GATEWAY.md](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/05-epics/EPIC_04_SECURE_VPN_ACCESS_GATEWAY.md) |
| **Epic 5** | Đấu trường CTF & Đối kháng Thời gian thực KotH Arena | 4 Stories | Phase 2 (CTF) & Phase 3 (KotH) | [EPIC_05_CTF_COMPETITIONS_KOTH_ARENA.md](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/05-epics/EPIC_05_CTF_COMPETITIONS_KOTH_ARENA.md) |
| **Epic 6** | Khảo thí Thực hành Độc lập & Cấp Chứng chỉ Số | 3 Stories | Phase 3 (Capstone & Certs) | [EPIC_06_CAPSTONE_EXAMS_DIGITAL_CERTIFICATES.md](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/05-epics/EPIC_06_CAPSTONE_EXAMS_DIGITAL_CERTIFICATES.md) |
| **Epic 7** | Gamification, Chuỗi Ngày Học & Biểu đồ Radar 8 Trục | 3 Stories | Phase 1 & Phase 2 | [EPIC_07_GAMIFICATION_STREAKS_SKILL_RADAR.md](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/05-epics/EPIC_07_GAMIFICATION_STREAKS_SKILL_RADAR.md) |
| **Epic 8** | Xưởng Sáng tạo Bài Lab & Phân tích Năng lực Doanh nghiệp | 3 Stories | Phase 1 (CMS) / Phase 2 & 3 | [EPIC_08_LAB_CREATOR_STUDIO_ANALYTICS.md](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/05-epics/EPIC_08_LAB_CREATOR_STUDIO_ANALYTICS.md) |

---

## 📋 Danh Sách Chi Tiết Toàn Bộ User Stories (Traceability Matrix)

### Epic 1: User Identity, Profiles & Granular RBAC
- **US-01.01**: Đăng ký & Đăng nhập 1-Click qua GitHub/Google OAuth2
- **US-01.02**: Đăng ký / Đăng nhập qua Email & Mật khẩu kèm JWT + Rate Limiting
- **US-01.03**: Hồ sơ Năng lực Cá nhân Công khai (Public Profile & Portfolio)
- **US-01.04**: Quản lý Phân quyền RBAC & Xét duyệt Creator / Instructor

### Epic 2: Structured Learning Paths & Interactive Rooms
- **US-02.01**: Khám phá & Ghi danh Lộ trình Học tập (Learning Paths Catalog)
- **US-02.02**: Không gian Học tập Tương tác Toàn diện (All-in-One Split-Pane Room)
- **US-02.03**: Công cụ Chấm cờ Động & Tự động Chống Gian lận (Flag Validation Engine)
- **US-02.04**: Hệ thống Gợi ý Bậc thang & Lời giải Chi tiết (Tiered Hint System)

### Epic 3: Zero-Setup Cloud Lab & In-Browser Practice
- **US-03.01**: Khởi chạy Máy mục tiêu Tức thì (1-Click Target Machine Spawner)
- **US-03.02**: Quản lý Vòng đời Thuê máy & Thu hồi Tự động (Lease Manager & Reaper Daemon)
- **US-03.03**: Truy cập Giao diện Kali AttackBox Trên Trình duyệt (In-Browser Guacamole Stream)
- **US-03.04**: Trình Dòng lệnh Web Terminal Nhúng Cô Lập (Embedded xterm.js Sandbox)

### Epic 4: Secure VPN Access Gateway
- **US-04.01**: Khởi tạo & Tải Cấu hình VPN Cá nhân (WireGuard / OpenVPN Profile)
- **US-04.02**: Giám sát Trạng thái Kết nối VPN Thời gian Thực (Live VPN Health Indicator)
- **US-04.03**: Cô lập Mạng Client-to-Client & Chặn Quét Mạng Trái phép (Client Isolation & Anti-Pivot)

### Epic 5: CTF Competitions & Real-Time King of the Hill (KotH) Arena
- **US-05.01**: Tham gia Đấu trường King of the Hill (KotH Match Lifecycle & Tick Engine)
- **US-05.02**: Giám sát SLA Dịch vụ & Cơ chế Tự Phục hồi Máy chủ (Service Auto-Heal Daemon)
- **US-05.03**: Chống Phá hoại Hệ thống & Kỷ luật Vi phạm KotH (Anti-Sabotage & Disciplinary)
- **US-05.04**: Thi đấu Jeopardy CTF & Tính điểm Suy giảm Động (Dynamic Decay Scoring)

### Epic 6: Practical Capstone Exams & Verifiable Digital Certificates
- **US-06.01**: Tham gia Kỳ thi Khảo thí Thực hành Độc lập (Hands-on Capstone Exam Session)
- **US-06.02**: Cấp Chứng chỉ Kỹ thuật số Có Chữ ký Số Mật mã (Cryptographically Signed PDF)
- **US-06.03**: Cổng Tra cứu & Xác thực Chứng chỉ Công khai (Public Certificate Verification Portal)

### Epic 7: Gamification, Streaks & 8-Axis Skill Radar
- **US-07.01**: Ghi nhận Chuỗi Ngày Học Liên tục & Hệ số Thưởng (Daily Streak System)
- **US-07.02**: Cập nhật & Biểu diễn Biểu đồ Năng lực 8 Trục (8-Axis Cyber Radar)
- **US-07.03**: Hệ thống Thăng tiến Cấp bậc & Bộ sưu tập Huy hiệu (Rank Tier Progression)

### Epic 8: Lab Creator Studio & University/Enterprise Analytics
- **US-08.01**: Hệ thống Quản trị Nội dung Admin CMS Tập trung (Phase 1 Content Management)
- **US-08.02**: Trình Soạn thảo Bài Lab Trực quan cho Giảng viên (Phase 2 Creator Studio)
- **US-08.03**: Báo cáo Phân tích Lỗ hổng Kỹ năng Doanh nghiệp / Đại học (Phase 3 Skill Gap Matrix)
