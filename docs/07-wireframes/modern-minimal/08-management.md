# CMS, Creator và phân tích tổ chức

Phiên bản wireframe Modern Minimal · 2026-10-10. Đây là thiết kế, chưa triển khai frontend.

[Chỉ mục](README.md) · [Quy tắc chung](FOUNDATION.md) · [Design system](../../../DESIGN.md)

Mỗi sơ đồ mô tả thứ tự và vùng nội dung, không phải số liệu thực tế. Áp dụng toàn bộ trạng thái nền trong FOUNDATION bên cạnh trạng thái riêng của từng màn hình.

- [MANAGE-01 — Danh mục nội dung CMS](#manage-01)
- [MANAGE-02 — Soạn nội dung và cấu hình phòng](#manage-02)
- [MANAGE-03 — Creator Studio](#manage-03)
- [MANAGE-04 — Kiểm thử lab trước duyệt](#manage-04)
- [MANAGE-05 — Hàng đợi duyệt bài](#manage-05)
- [MANAGE-06 — Phân tích năng lực tổ chức](#manage-06)
- [MANAGE-07 — Chi tiết kỹ năng và giao lộ trình](#manage-07)

<a id="manage-01"></a>

## MANAGE-01 — Danh mục nội dung CMS

**Đường dẫn thiết kế:** `/admin/cms`. **Nguồn nghiệp vụ:** US-08.01.

**Ưu tiên:** Nội dung cần sửa/xuất bản và quan hệ lộ trình → module → phòng.

### Desktop

```text
Quản trị nội dung                         [Tạo mới]
[Lộ trình | Module | Phòng]
[Tìm kiếm] [Trạng thái] [Lộ trình]
Tên          Thuộc nhóm     Trạng thái     Cập nhật    [Chỉnh sửa]
Phân trang
```

### Mobile

```text
Nội dung [Tạo mới]
[Lộ trình | Module | Phòng]
[Tìm] [Lọc]
Tên / nhóm
Trạng thái / cập nhật
[Chỉnh sửa]
Phân trang
```

### Hành vi và thông tin cần giữ

Chỉ Admin truy cập CMS. Chọn loại nội dung rồi mở MANAGE-02; giữ bộ lọc khi quay lại. Không có nút xuất bản hàng loạt nếu nghiệp vụ chưa quy định. Xóa/lưu trữ nêu ảnh hưởng đến nội dung liên quan trước xác nhận.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Trống | Tạo nội dung đầu tiên theo loại đang chọn. |
| Draft/Published/Archived | Trạng thái văn bản, hành động đúng quyền. |
| Không đủ quyền | ID-08. |
| Xóa lỗi do phụ thuộc | Hiện quan hệ cần xử lý; không tự xóa dây chuyền. |

<a id="manage-02"></a>

## MANAGE-02 — Soạn nội dung và cấu hình phòng

**Đường dẫn thiết kế:** `/admin/cms/rooms/new; /admin/cms/[type]/[id]`. **Nguồn nghiệp vụ:** US-08.01.

**Ưu tiên:** Cấu trúc nội dung, lỗi cần sửa và khả năng xuất bản.

### Desktop

```text
Tên nội dung · Trạng thái · Lưu lần cuối       [Lưu nháp] [Xuất bản]
[Thông tin | Nội dung | Câu hỏi | Môi trường]
Cây module/phòng/task (240 px) | Form của mục đang chọn
                              | Tên / thứ tự / nội dung / quan hệ
                              | Câu hỏi: loại flag / EXP / hints
                              | Môi trường: image / CPU / RAM / ports
Lỗi xuất bản: danh sách liên kết đến trường lỗi
```

### Mobile

```text
Tên / trạng thái lưu
[Chọn mục trong cấu trúc]
[Thông tin | Nội dung]
[Câu hỏi | Môi trường]
Form của mục đang chọn
Lỗi có liên kết tới trường
[Lưu nháp] [Xuất bản]
```

### Hành vi và thông tin cần giữ

Form thay đổi theo loại: lộ trình chọn module; module chọn phòng; phòng quản lý task/câu hỏi. Không buộc lộ trình nhập image. EXP > 0, tiêu đề bắt buộc; image phải tồn tại đối với phòng thực hành. Registry kiểm tra và port mapping nằm trong tab Môi trường; giới hạn tài nguyên theo backend. Cờ/đáp án không nằm trong preview học viên.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Trường lỗi | Tóm tắt lỗi đầu form và lỗi tại trường, chuyển tab/focus tới lỗi. |
| Image đang kiểm tra/không tồn tại | Hiển thị rõ, chặn xuất bản phòng thực hành. |
| Chưa lưu | Nêu chưa lưu, xác nhận trước khi rời. |
| Lưu/xuất bản thất bại | Giữ nháp, không đổi trạng thái sang Published. |
| Đã xuất bản | Trạng thái và link xem phòng; backend xác nhận trước. |
| Xung đột phiên bản | Giữ nháp và cho tải bản mới để đối chiếu, không tự ghi đè. |

<a id="manage-03"></a>

## MANAGE-03 — Creator Studio

**Đường dẫn thiết kế:** `/creator; /creator/rooms/[id]`. **Nguồn nghiệp vụ:** US-08.02.

**Ưu tiên:** Soạn bài, xem như học viên và biết còn thiếu gì trước gửi duyệt.

### Desktop

```text
Bài của tôi: tên / trạng thái / lần cập nhật / [Mở] [Tạo bài]
Editor: Tên bài · trạng thái lưu                [Lưu nháp]
[Nội dung | Câu hỏi | Môi trường | Kiểm thử]
Soạn MDX (50%)                     | Preview học viên (50%)
Lỗi cú pháp tại vị trí liên quan   | Bản preview hợp lệ gần nhất
Kiểm thử: chưa đạt / đã đạt        [Chạy thử lab] [Gửi duyệt]
```

### Mobile

```text
Bài của tôi / [Tạo bài]
Tên bài / trạng thái lưu
[Chọn phần chỉnh sửa]
[Soạn | Xem trước]
Vùng đang chọn
Kết quả kiểm thử
[Lưu nháp] [Chạy thử] [Gửi duyệt]
```

### Hành vi và thông tin cần giữ

Creator chỉ thấy nội dung thuộc quyền mình. Preview dùng cùng phân cấp bài học mới, không thi hành MDX không tin cậy ngoài môi trường kiểm soát. Form câu hỏi/môi trường theo MANAGE-02. Gửi duyệt chỉ mở khi backend xác nhận dry-run và tất cả cờ bắt buộc hợp lệ cho phiên bản đang gửi; không suy ra từ một nút bấm chạy máy.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Lỗi MDX | Nêu dòng lỗi, giữ bản thảo và preview hợp lệ trước đó có nhãn cũ. |
| Chưa kiểm thử | Nút gửi duyệt bị khóa; lý do hiển thị ngay, không chỉ tooltip. |
| Đã kiểm thử | Hiện số cờ đã xác minh/tổng và phiên bản. |
| Sửa sau kiểm thử | Không tự tái sử dụng chứng nhận test cho bản mới; yêu cầu backend xác nhận hợp lệ hoặc chạy lại. |
| Chờ duyệt | Trạng thái rõ; không cho gửi trùng. |
| Yêu cầu chỉnh sửa | Hiển thị nhận xét reviewer theo API và đường mở bản nháp. |

<a id="manage-04"></a>

## MANAGE-04 — Kiểm thử lab trước duyệt

**Đường dẫn thiết kế:** `tab Kiểm thử của Creator Studio`. **Nguồn nghiệp vụ:** US-08.02.

**Ưu tiên:** Khởi tạo thử, xác minh cờ và lỗi ngăn gửi duyệt.

### Desktop

```text
Kiểm thử bản nháp · Phiên bản
Máy thử / IP / thời gian / trạng thái
Câu hỏi & ô nộp thử                  | Terminal / AttackBox staging
Đã xác minh x/y cờ                   | Logs có thể mở
[Chạy lại] [Dừng máy thử]             [Gửi duyệt khi đủ điều kiện]
```

### Mobile

```text
Kiểm thử / phiên bản
IP / thời gian
[Câu hỏi | Thực hành]
x/y cờ đã xác minh
Lỗi nếu có
[Dừng] [Gửi duyệt]
```

### Hành vi và thông tin cần giữ

Phiên thử được đánh dấu rõ là staging, không cộng EXP/streak học viên. Cờ cần kiểm tra hiển thị đủ số lượng. Chạy lại/dừng cảnh báo mất trạng thái máy; không tự xuất bản sau khi test thành công.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Provisioning lỗi | Hiển thị lỗi môi trường, giữ nội dung soạn. |
| Cờ sai | Nêu câu chưa đạt, không mở gửi duyệt. |
| Test đạt | Tất cả cờ bắt buộc được backend xác nhận, bật gửi duyệt. |
| Gửi duyệt lỗi | Giữ kết quả test còn hợp lệ, cho thử lại sau đối chiếu trạng thái. |
| Đã gửi | Biên nhận trạng thái Pending Review và đường về danh sách. |

<a id="manage-05"></a>

## MANAGE-05 — Hàng đợi duyệt bài

**Đường dẫn thiết kế:** `/admin/cms/queue`. **Nguồn nghiệp vụ:** US-08.02.

**Ưu tiên:** Nội dung, kết quả kiểm thử và quyết định duyệt.

### Desktop

```text
Hàng đợi duyệt [Tìm] [Trạng thái]
Bài / tác giả / thời gian gửi / kết quả test / [Xem]
Chi tiết: preview bài + cấu hình + bằng chứng test
Nhận xét [_______________________________________]
[Yêu cầu chỉnh sửa / Từ chối]          [Phê duyệt]
```

### Mobile

```text
Hàng đợi duyệt
[Tìm] [Lọc]
Tên / tác giả / thời gian
[Xem]
Preview / cấu hình / test
Nhận xét
[Từ chối] [Phê duyệt]
```

### Hành vi và thông tin cần giữ

Không bỏ kiểm tra chất lượng để tối giản UI. Xác nhận tên bài và trạng thái sau quyết định; không gọi Published nếu backend chỉ chuyển Approved. Reviewer thấy đúng phiên bản đã gửi.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Không có bài | Thông báo hàng đợi trống. |
| Bằng chứng test thiếu/hết hiệu lực | Không cho duyệt khi backend yêu cầu test lại, chỉ rõ thiếu gì. |
| Đã được xử lý | Refresh trạng thái, không phê duyệt lần hai. |
| Lỗi quyết định | Giữ nhận xét và chi tiết, cho thử lại. |

<a id="manage-06"></a>

## MANAGE-06 — Phân tích năng lực tổ chức

**Đường dẫn thiết kế:** `/b2b/analytics`. **Nguồn nghiệp vụ:** US-08.03.

**Ưu tiên:** Nhóm nào thiếu dữ liệu, kỹ năng nào dưới chuẩn và cách xem chi tiết.

### Desktop

```text
Phân tích năng lực             [Tổ chức / lớp / nhóm] [Xuất báo cáo]
Số thành viên có dữ liệu / tổng · thời điểm cập nhật
Kỹ năng cần cải thiện + căn cứ so với benchmark
Ma trận: Thành viên | Web | Network | Pwn | Crypto | DFIR | AD | SOC | Cloud
Số trong ô + sắc độ nền; chú giải đơn vị và thang đo
[Xem thành viên] [Lộ trình phù hợp]
```

### Mobile

```text
Phân tích năng lực
[Nhóm] [Xuất]
Có dữ liệu x/y / cập nhật
Điểm cần cải thiện
[Ma trận | Theo thành viên]
Ma trận cuộn ngang, ghim tên
hoặc danh sách thành viên
Chi tiết đủ 8 kỹ năng
```

### Hành vi và thông tin cần giữ

Chỉ Enterprise/University Admin thuộc tổ chức được xem. Radar cá nhân là EXP tuyệt đối; thang proficiency 0–100 của B2B phải có công thức/benchmark từ backend, không tự chuẩn hóa. Ô thiếu dữ liệu dùng “Chưa có dữ liệu”, khác với 0 đo được. Báo cáo PDF/CSV giữ bộ lọc và phạm vi quyền. Gợi ý lộ trình phải có căn cứ kỹ năng.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Nhóm mới | Nêu chưa có hoạt động; nếu API trả 0 trung bình thì ghi rõ chưa đánh giá, không kết luận cả lớp yếu. |
| Dữ liệu một phần | Hiển thị số người đủ dữ liệu; không gộp người chưa học như điểm thấp. |
| Không có benchmark | Hiện số liệu sẵn có, không gắn kết luận dưới chuẩn. |
| Đang xuất/lỗi xuất | Hiện định dạng và phạm vi; có tải khi sẵn sàng hoặc thử lại. |
| Không có quyền | Không hiển thị dữ liệu nhóm cũ khi đổi tổ chức. |

<a id="manage-07"></a>

## MANAGE-07 — Chi tiết kỹ năng và giao lộ trình

**Đường dẫn thiết kế:** `panel từ phân tích năng lực`. **Nguồn nghiệp vụ:** US-08.03; wireframe cũ 8.7.

**Ưu tiên:** Căn cứ đề xuất và xác nhận đúng nhóm nhận.

### Desktop

```text
Cloud & DevSecOps
Điểm trung bình / benchmark / số người có dữ liệu
Thành viên dưới chuẩn (theo dữ liệu hợp lệ)
Lộ trình liên quan / nội dung / [Chọn]
Nhóm nhận + số thành viên + danh sách kiểm tra
[Hủy]                              [Xác nhận giao lộ trình]
```

### Mobile

```text
Kỹ năng / căn cứ
Thành viên liên quan
[Chọn lộ trình]
Nhóm nhận / số người
[Xem danh sách]
[Hủy] [Xác nhận giao]
```

### Hành vi và thông tin cần giữ

Giữ luồng giao lộ trình đã có trong wireframe 8.7, không coi là API đã triển khai. Không giao tự động dựa trên insight. Xác nhận rõ người nhận và lộ trình; không thêm deadline bắt buộc chưa được nghiệp vụ quy định.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Không có lộ trình liên quan | Cho về danh mục để chọn, không dựng đề xuất giả. |
| Thay nhóm | Xóa lựa chọn người nhận cũ hoặc yêu cầu xác nhận lại, không giao nhầm tổ chức. |
| Thành công một phần | Liệt kê số thành công/thất bại, chỉ thử lại phần thất bại nếu backend hỗ trợ. |
| API chưa hỗ trợ giao | Hiển thị chi tiết đề xuất; không trình bày nút như tác vụ hoạt động trong triển khai tương lai. |
