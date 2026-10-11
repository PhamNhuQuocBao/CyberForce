# CyberForce — Wireframe Modern Minimal

Bản thiết kế ngày 2026-10-10, theo phạm vi người dùng đã phê duyệt: toàn bộ 8 epic, trang chủ và dashboard; desktop/mobile; light mặc định và dark mode; Inter + JetBrains Mono; phòng học hai vùng; phản hồi tại chỗ; giữ thành tích nghiệp vụ dưới dạng danh sách.

**Hình thức bàn giao:** tài liệu Markdown có sơ đồ low-fidelity bằng text, mô tả tương tác và bảng trạng thái. Không phải prototype HTML/Figma có thể bấm, không phải frontend đã kết nối API. Những chi tiết bố cục dưới đây là bản thiết kế để review, không phải thay đổi nghiệp vụ hoặc bằng chứng chức năng đã chạy.

## Đọc bộ thiết kế

1. [Design system](../../../DESIGN.md): token màu, typography, layout và component.
2. [Quy tắc chung](FOUNDATION.md): điều hướng, responsive, dark mode, trạng thái và accessibility.
3. Xem từng nhóm màn hình bên dưới.
4. [Đối chiếu 64 wireframe cũ](TRACEABILITY.md): kiểm tra luồng cũ còn ở đâu.
5. [Bàn giao và các điểm cần đối chiếu](HANDOFF.md): ranh giới triển khai, mâu thuẫn nguồn và tiêu chí kiểm tra.

## Các nhóm màn hình

| Tài liệu | Số đơn vị thiết kế | Nội dung |
|---|---:|---|
| [Trang chủ và tổng quan](00-entry.md) | 2 | HOME-01, HOME-02 |
| [Danh tính, hồ sơ và phân quyền](01-identity.md) | 8 | ID-01, ID-02, ID-03, ID-04, ID-05, ID-06, ID-07, ID-08 |
| [Lộ trình và phòng học](02-learning.md) | 4 | LEARN-01, LEARN-02, LEARN-03, LEARN-04 |
| [Cloud Lab và môi trường thực hành](03-lab.md) | 2 | LAB-01, LAB-02 |
| [Kết nối VPN](04-vpn.md) | 2 | VPN-01, VPN-02 |
| [CTF và KotH](05-competition.md) | 5 | CTF-01, CTF-02, CTF-03, CTF-04, CTF-05 |
| [Kỳ thi và chứng chỉ](06-exams.md) | 4 | EXAM-01, EXAM-02, EXAM-03, EXAM-04 |
| [Tiến độ và thành tích](07-progress.md) | 1 | PROGRESS-01 |
| [CMS, Creator và phân tích tổ chức](08-management.md) | 7 | MANAGE-01, MANAGE-02, MANAGE-03, MANAGE-04, MANAGE-05, MANAGE-06, MANAGE-07 |

Tổng cộng **35 đơn vị thiết kế**. Một đơn vị có thể là trang, nhóm danh mục/chi tiết có cùng cấu trúc, hoặc panel/trạng thái dùng lại; không tương đương 35 route mới.

## Thứ tự review

Bắt đầu HOME-02 → LEARN-02 → LEARN-04 → LAB-01 để xem luồng học tập chính. Tiếp theo EXAM-01 → EXAM-04 cho khảo thí; CTF-01 → CTF-05 cho thi đấu; MANAGE-01 → MANAGE-07 cho vận hành nội dung và tổ chức. Xác thực, quyền riêng tư và trạng thái lỗi dùng chung được kiểm tra cùng các luồng này.

## Nguồn

- [Theme do người dùng chỉ định](../../cybersecurity-theme.md), sao chép nguyên văn từ repo gốc vào worktree này.
- [PRD](../../01-product/PRD_CYBERFORCE.md), [TDD](../../02-architecture/TDD_CYBERFORCE.md).
- [Danh mục epic/user story](../../05-epics/SUMMARY.md), các user flow trong `docs/06-user-flow` và 64 mục wireframe cũ được dẫn trong TRACEABILITY.
- Các trang hiện có trong `apps/web/src/app`: trang chủ, login/register, OAuth callback, hồ sơ và admin roles. Route khác trong bộ này là đích thiết kế, không khẳng định đã triển khai.

Số IP, thời gian và điểm trong sơ đồ là minh họa bố cục. Khi triển khai phải dùng dữ liệu thật và quyền từ máy chủ.

## Kiểm tra bàn giao

Xem [kết quả kiểm tra tài liệu](VALIDATION.md).

## Prototype trực quan

[Bản prototype 4 màn hình](prototype/README.md) đã được dựng ở bước tiếp theo theo phê duyệt của người dùng. HTML chạy độc lập, có light/dark và các tương tác mô phỏng; không thay thế frontend ứng dụng.
