# Lộ trình và phòng học

Phiên bản wireframe Modern Minimal · 2026-10-10. Đây là thiết kế, chưa triển khai frontend.

[Chỉ mục](README.md) · [Quy tắc chung](FOUNDATION.md) · [Design system](../../../DESIGN.md)

Mỗi sơ đồ mô tả thứ tự và vùng nội dung, không phải số liệu thực tế. Áp dụng toàn bộ trạng thái nền trong FOUNDATION bên cạnh trạng thái riêng của từng màn hình.

- [LEARN-01 — Danh mục lộ trình](#learn-01)
- [LEARN-02 — Chi tiết lộ trình](#learn-02)
- [LEARN-03 — Danh mục phòng thực hành](#learn-03)
- [LEARN-04 — Phòng học hai vùng](#learn-04)

<a id="learn-01"></a>

## LEARN-01 — Danh mục lộ trình

**Đường dẫn thiết kế:** `/paths`. **Nguồn nghiệp vụ:** US-02.01.

**Ưu tiên:** Tìm lộ trình phù hợp và tiếp tục lộ trình đang học.

### Desktop

```text
Học tập / Lộ trình
[Tìm theo tên, kỹ năng] [Định hướng] [Trình độ] [Xóa lọc]
Đang học: tên lộ trình · số task hoàn thành     [Tiếp tục]
Lộ trình             Trình độ    Thời lượng    Tiến độ
Tên + mô tả ngắn     Cơ bản      Ước tính      x/y task [Xem]
Tên + mô tả ngắn     Nâng cao    Ước tính      Chưa học [Xem]
Phân trang
```

### Mobile

```text
Lộ trình
[Tìm kiếm]
[Lọc] số bộ lọc áp dụng
Đang học / [Tiếp tục]
Tên lộ trình
Trình độ · thời lượng
Tiến độ x/y task / [Xem]
[Trang trước] [Trang sau]
```

### Hành vi và thông tin cần giữ

Ưu tiên danh sách dễ so sánh. Thời lượng chỉ hiện khi có dữ liệu, gắn “ước tính”. Tiến độ tính theo task bắt buộc, không thay bằng tỷ lệ phòng. Giữ trạng thái bộ lọc khi quay lại từ trang chi tiết.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Chưa bắt đầu | Không có khối đang học; hiển thị danh mục. |
| Không có kết quả | Hiện điều kiện lọc và “Xóa bộ lọc”. |
| Nội dung cập nhật | Dòng lộ trình ghi có nội dung mới; chi tiết tại LEARN-02. |
| Lỗi danh mục | Giữ bộ lọc, cho tải lại. |

<a id="learn-02"></a>

## LEARN-02 — Chi tiết lộ trình

**Đường dẫn thiết kế:** `/paths/[slug]`. **Nguồn nghiệp vụ:** US-02.01.

**Ưu tiên:** Bài học tiếp theo, tiến độ task và điều kiện tiên quyết.

### Desktop

```text
Lộ trình / Tên lộ trình
Mô tả · Trình độ · Thời lượng
Hoàn thành x/y task bắt buộc                  [Tiếp tục học]
Nội dung mới (chỉ khi có)
Module 1 [Mở/thu gọn]                 | Điều kiện chứng chỉ
  Phòng / x/y task / Trạng thái       | Tiến độ điều kiện thi
  Phòng bị khóa / bài cần hoàn thành  | [Xem kỳ thi]
Module 2 [Mở/thu gọn]
```

### Mobile

```text
Tên lộ trình
x/y task / [Tiếp tục học]
Nội dung mới nếu có
Module 1
Phòng / tiến độ / [Mở]
Phòng khóa / lý do / [Bài trước]
Module 2
Điều kiện chứng chỉ / [Xem]
```

### Hành vi và thông tin cần giữ

Mở mặc định module có bài đang học. Khóa phòng giải thích tại dòng và liên kết bài tiên quyết, không mở modal chỉ để thông báo. Nội dung bổ sung có chỉ dẫn đến task mới; giữ thành tích đã đạt, chỉ cập nhật tiến độ theo dữ liệu máy chủ.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Đang học | CTA tới task chưa xong phù hợp điều kiện. |
| Bị khóa | Nêu bài còn thiếu, vẫn cho đọc mô tả nếu quyền cho phép. |
| Hoàn thành | CTA ôn tập; điều kiện thi được kiểm tra độc lập. |
| Có nội dung mới | Giải thích vì sao phần trăm thay đổi và chỉ rõ mục mới. |

<a id="learn-03"></a>

## LEARN-03 — Danh mục phòng thực hành

**Đường dẫn thiết kế:** `/rooms`. **Nguồn nghiệp vụ:** US-02.02; PRD điều hướng Practice.

**Ưu tiên:** Tìm phòng theo kỹ năng và biết phòng nào có thể bắt đầu.

### Desktop

```text
Thực hành
[Tìm phòng] [Kỹ năng] [Độ khó] [Trạng thái học]
Tên phòng         Kỹ năng        Độ khó    Task    Trạng thái
Linux căn bản     Linux          Cơ bản    x/y     [Mở phòng]
Phân trang
```

### Mobile

```text
Thực hành
[Tìm phòng] [Lọc]
Tên phòng
Kỹ năng · độ khó
x/y task / [Mở phòng]
Phân trang
```

### Hành vi và thông tin cần giữ

Danh mục bổ sung làm điểm vào cho phòng học; không tự tạo hệ thống đánh giá hoặc rating. Metadata là văn bản, không chuỗi badges. Máy chưa chạy khi chỉ mở danh mục.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Không khớp bộ lọc | Nút xóa lọc. |
| Phòng bị khóa | Nêu điều kiện và liên kết lộ trình. |
| Phòng ngừng xuất bản | Thông báo không khả dụng, quay lại danh mục; không cho khởi chạy. |

<a id="learn-04"></a>

## LEARN-04 — Phòng học hai vùng

**Đường dẫn thiết kế:** `/rooms/[slug]`. **Nguồn nghiệp vụ:** US-02.02–US-02.04; US-03.01–US-03.04.

**Ưu tiên:** Nhiệm vụ hiện tại, câu trả lời và môi trường thực hành cùng xuất hiện.

### Desktop

Phòng lý thuyết — một vùng chiếm toàn bộ chiều rộng khả dụng:

```text
[Về lộ trình] Tên phòng lý thuyết          x/y nhiệm vụ
+------------------------------------------------------+
| Danh sách nhiệm vụ — cuộn trong vùng này              |
| Nhiệm vụ 1 / Tiêu đề / Trạng thái             [Thu]   |
|   Nội dung lý thuyết                                  |
|   Câu hỏi / đáp án [________________] [Kiểm tra]       |
|   Phản hồi / gợi ý nếu có                             |
| Nhiệm vụ 2 / Tiêu đề / Trạng thái             [Mở]    |
| Nhiệm vụ 3 / Tiêu đề / Trạng thái             [Mở]    |
+------------------------------------------------------+
```

Phòng thực hành — hai vùng độc lập:

```text
[Về lộ trình] Tên phòng                   x/y nhiệm vụ
Máy: Đang chạy · IP [Chép] · 54:20 [Gia hạn] [Điều khiển]
Danh sách nhiệm vụ cuộn (45%)       | Thực hành (55%)
Nhiệm vụ 1 / Tiêu đề / Xong [Mở]    | Terminal / AttackBox
Nhiệm vụ 2 / Tiêu đề        [Thu]   | Toolbar
  Lý thuyết                        | Nội dung máy ảo
  Câu hỏi + đáp án + Kiểm tra       | Cuộn riêng
  Phản hồi và gợi ý                |
Nhiệm vụ 3 / Tiêu đề        [Mở]    |
```

### Mobile

```text
Tên phòng / x/y nhiệm vụ
Phòng thực hành: IP · thời gian [Máy]
Phòng thực hành: [Bài học | Thực hành]
Phòng lý thuyết: không thanh máy, không tab Thực hành
Danh sách nhiệm vụ cuộn
  Nhiệm vụ 1 / tiêu đề / trạng thái [Mở]
  Nhiệm vụ 2 / tiêu đề / trạng thái [Thu]
    Lý thuyết
    Câu hỏi / đáp án [________]
    [Kiểm tra] [Gợi ý]
    Phản hồi tại câu hỏi
  Nhiệm vụ 3 [Mở]
```

### Hành vi và thông tin cần giữ

Điều chỉnh theo góp ý đã xác nhận của người dùng: hai loại phòng là **lý thuyết** và **thực hành**. Phòng lý thuyết chỉ có vùng nhiệm vụ–lý thuyết toàn chiều rộng; không tạo cột trống, không hiện thanh điều khiển máy, IP hoặc terminal. Phòng thực hành giữ hai vùng bài học và máy ảo; các nội dung lab áp dụng riêng loại này.

Mỗi task là một accordion có tiêu đề chứa số thứ tự, tên nhiệm vụ và trạng thái hoàn thành bằng chữ. Khi mở, hiển thị toàn bộ lý thuyết, câu hỏi, input, nút kiểm tra, gợi ý và phản hồi của chính task đó. Cho mở nhiều task cùng lúc để đối chiếu; đóng task không xóa câu trả lời hoặc kết quả. Mặc định mở nhiệm vụ đang làm. Không tự thu task khi nộp đúng.

**Cuộn toàn danh sách task trong vùng bài học**, không cuộn riêng đoạn lý thuyết bên trong từng task. Header task luôn có thể thao tác bằng bàn phím, biểu thị mở/đóng. Vùng cuộn có nhãn và focus bằng bàn phím. Trạng thái mở/đóng, nháp và vị trí đọc được giữ khi đổi tab responsive.

Phòng thực hành dùng hai vùng co giãn, tối thiểu 360 px mỗi vùng trên desktop. Dưới 1024 px chuyển tab Bài học/Thực hành, giữ phiên và nháp; IP, timer và cảnh báo ngoài tab. Phòng lý thuyết luôn một vùng trên mọi kích thước.

Mất mạng không tự gửi bản nháp khi kết nối lại. Nội dung nháp nhạy cảm phải giới hạn theo tài khoản/phòng và xóa khi đăng xuất. Loại phòng là thuộc tính nội dung khi triển khai thật; bộ chọn loại trong prototype chỉ phục vụ review hai mẫu, không phải lựa chọn làm biến đổi loại phòng của học viên.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Đang tải | Giữ khung hai vùng, chưa cho Start/Nộp khi chưa có dữ liệu quyền. |
| Offline | Thanh thông báo cố định “Mất kết nối. Câu trả lời chưa được gửi”; giữ nháp và quyền đọc nội dung đã tải. |
| Nộp đúng | Tại câu hỏi: “Đúng · +N EXP”; khóa câu đã giải, cập nhật tiến độ từ server. |
| Nộp sai | Lỗi cạnh input, giữ đáp án cho sửa. |
| Khóa nộp | Sau 5 lần sai/60 giây theo server, đếm ngược 3 phút tại câu đó; các câu khác hoạt động. |
| Gợi ý | Xác nhận điểm trước/sau: 100 → 90 với Hint 1; 90 → 70 với Hint 2. Chỉ trừ sau thành công. |
| Lời giải | Trước khi giải, xác nhận điểm còn 0; chỉ mở khi đủ điều kiện; không hiện trong kỳ thi. |
| Hoàn thành phòng | Thông báo trong vùng bài học, điểm nhận và CTA bài tiếp; không popup chúc mừng. |
| Ôn tập | Nêu không tăng streak do không phải task mới; EXP lấy từ server. |
