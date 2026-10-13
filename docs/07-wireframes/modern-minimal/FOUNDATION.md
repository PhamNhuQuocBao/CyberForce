# Quy tắc bố cục và tương tác chung

[Chỉ mục](README.md) · [Design system](../../../DESIGN.md)

## Phân cấp thông tin

Mỗi trang có một tiêu đề, một nhiệm vụ chính và một cụm hành động chính. Thứ tự mặc định: điều hướng → tiêu đề và ngữ cảnh → cảnh báo ảnh hưởng tác vụ → nội dung đang làm → dữ liệu tham khảo. Cảnh báo hết giờ hoặc mất kết nối không bị giấu trong tab đang đóng.

Nền sáng chiếm phần lớn ứng dụng. Navy dùng cho hero trang chủ, terminal và bề mặt của dark mode; lime dành cho CTA chính. Chữ trạng thái dùng màu ngữ nghĩa và câu giải thích, không pill/badge. Giảm container lồng nhau; bảng dùng một vùng rõ ràng, form chia theo nhóm trường. Không biến mọi dòng dữ liệu thành card.

## Điều hướng theo quyền

| Ngữ cảnh | Điều hướng | Đường tới chức năng phụ |
|---|---|---|
| Khách | Logo, Lộ trình, Thực hành, Thi đấu, Chứng chỉ, Đăng nhập | Tra cứu chứng chỉ ở mục Chứng chỉ và footer |
| Học viên | Logo về dashboard; Học tập, Thực hành, Thi đấu, Chứng chỉ | Tài khoản mở Hồ sơ, Tiến độ, VPN, Đăng ký Creator, Đăng xuất |
| Creator | Giữ các mục học viên | Thêm Creator Studio trong menu tài khoản |
| Admin | Giữ các mục học viên | Quản trị: Nội dung, Duyệt bài, Phân quyền |
| Quản lý tổ chức | Theo quyền tổ chức | Phân tích năng lực và chọn tổ chức được phép |
| Phòng học / thi / trận | Thanh tác vụ theo phiên thay navbar dài | Quay lại có nhãn rõ; IP/timer và cảnh báo luôn dễ truy cập |

Menu phụ quản trị có thể là thanh bên 220 px trên desktop, drawer có nhãn trên mobile. Chỉ hiển thị chức năng có quyền; API vẫn phải kiểm tra quyền. Không dùng việc ẩn menu làm kiểm soát bảo mật. Không đưa EXP, streak và VPN thành ba badges thường trực trên navbar; VPN xuất hiện trong ngữ cảnh cần kết nối, tiến độ ở dashboard/hồ sơ.

## Kích thước và responsive

| Viewport | Bố cục |
|---|---|
| 320–767 px | Một cột, gutter 16 px, menu thu gọn; bảng đổi sang dòng có nhãn trừ ma trận/terminal cần cuộn riêng |
| 768–1023 px | Gutter 24 px, tối đa hai cột nội dung đơn giản; phòng học vẫn dùng tab |
| Từ 1024 px | Gutter 32 px, container tối đa 1280 px; phòng học hai vùng co giãn |
| Từ 1440 px | Workspace tối đa 1600 px hoặc toàn vùng khả dụng; không kéo dài đoạn đọc quá 72 ký tự mỗi dòng |

Mẫu desktop được đọc ở 1440 × 900; 1024 px và zoom 200% là các điểm kiểm tra web tiếp theo. Mobile 390 × 844 và 320 px vẫn là hướng responsive tham khảo, không thuộc phạm vi kiểm thử UI hiện tại trừ khi người dùng yêu cầu. Trang thông thường không cuộn ngang. Terminal, canvas và ma trận có viewport cuộn riêng được gắn nhãn. Dùng min-height theo viewport động; không khóa chiều cao form khiến bàn phím che nút gửi.

Phòng lý thuyết không dùng chia cột hoặc tab Thực hành: vùng nhiệm vụ chiếm toàn chiều rộng. Mỗi nhiệm vụ là accordion chứa lý thuyết và câu hỏi, cuộn cả danh sách trong vùng bài học. Dashboard dùng card riêng cho bốn nhóm lộ trình, thành tích, tiến độ và năng lực theo góp ý đã duyệt.

Các tab mobile của phòng thực hành giữ nội dung, scroll, nháp và phiên máy khi chuyển. IP/timer/cảnh báo nằm ngoài tab. Không tự khởi chạy hoặc dừng máy khi thay kích thước cửa sổ. Thanh cố định có khoảng bù để không đè phần nội dung cuối.

## Trạng thái nền cho mọi màn hình

| Trạng thái | Quy tắc |
|---|---|
| Đang tải lần đầu | Giữ tiêu đề và khung bố cục, skeleton theo nội dung thật; có chữ đang tải cho công nghệ hỗ trợ |
| Đang tải lại | Giữ dữ liệu trước với dấu thời gian nếu phù hợp; không gọi dữ liệu cũ là trực tiếp |
| Rỗng | Phân biệt chưa có dữ liệu và lọc không có kết quả; một hành động tiếp theo phù hợp |
| Lỗi đọc | Thông báo tại vùng lỗi + Thử lại; không xóa các vùng đã tải thành công |
| Lỗi ghi | Giữ bản nháp, nêu lỗi tại trường hoặc nhóm hành động; không hiện thành công giả |
| Đang gửi | Chống gửi trùng; nhãn nút đổi theo tác vụ; chỉ khóa vùng đang gửi |
| Thành công | Phản hồi cạnh hành động, cập nhật từ server; thông tin quan trọng không chỉ tồn tại trong toast |
| Hết phiên | Đăng nhập lại, trở về đích hợp lệ; không reset hạn phiên lab/thi |
| Không có quyền | ID-08; không render dữ liệu nhạy cảm trong lúc kiểm tra |
| Mất mạng | Cho đọc dữ liệu đã tải; nêu nội dung chưa gửi; không tự gửi tác vụ có hậu quả khi mạng trở lại |
| Chưa rõ tác vụ đã thành công | Kiểm tra trạng thái trước thử lại, tránh tạo phiên, gửi duyệt hoặc nộp bài trùng |

## Xác nhận có hậu quả

Giữ xác nhận cho mở gợi ý/lời giải mất điểm, dừng/reset/chuyển máy, tạo lại khóa VPN, bắt đầu/kết thúc thi, bỏ bản nháp, đổi quyền, quyết định duyệt và xóa/lưu trữ nội dung. Dialog nói rõ đối tượng, hậu quả và nhãn nút cụ thể; không dùng “OK” chung chung. Nút hủy/tiếp tục làm luôn có mặt khi hành động còn hủy được.

Xác nhận desktop tối đa 480–640 px; mobile vừa chiều rộng và có vùng cuộn. Trap focus trong modal, focus ban đầu ở lựa chọn an toàn, trả focus về nút mở khi đóng. Không dùng modal cho lời chúc mừng, điều kiện khóa phòng hoặc dữ liệu tham khảo đơn giản.

## Light và dark mode

Light là mặc định lần đầu; lựa chọn người dùng được lưu. Bố cục và thứ tự thông tin giống nhau giữa hai theme. Tất cả nền, chữ, border, input, trạng thái, disabled, focus và biểu đồ dùng token tương ứng trong DESIGN.md; không đảo màu ảnh/canvas. Terminal giữ nền navy ngay trong light mode. Preview Creator phải kiểm tra cả hai theme của giao diện học viên.

## Accessibility và microcopy

Nhãn input luôn hiện, lỗi liên kết với trường, thứ tự Tab theo thứ tự đọc. Focus 2 px có offset, không mất khi dùng bàn phím. Vùng chạm tối thiểu 44 × 44 px. Link có underline hoặc dấu hiệu ngoài màu. Heading theo cấp. Checkbox/switch nêu nhãn và trạng thái.

Radar/heatmap có dữ liệu số thay thế và chú giải. Bảng có tiêu đề cột và tiêu đề vùng; số dùng tabular-nums. Đồng hồ không đọc từng giây qua screen reader; chỉ thông báo mốc cần hành động. Cập nhật realtime không lấy focus. Giảm chuyển động theo lựa chọn hệ thống; không nhấp nháy, confetti, parallax hoặc âm thanh mặc định.

Bản wireframe dùng tiếng Việt nhất quán để review; định danh kỹ thuật giữ nguyên (IP, EXP, VPN, flag). Đây không phải yêu cầu thêm hệ thống đa ngôn ngữ. Lỗi nói việc gì xảy ra, dữ liệu có được giữ không, và người dùng làm gì tiếp theo.
