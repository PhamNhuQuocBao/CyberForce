# Hiện trạng màn hình và giới hạn dữ liệu

Cập nhật 2026-10-13. Bảng này phân biệt route/UI đang có với thiết kế để đưa vào Stitch. “Đã có” chỉ có nghĩa là route và luồng tương ứng tồn tại trong repo; không xác nhận tất cả trạng thái thiết kế đã được nghiệm thu.

| Nhóm | Màn hình hiện có | Giới hạn khi tạo UI |
|---|---|---|
| Trang chủ | `/` | Nội dung nổi bật phải lấy dữ liệu xuất bản; không điền thống kê/đối tác giả. Dashboard `/dashboard` là ý tưởng. |
| Danh tính | `/login`, `/register`, `/auth/callback`, `/user/[username]`, `/admin/roles` | Auth, hồ sơ, privacy và duyệt Creator đã nối API. OAuth ngoài hệ thống/OTP email chưa được xác minh. Số liệu kỹ năng, lab, lộ trình trên profile backend còn mô phỏng: không vẽ như thành tích thật. |
| Học tập | `/paths`, `/paths/[slug]`, `/rooms/[slug]` | Catalog, chi tiết và enroll lưu DB. Phòng học có nội dung, bài tập, nháp theo tài khoản/phòng và nộp cờ; chỉ hiện tiến độ/EXP do server trả. `/rooms` danh mục riêng chưa có. |
| Lab | Chưa có máy lab, AttackBox hoặc terminal thật | Khu vực thực hành của phòng chỉ là vị trí dành cho lab. Không dựng terminal giả, IP/timer hoặc nút Start có vẻ hoạt động. |
| VPN, CTF, KotH, thi, chứng chỉ, gamification, CMS, Creator Studio, B2B analytics | Ý tưởng theo wireframe | Thiết kế đầy đủ để thảo luận; không mô tả API hoặc route này như đã chạy. `/admin/roles` là duyệt quyền Creator, khác hàng đợi duyệt nội dung CMS. |

Các trạng thái thiếu dữ liệu, đang tải, lỗi và không có quyền phải có chỗ đứng trong bản thiết kế. Mọi số liệu trong mockup là **dữ liệu minh họa cho bố cục**, phải gắn nhãn trong bản xuất Stitch; không dùng làm bằng chứng tính năng. Đáp án/cờ đúng không xuất hiện trong view học viên. Điều kiện khóa phòng, quyền xem, điểm và trạng thái nộp do backend quyết định.

Nguồn đối chiếu: [wireframe](README.md), [task handoff](../../handoffs/CURRENT_TASK.md), [gói prompt Stitch](STITCH.md).
