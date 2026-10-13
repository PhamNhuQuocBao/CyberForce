# Hướng dẫn kiểm thử thủ công CyberForce theo vai trò

Tài liệu này áp dụng cho phiên bản CyberForce từ CF-301 cùng các cải tiến giao diện đăng ký, hồ sơ, lộ trình và nộp đáp án. Thực hiện trên **trình duyệt web desktop**. Mỗi bước có kết quả mong đợi để bạn tự đánh dấu; các tính năng mới có backend nhưng chưa có giao diện được tách riêng ở cuối.

## 1. Chuẩn bị môi trường

1. Trong thư mục gốc dự án, chạy `docker compose up -d --build --wait`.
2. Chạy `docker compose ps -a`: `postgres`, `redis`, `minio`, `guacd`, `traefik`, `orchestrator`, `api`, `web` phải hoạt động/healthy; `db-init` kết thúc mã 0 là bình thường.
3. Mở `http://localhost:3000` và `http://localhost:4000/health`. Nếu cổng khác giá trị mặc định, dùng URL bạn đã cấu hình.
4. Nếu **DB phát triển mới, có thể thay thế dữ liệu mẫu**, chạy `docker compose run --rm api pnpm exec tsx prisma/seed.ts` để tạo lộ trình, phòng, câu hỏi và ba tài khoản mẫu. **Không chạy lại seed trên DB có dữ liệu cần giữ**: seed xóa và tạo lại nhiệm vụ/câu hỏi của bốn phòng mẫu, đồng thời xóa submission của Student mẫu. Lệnh `docker compose up` không tự seed.

Tài khoản do seed **tạo mới** dùng mật khẩu `Password123!`:

| Vai trò | Email | Username | Dùng để kiểm tra |
| --- | --- | --- | --- |
| Superadmin | `admin@cyberforce.io` | `cyber_admin` | Duyệt/từ chối Creator |
| Creator | `creator@cyberforce.io` | `forge_creator` | Quyền Creator đã có sẵn |
| Student | `student@cyberforce.io` | `novice_hacker` | Xem tiến độ mẫu đã có |

Seed dùng `upsert` nhưng **không đổi mật khẩu tài khoản đã tồn tại**. Nếu đăng nhập tài khoản mẫu thất bại trên DB cũ, dùng mật khẩu thực tế của DB đó. Mật khẩu mẫu chỉ dành cho local; không dùng những tài khoản này trên môi trường công khai.

Để thử hành trình học từ số 0, hãy **đăng ký một Student mới** (ví dụ `student_e2e_01` với email bạn tự đặt). Dùng thêm một Student thứ hai nếu muốn thử từ chối quyền Creator hoặc kiểm tra nháp/gợi ý tách theo tài khoản. Mở cửa sổ ẩn danh hoặc hồ sơ trình duyệt khác để so sánh quyền riêng tư giữa hai tài khoản; không cần kiểm thử mobile.

## 2. Phạm vi hiện có theo vai trò

| Vai trò | Thao tác dùng được hiện nay trên web | Giới hạn |
| --- | --- | --- |
| Khách | Trang chủ, xem danh mục/chi tiết lộ trình, xem hồ sơ công khai, đăng ký/đăng nhập | Mở phòng và đăng ký lộ trình cần đăng nhập |
| Student | Hồ sơ, đăng ký lộ trình, phòng học, nộp đáp án, gợi ý (khi câu hỏi có dữ liệu gợi ý), gửi yêu cầu Creator | Máy lab chỉ có API spawn/stop; nút trên web đang khóa |
| Creator | Các luồng học chung, hồ sơ | `Creator Studio` trên menu chỉ dẫn về phần giới thiệu ở trang chủ; chưa có màn hình soạn/xuất bản nội dung |
| Instructor | Vai trò có trong RBAC; dùng các luồng học chung | Chưa có màn hình riêng cho Instructor |
| Org Admin, Superadmin | Các luồng chung và `/admin/roles` để duyệt Creator | Gán vai trò trực tiếp và xem audit log mới có API, chưa có trang quản trị tương ứng |

Trang chủ có mục “Thi đấu”, “Chứng chỉ”, “Thực hành” để giới thiệu sản phẩm; đó **không phải** các luồng CTF/VPN/kỳ thi/terminal đã hoàn thiện. Số liệu radar kỹ năng, lab hoàn thành, badge, chứng chỉ mặc định và lộ trình “đã hoàn thành” trên **hồ sơ** hiện có phần được tạo từ EXP mẫu, chưa phản ánh đầy đủ hoạt động thật. Khi xác minh tiến độ học, dùng `/paths` và trạng thái câu hỏi/phòng, không dùng các số tổng hợp này làm bằng chứng.

## 3. Khách và đăng ký/đăng nhập

- [ x] **G01 — Khách xem lộ trình:** Mở `/paths`, thử tìm kiếm và bộ lọc chuyên môn; mở `/paths/offensive-web-associate`. Danh mục và các module/phòng hiển thị; nút chính là **Đăng nhập để đăng ký**.
- [ x] **G02 — Chặn truy cập khi chưa đăng nhập:** Mở thẳng `/rooms/sql-injection-fundamentals`. Trang yêu cầu đăng nhập, không hiển thị nhiệm vụ/câu hỏi.
- [ x] **A01 — Đăng ký Student mới:** Mở `/register`, nhập email chưa dùng, username 3–50 ký tự gồm chữ/số/`_`/`-`, mật khẩu ít nhất 8 ký tự có chữ hoa, số và ký tự đặc biệt. Đăng ký thành công rồi kiểm tra menu tài khoản có username mới.
- [x ] **A02 — Đăng xuất và đăng nhập lại:** Chọn menu tài khoản → **Đăng xuất**; vào `/login` với email/mật khẩu vừa tạo. Sau khi đăng nhập, reload trang: phiên vẫn được khôi phục. Đăng xuất lần nữa: các hành động cần đăng nhập không còn dùng được.
- [x ] **A03 — Sai mật khẩu:** Thử một lần sai với **tài khoản test riêng**, kiểm tra lỗi và số lần còn lại. Nếu muốn thử khóa tài khoản, nhập sai đủ 5 lần trong 15 phút: lần thứ 5 trả lỗi sai mật khẩu và còn 0 lần thử; request đăng nhập **tiếp theo** trả trạng thái khóa và bộ đếm khoảng 15 phút. Không làm phép thử này trên tài khoản Admin cần dùng ở các bước sau.
- [x ] **A04 — OAuth và liên kết tài khoản (chỉ khi đã cấu hình):** Trên cả `/login` và `/register`, nút **Tiếp tục với Google/GitHub** hoạt động độc lập với form email/mật khẩu. Điền GitHub/Google client ID, secret và callback URL theo `.env.example`, khởi động lại stack rồi thử điều hướng OAuth. Với email đã có, kiểm tra hộp thoại liên kết bằng mật khẩu hiện tại. Nhánh OTP hiện phục vụ môi trường phát triển qua response/log, **chưa gửi email thật**; không coi OTP là luồng sản phẩm đã nghiệm thu. Nếu chưa cấu hình OAuth thật, không thể hoàn tất luồng bên nhà cung cấp.

## 4. Student: hồ sơ và quyền riêng tư

Đăng nhập bằng Student mới, rồi chọn menu tài khoản → **Hồ sơ & quyền riêng tư** (URL `/user/<username>`).

- [ x] **P01 — Sửa hồ sơ:** Chọn **Chỉnh sửa**, đổi **Giới thiệu** và **Chuyên môn**, lưu rồi reload. Trường Chuyên môn là **ô nhập tự do có danh sách gợi ý**: có thể chọn gợi ý hoặc tự gõ giá trị khác. Nội dung vừa nhập còn nguyên.
- [ x] **P02 — Riêng tư:** Chuyển hồ sơ sang **Riêng tư**. Tài khoản đang đăng nhập vẫn xem được hồ sơ đầy đủ. Mở cùng URL trong cửa sổ ẩn danh hoặc bằng tài khoản khác: chỉ thấy thông báo **Hồ sơ riêng tư**.
- [ x] **P03 — Công khai và chia sẻ:** Ở hồ sơ riêng tư chọn **Chia sẻ** để xem cảnh báo; chỉ khi chủ động chọn **Chuyển sang công khai** thì người khác mới xem được hồ sơ. Reload cửa sổ thứ hai để đối chiếu. Bạn có thể chuyển lại Riêng tư sau thử nghiệm.

## 5. Student: lộ trình → phòng → câu hỏi

Dùng Student **mới** để không bị các submission của `novice_hacker` ảnh hưởng. Dữ liệu seed cho lộ trình `offensive-web-associate` có chuỗi phòng 20 → 21 → 22 → 23; phòng 24 là nội dung trả phí.

- [ x] **L01 — Đăng ký lộ trình:** Mở `/paths/offensive-web-associate`, chọn **Đăng ký lộ trình**. Reload trang và quay lại `/paths`: trạng thái đăng ký vẫn còn, không tạo tiến độ hoặc EXP chỉ vì đăng ký.
- [ x] **L02 — Phòng bị khóa:** Trên trang lộ trình, phòng 21 có **Xem điều kiện tiên quyết**. Mở trực tiếp `/rooms/blind-time-based-sqli` bằng URL: vẫn bị chặn cho tới khi hoàn thành **tất cả** câu hỏi phòng 20.
- [ x] **L03 — Workspace:** Mở `/rooms/sql-injection-fundamentals`. Đọc nội dung, thử đóng/mở nhiệm vụ, kéo vách giữa bài học và thực hành, chọn **Mở rộng vùng thực hành** rồi **Trở về chia đôi**. Nhập nháp câu trả lời, reload: nháp và trạng thái workspace được khôi phục trên **trình duyệt này**. Đăng nhập Student khác để xác nhận không thấy nháp của tài khoản trước.
- [ x] **L04 — Nộp sai:** Với câu đầu tiên, nộp một đáp án sai. Trang báo chưa đúng; câu chưa hoàn thành, EXP không tăng, nháp vẫn còn. Không thử quá nhiều lần trên tài khoản dùng cho các bước tiếp.
- [ x] **L05 — Nộp đúng:** Đối chiếu **nguyên văn câu hỏi ngay trên ô nhập** với bảng dưới đây; hai đáp án không dùng thay cho nhau. Không nhập dấu backtick Markdown. Nếu không mở gợi ý, mỗi câu thưởng 75 EXP khi đúng lần đầu; câu được đánh dấu hoàn thành. Reload: trạng thái hoàn thành vẫn còn; nộp lại không được cộng thưởng lần hai.

  | Câu hỏi hiển thị ở phòng 20 | Đáp án seed cần nhập vào đúng ô |
  | --- | --- |
  | `What is the boolean true condition payload?` | `' OR 1=1 --` (có dấu nháy đơn đầu) |
  | `Submit the extracted admin password hash.` | `CF{sqli_admin_hash_99a8}` |

  Bộ chấm so khớp **chính xác**, kể cả chữ hoa/chữ thường và khoảng trắng. Nếu nộp đúng chuỗi nhưng vào ô câu hỏi khác, hệ thống vẫn chấm sai.
- [ x] **L06 — Mở phòng kế tiếp:** Sau khi hoàn thành cả hai câu phòng 20, quay về lộ trình: phòng 21 mở được. URL trực tiếp `/rooms/blind-time-based-sqli` cũng truy cập được. Câu 1 phòng 21 có đáp án seed `pg_sleep` nếu bạn muốn tiếp tục kiểm tra chuỗi prerequisite.
- [x ] **L07 — Phòng trả phí:** `/rooms/insecure-deserialization-ssrf` bị từ chối ngay cả khi nhập URL trực tiếp; hiện chưa có mua/quyền truy cập nội dung trả phí.
- [ x] **L08 — Chống nộp sai liên tiếp (tùy chọn):** Dùng **câu chưa hoàn thành** và tài khoản test riêng, nộp sai 5 lần trong 60 giây. Lần sai thứ 5 phải khóa nộp trong 180 giây và hiển thị đếm ngược. Reload hoặc nhập URL trực tiếp không được vượt khóa. Tránh dùng câu cần giải ngay vì phải chờ hết khóa.

### Thử gợi ý CF-204 trên DB thử nghiệm

Seed hiện tại **không gán `hint_tiers` cho câu hỏi**, nên nút **Gợi ý & lời giải** sẽ báo câu chưa có gợi ý. Để tự thử luồng trên một **DB local dùng cho kiểm thử và có thể thay thế**, chạy lệnh sau **trước khi Student mới nộp câu 2 phòng 20**. Lệnh chỉ thêm nội dung gợi ý cho câu hỏi seed cụ thể; không chạy trên DB dùng chung/production.

```bash
docker compose exec -T postgres psql -U cyberforce -d cyberforce <<'SQL'
UPDATE questions q
SET hint_tiers = '[{"tier":1,"content":"Kiểm tra kết quả truy vấn SQL."},{"tier":2,"content":"Tìm giá trị hash ở bước trích xuất."},{"tier":3,"content":"Đáp án mẫu: CF{sqli_admin_hash_99a8}"}]'::jsonb
FROM tasks t, rooms r
WHERE q.task_id = t.id
  AND t.room_id = r.id
  AND r.slug = 'sql-injection-fundamentals'
  AND q.question_text = 'Submit the extracted admin password hash.'
RETURNING q.id, q.question_text;
SQL
```

Kỳ vọng lệnh báo `UPDATE 1`. Nếu `UPDATE 0`, kiểm tra seed và slug phòng trước khi tiếp tục.

- [ ] **H01 — Hủy không mất điểm:** Ở câu 2, mở **Gợi ý & lời giải** → **Gợi ý 1**. Hộp xác nhận cho thấy điểm thưởng 75 → 68 EXP (giảm 7 do làm tròn xuống). Chọn **Hủy**; mở lại kiểm tra vẫn còn 75 EXP và chưa thấy nội dung.
- [ ] **H02 — Mở và lưu trạng thái:** Xác nhận mở Gợi ý 1. Nội dung xuất hiện, điểm thưởng còn 68 EXP; **tổng EXP đã tích lũy không giảm**. Reload: gợi ý vẫn mở. Gợi ý 2/lời giải chỉ mở theo thứ tự và có xác nhận chi phí; tài khoản Student khác không thấy nội dung đã mở của bạn.
- [ ] **H03 — Chấm điểm sau gợi ý:** Nộp đúng câu 2; nếu chỉ mở Gợi ý 1, nhận **68 EXP** thay vì 75. Sau khi câu đã hoàn thành, có thể xem các gợi ý/lời giải của chính câu đó miễn phí. Nếu đã mở thêm cấp khác, điểm nhận sẽ thấp hơn tương ứng.

## 6. Student → Admin → Creator

Luồng này cần ít nhất một Student mới và tài khoản `cyber_admin` từ seed. Dùng hai hồ sơ trình duyệt hoặc đăng xuất/đăng nhập tuần tự.

- x[ ] **R01 — Gửi yêu cầu Creator:** Student mở menu tài khoản → **Đăng ký trở thành Creator**. Chọn chuyên môn, nhập **Kinh nghiệm & ý tưởng** ít nhất 10 ký tự, portfolio URL nếu có, rồi gửi. Mở lại hộp thoại: thấy trạng thái **đang chờ duyệt**, không gửi trùng yêu cầu pending.
- [ x] **R02 — Chặn Student ở trang Admin:** Student mở thẳng `/admin/roles`: thấy thông báo chỉ quản trị viên được truy cập, không thấy danh sách yêu cầu.
- [x ] **R03 — Admin duyệt:** Đăng nhập `admin@cyberforce.io`, vào menu tài khoản → **Duyệt quyền Creator** (`/admin/roles`). Ở tab **Chờ duyệt**, mở **Kinh nghiệm & ý tưởng** của Student và chọn **Duyệt**. Yêu cầu chuyển sang tab **Đã duyệt**; sau khi Student đăng nhập lại/khôi phục phiên, role là Creator và mục đăng ký Creator không còn trong menu.
- [ x] **R04 — Admin từ chối:** Tạo một Student thứ hai, gửi yêu cầu khác. Admin chọn **Từ chối**, nhập lý do ít nhất 5 ký tự. Student mở lại hộp đăng ký: thấy lý do từ chối và có thể gửi yêu cầu mới.
- [ x] **R05 — Lọc/phân trang (nếu đủ dữ liệu):** Admin thử **Tất cả / Chờ duyệt / Đã duyệt / Từ chối**; mỗi trang tối đa 20 yêu cầu. Khi có hơn 20 yêu cầu, thử chuyển trang rồi xử lý bản ghi cuối để kiểm tra trang hợp lệ được cập nhật.

Creator và Instructor hiện không có workflow tác giả riêng để kiểm tra. `Creator Studio` trong menu đưa về đoạn giới thiệu ở trang chủ, **không phải** trình soạn nội dung. `Org Admin` dùng cùng trang duyệt quyền Creator như `Superadmin`. Chỉ tạo tài khoản Org Admin/Instructor thử nghiệm bằng API gán vai trò nếu bạn muốn kiểm tra RBAC; không đổi vai trò của tài khoản thật.

**API quản trị bổ sung (tùy chọn, chỉ trên DB thử nghiệm):** Đăng nhập Superadmin bằng API như bước 7 để lấy access token. Lấy `data.user.id` của một tài khoản test từ response đăng nhập tài khoản đó, rồi gọi `POST /api/v1/admin/users/assign-role` với JSON `{"userId":"<UUID tài khoản test>","role":"instructor"}` hoặc `"org_admin"`. Đăng nhập lại tài khoản test: Instructor vẫn bị chặn ở `/admin/roles`, Org Admin mở được trang này. `GET /api/v1/admin/audit-logs` bằng token Admin cho phép xem lịch sử thao tác quyền. Student/Instructor gọi các API `/admin/*` phải bị từ chối 403. Gán role trực tiếp và audit log chưa có UI.

## 7. Kiểm tra backend CF-301–302 bằng API client (tùy chọn)

Web hiện hiển thị **Khởi chạy máy (chưa khả dụng)**; chưa có terminal, bộ đếm giờ, gia hạn hay nút dừng. Muốn thử backend CF-301–302, dùng Postman/Insomnia hoặc công cụ API tương đương trên DB local thử nghiệm.

1. Gửi `POST http://localhost:4000/api/v1/auth/login` với JSON `{"email":"<email Student>","password":"<mật khẩu>"}`; lấy `data.accessToken` trong response. Với các request tiếp theo, đặt header `Authorization: Bearer <accessToken>`. Không lưu token hoặc mật khẩu vào repo.
2. Đảm bảo phòng `sql-injection-fundamentals` có image `cyberforce/sqli-basics:latest` **đã tồn tại sẵn trên Docker host**. Seed chỉ ghi tên image, không build/pull image. Nếu thiếu image, spawn có thể trả 503; đây là thiếu dữ liệu môi trường, chưa phải lỗi UI.
3. Gửi `POST /api/v1/rooms/sql-injection-fundamentals/spawn` với Student đã đăng nhập. Kỳ vọng HTTP 201, `data.status=running`, `instanceId`, `targetIp` thuộc `100.64.0.0/10`, `expiresAt` khoảng 60 phút. Response không chứa container ID, image hoặc salt.
4. Gửi lại spawn khi máy còn chạy: HTTP 409, mỗi tài khoản chỉ có một máy active. Dùng Student khác gửi `POST .../stop` cho phòng đó: HTTP 404; không được dừng máy của chủ phiên.
5. Gửi `POST /api/v1/rooms/sql-injection-fundamentals/extend` bằng token chủ phiên: hạn tăng 60 phút và `extensionCount` tăng một. Chỉ chủ phiên được gia hạn, tối đa 3 lần; sau đó API trả `LAB_EXTENSION_LIMIT`. Phiên vừa hết hạn vẫn được gia hạn trong 3 phút ân hạn. Đừng sửa đồng hồ hệ thống hoặc DB thật để thử grace; dùng DB test riêng.
6. Gửi `POST /api/v1/rooms/sql-injection-fundamentals/stop` bằng token chủ phiên: HTTP 200, `status=terminated`. Sau đó thử spawn lại để xác nhận đã được phép, rồi **stop lần nữa** để dọn container. Nếu để phiên tự hết hạn, Go reaper kiểm tra mỗi 30 giây và dọn sau 3 phút ân hạn; không cần giữ máy chạy chỉ để đợi kiểm thử thời gian thật.
7. Nếu muốn kiểm tra bảo vệ API: spawn không token trả 401; spawn phòng trả phí trả 403; spawn phòng chưa đủ prerequisite trả 403. Các route này không thay thế giao diện người dùng.

## 8. Ghi nhận kết quả

Khi có bước không đạt, ghi **mã bước**, tài khoản/role, URL, dữ liệu test, kết quả mong đợi và kết quả thực tế. Với lỗi API, lưu thêm HTTP status và `error.code`; che token, cookie, mật khẩu và thông tin riêng tư trước khi chia sẻ. Nếu muốn chạy lại từ đầu, tạo **tài khoản test mới**; đừng chạy lại seed trên DB cần giữ dữ liệu.
