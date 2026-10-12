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
