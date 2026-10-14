# CF-304 — Đổi độ phân giải AttackBox thật (2026-10-14)

## Phạm vi được duyệt

Người dùng duyệt thay Xvfb/x11vnc bằng TigerVNC Xvnc trong Kali AttackBox để Guacamole có thể đổi độ phân giải desktop theo vùng web desktop. Đo SLA phản hồi `<80ms` là bước riêng.

## Triển khai

- Image Kali dùng `tigervnc-standalone-server` và `tigervnc-tools`, giữ XFCE, công cụ pentest, VNC password theo phiên, mạng riêng, quyền container và tài nguyên như trước.
- Entrypoint tạo password file có quyền riêng, chạy Xvnc với VncAuth và `AcceptSetDesktopSize`, khởi động XFCE cùng `vncconfig -nowin` cho clipboard.
- Entrypoint chuyển SIGTERM tới Xvnc để dừng container gọn khi lab kết thúc.
- Web chờ frame Guacamole đầu tiên trước khi gửi `size`, debounce 250 ms, giới hạn 640×480–1920×1080. Canvas scale theo kích thước desktop thực và vùng chứa; chuột tiếp tục quy đổi theo scale.
- Go bridge cũng giới hạn lệnh `size` từ WebSocket ở 640×480–1920×1080 và DPI 72–192 để client tùy biến không thể yêu cầu framebuffer quá lớn.
- Không thay đổi API public, schema hay cơ chế ticket/guacd.

## Kiểm chứng

- Image Kali build thành công; container với sandbox policy thật chạy Xvnc và `vncconfig`. `xrandr` trong container tạm đổi 1280×800 sang 1024×768.
- Web local desktop (1440×900) với phòng `sqli-basics-101`: AttackBox hiển thị qua Guacamole; `xrandr` ghi 687×480 ở split view, 1310×818 khi mở rộng, 687×480 khi thu lại; trạng thái kết nối duy trì.
- Clipboard browser → Kali và Kali → browser đúng chuỗi test; reconnect vẫn hiển thị desktop. Web typecheck, lint, build, Go tests và `git diff --check` qua.
- Phiên lab, AttackBox và tài khoản test `cf304resize141026` đã dọn. Web local đã được rebuild và healthy.
- Go Orchestrator local cũng đã rebuild và healthy với giới hạn resize ở bridge.

## Giới hạn

- Chưa đo độ trễ đầu cuối `<80ms` dưới tải hoặc trên mạng khác máy local. Cần nghiệm thu hiệu năng riêng trước khi tuyên bố đạt SLA.
- Các phiên AttackBox đã chạy trước khi thay image không tự đổi VNC server; phiên mới dùng image đã build.
