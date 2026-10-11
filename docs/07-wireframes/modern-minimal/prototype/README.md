# Prototype CyberForce — Modern Minimal

Prototype HTML/CSS/JavaScript độc lập cho 4 màn hình đã duyệt. Dữ liệu và mọi thao tác là mô phỏng; không gọi API, không thực thi lệnh terminal, không tạo máy lab và không xuất bản nội dung thật.

## Mở prototype

Từ thư mục gốc repo:

```sh
python3 -m http.server 4173 --bind 127.0.0.1 --directory docs/07-wireframes/modern-minimal/prototype
```

Mở [prototype tại localhost](http://127.0.0.1:4173/). Có thể mở trực tiếp `index.html`; tính năng sao chép clipboard tùy quyền trình duyệt, có phương án hiển thị IP để chép thủ công.

Không cần cài dependency hay build. Font Inter và JetBrains Mono được phục vụ cục bộ trong `fonts/`, kèm giấy phép SIL Open Font License. Không có yêu cầu tải font từ dịch vụ ngoài khi sử dụng prototype.

## Các màn hình

- `#dashboard`: tiếp tục học, phiên máy, tiến độ và 8 kỹ năng.
- `#path`: chi tiết lộ trình, module thu gọn, điều kiện mở phòng và điều kiện thi.
- `#room`: chọn mẫu Phòng lý thuyết (một vùng toàn chiều rộng) hoặc Phòng thực hành (hai vùng). Mỗi nhiệm vụ là accordion chứa lý thuyết và câu hỏi; danh sách cuộn độc lập. Mobile của phòng thực hành chuyển tab giữ nháp.
- `#cms`: danh mục phòng, tìm kiếm, bộ lọc trạng thái, tạo/chỉnh sửa metadata mô phỏng.

Menu mobile mở bằng nút Menu. Nút Chế độ tối/Chế độ sáng hoạt động trên cả 4 trang và nhớ lựa chọn trong trình duyệt. Reload đặt lại dữ liệu phiên mô phỏng, câu trả lời và chỉnh sửa CMS, nhưng giữ theme.

## Kịch bản review

1. Từ Tổng quan, chọn Tiếp tục học; xem vị trí IP, thời gian và điều khiển máy.
2. Nhập câu trả lời bất kỳ để xem phản hồi sai; dùng `prepared statements` để xem thành công.
3. Reload để thử lại. Mở gợi ý, xác nhận giảm điểm 100 → 90; nộp đáp án và xem EXP cập nhật.
4. Trong Điều khiển máy: gia hạn tối đa 3 lần; chọn dừng để xem xác nhận mất dữ liệu máy. Hủy giữ phiên, xác nhận chuyển máy sang đã dừng; có thể khởi chạy lại.
5. Ở mobile, nhập nháp, đổi tab Thực hành rồi trở lại Bài học. Nháp vẫn còn. Tab hỗ trợ phím trái/phải, Home/End.
6. Chọn Mất kết nối trên thanh mô phỏng: hiện cảnh báo, giữ nháp, khóa nộp đáp án và thay đổi máy. Đổi về Bình thường để gửi thủ công.
7. Ở CMS, tìm Linux hoặc lọc Bản nháp. Tạo một phòng mẫu, sửa tên/lộ trình/trạng thái và xem bảng cập nhật. Trường bắt buộc được kiểm tra; Hủy không yêu cầu nhập đủ form.
8. Chọn Chưa có dữ liệu để xem empty state trên Dashboard và danh mục Phòng trong CMS. Trạng thái này không thay nội dung tĩnh của trang Lộ trình/Phòng học.

## Giới hạn có chủ đích

Đồng hồ lab là giá trị minh họa cố định, tăng 60 phút khi gia hạn, không phải countdown thật. Terminal có một lệnh mẫu với đầu ra đã định sẵn. Chưa có kéo thay đổi tỷ lệ hai vùng, AttackBox, bài học tiếp theo hoặc khảo thí. Các tab Lộ trình/Module trong CMS chỉ giải thích phạm vi; chỉnh sửa đầy đủ MDX, câu hỏi, registry và xuất bản thực tế thuộc bước triển khai tiếp theo.

Phần mock không triển khai toàn bộ trạng thái/luồng trong bộ wireframe. Mục đích là duyệt bố cục, typography, màu sắc và các tương tác đại diện trước khi đổi frontend.

## Đã kiểm tra bằng trình duyệt

- 4 màn hình × light/dark × 320, 390, 1440 px: 24 tổ hợp không có tràn ngang toàn trang.
- Quan sát giao diện desktop phòng học/lộ trình/CMS và mobile dark; menu mobile và vùng cuộn nội bộ.
- Nộp đúng nhận 100 EXP; mở gợi ý rồi nộp nhận 90 EXP.
- Giữ nháp sau đổi tab mobile và chuyển sang offline; offline vô hiệu hóa gửi.
- Gia hạn máy, xác nhận dừng máy và chuyển trạng thái đã dừng.
- Tìm kiếm CMS, tạo metadata mẫu và hủy form trống.
- Không có console error trong phiên kiểm tra; `node --check app.js` thành công.

Đây không phải kiểm thử backend, thiết bị di động thật, screen reader hoặc toàn bộ WCAG. Source ứng dụng tại `apps/` và `services/` không bị sửa.

## Điều chỉnh sau review

- Dashboard: thêm card bao ngoài riêng cho bốn nhóm lộ trình, thành tích, tiến độ và năng lực.
- Phòng học: bộ chọn Loại phòng mô phỏng dùng để review hai bố cục; trạng thái nhiệm vụ được giữ riêng theo mỗi loại trong phiên demo. Phòng lý thuyết không có terminal/điều khiển máy.
- Mở nhiều nhiệm vụ cùng lúc, cuộn danh sách, thu gọn/mở lại không mất đáp án. Nhiệm vụ chỉ đọc có nút Đã đọc và hiểu; nhiệm vụ câu hỏi có ô nhập và Kiểm tra đáp án.
- Lộ trình và CMS giữ bố cục đã được review.
