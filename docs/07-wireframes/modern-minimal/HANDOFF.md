# Bàn giao và ranh giới triển khai

## Đã được phê duyệt

Toàn bộ 8 epic cộng trang chủ/dashboard; wireframe desktop/mobile và trạng thái; light mặc định/dark; Inter + JetBrains Mono; hai vùng phòng học; phản hồi tại chỗ thay popup chúc mừng; danh sách thành tích thay badges trang trí. DESIGN.md là hướng thiết kế mới, không mô tả CSS hiện đang chạy.

## Đối chiếu nguồn và giới hạn

| Điểm khác nhau giữa tài liệu | Cách xử lý trong thiết kế |
|---|---|
| DESIGN cũ Neo-Brutalism, README/wireframe cũ có Tactical HUD | Thiết kế Modern Minimal đã duyệt thay thế phần trình bày; không dùng lại token cũ |
| `/room/...` trong wireframe, `/rooms/...` trong epic | Dùng `/rooms/[slug]` làm đường dẫn thiết kế theo epic; chưa thêm redirect hay sửa route runtime |
| VPN `/settings/vpn` trong wireframe, `/access/vpn` trong epic | Dùng `/access/vpn` theo epic; chưa thay đổi API/route hiện có |
| Ví dụ IP 10.x trong sơ đồ cũ, epic 3/4 quy định 100.64.0.0/10 | Dùng IP 100.64.x.x cho minh họa; UI thực tế hiển thị IP được server cấp |
| README ghi lease 2 giờ ở phần hạ tầng, PRD/epic ghi 60 phút + 3 lần gia hạn | Thiết kế dùng quy tắc PRD/epic; runtime phải đối chiếu hợp đồng backend, không sửa backend trong đợt này |
| Điểm tiến độ cũ dùng phòng, epic quy định task bắt buộc | Hiển thị x/y task cho tiến độ học; điều kiện thi vẫn kiểm tra các phòng bắt buộc theo server |
| Radar là EXP tuyệt đối; B2B dùng proficiency 0–100 | Giữ hai thang đo khác nhau, không tự nghĩ công thức chuẩn hóa/benchmark |
| Mức phạt KotH diễn giải khác nhau trong PRD và ví dụ epic | Không hardcode mức phạt trong UI; hiển thị mức và thời hạn máy chủ trả |
| Mẫu mã/chữ ký chứng chỉ khác nhau giữa các nguồn | Hiển thị nguyên văn mã và kết quả xác minh server; không chọn thuật toán mật mã trong thiết kế |
| Creator yêu cầu nộp thử ít nhất 1 lần, tooltip đòi đủ tất cả cờ | Thể hiện x/y cờ bắt buộc và chỉ mở gửi khi backend xác nhận đủ; không tự nới điều kiện |

Các điểm này không được coi là thay đổi nghiệp vụ đã được duyệt. Khi triển khai nếu hợp đồng backend khác với yêu cầu thì cần đưa phương án cụ thể cho người dùng phê duyệt; tài liệu này không tự sửa chính sách để giải quyết mâu thuẫn.

## Phạm vi thay đổi hiện tại

Chỉ tài liệu và theme nguồn trong worktree. Không chỉnh React, CSS, API, database, dependencies, routing, dữ liệu hoặc môi trường triển khai. Các wireframe cũ được đánh dấu đã thay thế để giữ lịch sử đối chiếu. Chưa tạo PR, commit hoặc deploy.

## Tiêu chí nghiệm thu khi triển khai frontend sau này

- [ ] Luồng học viên: đăng ký → danh mục → bài học → khởi chạy → nộp → tiến độ, đầy đủ các trạng thái lỗi.
- [ ] Không mất nháp/phiên khi chuyển tab mobile hoặc resize workspace; offline không báo nộp thành công giả.
- [ ] Lab: xung đột target, gia hạn hết lượt, grace, thu hồi và reconnect được kiểm tra bằng trạng thái backend.
- [ ] Thi: không gợi ý, không đổi VPN, deadline server, kết thúc không gửi trùng, PDF pending/error tách khỏi kết quả thi.
- [ ] CTF: suy giảm điểm và freeze không tiết lộ thứ hạng chưa công bố; KotH không cộng điểm từ timer client.
- [ ] Quyền riêng tư và RBAC: khách/private/Student/Creator/Admin/tổ chức không thấy dữ liệu ngoài quyền.
- [ ] CMS và Creator: validation, test, gửi duyệt, duyệt đồng thời và bản nháp không mất khi lỗi.
- [ ] B2B: người chưa học không bị đánh giá là năng lực 0; đơn vị/benchmark có nguồn rõ ràng.
- [ ] Desktop 1440/1024, tablet 768, mobile 390/320, zoom 200%, light/dark và bàn phím.
- [ ] Đối chiếu đầy đủ 64 hàng TRACEABILITY và mọi user story trong 8 epic.

Đây là checklist cho bước triển khai, chưa đánh dấu đã chạy test UI. Bản bàn giao hiện tại chỉ được kiểm tra cấu trúc tài liệu, liên kết, độ phủ đối chiếu và token màu.
