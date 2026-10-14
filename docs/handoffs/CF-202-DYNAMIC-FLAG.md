# CF-202 — Dynamic flag injection (2026-10-14)

## Phạm vi được duyệt

API Core sinh cờ theo HMAC đã có từ `userId + roomId + dynamicSalt`, gửi chỉ giá trị cờ tới Orchestrator qua API nội bộ có bearer token. Orchestrator ghi cờ vào `/root/flag.txt` trước khi khởi động container target. Không chuyển platform master key sang Orchestrator hoặc đưa cờ vào environment của container. Kiểm thử web desktop; không mở rộng sang mobile.

## Triển khai

- API chỉ tạo cờ khi phòng có ít nhất một câu hỏi `dynamic_hmac`; các phòng dùng cờ tĩnh/regex không yêu cầu `PLATFORM_MASTER_KEY` thật.
- Khóa mặc định hoặc khóa ngắn làm spawn phòng dynamic trả `503 DYNAMIC_FLAG_UNAVAILABLE` trước khi tạo bản ghi phiên.
- Hợp đồng spawn nội bộ có trường `dynamicFlag` tùy chọn, được Go kiểm tra đúng `flag{24 hex}`. Response cho học viên và Orchestrator không chứa cờ.
- Docker SDK copy TAR chỉ chứa `flag.txt` với quyền `0400`, owner root, vào `/root` của target trước `ContainerStart`. Lỗi inject hủy container/network và API đánh dấu phiên terminated.
- Bộ chấm tiếp tục dùng salt lưu ở DB và cùng hàm kiểm tra khóa, không thay đổi công thức cờ hay schema.

## Kiểm chứng

- API: 111/111 tests qua trên database `cf202_dynamic_test_20261014`, Redis DB 14. Test mới kiểm tra placeholder bị từ chối, request nội bộ chỉ có cờ, không lộ cờ/salt ở response, cờ được bộ chấm chấp nhận.
- Go: toàn bộ unit tests qua với Go 1.24 trong container.
- Docker smoke trên image local `cyberforce/sqli-basics-101:local`: file `/root/flag.txt` có đúng cờ, quyền `0400`; environment container không có cờ; stop dọn lab thành công.
- API typecheck/lint và `git diff --check` qua.

## Điều kiện sử dụng và giới hạn

- Người vận hành cần đặt `PLATFORM_MASTER_KEY` bí mật, dài ít nhất 32 ký tự, khác placeholder trong `.env.example`; giữ ổn định để cờ của phiên đang chạy tiếp tục chấm đúng.
- Room cần image target có thư mục `/root` và câu hỏi `dynamic_hmac`. Seed hiện có chỉ dùng cờ tĩnh; không tự chuyển đáp án của các phòng hiện tại sang dynamic.
- Chưa đo SLA spawn dưới tải. CF-304 còn việc đổi độ phân giải Xvfb thực và đo độ trễ `<80ms`.
