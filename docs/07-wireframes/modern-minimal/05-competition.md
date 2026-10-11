# CTF và KotH

Phiên bản wireframe Modern Minimal · 2026-10-10. Đây là thiết kế, chưa triển khai frontend.

[Chỉ mục](README.md) · [Quy tắc chung](FOUNDATION.md) · [Design system](../../../DESIGN.md)

Mỗi sơ đồ mô tả thứ tự và vùng nội dung, không phải số liệu thực tế. Áp dụng toàn bộ trạng thái nền trong FOUNDATION bên cạnh trạng thái riêng của từng màn hình.

- [CTF-01 — Danh mục giải và sảnh KotH](#ctf-01)
- [CTF-02 — Phòng chờ trước trận](#ctf-02)
- [CTF-03 — KotH trực tiếp](#ctf-03)
- [CTF-04 — Thử thách Jeopardy CTF](#ctf-04)
- [CTF-05 — Bảng kết quả thi đấu](#ctf-05)

<a id="ctf-01"></a>

## CTF-01 — Danh mục giải và sảnh KotH

**Đường dẫn thiết kế:** `/ctf; /koth`. **Nguồn nghiệp vụ:** US-05.01, US-05.04.

**Ưu tiên:** Giải có thể tham gia, thời gian và quy chế.

### Desktop

```text
Thi đấu                         [CTF | KotH]
[Tìm giải] [Sắp diễn ra | Đang diễn ra | Đã kết thúc]
Tên giải       Thời gian / múi giờ       Người chơi     [Chi tiết]
Chi tiết giải: mô tả / quy chế / điều kiện / thời lượng
KotH: số người 4–10, 45 phút, trạng thái chỗ trống
[Tham gia]
```

### Mobile

```text
Thi đấu [CTF | KotH]
[Lọc trạng thái]
Tên giải
Thời gian / múi giờ
Số người / điều kiện
[Chi tiết] → [Tham gia]
```

### Hành vi và thông tin cần giữ

Không trộn timer các giải vào navbar toàn hệ thống. Hiển thị thời gian tuyệt đối và múi giờ bên cạnh thời gian tương đối. Không tự đưa người dùng vào queue khi mở chi tiết.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Sắp diễn ra | Hiển thị giờ bắt đầu; hành động theo quyền đăng ký của server. |
| Đầy phòng | Vô hiệu hóa tham gia có lý do, cho chọn phòng khác. |
| Đang xếp hàng | Thời gian chờ đã trôi và nút rời hàng; không bịa vị trí queue. |
| Bị cấm thi đấu | Nêu thời điểm hết cấm và lý do được phép xem. |
| Đã kết thúc | Mở bảng kết quả thay nút tham gia. |

<a id="ctf-02"></a>

## CTF-02 — Phòng chờ trước trận

**Đường dẫn thiết kế:** `/koth/[match]/lobby`. **Nguồn nghiệp vụ:** US-05.01.

**Ưu tiên:** Sẵn sàng, kết nối và quy tắc tính điểm.

### Desktop

```text
Tên trận · Bắt đầu lúc / đếm ngược
Người chơi / trạng thái        | Quy chế
Kết nối của bạn                | 45 phút · tick 60 giây
[Kiểm tra VPN / AttackBox]     | +10 điểm nếu King hợp lệ và SLA đạt
[Sẵn sàng] [Rời phòng]         | Các hành vi bị cấm
```

### Mobile

```text
Tên trận / đếm ngược
Kết nối của bạn
[Kiểm tra]
Người chơi / trạng thái
Quy chế / điều kiện tính điểm
[Sẵn sàng] [Rời phòng]
```

### Hành vi và thông tin cần giữ

Danh sách hiển thị trạng thái bằng chữ. Hướng dẫn mục tiêu và file king.txt là nội dung nghiệp vụ, không trang trí terminal. Khi trận bắt đầu chuyển sang CTF-03 theo trạng thái máy chủ.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Thiếu người | Nêu đang chờ, không tự chạy đồng hồ trận. |
| Mất kết nối | Giữ trạng thái đăng ký, kết nối lại trước khi báo sẵn sàng. |
| Trận bị hủy | Giải thích và về sảnh. |
| Trận đã bắt đầu khi quay lại | Đi tới phiên đang diễn ra nếu còn quyền. |

<a id="ctf-03"></a>

## CTF-03 — KotH trực tiếp

**Đường dẫn thiết kế:** `/koth/[match]`. **Nguồn nghiệp vụ:** US-05.01–US-05.03.

**Ưu tiên:** Thời gian trận, target, King và tình trạng SLA.

### Desktop

```text
Tên trận · Còn 20:00 · Tick tiếp 00:32 · Điểm của bạn
Target IP [Chép] · King hiện tại · SLA: đang hoạt động
Thực hành (70%)                       | Bảng xếp hạng (30%)
Terminal / AttackBox                  | Hạng / người / điểm
                                     | Dòng của bạn dễ nhận biết
Thông báo SLA / phạt tại đây          | Nhật ký [Mở khi cần]
```

### Mobile

```text
Còn 20:00 · Tick 00:32
IP [Chép] · King · SLA
[Thực hành | Bảng điểm | Nhật ký]
Vùng đang chọn
Điểm/hạng của bạn
Cảnh báo quan trọng
```

### Hành vi và thông tin cần giữ

Không đưa hoạt ảnh đổi ngôi hoặc âm thanh bắt buộc. +10 điểm/tick 60 giây chỉ khi King hợp lệ và SLA đạt. Giao diện chỉ thể hiện quyết định server. Khi người dùng đang đọc bảng, cập nhật dữ liệu không kéo focus hoặc tự cuộn.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| SLA lỗi | Banner tên dịch vụ, thời điểm và “Không cộng điểm tick bị ảnh hưởng”; hiển thị đang phục hồi, không hứa điểm bù. |
| King không hợp lệ | Không ai nhận điểm tick đó, nêu chưa có King hợp lệ. |
| Vi phạm | Thông báo lý do, mức phạt do server trả và hạn cấm; dialog chỉ cần xác nhận đã đọc, không coi đóng dialog là xóa phạt. |
| Mất WebSocket | Bảng ghi lần cập nhật cuối, timer tham khảo; không tự cộng điểm. |
| Kết thúc | Chuyển kết quả CTF-05 sau xác nhận máy chủ. |

<a id="ctf-04"></a>

## CTF-04 — Thử thách Jeopardy CTF

**Đường dẫn thiết kế:** `/ctf/[event]`. **Nguồn nghiệp vụ:** US-05.04.

**Ưu tiên:** Thử thách, điểm hiện tại, lượt giải và nộp cờ.

### Desktop

```text
Tên giải · Giờ kết thúc · Điểm cá nhân
[Thử thách | Bảng điểm]  [Kỹ năng] [Chưa giải]
Tên / Kỹ năng / Điểm hiện tại / Số lượt giải / Trạng thái
Thử thách được chọn mở panel:
Đề bài / tệp đính kèm / target nếu có
Điểm khởi đầu → hiện tại → tối thiểu; giải thích suy giảm
Flag [________________________] [Nộp]
Phản hồi
```

### Mobile

```text
Tên giải / thời gian
[Thử thách | Bảng điểm]
[Lọc]
Tên / điểm / lượt giải
[Mở thử thách]
Chi tiết toàn chiều rộng
Flag [________] [Nộp]
```

### Hành vi và thông tin cần giữ

Chọn thử thách không làm mất bộ lọc/dòng đang xem. Điểm suy giảm hồi tố cho mọi người giải, trình bày giải thích tại panel thay huy hiệu. Tệp đính kèm có tên/loại/dung lượng khi dữ liệu có. Bảng điểm độc lập với xác nhận nộp cá nhân.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Freeze | Banner nêu bảng công khai dừng cập nhật từ giờ nào; nộp cờ vẫn hoạt động. |
| Đúng trong freeze | Hiện đã chấp nhận và thời điểm, không suy ra thứ hạng mới hoặc tiết lộ điểm ẩn. |
| Điểm thay đổi | Cập nhật giá trị server, giải thích do số lượt giải tăng. |
| Hết giờ | Khóa nộp theo server, giữ khả năng đọc đề và kết quả. |
| Nộp lỗi/mất mạng | Giữ đáp án, đối chiếu trạng thái trước thử lại; không báo đã nhận khi chưa có xác nhận. |

<a id="ctf-05"></a>

## CTF-05 — Bảng kết quả thi đấu

**Đường dẫn thiết kế:** `/ctf/[event]/results; /koth/[match]/results`. **Nguồn nghiệp vụ:** US-05.01, US-05.04.

**Ưu tiên:** Kết quả cá nhân và bảng xếp hạng chính thức.

### Desktop

```text
Kết quả · Tên giải · Thời gian chốt
Bạn: Hạng / điểm / số thử thách đã giải
Hạng     Người hoặc đội     Điểm     Chi tiết kết quả
1        ...               ...      [Xem]
[Tìm người/đội] [Phân trang]
[Quay lại danh sách giải]
```

### Mobile

```text
Kết quả / thời gian chốt
Hạng và điểm của bạn
[Tìm người/đội]
Hạng / tên / điểm
[Chi tiết]
Phân trang
```

### Hành vi và thông tin cần giữ

Dùng bảng có thể tra cứu thay podium lớn; thành tích mới thông báo tại dòng cá nhân và lưu vào hồ sơ. Không tự chốt đồng hạng; hiển thị hạng server.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Chưa công bố | Nêu đang chờ công bố, không coi bảng frozen là kết quả cuối. |
| Chính thức | Hiện thời điểm chốt và kết quả. |
| Không tham gia | Ẩn tóm tắt cá nhân, vẫn cho xem bảng nếu giải công khai. |
| Lỗi tải | Giữ nhãn dữ liệu cũ nếu có, cho thử lại. |
