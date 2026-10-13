# Gói đầu vào Stitch — CyberForce web

Cập nhật 2026-10-13. Dùng [DESIGN.md](../../../DESIGN.md) làm nguồn token và lý do thiết kế, [FOUNDATION.md](FOUNDATION.md) cho quy tắc tương tác, [wireframe](README.md) cho bố cục/trạng thái và [hiện trạng](IMPLEMENTATION-STATUS.md) để phân biệt UI đang chạy với ý tưởng. Các prompt dưới đây giúp tạo **UI web desktop 1440 × 900**, tiếng Việt. Nếu Stitch nhận file, đưa DESIGN.md và wireframe liên quan làm context; nếu dùng ô prompt, dán prompt nền rồi thêm một prompt màn hình. Tạo từng nhóm màn hình để giữ tính nhất quán, rồi tinh chỉnh trên cùng canvas.

## Prompt nền — dán một lần cho dự án

```text
Thiết kế CyberForce, nền tảng học an ninh mạng qua lộ trình, phòng học và thực hành. Tạo giao diện web desktop tiếng Việt, canvas 1440×900, phong cách Modern Minimal đã có trong DESIGN.md đính kèm. Light mode mặc định: nền #F9F9FB, surface #FFFFFF, chữ #182031, navy #212C42; CTA lime #A3EA2A với chữ #151C2B; xanh #1550F5 cho link và focus. Dark mode dùng nền #151C2B, surface #182031. Font Inter, code/IP dùng JetBrains Mono. Nhịp spacing 4/8/16/24/32/48/64px, control bo 4px, panel bo 8px, border 1px dịu; một hành động chính rõ trên mỗi màn hình. Dùng typography và khoảng trắng để phân cấp, bảng/danh sách cho dữ liệu dày, card chỉ cho nhóm nội dung thực sự. Không dùng Neo-Brutalism, Tactical HUD, neon glow, gradient trang trí, terminal giả, biểu đồ/số liệu giả, sticker, confetti, trophy 3D hoặc badge trang trí.

Thiết kế hệ thống navigation nhất quán: khách thấy lộ trình, thực hành, thi đấu, chứng chỉ, đăng nhập; menu tài khoản và các mục Creator/Admin chỉ xuất hiện khi có quyền. Ở mỗi màn hình thể hiện nhãn trường, trạng thái bằng chữ, focus rõ, lỗi tại chỗ, loading/empty/error và hành động thử lại. Không đặt đáp án cờ trong UI học viên. Không vẽ quyền hoặc thành công chỉ từ client; nội dung khóa, tiến độ và điểm là dữ liệu server. Giữ bản thiết kế desktop ưu tiên; responsive có thể tham khảo nhưng không cần tạo bộ mobile trong lần generate này.
```

## Prompt màn hình — dán một hàng mỗi lượt

Khi dùng một hàng, thêm câu cuối: “Tạo đúng một màn hình hoặc một trạng thái được nêu; giữ token, navigation và component của dự án. Dùng cấu trúc và hành vi chi tiết ở liên kết wireframe.” Các tên route là đích thiết kế, không tự chứng minh route đã triển khai. Trạng thái cụ thể và microcopy nằm tại liên kết từng màn hình.

| ID | Prompt cần thêm sau prompt nền | Wireframe |
|---|---|---|
| HOME-01 | Trang chủ công khai `/`: hero navy với thông điệp học qua thực hành, CTA “Bắt đầu học” và “Xem lộ trình”; phần lộ trình xuất bản trên nền sáng, giải thích cách học, footer gọn. Không dùng số liệu xã hội giả. | [Chi tiết](00-entry.md#home-01) |
| HOME-02 | Dashboard học viên `/dashboard`: ưu tiên tiếp tục bài và lab đang chạy nếu có; bốn nhóm tách rõ “Lộ trình của bạn”, “Thành tích gần đây”, “Tiến độ cá nhân”, “Năng lực đã tích lũy”. Dữ liệu trống phải dẫn tới lộ trình đầu tiên. Đây là ý tưởng, tránh giả làm dữ liệu live. | [Chi tiết](00-entry.md#home-02) |
| ID-01 | Trang đăng nhập `/login`: form giữa trang rộng tối đa 440px, Google/GitHub, email/mật khẩu, hiển thị mật khẩu, lỗi sát form, link đăng ký. Có trạng thái đang gửi và giới hạn thử lại. | [Chi tiết](01-identity.md#id-01) |
| ID-02 | Trang đăng ký `/register`: form gọn, phương thức OAuth, username/email/password, yêu cầu mật khẩu rõ, phản hồi xác thực và link đăng nhập. | [Chi tiết](01-identity.md#id-02) |
| ID-03 | OAuth callback/liên kết tài khoản: trạng thái đang xác minh, xung đột tài khoản và cách xác thực tài khoản hiện có trước khi liên kết; không tự gộp email. | [Chi tiết](01-identity.md#id-03) |
| ID-04 | Hồ sơ `/user/[username]`: thông tin công khai, tiến độ/kỹ năng chỉ khi có dữ liệu thật, chứng chỉ xác thực được; trạng thái private không rò rỉ. | [Chi tiết](01-identity.md#id-04) |
| ID-05 | Dialog chỉnh hồ sơ/quyền riêng tư: trường chỉnh sửa, lựa chọn công khai, trạng thái lưu/lỗi tại chỗ, giữ bản nháp khi lỗi. | [Chi tiết](01-identity.md#id-05) |
| ID-06 | Dialog đăng ký Creator: điều kiện, mô tả kinh nghiệm, gửi yêu cầu và trạng thái chờ duyệt; không báo thành công trước phản hồi API. | [Chi tiết](01-identity.md#id-06) |
| ID-07 | Trang `/admin/roles`: bảng yêu cầu Creator có lọc/phân trang, chi tiết, nhận xét và quyết định duyệt/từ chối; quyền admin và cập nhật trạng thái rõ. | [Chi tiết](01-identity.md#id-07) |
| ID-08 | Trạng thái 403/404: lý do dễ hiểu, đường quay lại hợp lệ, không nháy dữ liệu nhạy cảm khi đang kiểm quyền. | [Chi tiết](01-identity.md#id-08) |
| LEARN-01 | Danh mục `/paths`: tiêu đề, tìm/lọc, danh sách lộ trình xuất bản với trình độ và trạng thái đã đăng ký; empty/error/retry; một CTA rõ tới chi tiết. | [Chi tiết](02-learning.md#learn-01) |
| LEARN-02 | Chi tiết `/paths/[slug]`: giới thiệu lộ trình, nút đăng ký/tiếp tục, cấu trúc module/phòng và điều kiện tiên quyết bằng chữ; tiến độ chỉ theo dữ liệu server. | [Chi tiết](02-learning.md#learn-02) |
| LEARN-03 | Danh mục phòng `/rooms`: bộ lọc kỹ năng/độ khó, danh sách phòng, trạng thái có thể mở hay bị khóa với lý do; đây là route ý tưởng. | [Chi tiết](02-learning.md#learn-03) |
| LEARN-04 | Phòng `/rooms/[slug]`: phòng lý thuyết một vùng toàn chiều rộng; phòng thực hành hai vùng bài học 45% và lab 55% có divider điều chỉnh. Mỗi task là accordion chứa nội dung, input cờ, nút Kiểm tra và phản hồi. Giữ nháp, hiển thị cooldown riêng từng câu; khu lab hiện chưa có runtime nên không vẽ terminal/IP giả trong bản hiện trạng. | [Chi tiết](02-learning.md#learn-04) |
| LAB-01 | Khái niệm điều khiển máy trong phòng thực hành: vùng trạng thái, IP, thời gian lease, gia hạn/dừng và xác nhận hậu quả, tất cả chỉ xuất hiện khi backend cấp phiên thật. | [Chi tiết](03-lab.md#lab-01) |
| LAB-02 | Khái niệm AttackBox/Web Terminal: toolbar, viewport riêng, reconnect, chính sách mạng và đường về câu hỏi; nhãn rõ “Thiết kế cho giai đoạn lab”, không dựng đầu ra terminal giả. | [Chi tiết](03-lab.md#lab-02) |
| VPN-01 | Trang quản lý VPN `/access/vpn`: hồ sơ cấu hình, trạng thái kết nối, mục tiêu được phép, tải/cấp lại và giải thích hậu quả; chỉ hiển thị health thật nếu API có. | [Chi tiết](04-vpn.md#vpn-01) |
| VPN-02 | Panel chẩn đoán VPN: các bước kiểm tra và kết quả theo từng bước, lỗi có hướng xử lý, không khẳng định kết nối thành công chỉ vì giao diện. | [Chi tiết](04-vpn.md#vpn-02) |
| CTF-01 | Danh mục giải `/ctf` và sảnh `/koth`: thời gian, điều kiện tham gia, luật, CTA đúng trạng thái; bảng/danh sách dễ quét. | [Chi tiết](05-competition.md#ctf-01) |
| CTF-02 | Phòng chờ KotH: người tham gia, trạng thái sẵn sàng, thời điểm bắt đầu, luật tính điểm và kết nối. | [Chi tiết](05-competition.md#ctf-02) |
| CTF-03 | Trận KotH trực tiếp: timer server, target, King, SLA, điểm và cảnh báo hành vi; bố cục tập trung tác vụ, không biến thành HUD trò chơi. | [Chi tiết](05-competition.md#ctf-03) |
| CTF-04 | Thử thách Jeopardy: danh sách/ma trận challenge có điểm hiện tại, lọc, chi tiết và nộp flag; trạng thái đóng băng bảng xếp hạng không tiết lộ thứ hạng. | [Chi tiết](05-competition.md#ctf-04) |
| CTF-05 | Kết quả CTF/KotH: bảng xếp hạng chính thức và kết quả cá nhân sau công bố, không podium/trophy trang trí. | [Chi tiết](05-competition.md#ctf-05) |
| EXAM-01 | Danh mục/chi tiết kỳ thi: điều kiện dự thi, thời lượng, ngưỡng đạt và quy chế; xác nhận trước khi bắt đầu. | [Chi tiết](06-exams.md#exam-01) |
| EXAM-02 | Workspace thi: thời gian còn lại từ server, danh sách câu/tiến độ, nộp bài và xác nhận kết thúc; không hiện gợi ý hoặc VPN đổi giữa phiên. | [Chi tiết](06-exams.md#exam-02) |
| EXAM-03 | Kết quả thi: đạt/chưa đạt, điểm/ngưỡng, năng lực cần ôn hoặc chứng chỉ đã cấp; PDF đang tạo/lỗi là trạng thái riêng. | [Chi tiết](06-exams.md#exam-03) |
| EXAM-04 | Xác thực chứng chỉ công khai: ô mã, kết luận hợp lệ/bị thu hồi/không tìm thấy/lỗi xác minh trước chi tiết; trạng thái bằng chữ, không badge. | [Chi tiết](06-exams.md#exam-04) |
| PROGRESS-01 | Tiến độ: EXP, cấp, streak, lịch hoạt động, radar tám kỹ năng kèm bảng số thay thế, danh sách thành tích; không dựng giá trị kỹ năng khi nguồn vẫn mô phỏng. | [Chi tiết](07-progress.md#progress-01) |
| MANAGE-01 | CMS admin: bảng lộ trình/module/phòng, lọc trạng thái và hành động tạo/chỉnh sửa theo quyền. | [Chi tiết](08-management.md#manage-01) |
| MANAGE-02 | Editor CMS: cây cấu trúc bên trái, form mục đang chọn bên phải, nhóm nội dung/câu hỏi/môi trường, lỗi xuất bản dẫn tới trường. | [Chi tiết](08-management.md#manage-02) |
| MANAGE-03 | Creator Studio: danh sách bài của mình, editor nội dung và preview học viên hai vùng, trạng thái lưu/kiểm thử/gửi duyệt. | [Chi tiết](08-management.md#manage-03) |
| MANAGE-04 | Kiểm thử lab bản nháp: phiên staging, trạng thái môi trường, x/y cờ đã xác minh và lỗi ngăn gửi duyệt; không dùng terminal giả. | [Chi tiết](08-management.md#manage-04) |
| MANAGE-05 | Hàng đợi duyệt nội dung: bảng bài/phiên bản/tác giả, preview và bằng chứng test, nhận xét, duyệt/từ chối với xác nhận. Khác `/admin/roles`. | [Chi tiết](08-management.md#manage-05) |
| MANAGE-06 | Phân tích tổ chức: nhóm, thời điểm cập nhật, độ phủ dữ liệu, ma trận tám kỹ năng có số và chú giải, phân biệt chưa có dữ liệu với 0. | [Chi tiết](08-management.md#manage-06) |
| MANAGE-07 | Chi tiết kỹ năng/giao lộ trình: benchmark có nguồn, thành viên liên quan, chọn lộ trình/nhóm nhận và xác nhận; không giao tự động. | [Chi tiết](08-management.md#manage-07) |

## Kiểm tra bản generate

- Đúng token DESIGN.md, chữ tiếng Việt, desktop 1440px, light mặc định; dark mode là biến thể cùng cấu trúc.
- So từng màn hình với wireframe ID tương ứng và [TRACEABILITY.md](TRACEABILITY.md); trạng thái lỗi/rỗng/khóa có nội dung, không chỉ màu.
- Nếu dùng ảnh/code hiện tại làm context, giữ luồng hiện có; màn hình chưa có API chỉ là concept và phải ghi rõ trong tên frame.
- Không chấp nhận mockup chứa thông tin nhạy cảm, đáp án, IP/timer giả hoặc số liệu học tập không có nguồn.
