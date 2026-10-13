# Kiểm tra bộ tài liệu

Thực hiện ngày 2026-10-10. Đây là kiểm tra tài liệu thiết kế, không phải kiểm thử frontend hoặc chứng nhận accessibility của ứng dụng.

| Kiểm tra | Kết quả |
|---|---|
| Đơn vị thiết kế | 35 mục; mỗi mục có Desktop, Mobile, hành vi và trạng thái riêng |
| Đối chiếu nguồn | 64/64 wireframe cũ có đích thay thế |
| Độ phủ nghiệp vụ | 28/28 user story trong 8 file epic có mục thiết kế tương ứng |
| Liên kết nội bộ và anchor | Tồn tại; kiểm tra bằng script đọc file |
| Code fence Markdown | Cân bằng |
| YAML DESIGN.md | Parse thành công |
| Tham chiếu token | Tất cả tham chiếu giải được |
| Theme nguồn | Bản trong worktree khớp byte với file người dùng chỉ định tại repo gốc |
| Tương phản | 17 cặp chữ/nền chính light/dark, CTA và thông báo đạt ít nhất 4,5:1 |
| Phạm vi thay đổi | Tài liệu Markdown; không sửa source frontend hoặc backend |

Các cặp tương phản đã kiểm: foreground/background 15,48; muted-foreground/surface-muted 5,13; chữ CTA với primary/hover/active 11,65/9,38/7,40; link/surface 6,00; dark-foreground/dark-surface 15,48; dark-muted-foreground/dark-surface-muted 7,71; dark-link/dark-surface-interactive 5,14; chữ/nền success 6,49, warning 6,37, error 6,80, info 7,65; dark-success/warning/error/info trên dark-surface lần lượt 11,60/11,29/8,58/9,03.

Tài liệu wireframe không tự xác nhận render, bàn phím, screen reader, responsive runtime, API hay phiên lab. Một số route đã được kiểm thử riêng theo handoff kỹ thuật; phần còn lại vẫn là ý tưởng. Xem IMPLEMENTATION-STATUS.md và HANDOFF.md.
