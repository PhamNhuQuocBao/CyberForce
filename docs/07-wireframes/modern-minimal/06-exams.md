# Kỳ thi và chứng chỉ

Phiên bản wireframe Modern Minimal · 2026-10-10. Đây là thiết kế, chưa triển khai frontend.

[Chỉ mục](README.md) · [Quy tắc chung](FOUNDATION.md) · [Design system](../../../DESIGN.md)

Mỗi sơ đồ mô tả thứ tự và vùng nội dung, không phải số liệu thực tế. Áp dụng toàn bộ trạng thái nền trong FOUNDATION bên cạnh trạng thái riêng của từng màn hình.

- [EXAM-01 — Danh mục và điều kiện kỳ thi](#exam-01)
- [EXAM-02 — Không gian làm bài thi](#exam-02)
- [EXAM-03 — Kết quả và chứng chỉ cá nhân](#exam-03)
- [EXAM-04 — Tra cứu và xác thực công khai](#exam-04)

<a id="exam-01"></a>

## EXAM-01 — Danh mục và điều kiện kỳ thi

**Đường dẫn thiết kế:** `/exams; /exams/[slug]`. **Nguồn nghiệp vụ:** US-06.01.

**Ưu tiên:** Điều kiện dự thi, thời lượng, ngưỡng đạt và quy chế trước khi bắt đầu.

### Desktop

```text
Chứng chỉ / Kỳ thi
Danh mục: tên / lộ trình / thời lượng / điều kiện / [Xem]
Chi tiết kỳ thi:
Tên / mô tả                           | Điều kiện của bạn
Thời lượng theo cấu hình              | x/y task bắt buộc
Ngưỡng đạt / kỹ năng đánh giá          | Bài còn thiếu [Mở]
Quy chế: không gợi ý, không đổi IP VPN | [Bắt đầu thi]
Cam kết mở khi bắt đầu: [Hủy] [Đồng ý và bắt đầu]
```

### Mobile

```text
Tên kỳ thi
Thời lượng / ngưỡng đạt
Điều kiện x/y task
Bài còn thiếu [Mở]
Quy chế
[Bắt đầu thi]
Cam kết trước khi kích hoạt
```

### Hành vi và thông tin cần giữ

Danh mục và chi tiết dùng cùng phân cấp, chi tiết là trang riêng. Khóa bắt đầu khi chưa đủ 100% phòng bắt buộc; tiến độ task và điều kiện kỳ thi lấy từ server. Hiển thị rõ việc bắt đầu khởi động đồng hồ; cam kết không chọn sẵn. Thời lượng 6/12/24 giờ hoặc cấu hình thực tế, không cố định 12 giờ.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Chưa đủ điều kiện | Nút không khả dụng, bài còn thiếu là liên kết trực tiếp. |
| Có phiên đang thi | CTA “Tiếp tục phiên thi”, không tạo phiên mới. |
| Trong thời gian chờ thi lại | Ngày giờ được thi lại theo server, đủ 14 ngày theo nghiệp vụ. |
| Đang cấp phát | Nêu trạng thái và thời điểm bắt đầu/hạn nộp do server trả; lỗi không tự khởi tạo bài thi lần hai. |

<a id="exam-02"></a>

## EXAM-02 — Không gian làm bài thi

**Đường dẫn thiết kế:** `/exams/[slug]/session`. **Nguồn nghiệp vụ:** US-06.01.

**Ưu tiên:** Thời gian còn lại, mục tiêu, trạng thái nộp từng câu và kết thúc bài.

### Desktop

```text
Tên kỳ thi · Còn 11:42:18 · Hạn nộp cụ thể       [Kết thúc bài]
Đồng bộ lần cuối / cảnh báo kết nối
Nhiệm vụ và nộp cờ (45%)              | Mạng mục tiêu (55%)
[Chọn nhiệm vụ]                       | Tên máy / IP / trạng thái
Yêu cầu / trọng số                    | Terminal / AttackBox / VPN
Flag [____________] [Nộp cờ]          |
Đã nhận lúc ... / Chưa gửi            |
Danh sách câu đã nộp / chưa nộp       |
```

### Mobile

```text
Còn 11:42:18 [Kết thúc]
Đồng bộ / hạn nộp
[Nhiệm vụ | Thực hành]
Câu / trọng số
Flag [________] [Nộp]
Trạng thái nhận bài
Danh sách câu
```

### Hành vi và thông tin cần giữ

Không có gợi ý, walkthrough, diễn đàn hoặc đổi IP VPN. Không gọi lưu bản nháp là đã nộp bài. Đồng hồ dựa thời hạn server; mất mạng không tạm dừng giờ thi. Dialog kết thúc: số câu đã nhận, chưa nhận và hậu quả không sửa tiếp; [Tiếp tục làm] là lựa chọn an toàn. Không yêu cầu báo cáo PDF.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Đang nộp cờ | Chờ xác nhận server trước khi đổi trạng thái câu. |
| Mất mạng | Giữ nháp cục bộ theo chính sách phiên; nhắc thời gian vẫn chạy, không hứa nháp sẽ được chấm. |
| Đã kết thúc/hết giờ | Khóa thao tác, đối chiếu bài đã nhận và kết quả server; không tự gửi cờ muộn. |
| Chưa rõ kết quả yêu cầu kết thúc | Hiện đang xác minh phiên, không tạo bài thi mới. |
| Hết phiên đăng nhập | Cho xác thực lại và quay về đúng phiên; không reset timer. |

<a id="exam-03"></a>

## EXAM-03 — Kết quả và chứng chỉ cá nhân

**Đường dẫn thiết kế:** `/exams/[slug]/results`. **Nguồn nghiệp vụ:** US-06.02.

**Ưu tiên:** Đạt/chưa đạt, điểm và bước tiếp theo.

### Desktop

```text
Kết quả kỳ thi
Đạt / Chưa đạt · Điểm / Ngưỡng đạt
Nhóm kỹ năng / kết quả
Nếu đạt: Chứng chỉ / mã / ngày cấp
[Tải PDF] [Xác thực] [Thêm vào LinkedIn]
Nếu chưa đạt: Ngày được thi lại / nội dung cần ôn [Mở lộ trình]
```

### Mobile

```text
Đạt / Chưa đạt
Điểm / ngưỡng
Kết quả kỹ năng
Chứng chỉ hoặc ngày thi lại
[Tải PDF]
[Xác thực] [LinkedIn]
hoặc [Ôn tập]
```

### Hành vi và thông tin cần giữ

Không confetti, trophy khổng lồ hay âm thanh. Giữ mã chứng chỉ nguyên văn từ server vì ví dụ định dạng trong tài liệu chưa hoàn toàn thống nhất. Không tạo nút tải cho file chưa sẵn sàng. Chia sẻ chỉ sau thao tác người dùng.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Đang chấm | Hiển thị đang xử lý, không tự suy ra đạt. |
| Đạt, PDF đang tạo | Kết quả thi vẫn hiện; “Đang tạo chứng chỉ”, mục tiêu dưới 30 giây không phải cam kết giả. |
| Tạo PDF lỗi | Giữ kết quả đạt; cho thử tải lại trạng thái/cấp lại theo API, không yêu cầu thi lại. |
| Chưa đạt | Nêu điểm thiếu, kỹ năng cần ôn và mốc được thi lại sau 14 ngày. |
| Đã cấp | Tải PDF, URL xác thực và chia sẻ sẵn sàng. |

<a id="exam-04"></a>

## EXAM-04 — Tra cứu và xác thực công khai

**Đường dẫn thiết kế:** `/verify; /verify/[certId]`. **Nguồn nghiệp vụ:** US-06.03.

**Ưu tiên:** Kết luận xác thực xuất hiện trước thông tin chứng chỉ.

### Desktop

```text
Logo CyberForce                               Không cần đăng nhập
Xác thực chứng chỉ
Mã chứng chỉ [______________________] [Tra cứu]
HỢP LỆ / BỊ THU HỒI / KHÔNG TÌM THẤY / CHƯA XÁC MINH
Tên người nhận / Tên chứng chỉ / Mã
Ngày cấp / Hết hạn nếu có / Điểm / Kỹ năng được xác nhận
Trạng thái kiểm tra chữ ký / Đơn vị cấp
[Tra cứu mã khác]
```

### Mobile

```text
Logo
Mã [____________] [Tra cứu]
Kết luận xác thực
Người nhận / chứng chỉ
Ngày cấp / hết hạn / điểm
Kỹ năng
Trạng thái chữ ký
[Tra cứu mã khác]
```

### Hành vi và thông tin cần giữ

Kết quả là tiêu đề văn bản có màu trạng thái hỗ trợ, không badge. Phân biệt bị thu hồi với không tìm thấy và lỗi dịch vụ. Chỉ hiện dữ liệu công khai được server trả. QR dẫn trực tiếp tới trang kết quả.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Mã không hợp lệ | Lỗi cạnh input, chưa gọi kết luận chứng chỉ giả. |
| Hợp lệ | Nêu trạng thái chữ ký đã được server xác nhận. |
| Bị thu hồi | Thông báo nổi bật, không hiện lời khẳng định hợp lệ hoặc nút chia sẻ xác thực. |
| Không tìm thấy | Cho kiểm tra mã hoặc tra cứu lại. |
| Lỗi xác minh | Nêu chưa thể xác minh, không gắn nhãn giả/thu hồi. |
| Hết hạn nếu có | Ngày hết hạn và trạng thái do hệ thống trả, không che dưới kết luận hợp lệ. |
