# Kết nối VPN

Wireframe Modern Minimal · cập nhật 2026-10-13. Một số màn hình đã có frontend/API, phần còn lại là ý tưởng; xem [hiện trạng](IMPLEMENTATION-STATUS.md) và [prompt Stitch](STITCH.md).

[Chỉ mục](README.md) · [Quy tắc chung](FOUNDATION.md) · [Design system](../../../DESIGN.md)

Mỗi sơ đồ mô tả thứ tự và vùng nội dung, không phải số liệu thực tế. Áp dụng toàn bộ trạng thái nền trong FOUNDATION bên cạnh trạng thái riêng của từng màn hình.

- [VPN-01 — Quản lý kết nối VPN](#vpn-01)
- [VPN-02 — Chẩn đoán kết nối](#vpn-02)

<a id="vpn-01"></a>

## VPN-01 — Quản lý kết nối VPN

**Đường dẫn thiết kế:** `/access/vpn`. **Nguồn nghiệp vụ:** US-04.01–US-04.03.

**Ưu tiên:** Trạng thái thật, cấu hình cá nhân và mục tiêu được phép.

### Desktop

```text
Kết nối VPN
Trạng thái: Chưa kết nối / Đã kết nối · IP · Lần cập nhật
[WireGuard | OpenVPN]
[Tải cấu hình]                  | Hướng dẫn 3 bước
Tên file / hướng dẫn bảo quản    | 1 Cài công cụ
                                | 2 Nhập cấu hình
                                | 3 Kết nối và kiểm tra
Máy được phép: tên / IP          | [Kiểm tra kết nối]
Quản lý khóa: [Tạo lại cấu hình]
```

### Mobile

```text
Kết nối VPN
Trạng thái / IP / cập nhật
[WireGuard | OpenVPN]
[Tải cấu hình]
Hướng dẫn 1 → 2 → 3
Mục tiêu được phép / IP
[Kiểm tra kết nối]
[Tạo lại cấu hình]
```

### Hành vi và thông tin cần giữ

Giữ WireGuard mặc định, OpenVPN dự phòng. Không hiển thị khóa riêng. Giải thích tải cấu hình không có nghĩa đã kết nối. Mạng định tuyến 100.64.0.0/10 không đồng nghĩa được phép quét toàn dải; chỉ target được cấp. Trong phiên thi không cho thay IP/tạo lại cấu hình. Quy tắc mạng hiển thị ngắn và có chi tiết mở rộng.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Chưa có cấu hình | Cho tạo/tải theo API; trạng thái đang tạo chống gửi trùng. |
| Khóa chỉ tải một lần | Nếu không còn file tải lại, giải thích và dùng quy trình tạo lại có xác nhận. |
| Đã kết nối | IP được cấp và lần cập nhật; dùng chữ, không badge. |
| Trạng thái cũ | Nêu chưa xác nhận kết nối, không tiếp tục hiện “Đã kết nối” như dữ liệu mới. |
| Tạo lại khóa | Dialog nêu mất kết nối cũ ngay, [Hủy] [Thu hồi và tạo lại]; sau thành công yêu cầu thay file trên máy. |
| Chưa có target | Hướng dẫn mở phòng và khởi chạy; không báo VPN lỗi. |
| Ngoài phạm vi | Hiển thị target được phép và nút chép IP, không lộ IP người khác. |

<a id="vpn-02"></a>

## VPN-02 — Chẩn đoán kết nối

**Đường dẫn thiết kế:** `panel tại VPN hoặc phòng học`. **Nguồn nghiệp vụ:** US-04.02, US-04.03.

**Ưu tiên:** Bước nào lỗi và hành động khắc phục phù hợp.

### Desktop

```text
Kiểm tra kết nối                                     [Đóng]
Interface       Đã xác nhận / Chưa xác nhận
Gateway         Đã xác nhận / Chưa xác nhận
Route           Đã xác nhận / Chưa xác nhận
Target          Thành công / Không phản hồi
Giải thích lỗi cụ thể
[Kiểm tra lại] [Hướng dẫn OpenVPN] [Dùng AttackBox]
```

### Mobile

```text
Kiểm tra kết nối [Đóng]
Interface / kết quả
Gateway / kết quả
Route / kết quả
Target / kết quả
Giải thích
[Kiểm tra lại]
[OpenVPN] [AttackBox]
```

### Hành vi và thông tin cần giữ

Chỉ đánh dấu bước đã có bằng chứng từ backend; không tuyên bố trình duyệt có thể tự kiểm tra route hoặc firewall của máy cá nhân. Phân biệt lỗi tunnel và target chưa chạy. Test ping theo nghiệp vụ; kết quả timeout không khẳng định nguyên nhân.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Đang kiểm tra | Hiển thị từng bước, nút đang kiểm tra. |
| Timeout 5 giây | Nêu khả năng UDP/firewall, đề nghị OpenVPN TCP hoặc AttackBox. |
| Thành công | Hiện target và thời điểm kiểm tra. |
| Không có quyền/chưa có lab | Đường quay về phiên được phép, không ping target tùy ý. |
