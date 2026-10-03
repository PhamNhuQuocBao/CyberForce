# 📋 CyberForce - Kế Hoạch Phân Rã Công Việc & Nhiệm Vụ (Task Breakdown & Work Breakdown Structure)

> **Document Owner:** Project Planning Agent (`@project-planner`)  
> **Status:** Approved / Ready for Execution  
> **Version:** 1.0.0  
> **Traceability References:**
> - Product Requirements: [`docs/01-product/PRD_CYBERFORCE.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/01-product/PRD_CYBERFORCE.md)
> - Technical Design: [`docs/02-architecture/TDD_CYBERFORCE.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/02-architecture/TDD_CYBERFORCE.md)
> - Git & Branch Conventions: [`docs/03-guidelines/GIT_GUIDELINES.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/03-guidelines/GIT_GUIDELINES.md)
> - Epics & User Stories: [`docs/05-epics/SUMMARY.md`](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/05-epics/SUMMARY.md) (EPIC_01 to EPIC_08)
> - User Journeys & Flows: `docs/06-user-flow/`
> - UI Wireframes & Design Specs: `docs/07-wireframes/`

---

## 1. Tổng Quan & Mục Tiêu (Overview & Strategic Objectives)

### 1.1. Bối cảnh & Mục đích
**CyberForce** là nền tảng đào tạo an ninh mạng tương tác toàn diện, tích hợp **Cloud Cyber Range**, đấu trường đối kháng thời gian thực (**KotH/CTF**) và hệ thống **khảo thí cấp chứng chỉ số thực hành**.

Tài liệu này thực hiện việc **phân rã công việc (Work Breakdown Structure - WBS)** từ tài liệu đặc tả sản phẩm (PRD), kiến trúc kỹ thuật (TDD), 8 bộ Epic chi tiết, User Flows và Wireframes thành các nhiệm vụ cụ thể, có khả năng thực thi, kiểm thử độc lập và phân bổ đúng vai trò chuyên môn theo chuẩn quy trình phần mềm.

### 1.2. Loại hình Dự án & Phân loại Agent (Project Classification)
- **Project Type:** **FULLSTACK WEB & CLOUD INFRASTRUCTURE (HYBRID)**
  - Frontend: Next.js 14 (App Router, TypeScript, Tailwind CSS, Shadcn UI, xterm.js, Guacamole Client).
  - Backend API: Go (Golang) / NestJS (TypeScript), REST OpenAPI + WebSocket.
  - Orchestration & Virtualization: Go Docker SDK, Firecracker KVM, WireGuard Kernel Gateway, Apache Guacamole `guacd`.
  - Database & Caching: PostgreSQL 16 (JSONB), Redis 7.2 (Pub/Sub & Sorted Sets), MinIO Object Storage.
- **Quy tắc phân bổ Agent:**
  - `database-architect`: Thiết kế CSDL, Schema Migration, Indexing, Data integrity.
  - `backend-specialist`: Viết API REST, Logic nghiệp vụ, WebSocket, Worker Daemons.
  - `frontend-specialist`: Giao diện Web, Tương tác component, State Management, Terminal canvas.
  - `security-auditor`: Cơ chế Auth (OAuth2, JWT), RBAC, Network Isolation (eBPF/iptables), Anti-abuse.
  - `devops-engineer`: Docker Compose, Traefik Ingress, WireGuard VPN, CI/CD pipelines, K8s/VM node orchestration.
  - `test-engineer`: Unit testing, Integration testing, E2E Playwright, SLA verification.

---

## 2. Tiêu Chuẩn Nghiệm Thu & Quy Chuẩn Thực Hiện (Definition of Done & Conventions)

### 2.1. Quy chuẩn Đặt tên Nhánh & Commit (theo `GIT_GUIDELINES.md`)
- **Branch Pattern:** `<prefix>/CF-<ticket-id>-<kebab-case-description>`
  - Ví dụ: `feature/CF-01-oauth2-auth`, `feature/CF-15-docker-spawner`, `fix/CF-22-koth-tick-race`
- **Conventional Commits:** `<type>(<scope>): <short summary>` (ví dụ: `feat(auth): add OAuth2 GitHub & Google login flow`)

### 2.2. Tiêu chí Hoàn thành Mỗi Task (Definition of Done - DoD)
Mỗi Task bắt buộc tuân theo quy tắc:
1. **INPUT:** Dữ liệu đầu vào, tài liệu tham chiếu, phụ thuộc tiên quyết.
2. **OUTPUT:** Mã nguồn cụ thể, schema, API endpoint hoặc component hoàn thiện.
3. **VERIFY:** Lệnh kiểm thử tự động, curl test, unit test hoặc thao tác UI kiểm chứng kết quả thực tế.

---

## 3. Kiến Trúc Cây Thư Mục Dự Án Dự Kiến (Monorepo Layout)

```
CyberForge/
├── apps/
│   └── web/                                 # Next.js 14 App Router (Frontend)
│       ├── src/app/                         # Pages & Layouts
│       │   ├── (auth)/                      # Login, Register, Account Linking
│       │   ├── (dashboard)/                 # User Dashboard, Profile, Radar
│       │   ├── paths/                       # Learning Paths catalog & detail
│       │   ├── rooms/[slug]/                # All-in-One Split-pane Workspace
│       │   ├── arena/                       # KotH & CTF Live Arena
│       │   ├── exams/                       # Capstone Exams
│       │   ├── verify/[code]/               # Public Certificate Verification
│       │   └── admin/                       # Admin CMS Dashboard
│       ├── src/components/                  # UI Components (Terminal, Guac, Radar, etc.)
│       └── src/lib/                         # API clients, WS connectors, hooks
├── services/
│   ├── api-core/                            # Main API Gateway & LMS Service (Go/NestJS)
│   │   ├── src/modules/auth/                # OAuth2, JWT, RBAC
│   │   ├── src/modules/learning/            # Paths, Modules, Rooms, Tasks
│   │   ├── src/modules/submissions/         # Flag verification engine
│   │   └── src/modules/gamification/        # Streaks, Badges, 8-Axis Radar
│   ├── orchestrator/                        # Go Lab Orchestration Daemon
│   │   ├── cmd/server/                      # Main daemon entrypoint
│   │   ├── pkg/docker/                      # Docker Engine SDK client
│   │   ├── pkg/network/                     # iptables / eBPF subnet manager
│   │   └── pkg/reaper/                      # 30s background lease cleaner
│   ├── koth-engine/                         # Go KotH Real-Time Tick Engine
│   │   ├── runner/                          # 60s tick loop & SLA health checker
│   │   └── arbiter/                         # Service auto-heal & anti-sabotage monitor
│   ├── vpn-gateway/                         # WireGuard manager & config generator
│   └── cert-signer/                         # Cryptographic PDF generator & RSA signer
├── infra/
│   ├── docker-compose.yml                   # Local development full-stack setup
│   ├── traefik/                             # Traefik routing, SSL, WebSocket configs
│   ├── wireguard/                           # WireGuard server & iptables configs
│   └── guacd/                               # Apache Guacamole daemon config
└── docs/                                    # Existing PRD, TDD, Epics, Flows, Wireframes
```

---

## 4. Lộ Trình Triển Khai Theo Giai Đoạn (Implementation Roadmaps)

```mermaid
gantt
    title Lộ Trình Phát Triển & Triển Khai CyberForce
    dateFormat  YYYY-MM-DD
    section Phase 0: Foundations
    Monorepo & Docker Dev Environment       :p0_1, 2026-09-23, 5d
    Database Schema & Redis Ingress Setup   :p0_2, 2026-09-28, 4d
    Design Tokens & Layout Shell            :p0_3, 2026-10-02, 4d
    section Phase 1: MVP Core (Oct 2026)
    Epic 1: Identity, Profiles & Granular RBAC :p1_1, 2026-10-06, 6d
    Epic 2: Learning Paths & Split-Pane Rooms  :p1_2, 2026-10-12, 7d
    Epic 3: Docker Sandbox & Web Terminal     :p1_3, 2026-10-19, 7d
    Epic 7: Daily Streak & Level Ranks        :p1_4, 2026-10-26, 4d
    Epic 8: Admin CMS Management Portal       :p1_5, 2026-10-30, 4d
    section Phase 2: Cloud Range (Dec 2026)
    Epic 4: WireGuard VPN Gateway & Isolation :p2_1, 2026-11-05, 8d
    Epic 3: Guacamole Web AttackBox (Kali)    :p2_2, 2026-11-13, 7d
    Epic 5: Jeopardy CTF & Dynamic Decay      :p2_3, 2026-11-20, 6d
    Epic 7: 8-Axis Multi-Tag Skill Radar      :p2_4, 2026-11-26, 5d
    section Phase 3: Arena & Certs (Mar 2027)
    Epic 5: KotH Tick Engine & Auto-Heal      :p3_1, 2026-12-01, 10d
    Epic 6: Capstone Exams & Signed Certs     :p3_2, 2026-12-11, 10d
    section Phase 4: Creator & Enterprise
    Epic 8: Creator Studio & B2B Analytics    :p4_1, 2026-12-21, 10d
    section Phase X: Verification
    End-to-End Auditing & Security Hardening  :px_1, 2027-01-05, 7d
```

---

## 5. Bảng Phân Rã Nhiệm Vụ Chi Tiết (Detailed Work Breakdown)

### 🏗️ PHASE 0: HẠ TẦNG NỀN TẢNG & MÔI TRƯỜNG PHÁT TRIỂN (FOUNDATIONS)

#### [x] Task CF-001: Khởi tạo Monorepo Workspace & Cấu hình Phát triển Cục bộ (Hoàn thành)
* **Agent:** `devops-engineer` | **Skills:** `bash-linux`, `clean-code`
* **Priority:** `P0 (Critical)` | **Dependencies:** None
* **Mô tả:** Khởi tạo cấu trúc monorepo với pnpm/npm workspaces, cấu hình TypeScript chung, ESLint, Prettier, commitlint và husky git hooks theo đúng `docs/03-guidelines/GIT_GUIDELINES.md`.
* **INPUT:** Quy chuẩn Git Guidelines, danh mục công nghệ Next.js 14, Go/NestJS.
* **OUTPUT:** Thư mục gốc dự án cấu hình xong workspaces (`apps/web`, `services/api-core`, `infra/`), git hooks chặn commit lỗi.
* **VERIFY:** Chạy `npm run lint` pass 100%, thử commit sai định dạng Conventional Commit bị chặn bởi hook.

#### [x] Task CF-002: Thiết lập Docker Compose Cụm Dịch vụ Hạ tầng (Hoàn thành)
* **Agent:** `devops-engineer` | **Skills:** `bash-linux`, `server-management`
* **Priority:** `P0 (Critical)` | **Dependencies:** CF-001
* **Mô tả:** Viết file `infra/docker-compose.yml` khởi chạy: PostgreSQL 16, Redis 7.2, MinIO S3, Apache Guacamole `guacd`, Traefik v3.0 Ingress Proxy kèm cấu hình biến môi trường chuẩn (`.env.example`).
* **INPUT:** TDD Mục 11.1 (Local Development Stack).
* **OUTPUT:** `infra/docker-compose.yml`, root `docker-compose.yml`, `.env.example`, `.env`.
* **VERIFY:** Chạy `docker compose up -d` thành công, kiểm tra `docker ps` thấy cả 5 container `Up (healthy)`.

#### [x] Task CF-003: Khởi tạo CSDL PostgreSQL & Data Dictionary Migrations (Hoàn thành)
* **Agent:** `database-architect` | **Skills:** `database-design`, `clean-code`
* **Priority:** `P0 (Critical)` | **Dependencies:** CF-002
* **Mô tả:** Thiết lập Prisma schema DDL khởi tạo các bảng: `users`, `refresh_tokens`, `learning_paths`, `rooms`, `tasks`, `questions`, `lab_instances`, `submissions`, `certificates` theo TDD Mục 4.1.
* **INPUT:** `docs/02-architecture/TDD_CYBERFORCE.md` Mục 4.1.
* **OUTPUT:** `services/api-core/prisma/schema.prisma`, seed script `services/api-core/prisma/seed.ts`.
* **VERIFY:** Chạy `pnpm --filter @cyberforce/api-core run db:push` và `db:seed` thành công, `\dt` trong PostgreSQL hiển thị đủ 9 bảng chính kèm foreign keys và dữ liệu mẫu (admin, creator, student, sample room).

#### [x] Task CF-004: Xây dựng Hệ thống Design System Tokens & Base Layout Shell (Hoàn thành)
* **Agent:** `frontend-specialist` | **Skills:** `frontend-design`, `design-spec`, `clean-code`
* **Priority:** `P1 (High)` | **Dependencies:** CF-001
* **Mô tả:** Cài đặt Tailwind CSS v3 / Shadcn UI trên `apps/web`, cấu hình bảng màu Neo-Brutalism / Soft Brutalism (Positivus Theme: `#B9FF66` Electric Lime, `#191A23` Charcoal Ink Black, `#F3F3F3` Surface, 40px Card Radius, 14px Button Radius, 0-blur hard offset shadows). Dựng khung Top Navigation và Footer.
* **INPUT:** `DESIGN.md` (v2.0.0).
* **OUTPUT:** `apps/web/src/styles/globals.css`, `tailwind.config.ts`, components `Button`, `Card`, `Badge`, `Input`, `Navbar`.
* **VERIFY:** Khởi chạy `pnpm --filter @cyberforce/web dev`, truy cập `http://localhost:3000` hiển thị giao diện Neo-Brutalist Positivus chuẩn xác với Electric Lime.

---

### 👤 PHASE 1 - EPIC 1: USER IDENTITY, PROFILES & GRANULAR RBAC

#### Task CF-101: Triển khai Đăng nhập & Đăng ký 1-Click OAuth2 (Google & GitHub)
* **Agent:** `backend-specialist` | **Skills:** `api-patterns`, `clean-code`
* **Priority:** `P0 (Critical)` | **Dependencies:** CF-003
* **Mô tả:** Xây dựng luồng OAuth2 Authorization Code với PKCE cho GitHub & Google. Xử lý logic tạo mới tài khoản với vai trò `Student`, khởi tạo hồ sơ (Novice, 0 EXP, 1 ngày Streak) theo Story `US-01.01`.
* **INPUT:** `docs/05-epics/EPIC_01_USER_IDENTITY_PROFILES_RBAC.md` (US-01.01).
* **OUTPUT:** Endpoint `/api/v1/auth/oauth/github`, `/api/v1/auth/oauth/google`, `/api/v1/auth/callback`.
* **VERIFY:** Gửi code OAuth mock từ test suite, kiểm tra bản ghi được tạo trong bảng `users` và trả về cặp JWT Access/Refresh Token.

#### Task CF-102: Xử lý Trùng Email & Luồng Liên kết Tài khoản (Account Linking)
* **Agent:** `backend-specialist` & `frontend-specialist` | **Skills:** `api-patterns`, `frontend-architecture`
* **Priority:** `P1 (High)` | **Dependencies:** CF-101
* **Mô tả:** Cài đặt cơ chế bảo vệ khi người dùng đăng nhập bằng OAuth thứ 2 trùng email tài khoản đã có. Hệ thống không tự gộp mà hiển thị thông báo và gửi mã OTP xác nhận liên kết (Sub-flow 1.2).
* **INPUT:** `docs/06-user-flow/EPIC_01_USER_FLOW_IDENTITY_PROFILES_RBAC.md` Sub-flow 1.2.
* **OUTPUT:** Endpoint `/api/v1/auth/link-account`, Modal UI "Account Linking Confirmation" trên frontend.
* **VERIFY:** Đăng ký bằng Google `test@cyberforce.io`, sau đó dùng GitHub cùng email `test@cyberforce.io` -> Hệ thống dừng lại, yêu cầu OTP và liên kết thành công sau khi nhập đúng OTP.

#### [x] Task CF-103: Đăng nhập/Đăng ký Truyền thống (Email/Password) kèm Rate Limiting & Khóa Tạm thời (Hoàn thành)
* **Agent:** `security-auditor` & `backend-specialist` | **Skills:** `api-patterns`, `clean-code`
* **Priority:** `P0 (Critical)` | **Dependencies:** CF-003
* **Mô tả:** Triển khai đăng ký/đăng nhập qua email/password sử dụng thuật toán băm Argon2id. Tích hợp Redis rate limiting: nộp sai mật khẩu 5 lần/15 phút -> tạm khóa tài khoản trong 15 phút (US-01.02, Sub-flow 1.4).
* **INPUT:** `docs/05-epics/EPIC_01_USER_IDENTITY_PROFILES_RBAC.md` (US-01.02).
* **OUTPUT:** Endpoints `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/logout`, `/api/v1/auth/me`, Redis keys `auth:failed_attempts:<email>`, `auth:blacklist:<jti>`.
* **VERIFY:** Đăng nhập sai 5 lần liên tiếp -> lần thứ 6 nhận HTTP 429 `ACCOUNT_LOCKED` kèm đếm ngược remainingSeconds; đăng nhập đúng trả về HTTP-only refresh cookie và JWT access token. Đăng xuất thu hồi refresh token và blacklist access token.

#### Task CF-104: Xây dựng Giao diện Hồ sơ Năng lực Cá nhân & Thiết lập Quyền riêng tư
* **Agent:** `frontend-specialist` | **Skills:** `frontend-design`, `clean-code`
* **Priority:** `P1 (High)` | **Dependencies:** CF-004, CF-101
* **Mô tả:** Dựng trang `/user/[username]` hiển thị Avatar, Rank tier, EXP, Badges, danh sách chứng chỉ và nút chia sẻ. Cho phép người dùng bật/tắt chế độ Public Profile (US-01.03, Wireframe 1.2).
* **INPUT:** `docs/07-wireframes/EPIC_01_WIREFRAMES_IDENTITY_PROFILES_RBAC.md` Wireframe 1.2 & 1.3.
* **OUTPUT:** Trang `apps/web/src/app/(dashboard)/user/[username]/page.tsx`, component `ProfileSettingsDialog`.
* **VERIFY:** Đăng nhập, chỉnh sửa Bio và bật Public Profile -> Mở tab ẩn danh truy cập URL công khai hiển thị chính xác thông tin.

#### Task CF-105: Phân quyền Granular RBAC & Quy trình Xét duyệt Creator
* **Agent:** `backend-specialist` & `frontend-specialist` | **Skills:** `api-patterns`, `clean-code`
* **Priority:** `P1 (High)` | **Dependencies:** CF-101
* **Mô tả:** Xây dựng middleware kiểm tra quyền RBAC (`Student`, `Creator`, `Instructor`, `Admin`). Cung cấp form gửi yêu cầu "Become a Creator" cho học viên và trang duyệt cho Admin tại `/admin/roles` (US-01.04).
* **INPUT:** `docs/05-epics/EPIC_01_USER_IDENTITY_PROFILES_RBAC.md` (US-01.04).
* **OUTPUT:** Auth Guard Middleware, API `/api/v1/roles/request-creator`, `/api/v1/admin/roles/review`.
* **VERIFY:** Học viên gửi đơn -> Admin nhấn "Approve" -> Tài khoản học viên chuyển vai trò sang `Creator`, mở khóa quyền truy cập Creator Studio.

---

### 📖 PHASE 1 - EPIC 2: STRUCTURED LEARNING PATHS & INTERACTIVE ROOMS

#### Task CF-201: Xây dựng Catalog Khám phá Lộ trình Học tập (Learning Paths)
* **Agent:** `frontend-specialist` & `backend-specialist` | **Skills:** `nextjs-react-expert`, `api-patterns`
* **Priority:** `P0 (Critical)` | **Dependencies:** CF-003, CF-004
* **Mô tả:** Triển khai trang danh mục Lộ trình học `/paths` và chi tiết lộ trình `/paths/[slug]`. Hiển thị danh sách Modules, Rooms, điều kiện tiên quyết (Prerequisites), thanh tiến độ hoàn thành theo Story `US-02.01`.
* **INPUT:** `docs/05-epics/EPIC_02_LEARNING_PATHS_INTERACTIVE_ROOMS.md` (US-02.01) & Wireframe 2.1.
* **OUTPUT:** API `/api/v1/paths`, `/api/v1/paths/:slug`, giao diện `apps/web/src/app/paths/page.tsx`.
* **VERIFY:** Truy cập `/paths`, chọn lộ trình "Web Application Security", thấy các module mở khóa theo thứ tự và các phòng chưa đủ điều kiện bị gắn cờ `Locked`.

#### Task CF-202: Phát triển Giao diện Phòng học Tương tác Tích hợp (All-in-One Split-Pane Room)
* **Agent:** `frontend-specialist` | **Skills:** `frontend-design`, `nextjs-react-expert`
* **Priority:** `P0 (Critical)` | **Dependencies:** CF-004
* **Mô tả:** Xây dựng không gian làm bài All-in-One Split-Pane tại `/rooms/[slug]` gồm: Cột trái (MDX lý thuyết + thanh điều khiển thời gian lab), Cột giữa (Danh sách câu hỏi & form nộp cờ), Cột phải (Khung Terminal xterm.js / Màn hình Guacamole) theo Wireframe 2.2.
* **INPUT:** `docs/07-wireframes/EPIC_02_WIREFRAMES_LEARNING_PATHS_ROOMS.md` Wireframe 2.2.
* **OUTPUT:** Component `apps/web/src/components/room/SplitPaneWorkspace.tsx`, tích hợp thanh chia kích thước co giãn linh hoạt (resizable pane).
* **VERIFY:** Mở phòng lab, kéo thả thanh chia kích thước mượt mà, chuyển đổi giữa chế độ Fullscreen terminal và Split-view không bị giật lag.

#### Task CF-203: Xây dựng Động cơ Chấm Cờ (Flag Validation Engine) & Chống Brute-force
* **Agent:** `backend-specialist` & `security-auditor` | **Skills:** `api-patterns`, `clean-code`
* **Priority:** `P0 (Critical)` | **Dependencies:** CF-003
* **Mô tả:** Viết API nộp bài `/api/v1/tasks/:id/submit`. Hỗ trợ 3 kiểu cờ: `static` (chuỗi cố định băm bcrypt/SHA), `regex` (mẫu biểu thức chính quy) và `dynamic_hmac` (sinh theo phiên lab). Tích hợp chặn brute-force: sai 5 lần/phút -> khóa nộp 3 phút (Story `US-02.03`).
* **INPUT:** `docs/02-architecture/TDD_CYBERFORCE.md` Mục 5.1 & 9.1.
* **OUTPUT:** Service `FlagValidatorService`, API endpoint `/api/v1/tasks/:id/submit`.
* **VERIFY:** Nộp cờ đúng -> Nhận 200 OK + cộng EXP. Nộp cờ sai 6 lần liên tiếp -> Bị khóa 3 phút với mã HTTP 429.

#### Task CF-204: Triển khai Hệ thống Gợi ý Bậc thang (Tiered Hint System) & Khấu trừ EXP
* **Agent:** `backend-specialist` & `frontend-specialist` | **Skills:** `api-patterns`, `clean-code`
* **Priority:** `P1 (High)` | **Dependencies:** CF-203
* **Mô tả:** Triển khai tính năng mở gợi ý có trừ điểm: Mức 1 trừ 10% điểm thưởng, Mức 2 trừ 20% điểm thưởng, Mở Walkthrough trừ 100% điểm thưởng (Story `US-02.04`).
* **INPUT:** `docs/05-epics/EPIC_02_LEARNING_PATHS_INTERACTIVE_ROOMS.md` (US-02.04).
* **OUTPUT:** API `/api/v1/questions/:id/hints/:tier`, popup xác nhận trừ điểm trên giao diện câu hỏi.
* **VERIFY:** Câu hỏi 50 EXP -> Nhấn mở Hint 1 -> Popup cảnh báo trừ 5 EXP -> Xác nhận -> Hint 1 hiển thị, điểm thưởng tối đa còn lại là 45 EXP.

---

### 💻 PHASE 1 - EPIC 3: ZERO-SETUP CLOUD LAB & IN-BROWSER PRACTICE (CORE DOCKER)

#### Task CF-301: Xây dựng Go Lab Orchestration Daemon (Docker Engine SDK)
* **Agent:** `backend-specialist` & `devops-engineer` | **Skills:** `bash-linux`, `server-management`, `clean-code`
* **Priority:** `P0 (Critical)` | **Dependencies:** CF-002, CF-003
* **Mô tả:** Viết daemon dịch vụ Go tương tác trực tiếp với Docker Unix Socket `/var/run/docker.sock`. Tiếp nhận yêu cầu spawn container máy mục tiêu, gán IP nội bộ thuộc subnet `100.64.0.0/10` (RFC 6598), áp dụng cgroup quotas (2 vCPU, 2GB RAM, 512 PIDs) và hủy `CapDrop: ["ALL"]` (TDD Mục 6.1).
* **INPUT:** `docs/02-architecture/TDD_CYBERFORCE.md` Mục 6.1.
* **OUTPUT:** Go Service `services/orchestrator/pkg/docker/spawner.go`, Docker isolation policy.
* **VERIFY:** Gửi API spawn lab -> Container mục tiêu khởi động thành công trong $< 3$ giây, `docker inspect` xác nhận cgroup limits chính xác.

#### Task CF-302: Triển khai Cơ chế Quản lý Vòng đời Thuê máy & Reaper Worker
* **Agent:** `backend-specialist` | **Skills:** `clean-code`
* **Priority:** `P0 (Critical)` | **Dependencies:** CF-301
* **Mô tả:** Xây dựng tiến trình quét chạy ngầm (Reaper Worker) mỗi 30 giây trong Orchestrator: Quét các phiên lab hết hạn (mặc định 60 phút, cho phép gia hạn tối đa 3 lần). Khi hết hạn cho 3 phút grace period cảnh báo trước khi tự động gọi Docker kill & cleanup IP (Story `US-03.02`).
* **INPUT:** `docs/02-architecture/TDD_CYBERFORCE.md` Mục 6.2.
* **OUTPUT:** Go Worker `services/orchestrator/pkg/reaper/sweeper.go`, API gia hạn `/api/v1/rooms/:id/extend`.
* **VERIFY:** Chạy test với phiên lab có TTL 10 giây -> Hết hạn -> Sau grace period, container bị xóa sạch khỏi `docker ps` và trạng thái trong DB đổi thành `terminated`.

#### Task CF-303: Tích hợp Web Terminal xterm.js Tương tác Trực tiếp
* **Agent:** `frontend-specialist` & `backend-specialist` | **Skills:** `frontend-architecture`, `clean-code`
* **Priority:** `P0 (Critical)` | **Dependencies:** CF-202, CF-301
* **Mô tả:** Nhúng xterm.js vào cột phải của phòng học. Kết nối 2 chiều qua Secure WebSocket tới SSH/TTY container mục tiêu. Hỗ trợ ANSI colors, sự kiện resize màn hình terminal (`TIOCSWINSZ`), phím tắt Ctrl+C, copy/paste clipboard (Story `US-03.04`).
* **INPUT:** `docs/02-architecture/TDD_CYBERFORCE.md` Mục 7.2 & Wireframe 3.1.
* **OUTPUT:** Component `apps/web/src/components/room/WebTerminal.tsx`, WebSocket handler trên Go API.
* **VERIFY:** Mở phòng lab -> Terminal xterm.js kết nối thành công, gõ lệnh `ls -la`, `whoami` trả về kết quả mượt mà, resize cửa sổ terminal tự động điều chỉnh số cột/dòng.

---

### 🔥 PHASE 1 - EPIC 7 & EPIC 8: GAMIFICATION, STREAKS & ADMIN CMS

#### Task CF-701: Triển khai Hệ thống Ghi nhận Chuỗi Ngày Học (Daily Streak) theo Múi Giờ
* **Agent:** `backend-specialist` | **Skills:** `api-patterns`, `clean-code`
* **Priority:** `P1 (High)` | **Dependencies:** CF-203
* **Mô tả:** Xây dựng logic tính Streak khi học viên giải thành công **ít nhất 01 Task mới lần đầu tiên** trong ngày tính theo `Local Timezone` của học viên (US-07.01). Giải lại task cũ không tính streak. Kích hoạt huy hiệu "7-Day Warrior" và nhân `1.2x EXP` khi đạt mốc 7 ngày.
* **INPUT:** `docs/05-epics/EPIC_07_GAMIFICATION_STREAKS_SKILL_RADAR.md` (US-07.01).
* **OUTPUT:** Service `StreakService`, cron job kiểm tra đứt streak lúc nửa đêm theo timezone, icon lửa streak trên header.
* **VERIFY:** Nộp cờ task mới lần đầu lúc 23:00 GMT+7 -> Streak tăng từ 6 lên 7 ngày, nhận badge 7-Day Warrior; nộp lại task cũ -> Streak không tăng.

#### Task CF-702: Hệ thống Thăng tiến Cấp bậc (Rank Tiers) & Bộ sưu tập Huy hiệu
* **Agent:** `backend-specialist` & `frontend-specialist` | **Skills:** `clean-code`, `frontend-design`
* **Priority:** `P2 (Medium)` | **Dependencies:** CF-701
* **Mô tả:** Thiết lập 6 bậc xếp hạng (Novice, Apprentice, Specialist, Operator, Elite, Cyber Master) tính theo tổng điểm EXP. Dựng giao diện Modal mở khóa huy hiệu (Badges) kèm âm thanh tinh tế (US-07.03).
* **INPUT:** `docs/05-epics/EPIC_07_GAMIFICATION_STREAKS_SKILL_RADAR.md` (US-07.03).
* **OUTPUT:** Bảng tính Rank Tier thresholds, Component `BadgeUnlockModal.tsx`, Audio notification sound.
* **VERIFY:** Tích lũy đủ EXP vượt ngưỡng -> Giao diện kích hoạt animation thăng cấp từ `Novice` lên `Apprentice` kèm icon huy hiệu mới.

#### Task CF-801: Xây dựng Admin CMS Quản trị Nội dung Toàn diện (Phase 1 Management)
* **Agent:** `frontend-specialist` & `backend-specialist` | **Skills:** `nextjs-react-expert`, `api-patterns`
* **Priority:** `P1 (High)` | **Dependencies:** CF-003, CF-105
* **Mô tả:** Xây dựng cổng quản trị `/admin/cms` cho Admin thực hiện CRUD: Learning Paths, Modules, Rooms, Tasks, Questions và gán cấu hình Docker Image mục tiêu (US-08.01, Wireframe 8.1).
* **INPUT:** `docs/05-epics/EPIC_08_LAB_CREATOR_STUDIO_ANALYTICS.md` (US-08.01) & Wireframe 8.1.
* **OUTPUT:** Nhóm trang `apps/web/src/app/admin/cms/**`, APIs quản trị tương ứng có bảo vệ quyền Admin.
* **VERIFY:** Admin tạo phòng lab mới với tiêu đề, nội dung MDX, Docker image `cyberforce/lab-sqli:v1` -> Phòng xuất hiện ngay lập tức trên catalog của học viên.

---

### 🌐 PHASE 2: ADVANCED CLOUD RANGE & GAMIFICATION (DECEMBER 2026)

#### Task CF-401: Thiết lập WireGuard VPN Gateway Cluster & Cấp phát Cấu hình Cá nhân
* **Agent:** `devops-engineer` & `backend-specialist` | **Skills:** `bash-linux`, `server-management`, `clean-code`
* **Priority:** `P0 (Critical)` | **Dependencies:** CF-301
* **Mô tả:** Cài đặt dịch vụ WireGuard trên server Linux. Viết API sinh cặp khóa riêng/công (Private/Public Key) và tạo file cấu hình `.conf` cho học viên với IP được chỉ định trong dải `100.64.0.0/10` (RFC 6598) để triệt tiêu hoàn toàn xung đột mạng LAN gia đình (Story `US-04.01`).
* **INPUT:** `docs/02-architecture/TDD_CYBERFORCE.md` Mục 8 & `docs/05-epics/EPIC_04_SECURE_VPN_ACCESS_GATEWAY.md`.
* **OUTPUT:** WireGuard Server Controller, API `/api/v1/vpn/config/download`, trang quản lý VPN `/access`.
* **VERIFY:** Tải file `cyberforce-user.conf`, khởi chạy `wg-quick up cyberforce-user` trên máy client -> Nhận IP ảo `100.64.10.x`, ping thông tới gateway `100.64.0.1`.

#### Task CF-402: Triển khai Chính sách Cách ly Mạng (Zero-Egress & Client-to-Client Isolation)
* **Agent:** `security-auditor` & `devops-engineer` | **Skills:** `vulnerability-scanner`, `bash-linux`
* **Priority:** `P0 (Critical)` | **Dependencies:** CF-401
* **Mô tả:** Cấu hình iptables và eBPF policies:
  1. Chặn toàn bộ kết nối ra Internet từ máy lab: `iptables -A FORWARD -s 100.64.0.0/10 ! -d 100.64.0.0/10 -j DROP`.
  2. Chặn các học viên kết nối/scan lẫn nhau: `iptables -A FORWARD -i wg0 -o wg0 -j DROP` (Story `US-04.03`).
* **INPUT:** `docs/02-architecture/TDD_CYBERFORCE.md` Mục 8.1.
* **OUTPUT:** Script `infra/wireguard/setup-iptables.sh`, Cilium eBPF network policy yaml.
* **VERIFY:** Từ máy Client A ping sang IP của Client B -> Nhận `Destination Host Unreachable` hoặc `100% packet loss`; từ máy Lab ping ra `8.8.8.8` hoặc `google.com` -> Bị chặn 100%.

#### Task CF-403: Giám sát Trạng thái VPN Thời gian Thực (Live VPN Indicator)
* **Agent:** `backend-specialist` & `frontend-specialist` | **Skills:** `api-patterns`, `nextjs-react-expert`
* **Priority:** `P2 (Medium)` | **Dependencies:** CF-401
* **Mô tả:** Tạo worker định kỳ đọc `wg show` lấy handshake timestamp của từng client peer. Gửi trạng thái qua WebSocket về giao diện web. Header hiển thị chấm xanh "Connected (100.64.10.42)" hoặc chấm đỏ "Disconnected" (Story `US-04.02`).
* **INPUT:** `docs/05-epics/EPIC_04_SECURE_VPN_ACCESS_GATEWAY.md` (US-04.02) & Wireframe 4.1.
* **OUTPUT:** WebSocket event `VPN_STATUS_CHANGE`, component `VpnStatusBadge.tsx` trên thanh TopNav.
* **VERIFY:** Bật WireGuard trên máy thật -> Trong vòng 3 giây, badge trên web chuyển sang màu xanh lá kèm địa chỉ IP thực hành.

#### Task CF-304: Tích hợp Apache Guacamole Stream Kali AttackBox trên Trình Duyệt
* **Agent:** `devops-engineer` & `frontend-specialist` | **Skills:** `server-management`, `frontend-architecture`
* **Priority:** `P1 (High)` | **Dependencies:** CF-002, CF-301
* **Mô tả:** Cấu hình cụm `guacd` daemon kết nối tới container Kali Linux qua VNC/RDP. Sử dụng `guacamole-common-js` render trực tiếp lên HTML5 Canvas với độ trễ $< 80\text{ms}$, hỗ trợ sao chép/dán clipboard 2 chiều và tùy chỉnh độ phân giải màn hình linh hoạt (Story `US-03.03`).
* **INPUT:** `docs/02-architecture/TDD_CYBERFORCE.md` Mục 7.1 & Wireframe 3.2.
* **OUTPUT:** `infra/guacd/`, component `apps/web/src/components/room/GuacamoleViewer.tsx`.
* **VERIFY:** Nhấn "Start AttackBox" -> Giao diện Kali Linux desktop hiển thị đầy đủ thanh taskbar, mở terminal Kali và chạy `nmap` bình thường qua trình duyệt.

#### Task CF-504: Triển khai Động cơ Tính Điểm Suy Giảm Động (Dynamic Decay Scoring) cho CTF
* **Agent:** `backend-specialist` | **Skills:** `api-patterns`, `clean-code`
* **Priority:** `P1 (High)` | **Dependencies:** CF-203
* **Mô tả:** Lập trình thuật toán tự động giảm điểm thử thách CTF khi số lượng người giải tăng lên: $Point = \text{Min} + (\text{Max} - \text{Min}) \times \left( \frac{\text{Decay}}{\text{Decay} + \text{Solves}} \right)$. Tự động tính toán lại điểm số cho toàn bộ người giải trước đó (Story `US-05.04`).
* **INPUT:** `docs/05-epics/EPIC_05_CTF_COMPETITIONS_KOTH_ARENA.md` (US-05.04).
* **OUTPUT:** Service `DynamicScoringService`, API `/api/v1/ctf/challenges/:id/score`.
* **VERIFY:** Thử thách ban đầu 500 điểm -> Giả lập 10 lượt giải thành công -> Điểm thử thách giảm còn 340 điểm và điểm của 10 người giải đều cập nhật về 340.

#### Task CF-703: Biểu Diễn Biểu Đồ Năng Lực 8 Trục Kỹ Năng (8-Axis Cyber Radar)
* **Agent:** `frontend-specialist` & `backend-specialist` | **Skills:** `frontend-design`, `clean-code`
* **Priority:** `P1 (High)` | **Dependencies:** CF-104, CF-203
* **Mô tả:** Xây dựng biểu đồ Radar 8 trục (Web, Network, Binary, Crypto, Forensics, Windows/AD, Defensive, Cloud/DevSecOps). Áp dụng quy tắc **Điểm tích lũy tuyệt đối (Absolute Cumulative EXP)** và hỗ trợ **Cộng điểm song song đa kỹ năng (Multi-tag Parallel Scoring)** khi giải task tích hợp (Story `US-07.02`).
* **INPUT:** `docs/05-epics/EPIC_07_GAMIFICATION_STREAKS_SKILL_RADAR.md` (US-07.02) & Wireframe 7.1.
* **OUTPUT:** Component `CyberRadarChart.tsx` (dùng SVG / Recharts), API `/api/v1/user/:id/radar`.
* **VERIFY:** Giải 1 task gán đồng thời 2 tag "Cloud" và "Network" (mỗi tag 100 EXP) -> Cả 2 trục trên biểu đồ radar cùng tăng +100 điểm tương ứng.

---

### ⚔️ PHASE 3: REAL-TIME ARENA & CAPSTONE CERTIFICATIONS (MARCH 2027)

#### Task CF-501: Xây dựng Động cơ KotH Tick Runner (60s Cycle) & Redis Scoreboard
* **Agent:** `backend-specialist` | **Skills:** `api-patterns`, `clean-code`
* **Priority:** `P0 (Critical)` | **Dependencies:** CF-002, CF-301
* **Mô tả:** Lập trình daemon KotH Tick Runner độc lập bằng Go. Thiết lập chu kỳ 60 giây quét kiểm tra:
  1. Đọc nội dung token trong `/root/king.txt` trên máy mục tiêu.
  2. Thực hiện lệnh atomic Redis `ZINCRBY koth:match_<id>:scores 10 <userId>` cộng 10 điểm cho King.
  3. Broadcast bảng điểm trực tiếp tới tất cả người chơi trong phòng qua WebSocket Gateway (Story `US-05.01`, TDD Mục 9.2).
* **INPUT:** `docs/02-architecture/TDD_CYBERFORCE.md` Mục 3.2 & 9.2.
* **OUTPUT:** Go Service `services/koth-engine/runner/tick_runner.go`, WebSocket topic `/ws/arena/koth/:id`.
* **VERIFY:** Ghi username "Player1" vào `/root/king.txt` -> Chờ mốc tick 60s -> WebSocket nhận event `KOTH_TICK_UPDATE` hiển thị Player1 được cộng 10 điểm trên bảng xếp hạng trực tiếp.

#### Task CF-502: Triển khai Giám Sát SLA Dịch Vụ & Cơ Chế Tự Phục Hồi (Service Auto-Heal)
* **Agent:** `backend-specialist` & `security-auditor` | **Skills:** `server-management`, `clean-code`
* **Priority:** `P0 (Critical)` | **Dependencies:** CF-501
* **Mô tả:** Xây dựng daemon KotH Arbiter định kỳ kiểm tra cổng dịch vụ (port 80/22). Nếu dịch vụ bị sập do người chơi phá hoại -> Đánh dấu `SLA FAILED` (không ai nhận điểm tick đó). Kích hoạt cơ chế tự phục hồi dịch vụ và khôi phục quyền truy cập `/root/king.txt` về trạng thái chuẩn trong vòng 15 giây (Story `US-05.02`).
* **INPUT:** `docs/05-epics/EPIC_05_CTF_COMPETITIONS_KOTH_ARENA.md` (US-05.02).
* **OUTPUT:** Go Arbiter `services/koth-engine/arbiter/health_healer.go`.
* **VERIFY:** Tắt web server Apache/Nginx trên máy mục tiêu -> Tick runner phát thông báo SLA Failed; sau 15 giây, dịch vụ tự khởi động lại và tick tiếp theo trở lại bình thường.

#### Task CF-503: Cơ Chế Chống Phá Hoại (Anti-Sabotage) & Xử Lý Kỷ Luật KotH
* **Agent:** `security-auditor` & `backend-specialist` | **Skills:** `red-team-tactics`, `clean-code`
* **Priority:** `P1 (High)` | **Dependencies:** CF-502
* **Mô tả:** Thiết lập bộ lọc phát hiện các hành vi phá hoại môi trường OS (xóa file binary hệ thống, gán `chattr +i` cấm ghi vào file king.txt, cấu hình firewall cấm cửa trái quy định). Khi phát hiện, hệ thống tự động trừ điểm tick hiện tại và tự động khóa tài khoản (Block Account) trong 3 ngày sau trận đấu (Story `US-05.03`).
* **INPUT:** `docs/05-epics/EPIC_05_CTF_COMPETITIONS_KOTH_ARENA.md` (US-05.03).
* **OUTPUT:** Audit rules, bảng ghi nhận vi phạm `koth_penalties`, API cấm tài khoản.
* **VERIFY:** Cố tình chạy lệnh `chattr +i /root/king.txt` -> Arbiter phát hiện, gỡ thuộc tính i-node, ghi nhận vi phạm và áp dụng hình phạt theo quy chế.

#### Task CF-601: Phát triển Động cơ Quản lý Kỳ thi Thực hành Độc lập (Hands-on Capstone Exam)
* **Agent:** `backend-specialist` & `frontend-specialist` | **Skills:** `api-patterns`, `nextjs-react-expert`
* **Priority:** `P0 (Critical)` | **Dependencies:** CF-201, CF-301
* **Mô tả:** Xây dựng luồng thi Capstone: Kiểm tra điều kiện tiên quyết (phải hoàn thành 100% lộ trình), cấp phát cụm mạng thi riêng gồm nhiều máy mục tiêu (Multi-node Target Range), kích hoạt đồng hồ đếm ngược linh hoạt (Admin set: 6h, 12h, 24h). Khóa hoàn toàn tính năng xem gợi ý và diễn đàn thảo luận. Chấm điểm 100% tự động bằng Flag (Story `US-06.01`).
* **INPUT:** `docs/05-epics/EPIC_06_CAPSTONE_EXAMS_DIGITAL_CERTIFICATES.md` (US-06.01) & Wireframe 6.1.
* **OUTPUT:** Giao diện phòng thi `apps/web/src/app/exams/[id]/page.tsx`, API `/api/v1/exams/:id/start`.
* **VERIFY:** Tài khoản chỉ đạt 60% lộ trình cố tình truy cập `/exams/cop-01` -> Nút Start bị khóa kèm thông báo lỗi; tài khoản 100% nhấn Start -> Mạng thi được khởi tạo và đồng hồ đếm ngược bắt đầu chạy.

#### Task CF-602: Động cơ Sinh Chứng chỉ Số PDF & Ký Số Mật mã (RSA-4096 / SHA-256)
* **Agent:** `backend-specialist` & `security-auditor` | **Skills:** `clean-code`, `api-patterns`
* **Priority:** `P0 (Critical)` | **Dependencies:** CF-601
* **Mô tả:** Khi thí sinh đạt $\ge 80\%$ điểm bài thi Capstone, tự động kích hoạt dịch vụ ký số:
  1. Tạo mã định danh duy nhất: `CF-CERT-YYYY-XXXXX`.
  2. Ký số cryptographic hash bằng RSA-4096 Private Key.
  3. Render file PDF chứng chỉ chất lượng cao kèm mã QR trỏ tới URL tra cứu công khai.
  4. Lưu trữ file PDF vào MinIO S3 bucket (Story `US-06.02`, TDD Mục 10).
* **INPUT:** `docs/02-architecture/TDD_CYBERFORCE.md` Mục 10 & Wireframe 6.2.
* **OUTPUT:** Microservice `services/cert-signer/`, template chứng chỉ PDF, mã QR generator.
* **VERIFY:** Nộp đủ điểm bài thi -> Hệ thống trả về mã chứng chỉ, tải về file PDF mở ra thấy rõ chữ ký số và quét mã QR dẫn đúng về trang tra cứu.

#### Task CF-603: Xây dựng Cổng Tra Cứu & Xác Thực Chứng chỉ Công Khai (Public Portal)
* **Agent:** `frontend-specialist` | **Skills:** `frontend-design`, `seo-fundamentals`
* **Priority:** `P1 (High)` | **Dependencies:** CF-602
* **Mô tả:** Xây dựng trang tra cứu mở không cần đăng nhập tại `/verify/[code]` (hoặc `https://verify.cyberforce.io/[code]`). Hiển thị huy hiệu xác thực "Verified Authentic", họ tên học viên, tên bài thi, điểm số, ngày cấp, chữ ký số và nút "Add to LinkedIn" chuẩn OpenBadges (Story `US-06.03`, Wireframe 6.3).
* **INPUT:** `docs/07-wireframes/EPIC_06_WIREFRAMES_CAPSTONE_EXAMS_CERTIFICATES.md` Wireframe 6.3.
* **OUTPUT:** Trang công khai `apps/web/src/app/verify/[code]/page.tsx`, OpenGraph meta tags cho LinkedIn.
* **VERIFY:** Truy cập URL mã chứng chỉ hợp lệ -> Hiển thị dấu tích xanh và thông tin chính xác; thử nhập mã giả mạo -> Hiển thị thông báo "Certificate Not Found or Invalid".

---

### 🎨 PHASE 4: CREATOR STUDIO & B2B ENTERPRISE ANALYTICS (POST-MVP)

#### Task CF-802: Trình Soạn Thảo Bài Lab Trực Quan cho Giảng viên (MDX Live Preview)
* **Agent:** `frontend-specialist` | **Skills:** `frontend-architecture`, `clean-code`
* **Priority:** `P2 (Medium)` | **Dependencies:** CF-801
* **Mô tả:** Xây dựng giao diện Creator Studio dành riêng cho người dùng có vai trò `Creator`/`Instructor`. Tích hợp trình soạn thảo MDX 2 màn hình (Split Editor & Live Preview), cấu hình các bài tập, câu hỏi, cờ và tải file đính kèm trực tiếp (Story `US-08.02`, Wireframe 8.2).
* **INPUT:** `docs/05-epics/EPIC_08_LAB_CREATOR_STUDIO_ANALYTICS.md` (US-08.02) & Wireframe 8.2.
* **OUTPUT:** Trang `apps/web/src/app/(dashboard)/creator/studio/**`, component `MdxLiveEditor.tsx`.
* **VERIFY:** Giảng viên soạn nội dung MDX có chèn bảng, callout và code block -> Khung preview bên cạnh cập nhật tức thì theo thời gian thực.

#### Task CF-803: Bảng Điều Khiển Phân Tích Lỗ Hổng Kỹ Năng Doanh Nghiệp (Skill Gap Matrix)
* **Agent:** `frontend-specialist` & `backend-specialist` | **Skills:** `frontend-design`, `api-patterns`
* **Priority:** `P2 (Medium)` | **Dependencies:** CF-703
* **Mô tả:** Xây dựng cổng B2B dành cho Doanh nghiệp & Trường đại học tại `/org/analytics`. Hiển thị ma trận kỹ năng tổng hợp của toàn bộ nhân viên/sinh viên theo phòng ban, phát hiện các điểm yếu kiến thức (ví dụ: Cloud Security còn yếu) để đề xuất lộ trình đào tạo phù hợp (Story `US-08.03`, Wireframe 8.3).
* **INPUT:** `docs/05-epics/EPIC_08_LAB_CREATOR_STUDIO_ANALYTICS.md` (US-08.03) & Wireframe 8.3.
* **OUTPUT:** Trang `apps/web/src/app/(dashboard)/org/analytics/page.tsx`, component `SkillGapMatrixTable.tsx`.
* **VERIFY:** Quản trị viên doanh nghiệp truy cập -> Xem biểu đồ phân bố kỹ năng của 50 học viên trong tổ chức và xuất báo cáo PDF thành công.

---

### 🛡️ PHASE X: TỔNG KIỂM TRA, QUÉT BẢO MẬT & NGHIỆM THU (VERIFICATION & AUDIT)

#### Task CF-901: Quét Lỗ Hổng Bảo Mật Toàn Diện & Kiểm Tra Bí Mật (Security Scan)
* **Agent:** `security-auditor` | **Skills:** `vulnerability-scanner`, `clean-code`
* **Priority:** `P0 (Critical)` | **Dependencies:** Hoàn thành tất cả các phase
* **Mô tả:** Chạy công cụ kiểm tra bảo mật tĩnh và động:
  1. Quét tìm rò rỉ khóa bí mật, API keys, private keys trong mã nguồn.
  2. Kiểm toán các phụ thuộc thư viện (OWASP Dependency Check / `npm audit`).
  3. Kiểm tra các cấu hình Docker cgroups, quyền root và iptables zero-egress.
* **INPUT:** Toàn bộ mã nguồn repo và script `vulnerability-scanner`.
* **OUTPUT:** Báo cáo kiểm toán bảo mật `security_audit_report.json` với 0 lỗi Critical/High.
* **VERIFY:** Chạy lệnh quét:
  ```bash
  python .agents/skills/vulnerability-scanner/scripts/security_scan.py .
  ```

#### Task CF-902: Kiểm Toán Giao Diện UX, Trợ Năng & Tuân Thủ Quy Chuẩn Màu
* **Agent:** `frontend-specialist` | **Skills:** `frontend-design`, `web-design-guidelines`
* **Priority:** `P1 (High)` | **Dependencies:** Hoàn thành các task frontend
* **Mô tả:** Kiểm toán toàn bộ giao diện:
  1. **Purple Ban Check:** Đảm bảo 100% không sử dụng màu tím AI cấm (`#8B5CF6`, `#A855F7`, `#7C3AED`,...).
  2. **WCAG 2.1 AA:** Kiểm tra độ tương phản giữa văn bản và nền tối.
  3. **Touch Targets & Fitts's Law:** Đảm bảo các nút bấm điều khiển lab, nộp flag đạt kích thước tối thiểu $44 \times 44\text{px}$.
* **INPUT:** Toàn bộ source code frontend trong `apps/web`.
* **OUTPUT:** Báo cáo kiểm toán UX/UI `ux_audit_report.json`.
* **VERIFY:** Chạy script:
  ```bash
  python .agents/skills/frontend-design/scripts/ux_audit.py .
  ```

#### Task CF-903: Kiểm Thử Tích Hợp Đầu Cuối (End-to-End Playwright Tests)
* **Agent:** `test-engineer` | **Skills:** `webapp-testing`, `tdd-workflow`
* **Priority:** `P1 (High)` | **Dependencies:** Hoàn thành hệ thống
* **Mô tả:** Viết và chạy bộ test tự động E2E kiểm tra toàn bộ luồng người dùng chính:
  1. Đăng ký tài khoản mới -> Nhận 0 EXP, Novice tier.
  2. Mở phòng lab -> Nhấn Start Machine -> Nhận IP lab sau $< 3$s.
  3. Mở Web Terminal -> Gõ lệnh.
  4. Nộp Flag đúng -> EXP tăng, streak tăng lên 1 ngày.
* **INPUT:** User Flow Playbook `docs/06-user-flow/`.
* **OUTPUT:** Bộ test suites `tests/e2e/*.spec.ts`.
* **VERIFY:** Chạy `npx playwright test` và tất cả các bài test đều Pass.

#### Task CF-904: Kiểm Tra Build Sản Phẩm & Đóng Gói Docker Images
* **Agent:** `devops-engineer` | **Skills:** `bash-linux`, `server-management`
* **Priority:** `P0 (Critical)` | **Dependencies:** CF-901, CF-902, CF-903
* **Mô tả:** Chạy build production cho toàn bộ các ứng dụng và dịch vụ:
  1. `npm run build --prefix apps/web` không có lỗi lint hoặc TypeScript.
  2. Build Go binaries `CGO_ENABLED=0 go build` cho Orchestrator và API Core.
  3. Đóng gói Docker production images nhẹ và an toàn (Multi-stage build).
* **INPUT:** Monorepo codebase.
* **OUTPUT:** Các production artifact bundles và Docker images sẵn sàng deploy.
* **VERIFY:** Chạy `npm run build` thành công với output tối ưu, `docker compose -f docker-compose.prod.yml build` không có lỗi.

---

## 6. Ma Trận Truy Vết Nhiệm Vụ (Task Traceability Matrix)

| Mã Task | Epic Liên Quan | User Story / Tiêu Chuẩn Nghiệm Thu | Agent Phụ Trách | Ưu Tiên |
| :--- | :--- | :--- | :--- | :---: |
| **CF-001** | Foundation | Monorepo Setup & Git Guidelines | `devops-engineer` | P0 |
| **CF-002** | Foundation | Docker Compose Dev Infrastructure | `devops-engineer` | P0 |
| **CF-003** | Foundation | PostgreSQL Schema & Migrations | `database-architect` | P0 |
| **CF-004** | Foundation | Cyber-Minimalism Design System | `frontend-specialist` | P1 |
| **CF-101** | Epic 1 | US-01.01: 1-Click OAuth2 (Google/GitHub) | `backend-specialist` | P0 |
| **CF-102** | Epic 1 | US-01.01: Email Conflict & Account Linking | `backend-specialist` | P1 |
| **CF-103** | Epic 1 | US-01.02: Password Auth + Rate Limiting | `security-auditor` | P0 |
| **CF-104** | Epic 1 | US-01.03: Public Profile & Privacy Settings | `frontend-specialist` | P1 |
| **CF-105** | Epic 1 | US-01.04: Granular RBAC & Creator Approval | `backend-specialist` | P1 |
| **CF-201** | Epic 2 | US-02.01: Learning Paths Catalog & Detail | `frontend-specialist` | P0 |
| **CF-202** | Epic 2 | US-02.02: All-in-One Split-Pane Room View | `frontend-specialist` | P0 |
| **CF-203** | Epic 2 | US-02.03: Flag Validation & Anti-Bruteforce | `backend-specialist` | P0 |
| **CF-204** | Epic 2 | US-02.04: Tiered Hints & EXP Deduction | `backend-specialist` | P1 |
| **CF-301** | Epic 3 | US-03.01: Docker Sandbox Spawner Daemon | `backend-specialist` | P0 |
| **CF-302** | Epic 3 | US-03.02: Lease Lifecycle & Reaper Sweeper | `backend-specialist` | P0 |
| **CF-303** | Epic 3 | US-03.04: Embedded xterm.js Web Terminal | `frontend-specialist` | P0 |
| **CF-304** | Epic 3 | US-03.03: Apache Guacamole Kali AttackBox | `devops-engineer` | P1 |
| **CF-401** | Epic 4 | US-04.01: WireGuard Gateway & Config Gen | `devops-engineer` | P0 |
| **CF-402** | Epic 4 | US-04.03: Zero Egress & Client Isolation | `security-auditor` | P0 |
| **CF-403** | Epic 4 | US-04.02: Real-time Live VPN Health Indicator | `backend-specialist` | P2 |
| **CF-501** | Epic 5 | US-05.01: KotH 60s Tick Runner & Scoreboard | `backend-specialist` | P0 |
| **CF-502** | Epic 5 | US-05.02: SLA Monitor & Service Auto-Heal | `backend-specialist` | P0 |
| **CF-503** | Epic 5 | US-05.03: Anti-Sabotage & 3-Day Block Penalty | `security-auditor` | P1 |
| **CF-504** | Epic 5 | US-05.04: CTF Dynamic Decay Scoring Engine | `backend-specialist` | P1 |
| **CF-601** | Epic 6 | US-06.01: Hands-on Capstone Exam Session | `backend-specialist` | P0 |
| **CF-602** | Epic 6 | US-06.02: RSA-4096 Signed PDF Certificate | `backend-specialist` | P0 |
| **CF-603** | Epic 6 | US-06.03: Public Certificate Verify Portal | `frontend-specialist` | P1 |
| **CF-701** | Epic 7 | US-07.01: Timezone-Aware Daily Streak Engine | `backend-specialist` | P1 |
| **CF-702** | Epic 7 | US-07.03: Rank Tiers & Badge Progression | `frontend-specialist` | P2 |
| **CF-703** | Epic 7 | US-07.02: 8-Axis Multi-Tag Cyber Radar | `frontend-specialist` | P1 |
| **CF-801** | Epic 8 | US-08.01: Centralized Admin CMS Portal | `frontend-specialist` | P1 |
| **CF-802** | Epic 8 | US-08.02: Creator Studio MDX Live Preview | `frontend-specialist` | P2 |
| **CF-803** | Epic 8 | US-08.03: Enterprise Skill Gap Matrix B2B | `frontend-specialist` | P2 |
| **CF-901** | Phase X | Full Vulnerability & Secret Leak Scan | `security-auditor` | P0 |
| **CF-902** | Phase X | UX Contrast, Touch Target & Purple Ban Audit | `frontend-specialist` | P1 |
| **CF-903** | Phase X | Playwright E2E End-to-End Verification | `test-engineer` | P1 |
| **CF-904** | Phase X | Production Build & Multi-stage Containers | `devops-engineer` | P0 |

---

## 7. Bảng Kiểm Tra Định Kỳ & Kế Hoạch Triển Khai Tiếp Theo (Next Steps)

1. **Phê duyệt Kế hoạch Phân rã:** Người dùng và các kỹ sư rà soát tài liệu `task-breakdown.md`.
2. **Khởi động Giai đoạn 0 (Sprint 0 - Foundations):** Bắt đầu triển khai từ các task nền tảng `CF-001`, `CF-002`, `CF-003`, `CF-004`.
3. **Thực thi Sprint theo chuẩn Git:**
   - Mỗi task tạo một branch tương ứng theo format: `feature/CF-xxx-description`.
   - Viết test trước hoặc song song theo chuẩn TDD.
   - Hoàn thành từng task với đầy đủ `INPUT → OUTPUT → VERIFY`.
