# Handoff — API/UI integration (2026-10-11)

## Mục tiêu và phạm vi được duyệt

Tiếp tục tích hợp API thật cho UI hiện có, giữ thiết kế Modern Minimal. Backend mới ngoài phạm vi hiện có phải được duyệt trước. Người dùng **đã duyệt bổ sung lưu đăng ký lộ trình** trong phiên này. Chưa duyệt Dashboard/phòng học/lab/CMS hoặc nghiệp vụ thống kê hồ sơ mới. Người dùng đã yêu cầu commit và push nhánh này; chưa yêu cầu merge hoặc deploy.

## Git và workspace

- Workspace: `/home/quocbao/.codex/worktrees/9a93/CyberForge`.
- Branch: `codex/api-ui-integration`, nền `2b7470f`.
- Thay đổi được đóng gói để commit/push theo yêu cầu người dùng; dùng `git status` và `git log` kiểm tra trạng thái thực tế khi tiếp tục.
- Handoff gốc được đọc từ `/home/quocbao/.codex/worktrees/a446/CyberForge/docs/handoffs/CURRENT_TASK.md` vì file chưa tồn tại trong worktree mới.
- Checkout gốc khác worktree; không giả định Explorer ở repo gốc thấy các thay đổi này.

## Đã triển khai

- `AuthProvider` ở root layout: khởi tạo phiên dùng chung, deduplicate initialize, xác minh qua `/auth/me`, phục hồi bằng cookie refresh; không tin user cache để xác định quyền.
- Fetch client: refresh trước khi token hết hạn (quan trọng với API optional-auth), chia sẻ một refresh đang chạy, retry một lần sau 401; không refresh login hoặc 403; không xóa credential do lỗi mạng; chặn refresh ghi đè phiên đã thay đổi/đăng xuất.
- Sửa lỗi runtime POST không body nhưng có JSON Content-Type khiến Fastify từ chối enroll/logout.
- Catalog và chi tiết lộ trình dùng token theme hiện có, tiếng Việt, Navbar, trạng thái loading/error/empty, nút retry thực; loại bỏ link `/room/...` chưa có route và tuyên bố chứng chỉ không có bằng chứng.
- Đăng ký lộ trình được lưu bằng `PathEnrollment`: khóa chính `(userId, pathId)`, thời điểm đăng ký, upsert không trùng. Danh mục/chi tiết trả `isEnrolled` và `enrolledAt`. Đăng ký độc lập với tiến độ, không tăng EXP hay hoàn thành phòng.
- Admin roles chờ khôi phục phiên trước khi xác định quyền; phân trang 20 bản ghi, dùng pagination API, bỏ response lỗi thời, quay lại trang hợp lệ sau khi duyệt hết trang cuối.
- Hồ sơ: tránh response cũ ghi đè mới, giữ nội dung/dialog khi refresh nền, không ghi token cũ trở lại store sau PATCH; giữ draft khi dossier được cập nhật nền.
- Creator dialog hiển thị lỗi tải yêu cầu thay vì nuốt lỗi.
- Sửa kiểu dữ liệu fixture test paths/roles thiếu trường `role` để backend typecheck/build chạy được.

## Đối chiếu UI ↔ API

| Luồng | API `/api/v1` | Trạng thái |
|---|---|---|
| Đăng nhập/đăng ký/phiên | auth login/register/me/refresh/logout | Có kết nối; phiên dùng chung đã sửa và test |
| OAuth/link tài khoản | auth oauth + link endpoints | Kết nối sẵn, backend integration tests qua; chưa thử Google/GitHub bên ngoài |
| Hồ sơ/chỉnh sửa/quyền riêng tư | users/:username/profile, users/me/profile | GET/PATCH thật; chỉnh sửa đã thử trên trình duyệt; số liệu nghiệp vụ bên dưới còn mô phỏng |
| Gửi/xem yêu cầu Creator | roles/request-creator, roles/my-requests | Đã gửi và thấy pending qua trình duyệt |
| Duyệt/từ chối Creator | admin/roles/requests, admin/roles/review | Đã thử pagination, approve, reject và quay lại trang hợp lệ |
| Lộ trình | paths, paths/:slug | Danh mục/chi tiết thật, phản hồi theo phiên |
| Đăng ký | paths/:slug/enroll | Đã bổ sung persistence và UI, giữ trạng thái sau reload |
| Phòng học/lab | Chưa có route/API sản phẩm tương ứng | Hiển thị chưa mở; cần duyệt backend |
| Dashboard/CMS | Prototype có, backend tương ứng chưa có | Cần duyệt trước khi xây |

## DB và môi trường kiểm thử

- Không có `.env` tại worktree này. Cấu hình local được đọc trong bộ nhớ từ checkout gốc; không sao chép secrets vào repo/output.
- PostgreSQL/Redis local đã kết nối được ngoài sandbox.
- Test dùng schema PostgreSQL **`cf_integration_20261011_9a93`**, Redis DB **15**; không reset hoặc sửa schema dữ liệu chính.
- Prisma client đã generate; toàn bộ schema test được tạo bằng `prisma db push --skip-generate` chỉ vào schema test riêng.
- API preview cổng 4000, frontend bản build cổng 3000. `WEB_ORIGIN=http://localhost:3000`; truy cập bằng localhost cho cookie/CORS đồng nhất.
- Có dữ liệu test rõ nhãn: lộ trình slug `integration-check`, user `ui_check`, admin `admin_check`, các user `pagination_*`. Không coi đây là nội dung nghiệp vụ thật.
- Process local và file launcher `/tmp` có thể bị dừng/xóa khi đổi lượt; phải kiểm tra lại, không khẳng định URL luôn còn sống.

### Áp dụng schema cho môi trường khác

Repo trước đây dùng `prisma db push`, chưa có lịch sử Prisma migrations. Đã chuẩn bị SQL bổ sung duy nhất bảng mới:
`services/api-core/prisma/sql/20261011_path_enrollments.sql`.

Với `DATABASE_URL` đúng môi trường, chạy một lần từ `services/api-core`:

```sh
pnpm exec prisma db execute --file prisma/sql/20261011_path_enrollments.sql --schema prisma/schema.prisma
pnpm exec prisma generate
```

**Chưa áp dụng SQL vào schema chính hoặc production.** Schema test đã được tạo từ Prisma schema; script SQL riêng chưa được thực thi. Phải tạo bảng trước khi chạy backend mới trên DB cũ; không dùng reset/accept-data-loss.

## Bằng chứng kiểm thử

- Backend: **71 tests / 6 suites pass**, PostgreSQL/Redis thật trong schema riêng. Test enrollment gồm hai POST đồng thời chỉ lưu một dòng, GET list/detail giữ trạng thái, anonymous không thấy enrollment, POST anonymous 401, slug không tồn tại 404.
- Frontend: **11 tests pass** (`pnpm --filter @cyberforce/web test`), fetch mock; bao phủ initialize đồng thời, cookie-only session, refresh/retry mutation, concurrent 401, login/403 không refresh, hết phiên, mất mạng và retry, session bị clear khi refresh đang chạy, giới hạn retry, POST không body, proactive refresh cho optional-auth.
- Frontend/backend lint và typecheck: pass, 0 warnings ở lượt cuối đã chạy.
- Frontend `next build` và backend `tsc` build: hoàn tất, exit 0 (đã chạy lại sau thay đổi cuối).
- `git diff --check`: pass.
- Trình duyệt + API thật: catalog; email/password login; deep-link chi tiết; enroll rồi reload vẫn còn; profile PATCH rồi reload còn nội dung; gửi Creator request pending; logout; student bị chặn admin; admin deep-link; 22 requests phân thành 20+2; approve; reject bản ghi cuối trang 2 tự quay về trang 1 với 20/20.
- Đã xem screenshot catalog desktop sáng và chi tiết 390px tối. Chưa đủ ma trận mọi route × 320/390/1440 × sáng/tối.

## Còn cần xử lý/duyệt

1. **Hồ sơ trả dữ liệu mô phỏng từ backend**: tài khoản mới 0 EXP vẫn có điểm kỹ năng, 1 lab và một lộ trình 100%. Đã hỏi người dùng chọn ẩn mô phỏng / xây tính toán thật / giữ và ghi giới hạn. Chưa nhận câu trả lời tại thời điểm ghi file. Không tự suy ra phê duyệt từ yêu cầu tiếp tục chung.
2. Dashboard, room/lab runtime, CMS chưa được duyệt backend; không tạo terminal giả.
3. OAuth Google/GitHub và gửi OTP email thật chưa được kiểm chứng ngoài hệ thống test.
4. Kiểm tra thêm biểu mẫu khi lỗi mạng/403 và refresh token trong trình duyệt thực; các trường hợp refresh đã được test tự động bằng fetch mock, chưa chờ TTL thật trong browser.
5. Cân nhắc kiểm thử toàn bộ responsive và trạng thái riêng tư bằng hai tài khoản trước nghiệm thu đầy đủ.
6. Commit/push đã được người dùng duyệt. Merge/deploy và áp dụng DB chính chưa được yêu cầu.

## Tiếp nối CF-202 — 2026-10-12 (thay thế phạm vi phòng học bên trên)

- Người dùng đã duyệt triển khai CF-202. Branch hiện tại `codex/cf-202-room-workspace`, nền main `3d505e7` sau PR16. Chưa commit/push phần CF-202.
- Đã thêm GET `/api/v1/rooms/:slug`, bắt buộc đăng nhập, chặn phòng chưa xuất bản/future, path chưa xuất bản, phòng trả phí và prerequisite chưa hoàn thành. Response không chứa answerHash/pattern/hints/VM spec; cache private,no-store.
- `/rooms/[slug]` nối từ paths; Markdown an toàn, task accordion, câu trả lời nháp, progress thật. Lý thuyết toàn chiều rộng, lab chia đôi desktop và chuyển vùng mobile. Chưa có chấm bài/gợi ý (CF-203/204) hoặc provisioning/terminal (CF-301); UI ghi rõ chưa khả dụng.
- Bản nháp, accordion, scroll, tỷ lệ pane lưu localStorage với khóa `cf-room-v1:<userId>:<roomId>`; không đồng bộ lên server. Có thông báo khi storage bị chặn/mất mạng.
- Kiểm thử phát hiện race trong enrollment upsert cũ: đổi sang createMany skipDuplicates rồi đọc bản ghi, giữ timestamp và tính idempotent.
- Backend 76 tests/7 suites pass, frontend 14 tests/2 suites pass. Frontend/backend lint, typecheck/build pass. Test vẫn dùng schema `cf_integration_20261011_9a93`, Redis15; không đổi DB chính.
- Fixture local mới: `room_check`, `room_other`; phòng `cf202-practice`, `cf202-theory`. Launcher `/tmp/cf202-run.cjs` đọc env từ checkout gốc và ép schema test; file/process có thể mất ở lượt sau.
- Browser đã xác minh đăng nhập, đọc Markdown, giữ draft và tỷ lệ 50/50 sau reload, mở rộng/khôi phục, draft qua tab mobile, phòng khác không dùng nháp cũ. Phát hiện wrapper panel vẫn chiếm 50% khi nội dung bị ẩn, đã bổ sung CSS nhắm wrapper ngoài.
- Còn giới hạn: chưa kiểm thử offline/storage bị chặn thực tế và toàn bộ ma trận viewport/theme. Dữ liệu profile mô phỏng vẫn ngoài phạm vi như ghi ở trên.
- Kiểm tra cuối sau build: mobile lesson wrapper rộng 341px, lab 0px (đúng toàn vùng); tài khoản `room_other` mở cùng phòng thấy ô nháp trống. Viewport override đã reset. Frontend build cuối exit 0.

## Ưu tiên người dùng xác nhận 2026-10-12

CyberForce ưu tiên giao diện web desktop. Không cần kiểm thử giao diện mobile trừ khi người dùng yêu cầu rõ ràng. Áp dụng cho các giai đoạn tiếp theo.
Người dùng đã yêu cầu commit và push CF-202; chưa yêu cầu merge/deploy.

## Tiếp nối CF-203 — trạng thái hiện tại

CF-202 đã commit/push `13fd2e4`. CF-203 ở nhánh `codex/cf-203-flag-validation` dựa trên commit đó, chưa commit/push. Người dùng duyệt triển khai tuần tự và đã chốt khóa ngay lần sai5/60s trong180s, dynamic prefix `flag{24 hex}`.

Chi tiết API, dữ liệu cũ, kiểm thử và giới hạn: [CF-203.md](CF-203.md). Đã triển khai validator, submission API + EXP transaction, Redis chống brute-force, form desktop và countdown. Không mở rộng sang CF-204/CF-301. Người dùng đã yêu cầu commit/push CF-203 và cập nhật task-breakdown; dùng git log/status kiểm tra kết quả thực tế.

## Docker local full stack — 2026-10-13

- Nhánh `chore/CF-904-docker-full-stack`; người dùng yêu cầu commit/push theo Git Guidelines.
- Một lệnh: `docker compose up -d --build --wait` chạy postgres, redis, minio, guacd, traefik, db-init, api, web. README và .env.example đã cập nhật.
- Dockerfile multi-stage, frontend standalone, loại env secrets khỏi build context. db-init dùng prisma db push không accept-data-loss/reset, không tự seed.
- Sửa healthcheck MinIO dùng wget có sẵn; guacd kiểm tra mỗi5s thay vì mặc định5phút.
- Đã chạy thực tế với project/volume/cổng riêng `cf-docker-smoke`: lệnh up/build/wait exit0; db-init exit0; các service có healthcheck đều healthy. Không thay đổi volume DB/Redis chính.
- Đây là phần local Compose của CF-904; chưa nghiệm thu triển khai production hoặc toàn bộ phase cuối.

## Tiếp nối CF-204 — 2026-10-13

Người dùng đã duyệt thiết kế bảng và API gợi ý. CF-204 nằm trên branch `codex/cf-204-tiered-hints`: gợi ý theo cấp, xác nhận chi phí, lưu lượt mở và tích hợp điểm thưởng vào bộ chấm. 103 backend tests, 14 frontend tests, lint/typecheck/build và luồng browser desktop đã qua. Bảng `hint_unlocks` đã được tạo trong PostgreSQL local `cyberforce/public`; không sửa dữ liệu cũ. Chi tiết và giới hạn: [CF-204.md](CF-204.md). Khi tiếp nối, kiểm tra Git status/log để xác định commit/push thực tế, không suy ra từ handoff.

## Tiếp nối CF-301 — 2026-10-13

Người dùng duyệt kế hoạch backend CF-301. Branch `codex/cf-301-lab-spawner` đã hợp nhất `origin/main` sau khi CF-204 được squash vào main. Go daemon, API Core spawn/stop, Compose và network lab `100.64.0.0/10` đã triển khai; không đổi schema. Go tests và 107 backend tests qua; Docker smoke xác nhận spawn, inspect cgroup/capability/network, chặn Internet và cleanup; full-stack Compose trên project riêng cũng healthy. Chi tiết: [CF-301.md](CF-301.md). Chưa có reaper/UI terminal/dynamic flag injection; xem giới hạn trong handoff.

## Tiếp nối CF-302 — 2026-10-13

Người dùng duyệt phương án Go reaper theo TDD. Branch `codex/cf-302-lease-reaper` dựa trên `main` tại `04196a5`. Đã thêm gia hạn, grace, role DB giới hạn và Go sweeper. 108 API tests, Go tests, typecheck/lint/build và Docker smoke trên project riêng qua; chi tiết ở [CF-302.md](CF-302.md). Chưa có UI timer/terminal; không suy ra commit/push từ handoff, kiểm tra Git thực tế trước khi tiếp tục.

## Tiếp nối CF-303 — 2026-10-13

Người dùng duyệt sidecar terminal riêng và scratch tmpfs 512 MB cho host overlay2/extfs. Nhánh `codex/cf-303-web-terminal` dựa trên main `8298f02`. Đã nối xterm desktop, UI máy lab, WebSocket ticket một lần qua API Core, Go TTY sidecar và cleanup. API/Go/frontend tests, Docker smoke và browser desktop qua; stack local `api`, `web`, `orchestrator` healthy. Chi tiết và giới hạn: [CF-303.md](CF-303.md). Kiểm tra Git thực tế trước khi tiếp tục hoặc tạo PR.

## Tiếp nối CF-304 — 2026-10-14

Người dùng duyệt Guacamole/Kali trước, inject cờ động riêng; duyệt `guacd` dùng chung nối/ngắt mạng từng lab. Branch `codex/cf-304-guacamole-attackbox` dựa trên main `9ebd276`. Đã nối image Kali XFCE/VNC, Go orchestrator và Guacamole bridge, API ticket/stream và tab AttackBox desktop. Browser xác nhận XFCE, terminal `nmap` quét target cổng 80 và clipboard hai chiều; API 110/110 tests, Go tests và web build/lint qua. Desktop VNC cố định 1280×800, Canvas co giãn; chưa đổi độ phân giải Xvfb thực hoặc đo SLA <80ms. Chi tiết: [CF-304.md](CF-304.md). Kiểm tra Git thực tế để xác định commit/push/merge.

## Tiếp nối CF-202 dynamic flag — 2026-10-14

Người dùng duyệt API sinh cờ theo công thức HMAC đã chốt, truyền riêng cờ qua kết nối nội bộ có xác thực và Orchestrator ghi `/root/flag.txt` trước khi chạy target. Nhánh `codex/cf-202-dynamic-flag-injection` từ main `58c96be`. Chỉ phòng có câu hỏi `dynamic_hmac` mới cần cờ; khóa mặc định/placeholder bị từ chối. API 111 tests, Go tests, typecheck/lint và Docker smoke đều qua; chi tiết tại [CF-202-DYNAMIC-FLAG.md](CF-202-DYNAMIC-FLAG.md).

## Tiếp nối CF-304 resize — 2026-10-14

Người dùng duyệt đổi Xvfb/x11vnc sang TigerVNC Xvnc để desktop Kali nhận resize thật. Nhánh `codex/cf-304-dynamic-attackbox-resolution` từ main `414424a`. Image Kali build thành công; frontend chỉ gửi lệnh size sau frame đầu, debounce và giới hạn 640×480–1920×1080; Go bridge kiểm tra cùng giới hạn. Kiểm tra desktop web local: `xrandr` lần lượt 687×480 ở split view, 1310×818 khi mở rộng, rồi 687×480 khi thu lại; phiên không rớt, clipboard hai chiều và reconnect qua Guacamole hoạt động. Web typecheck/lint/build và Go tests qua; test user và container lab đã dọn. Chi tiết [CF-304-RESIZE.md](CF-304-RESIZE.md). Chưa đo SLA `<80ms`.

## Tiếp nối CF-401 — 2026-10-24

Người dùng yêu cầu đánh dấu CF-202 done và chuyển sang task kế tiếp. Đã cập nhật `task-breakdown.md`; trạng thái done là đóng phạm vi triển khai, **không xác nhận** AttackBox đạt SLA `<80ms` vì chưa đo. Checkout nhánh `codex/cf-401-wireguard-vpn` từ commit `83f9c11` để chuẩn bị CF-401. Hạng mục này thay đổi hạ tầng, API và bảo mật; cần duyệt phương án trong `cf-401-wireguard-vpn.md` trước khi triển khai.

Người dùng đã duyệt phương án. Đã triển khai gateway Compose, peer DB/API và trang `/access/vpn`; chi tiết cùng kết quả test tại [kế hoạch CF-401](../../cf-401-wireguard-vpn.md). Chỉ DB `cf401-smoke` được đồng bộ schema. Nhánh `codex/cf-401-wireguard-vpn` dựa trên `83f9c11` (CF-304 chưa merge tại thời điểm checkout). Bước sau là CF-402; không mở route tới lab trước khi có chính sách cách ly đúng phiên.
