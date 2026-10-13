# Tiến độ và thành tích

Wireframe Modern Minimal · cập nhật 2026-10-13. Một số màn hình đã có frontend/API, phần còn lại là ý tưởng; xem [hiện trạng](IMPLEMENTATION-STATUS.md) và [prompt Stitch](STITCH.md).

[Chỉ mục](README.md) · [Quy tắc chung](FOUNDATION.md) · [Design system](../../../DESIGN.md)

Mỗi sơ đồ mô tả thứ tự và vùng nội dung, không phải số liệu thực tế. Áp dụng toàn bộ trạng thái nền trong FOUNDATION bên cạnh trạng thái riêng của từng màn hình.

- [PROGRESS-01 — Tiến độ, chuỗi học và thành tích](#progress-01)

<a id="progress-01"></a>

## PROGRESS-01 — Tiến độ, chuỗi học và thành tích

**Đường dẫn thiết kế:** `khu vực Tiến độ trong dashboard/hồ sơ`. **Nguồn nghiệp vụ:** US-07.01–US-07.03.

**Ưu tiên:** Hiểu tiến bộ và biết hành động nào duy trì chuỗi học.

### Desktop

```text
Tiến độ của bạn
Cấp bậc · Tổng EXP · Mốc tiếp theo
Chuỗi hiện tại / dài nhất / múi giờ / hôm nay đã ghi nhận chưa
Lịch hoạt động                    | Năng lực 8 trục + bảng EXP
Ưu đãi EXP đang hiệu lực / thời điểm hết hạn
Thành tích: Tên | Điều kiện | Ngày đạt
Thang cấp bậc [Mở chi tiết]
```

### Mobile

```text
Tiến độ
Cấp bậc / EXP / mốc tiếp
Chuỗi / múi giờ / hôm nay
Lịch hoạt động cuộn riêng
Ưu đãi EXP / hết hạn
Radar + bảng 8 kỹ năng
Danh sách thành tích
```

### Hành vi và thông tin cần giữ

Chỉ task mới được tính streak; giải lại không tăng chuỗi. Lịch có ngày và giá trị đọc bằng bàn phím, không chỉ màu. Radar giữ EXP tuyệt đối; task đa kỹ năng cộng vào mỗi trục theo server, không chia đều. Rank không giảm khi trừ điểm. Bảng rank: Novice 0, Script Kiddie 1.000, Hacker 5.000, Pro Hacker 15.000, Elite Hacker 35.000, Cyber Guru 70.000 EXP.

### Trạng thái riêng

| Trạng thái / sự kiện | Hiển thị và hành động tiếp theo |
|---|---|
| Chưa có hoạt động | Hướng tới bài học đầu tiên; không vẽ radar đầy giả. |
| Đạt mốc 7 ngày | Thông báo tại chỗ hệ số 1,2 trong 24 giờ theo server và thời điểm hết hạn. |
| Đạt mốc 30 ngày | Thông báo hệ số 1,5 trong 48 giờ theo server; không tự cộng dồn hai hệ số. |
| Nguy cơ đứt chuỗi | Nhắc nhẹ trong tiến độ: hoàn thành task mới trước ngày kết thúc theo múi giờ hồ sơ; không chặn bài học. |
| Lên cấp | Cập nhật tên rank và thông báo tại chỗ, không modal. |
| Bài không gắn kỹ năng | Tổng EXP đổi, 8 trục giữ nguyên; không có NaN. |
| Mở gợi ý | Dialog ở LEARN-04 nêu điểm thay đổi và rank được giữ. |
