# Trang chủ và tổng quan

Phiên bản wireframe Modern Minimal · 2026-10-10. Đây là thiết kế, chưa triển khai frontend.

[Chỉ mục](README.md) · [Quy tắc chung](FOUNDATION.md) · [Design system](../../../DESIGN.md)

Mỗi sơ đồ mô tả thứ tự và vùng nội dung, không phải số liệu thực tế. Áp dụng toàn bộ trạng thái nền trong FOUNDATION bên cạnh trạng thái riêng của từng màn hình.

- [HOME-01 — Trang chủ công khai](#home-01)
- [HOME-02 — Dashboard học viên](#home-02)

<a id="home-01"></a>

## HOME-01 — Trang chủ công khai

**Đường dẫn thiết kế:** `/`. **Nguồn nghiệp vụ:** PRD mục tiêu sản phẩm; frontend hiện có.

**Ưu tiên:** Giúp khách hiểu học gì, thực hành thế nào và bắt đầu ở đâu.

### Desktop

```text
CyberForce     Lộ trình  Thực hành  Thi đấu  Chứng chỉ       Đăng nhập
Nền navy: Học an ninh mạng qua thực hành
Mô tả ngắn về bài học + lab trên trình duyệt
[Bắt đầu học]  [Xem lộ trình]
Nền sáng: Lộ trình học tiêu biểu / trình độ / thời lượng / [Xem]
Minh họa luồng thật: Chọn bài → Khởi chạy lab → Hoàn thành task
Chứng chỉ thực hành / [Tra cứu chứng chỉ]
Footer: điều hướng và hỗ trợ có thật
```

### Mobile

```text
Logo [Menu] [Đăng nhập]
Học qua thực hành
Mô tả ngắn
[Bắt đầu học]
[Xem lộ trình]
Lộ trình tiêu biểu
Quy trình thực hành
Chứng chỉ / Tra cứu
Footer
```

### Hành vi và thông tin cần giữ

CTA bắt đầu đưa tới đăng ký; tài khoản đã đăng nhập có đường đến dashboard. Không fake terminal, số học viên giả, huy hiệu “trusted”, logo khách hàng hoặc mô hình 3D chỉ để lấp chỗ. Nội dung tiêu biểu lấy từ danh mục đã xuất bản. Không cam kết lab luôn khởi động dưới 3 giây như SLA đã đo.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Đã đăng nhập | CTA “Về tổng quan học tập”. |
| Chưa có nội dung tiêu biểu | Giữ giới thiệu và đường xem danh mục; không tạo khóa học giả. |
| Danh mục tải lỗi | Thông báo trong section danh mục, phần còn lại vẫn đọc được. |

<a id="home-02"></a>

## HOME-02 — Dashboard học viên

**Đường dẫn thiết kế:** `/dashboard`. **Nguồn nghiệp vụ:** US-02.01; US-03.02; US-07.01–US-07.03.

**Ưu tiên:** Tiếp tục việc đang làm; lab sắp hết giờ phải dễ thấy.

### Desktop

```text
CyberForce  Học tập  Thực hành  Thi đấu  Chứng chỉ           Tài khoản
Tổng quan học tập
Lab đang chạy: Phòng / IP / thời gian [Mở phòng] (chỉ khi có)
Tiếp tục: tên bài + task đang dở             | Tiến độ cá nhân
Lộ trình / x/y task                         | Chuỗi ngày / EXP / cấp
[Tiếp tục học]                              | [Xem tiến độ]
Lộ trình đang học: tên / tiến độ / bài tiếp
Kỹ năng: radar nhỏ + bảng giá trị hoặc link chi tiết
Chứng chỉ gần đây / [Xác thực]
```

### Mobile

```text
Tổng quan [Menu]
Lab đang chạy / thời gian [Mở]
Bài đang học / task
[Tiếp tục học]
Lộ trình đang học
Chuỗi / EXP / cấp / [Chi tiết]
Kỹ năng
Chứng chỉ
```

### Hành vi và thông tin cần giữ

Theo góp ý người dùng, bốn nhóm **Lộ trình của bạn**, **Thành tích gần đây**, **Tiến độ cá nhân**, **Năng lực đã tích lũy** có card bao ngoài riêng: nền surface, viền nhẹ 1 px, bo góc 8 px, padding 24–28 px. Tiêu đề nằm trong card; dữ liệu bên trong dùng dòng hoặc danh sách, không thêm card lồng cho từng số liệu. Mobile xếp các card theo một cột, giữ khoảng cách giữa nhóm. Card Tiếp tục học vẫn giữ mức ưu tiên cao nhất. Phiên có cảnh báo ân hạn nằm trên khối tiếp tục. Lab và bài tiếp tục khác nhau ghi rõ tên phòng, không tự dừng phiên. Phân hệ Creator/Admin mở từ menu tài khoản theo quyền.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Người học mới | “Bắt đầu với một lộ trình” và danh mục phù hợp trình độ do người dùng chọn; không suy đoán năng lực. |
| Không có lab | Ẩn vùng phiên, không khối trống chiếm chỗ. |
| Đã học xong | Link ôn tập và kiểm tra điều kiện thi; không tự ghi đã có chứng chỉ. |
| Một nguồn dữ liệu lỗi | Giữ phần đã tải, lỗi tại vùng ảnh hưởng. |
| Ân hạn | Nêu còn thời gian xử lý và dẫn tới gia hạn LAB-01. |
