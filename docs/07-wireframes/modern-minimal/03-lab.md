# Cloud Lab và môi trường thực hành

Wireframe Modern Minimal · cập nhật 2026-10-13. Một số màn hình đã có frontend/API, phần còn lại là ý tưởng; xem [hiện trạng](IMPLEMENTATION-STATUS.md) và [prompt Stitch](STITCH.md).

[Chỉ mục](README.md) · [Quy tắc chung](FOUNDATION.md) · [Design system](../../../DESIGN.md)

Mỗi sơ đồ mô tả thứ tự và vùng nội dung, không phải số liệu thực tế. Áp dụng toàn bộ trạng thái nền trong FOUNDATION bên cạnh trạng thái riêng của từng màn hình.

- [LAB-01 — Điều khiển máy trong phòng học](#lab-01)
- [LAB-02 — AttackBox và Web Terminal](#lab-02)

<a id="lab-01"></a>

## LAB-01 — Điều khiển máy trong phòng học

**Đường dẫn thiết kế:** `thanh máy và panel tại /rooms/[slug]`. **Nguồn nghiệp vụ:** US-03.01, US-03.02.

**Ưu tiên:** IP, thời gian, lượt gia hạn và hậu quả của dừng máy.

### Desktop

```text
Máy mục tiêu: Đang chạy · 100.64.12.84 [Chép] · 54:20
[Gia hạn 60 phút] Còn 2 lượt                   [Tùy chọn máy]
Panel tùy chọn: Tên máy / loại môi trường / phạm vi được phép
[Khởi động lại] [Dừng máy]
Khi chưa chạy: [Khởi chạy máy] + thời gian dự kiến theo loại
```

### Mobile

```text
Máy · 54:20
100.64.12.84 [Chép]
[Mở điều khiển máy]
Panel toàn chiều rộng:
Trạng thái / phạm vi
[Gia hạn] Còn 2 lượt
[Khởi động lại] [Dừng máy]
```

### Hành vi và thông tin cần giữ

Giữ IP/timer ngoài panel trên cả hai kích thước. Phiên mặc định 60 phút; tối đa 3 lần gia hạn, tổng 4 giờ. Không bịa phần trăm provisioning; dùng bước/trạng thái server. Chỉ 1 target và 1 AttackBox mỗi tài khoản. Đồng hồ đồng bộ thời hạn server, không reset khi reload. Dừng/reset cần xác nhận mất dữ liệu máy; tiến độ học đã lưu được giữ.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Chưa chạy | Nút khởi chạy; Docker dự kiến dưới 3 giây, VM chuyên sâu dưới 60 giây là mục tiêu, không bảo đảm đếm ngược giả. |
| Đang khởi tạo | Trạng thái bước thật; ngăn click tạo thêm. |
| Khởi tạo lỗi/quá thời gian | Giải thích, kiểm tra lại trạng thái trước khi cho tạo mới. |
| Xung đột máy | Dialog tên phòng đang chạy; “Giữ máy hiện tại” hoặc “Dừng máy cũ và chuyển”; thất bại ở bước nào nêu rõ bước đó. |
| Gia hạn | Chỉ cập nhật giờ và lượt sau xác nhận server; lỗi giữ số cũ. |
| Hết lượt | Nút gia hạn không khả dụng kèm lý do văn bản. |
| Ân hạn | Cảnh báo cố định có timer 03:00 và gia hạn nếu còn lượt; không nhấp nháy. |
| Đã thu hồi | Nêu dữ liệu máy không còn, tiến độ đã lưu còn; cho khởi chạy phiên mới. |

<a id="lab-02"></a>

## LAB-02 — AttackBox và Web Terminal

**Đường dẫn thiết kế:** `tab thực hành; chế độ toàn màn hình của phòng`. **Nguồn nghiệp vụ:** US-03.03, US-03.04.

**Ưu tiên:** Không gian thao tác và khả năng quay lại câu hỏi.

### Desktop

```text
[Về bài học]  Target IP [Chép]  Thời gian
[Terminal | AttackBox] [Clipboard] [Toàn màn hình] [Phím tắt]
+----------------------------------------------------------------+
| Terminal hoặc màn hình Kali; không có dashboard chèn xung quanh |
+----------------------------------------------------------------+
Thông báo kết nối / phiên tại đây
```

### Mobile

```text
[Về bài học] IP · thời gian
[Terminal | AttackBox]
[Clipboard] [Bàn phím] [Mở rộng]
Vùng thực hành cuộn riêng
[Tab] [Ctrl] [Esc] [Mũi tên]
[Đến câu trả lời]
```

### Hành vi và thông tin cần giữ

Clipboard hai chiều mở panel riêng; có ô copy/paste thủ công khi trình duyệt chặn clipboard. Không thu terminal thành ảnh nhỏ: cho pan/zoom AttackBox, vùng cuộn riêng và chế độ ngang tùy chọn; không bắt buộc xoay thiết bị. Bàn phím ảo không che input. Cung cấp cách thoát focus terminal. Không gửi phím khi đang mất kết nối.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Chưa có AttackBox | CTA khởi chạy một lần, trạng thái target riêng. |
| Mất kết nối | Overlay trong vùng máy với số lần thử; cố kết nối lại cùng phiên, không tự reset. |
| Kết nối lại thất bại | Thử lại thủ công / mở VPN; không hứa tiến trình còn nếu server chưa xác nhận. |
| Terminal idle 15 phút | Nêu ngắt do không hoạt động; kết nối lại nếu phiên còn, nếu không cần tạo phiên mới. |
| Lưu lượng ngoài phạm vi | Thông báo cạnh terminal và chỉ dẫn target hợp lệ; không thêm modal cản đọc. |
| Toàn màn hình | Thoát bằng nút luôn nhìn thấy; trả về task và vị trí đọc cũ. |
