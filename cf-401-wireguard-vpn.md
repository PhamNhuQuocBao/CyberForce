# CF-401 — WireGuard VPN và cấu hình cá nhân

## Mục tiêu

Học viên đăng nhập tải cấu hình WireGuard riêng, kết nối tới gateway và ping được IP gateway trong dải `100.64.0.0/10`; khóa cũ bị thu hồi khi tạo lại.

## Phương án đã duyệt

- Chạy một gateway WireGuard trong Compose local với quyền mạng giới hạn, thay vì cấu hình trực tiếp trên host. Đây là bước đầu của CF-401; cluster nhiều node cần thiết kế riêng.
- Dành riêng một phần dải `100.64.0.0/10` cho VPN và loại dải đó khỏi bộ cấp subnet `/29` của lab để tránh trùng IP.
- Lưu public key, IP và trạng thái cấp phát trong PostgreSQL; private key chỉ trả về lúc tạo/tạo lại và không lưu trong DB. Tạo lại khóa phải thay peer trên gateway rồi mới trả cấu hình mới.
- Chỉ cho VPN client tới gateway ở CF-401. Route tới target của đúng phiên và cách ly client thuộc CF-402; không mở route chung tới toàn bộ lab trước khi có chính sách đó.

## Triển khai và kiểm chứng

- [x] Dành `100.127.240.0/20` cho VPN; allocator lab không chọn dải này.
- [x] Gateway Compose tạo/giữ server key trong volume, quản lý peer qua API nội bộ và khóa IPv4 forwarding; thử thêm/xóa peer và restart giữ trạng thái.
- [x] Bảng `vpn_peers`, API status/tạo/tạo lại cấu hình có xác thực; private key chỉ nằm trong phản hồi tạo, không lưu trong DB/gateway.
- [x] Trang `/access/vpn` tải `.conf`, cảnh báo trước khi tạo lại khóa và hướng dẫn `wg-quick`; đã kiểm tra trang desktop và cảnh báo bằng trình duyệt.
- [x] API 114/114 tests, Web 14/14 tests, Go gateway/orchestrator tests, lint/typecheck/build qua. Gateway smoke: hai client handshake và ping gateway, ping chéo bị chặn; peer sống qua restart. API thật tạo cấu hình một lần, từ chối tải lại, tạo lại khóa giữ IP.

## Giới hạn nghiệm thu

Không áp dụng cấu hình vào host hoặc production. Gateway nhiều node, OpenVPN dự phòng và route tới target phụ thuộc thiết kế/bước sau; cần quyết định riêng nếu muốn chúng nằm trong CF-401.

Chỉ áp dụng schema vào PostgreSQL của project smoke `cf401-smoke`; chưa áp dụng SQL vào DB local chính hoặc production. SLA mạng ngoài máy local chưa đo. Nhánh bắt đầu từ `83f9c11` của CF-304, đang chờ merge nhánh gốc.
