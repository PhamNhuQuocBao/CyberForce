# Danh tính, hồ sơ và phân quyền

Phiên bản wireframe Modern Minimal · 2026-10-10. Đây là thiết kế, chưa triển khai frontend.

[Chỉ mục](README.md) · [Quy tắc chung](FOUNDATION.md) · [Design system](../../../DESIGN.md)

Mỗi sơ đồ mô tả thứ tự và vùng nội dung, không phải số liệu thực tế. Áp dụng toàn bộ trạng thái nền trong FOUNDATION bên cạnh trạng thái riêng của từng màn hình.

- [ID-01 — Đăng nhập](#id-01)
- [ID-02 — Đăng ký](#id-02)
- [ID-03 — OAuth callback và liên kết tài khoản](#id-03)
- [ID-04 — Hồ sơ công khai](#id-04)
- [ID-05 — Cài đặt hồ sơ và quyền riêng tư](#id-05)
- [ID-06 — Đăng ký Creator](#id-06)
- [ID-07 — Quản lý vai trò và xét duyệt Creator](#id-07)
- [ID-08 — Không có quyền / không tìm thấy](#id-08)

<a id="id-01"></a>

## ID-01 — Đăng nhập

**Đường dẫn thiết kế:** `/login`. **Nguồn nghiệp vụ:** US-01.01, US-01.02.

**Ưu tiên:** Đăng nhập thành công; lỗi phải ở cạnh form, không bị đẩy xuống dưới nội dung giới thiệu.

### Desktop

```text
Logo                                                Giao diện sáng/tối
                    Đăng nhập
                    [Tiếp tục với Google]
                    [Tiếp tục với GitHub]
                    hoặc dùng email
                    Email [________________]
                    Mật khẩu [________] [Hiện]
                    Phản hồi xác thực
                    [Đăng nhập]
                    Chưa có tài khoản? Đăng ký
```

### Mobile

```text
Logo                 Sáng/tối
Đăng nhập
[Google]
[GitHub]
Email [________________]
Mật khẩu [_______] [Hiện]
Phản hồi xác thực
[Đăng nhập]
Đăng ký
```

### Hành vi và thông tin cần giữ

Form tối đa 440 px. Giữ nhãn trường, autocomplete và đường quay lại trang định truy cập nếu người dùng có quyền. Không có telemetry giả hoặc thông số lab trên trang xác thực. Liên kết tài khoản chuyển ID-03; không tự gộp email.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Đang gửi | Nút ghi “Đang đăng nhập”; chặn gửi trùng, giữ email. |
| Sai thông tin | Thông báo xác thực chung, cho nhập lại; không khẳng định tài khoản có tồn tại. |
| Bị giới hạn | Hiện thời điểm có thể thử lại và đếm ngược theo phản hồi máy chủ; quy tắc 5 lần sai/60 giây, khóa 15 phút. |
| OAuth bị hủy/lỗi | Trở về form với thông báo và lựa chọn thử lại hoặc dùng email. |
| Thành công | Đi tới dashboard hoặc đích hợp lệ đã lưu. |

<a id="id-02"></a>

## ID-02 — Đăng ký

**Đường dẫn thiết kế:** `/register`. **Nguồn nghiệp vụ:** US-01.01, US-01.02.

**Ưu tiên:** Phương thức đăng ký, thông tin bắt buộc và tiêu chuẩn mật khẩu.

### Desktop

```text
Logo
                  Tạo tài khoản
                  [Google] [GitHub]
                  Tên người dùng [__________]
                  Email [___________________]
                  Mật khẩu [________] [Hiện]
                  Yêu cầu mật khẩu và lỗi
                  [Tạo tài khoản]
                  Đã có tài khoản? Đăng nhập
```

### Mobile

```text
Tạo tài khoản
[Google]
[GitHub]
Tên người dùng [_______]
Email [_______________]
Mật khẩu [______] [Hiện]
Yêu cầu mật khẩu
[Tạo tài khoản]
Đăng nhập
```

### Hành vi và thông tin cần giữ

Yêu cầu mật khẩu hiển thị bằng văn bản: tối thiểu 8 ký tự, chữ hoa, chữ thường, số, ký tự đặc biệt. Lỗi nằm dưới trường; lỗi toàn form ở phía trên nút gửi. Không thêm bước onboarding bắt buộc. Vai trò Student và điểm khởi tạo do máy chủ quyết định.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Nhập chưa hợp lệ | Giữ các trường không nhạy cảm; focus trường lỗi đầu tiên khi gửi. |
| Tên/email xung đột | Dùng thông điệp được API cho phép, cung cấp đường đăng nhập/liên kết khi phù hợp. |
| Đang tạo | Chặn gửi trùng, hiển thị tiến trình bằng chữ. |
| Đã tạo | Chuyển dashboard; tài khoản chưa có hoạt động dùng trạng thái mới của HOME-02. |

<a id="id-03"></a>

## ID-03 — OAuth callback và liên kết tài khoản

**Đường dẫn thiết kế:** `/auth/callback; hộp thoại liên kết`. **Nguồn nghiệp vụ:** US-01.01.

**Ưu tiên:** Giải thích cần xác thực tài khoản hiện có trước khi liên kết.

### Desktop

```text
Logo
              Đang hoàn tất đăng nhập...
              hoặc: Liên kết tài khoản GitHub
              Email đã gắn với phương thức hiện có
              [Xác thực tài khoản hiện có]
              Phản hồi xác thực
              [Liên kết]  [Hủy]
```

### Mobile

```text
Liên kết tài khoản
Phương thức hiện có
[Xác thực]
Phản hồi
[Liên kết]
[Hủy]
```

### Hành vi và thông tin cần giữ

Callback là trạng thái chuyển tiếp, không phải trang marketing. Liên kết có thể mở thành dialog trên desktop và toàn chiều rộng trên mobile. Chỉ cung cấp phương thức xác thực backend hỗ trợ; không hứa gửi OTP nếu chưa có. Không hiển thị token trong UI.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Chờ callback | Thông điệp đang xác thực; chưa hiển thị thành công. |
| Xung đột email | Yêu cầu xác thực tài khoản cũ; tuyệt đối không tự merge. |
| Hết hạn hoặc xác thực thất bại | Cho bắt đầu lại xác thực, không tạo tài khoản trùng. |
| Đã liên kết | Thông báo tại chỗ rồi điều hướng. |
| Hủy | Đóng dialog và trở về đăng nhập an toàn. |

<a id="id-04"></a>

## ID-04 — Hồ sơ công khai

**Đường dẫn thiết kế:** `/user/[username]`. **Nguồn nghiệp vụ:** US-01.03; US-07.02, US-07.03.

**Ưu tiên:** Danh tính, chứng chỉ có thể xác thực và năng lực thực tế.

### Desktop

```text
Logo  Học tập  Thực hành  Thi đấu  Chứng chỉ           Tài khoản
Ảnh  Tên / @username                         [Sao chép liên kết]
Giới thiệu ngắn       Cấp bậc · EXP · Chuỗi ngày học
Năng lực (8 trục + bảng giá trị)   | Chứng chỉ
                                 | Tên / ngày cấp / [Xác thực]
Thành tích: tên, điều kiện đạt, ngày đạt
[Chỉnh sửa hồ sơ] chỉ hiện với chủ hồ sơ
```

### Mobile

```text
Tên / @username
Giới thiệu
[Sao chép liên kết]
Cấp bậc · EXP · Chuỗi ngày
Chứng chỉ / [Xác thực]
Năng lực: radar + giá trị
Danh sách thành tích
[Chỉnh sửa] nếu là chủ
```

### Hành vi và thông tin cần giữ

Radar luôn có bảng số liệu 8 kỹ năng đi kèm. Dùng EXP tích lũy tuyệt đối, không tự đổi thành phần trăm thành thạo. Không công khai email, IP VPN, thanh toán hay lịch sử nộp sai. Huy hiệu nghiệp vụ được giữ dưới dạng thành tích văn bản, không dùng pill.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Chưa có chứng chỉ/điểm | Nêu “Chưa có chứng chỉ”/“Chưa có dữ liệu thực hành”; không tạo số liệu mẫu trong sản phẩm. |
| Hồ sơ riêng tư | Khách chỉ thấy thông báo không khả dụng; chủ thấy nội dung của mình và dòng “Hồ sơ đang riêng tư”. |
| Không tìm thấy/lỗi tải | Không hiển thị dữ liệu hồ sơ cũ; có trở về và thử lại theo loại lỗi. |
| Sao chép thất bại | Hiện URL có thể chọn thủ công. |

<a id="id-05"></a>

## ID-05 — Cài đặt hồ sơ và quyền riêng tư

**Đường dẫn thiết kế:** `hộp thoại từ /user/[username]`. **Nguồn nghiệp vụ:** US-01.03.

**Ưu tiên:** Kiểm soát dữ liệu công khai và phản hồi lưu.

### Desktop

```text
Chỉnh sửa hồ sơ                                  [Đóng]
Ảnh đại diện      Tên / giới thiệu
Hồ sơ công khai   [Bật/tắt]
Nội dung người khác có thể xem
                         [Hủy] [Lưu thay đổi]
```

### Mobile

```text
Chỉnh sửa hồ sơ [Đóng]
Ảnh đại diện
Tên / giới thiệu
Hồ sơ công khai [Bật/tắt]
Giải thích quyền riêng tư
[Hủy] [Lưu thay đổi]
```

### Hành vi và thông tin cần giữ

Dialog tối đa 640 px, cuộn nội dung và giữ hành động trong vùng nhìn thấy. Không coi bật công khai là đã lưu trước phản hồi máy chủ. Đóng khi có thay đổi chưa lưu cần cho chọn tiếp tục sửa hoặc bỏ thay đổi.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Đang lưu | Chặn gửi trùng, giữ nội dung form. |
| Lưu lỗi | Giữ bản nháp, nêu lỗi và cho thử lại. |
| Đã lưu | Cập nhật hồ sơ và trạng thái công khai từ máy chủ; thông báo tại chỗ. |

<a id="id-06"></a>

## ID-06 — Đăng ký Creator

**Đường dẫn thiết kế:** `hộp thoại Become a Creator`. **Nguồn nghiệp vụ:** US-01.04.

**Ưu tiên:** Điều kiện, thông tin kinh nghiệm và trạng thái xét duyệt.

### Desktop

```text
Đăng ký làm Creator
Mô tả trách nhiệm
Kinh nghiệm [_______________________________]
Liên kết hồ sơ / minh chứng [_______________]
Phản hồi kiểm tra
[Hủy]                         [Gửi yêu cầu]
```

### Mobile

```text
Đăng ký Creator
Trách nhiệm
Kinh nghiệm
Minh chứng
Phản hồi
[Gửi yêu cầu] [Hủy]
```

### Hành vi và thông tin cần giữ

Chỉ yêu cầu trường có trong nghiệp vụ/API. Hiển thị trạng thái đơn trước form nếu đã gửi; không tạo đơn trùng. Khi được duyệt mới xuất hiện mục Creator Studio.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Chờ duyệt | Ngày gửi và trạng thái bằng chữ; không hiện lại nút gửi. |
| Bị từ chối | Hiển thị lý do được phép xem; chỉ cho gửi lại nếu backend cho phép. |
| Đã duyệt | Liên kết mở Creator Studio. |
| Lỗi gửi | Giữ nội dung, cho thử lại. |

<a id="id-07"></a>

## ID-07 — Quản lý vai trò và xét duyệt Creator

**Đường dẫn thiết kế:** `/admin/roles`. **Nguồn nghiệp vụ:** US-01.04.

**Ưu tiên:** Danh sách yêu cầu cần xử lý và lý do ra quyết định.

### Desktop

```text
Quản trị / Phân quyền
Yêu cầu Creator | Người dùng
[Tìm tên/email] [Trạng thái]
Người dùng     Ngày gửi     Trạng thái     [Xem yêu cầu]
Chi tiết yêu cầu trong panel bên phải
Kinh nghiệm / minh chứng / vai trò hiện tại
[Lý do từ chối...]                 [Từ chối] [Phê duyệt]
```

### Mobile

```text
Phân quyền
[Yêu cầu | Người dùng]
[Tìm kiếm] [Lọc]
Tên / ngày / trạng thái
[Xem yêu cầu]
Chi tiết mở toàn màn hình
[Từ chối] [Phê duyệt]
```

### Hành vi và thông tin cần giữ

Bảng desktop chuyển thành các dòng thông tin có nhãn trên mobile. Duyệt hoặc đổi quyền cần xác nhận người dùng đích và quyền mới. Hiển thị người xử lý/thời gian nếu API trả về; mọi thay đổi phải có audit log, không chỉ đổi UI.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Danh sách trống | Không có yêu cầu phù hợp; nút xóa bộ lọc nếu đang lọc. |
| Đang xử lý | Khóa hành động của đúng yêu cầu, giữ các dòng khác sử dụng được. |
| Đã được admin khác xử lý | Tải lại yêu cầu, báo trạng thái mới, không ghi đè. |
| 403 | Dùng ID-08; không render bảng rồi mới che. |
| Lỗi quyết định | Giữ lý do, cho thử lại sau khi đối chiếu trạng thái. |

<a id="id-08"></a>

## ID-08 — Không có quyền / không tìm thấy

**Đường dẫn thiết kế:** `trạng thái dùng chung 403/404`. **Nguồn nghiệp vụ:** US-01.03, US-01.04.

**Ưu tiên:** Giải thích ngắn và đường quay lại hợp lệ.

### Desktop

```text
Logo
               Không thể mở trang này
               Lý do phù hợp với quyền người xem
               [Về tổng quan] [Đăng nhập nếu cần]
```

### Mobile

```text
Logo
Không thể mở trang này
Lý do
[Về tổng quan]
[Đăng nhập nếu cần]
```

### Hành vi và thông tin cần giữ

Phân biệt hết phiên cần đăng nhập với không đủ quyền. Không hiển thị email, tài nguyên nội bộ hoặc chi tiết hồ sơ riêng tư. Không thêm ngôn ngữ quân sự như “security clearance”.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Chưa đăng nhập | Cho đăng nhập rồi trở về đích nếu được phép. |
| 403 | Thông báo không có quyền; link về vùng được phép. |
| 404 / riêng tư | Thông báo tài nguyên không khả dụng, không xác nhận dữ liệu nhạy cảm. |
