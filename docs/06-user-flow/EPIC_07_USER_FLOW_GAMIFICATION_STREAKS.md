# Epic 7: Gamification, Streaks & 8-Axis Skill Radar
## Tài liệu Thiết kế Kiến trúc User Flow Chi tiết (User Journey & Experience Flows)

* **Hệ thống:** CyberForce Cyber Range & Practical Security Platform
* **Tài liệu tham chiếu:** [EPIC_07_GAMIFICATION_STREAKS_SKILL_RADAR.md](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/05-epics/EPIC_07_GAMIFICATION_STREAKS_SKILL_RADAR.md)
* **Vai trò phụ trách:** Product Designer (UX Architect)
* **Phiên bản:** 1.0 (Strict Non-Tech User Experience Focus)

---

## 📑 MỤC LỤC TỔNG QUAN CÁC TIỂU LUỒNG (USER FLOWS)

Toàn bộ trải nghiệm tạo động lực học tập, duy trì thói quen hàng ngày và theo dõi sự tiến bộ của bản thân được thiết kế dưới góc nhìn **hoàn toàn phi kỹ thuật (non-tech)** qua **6 tiểu luồng trực quan**:

- **MODULE 1: CHUỖI NGÀY HỌC LIÊN TỤC & THƯỞNG HỆ SỐ NHÂN EXP (DAILY STREAKS & MULTIPLIERS)**
  - [Sub-flow 1.1: Hoàn Thành Bài Học Mới & Nuôi Dưỡng Ngọn Lửa Streak (US-07.01)](#sub-flow-11-hoàn-thành-bài-học-mới--nuôi-dưỡng-ngọn-lửa-streak-us-0701)
  - [Sub-flow 1.2: Phản Hồi Khi Ôn Tập Bài Cũ & Cảnh Báo Nguy Cơ Đứt Chuỗi (US-07.01)](#sub-flow-12-phản-hồi-khi-ôn-tập-bài-cũ--cảnh-báo-nguy-cơ-đứt-chuỗi-us-0701)
- **MODULE 2: BIỂU ĐỒ NĂNG LỰC 8 CÁNH & CỘNG ĐIỂM ĐA KỸ NĂNG (8-AXIS SKILL RADAR)**
  - [Sub-flow 2.1: Khám Phá Biểu Đồ Radar Năng Lực Trên Hồ Sơ Cá Nhân (US-07.02)](#sub-flow-21-khám-phá-biểu-đồ-radar-năng-lực-trên-hồ-sơ-cá-nhân-us-0702)
  - [Sub-flow 2.2: Trải Nghiệm Mở Rộng Biểu Đồ Khi Hoàn Thành Bài Tập Đa Kỹ Năng (US-07.02)](#sub-flow-22-trải-nghiệm-mở-rộng-biểu-đồ-khi-hoàn-thành-bài-tập-đa-kỹ-năng-us-0702)
- **MODULE 3: HỆ THỐNG CẤP BẬC DANH VỌNG & HUY HIỆU THÀNH TÍCH (RANK TIERS & ACHIEVEMENTS)**
  - [Sub-flow 3.1: Thăng Tiến Cấp Bậc Danh Vọng & Vinh Danh Toàn Màn Hình (US-07.03)](#sub-flow-31-thăng-tiến-cấp-bậc-danh-vọng--vinh-danh-toàn-màn-hình-us-0703)
  - [Sub-flow 3.2: Cơ Chế Bảo Toàn Cấp Bậc - Không Bị Giáng Hạng Khi Trừ Điểm (US-07.03)](#sub-flow-32-cơ-chế-bảo-toàn-cấp-bậc---không-bị-giáng-hạng-khi-trừ-điểm-us-0703)

---

## I. NGUYÊN TẮC THIẾT KẾ TRẢI NGHIỆM CHO NGƯỜI DÙNG NON-TECH

1. **Trải nghiệm Game Hóa Thân Thiện & Đầy Cảm Hứng (Inspiring Gamification):**
   - Tập trung vào những yếu tố mang lại niềm vui học tập: *Ngọn lửa chuỗi ngày cháy rực rỡ, huy hiệu sáng lấp lánh, hiệu ứng pháo hoa khi lên cấp, biểu đồ mạng nhện hình hoa nở rộng*.
   - Người học không cần hiểu cách máy chủ tính toán; chỉ cần biết: *Hôm nay làm bài mới $\rightarrow$ Ngọn lửa tiếp tục cháy $\rightarrow$ Điểm kinh nghiệm nhân đôi*.
2. **Cơ chế "No Dead End" (Luôn có động lực bước tiếp):**
   - Làm lại bài cũ không bị mất công vô ích mà vẫn được cộng điểm ôn tập và có nút gợi ý bài mới làm ngay để giữ chuỗi.
   - Bị trừ điểm do xem gợi ý cũng không bao giờ bị tụt cấp bậc danh vọng, giúp học viên luôn giữ được sự tự tin.
3. **Minh bạch & Trực quan Hóa Sự Tiến Bộ:**
   - Biểu đồ năng lực 8 trục giúp người học nhìn thấy ngay mảng nào mình giỏi (cánh biểu đồ vươn dài) và mảng nào cần học thêm (cánh biểu đồ còn ngắn) mà không cần đọc những bảng báo cáo khô khan.

---

## II. CHI TIẾT CÁC TIỂU LUỒNG USER FLOW (MERMAID FLOWCHARTS & MATRICES)

---

### Sub-flow 1.1: Hoàn Thành Bài Học Mới & Nuôi Dưỡng Ngọn Lửa Streak (US-07.01)

Mỗi ngày giải thành công ít nhất một bài tập mới trước nửa đêm để nuôi ngọn lửa học tập liên tục và nhận các phần thưởng nhân điểm hấp dẫn.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_DAILY_STUDY(["Học viên mở bài học trong ngày"]):::startEnd --> ACT_SUBMIT_NEW["Giải thành công và gửi đáp án của 01 bài tập mới"]:::process

    ACT_SUBMIT_NEW --> D_CHECK_NEW{"Bài tập này đã từng được giải trước đây chưa?"}:::decision

    %% Brand New Task
    D_CHECK_NEW -- "Bài tập mới tinh - Giải lần đầu" --> ACT_EXTEND_STREAK["Chuỗi ngày học liên tục (Streak) tự động tăng thêm +1 Ngày"]:::process

    ACT_EXTEND_STREAK --> D_STREAK_MILESTONE{"Kiểm tra các cột mốc chuỗi ngày đặc biệt?"}:::decision

    %% Normal day
    D_STREAK_MILESTONE -- "Ngày học bình thường" --> P_NORMAL_STREAK_POP["Biểu tượng Ngọn lửa bùng cháy rực rỡ:<br>Chúc mừng bạn duy trì chuỗi học tập X ngày liên tiếp!"]:::successState

    %% 7 Days Milestone
    D_STREAK_MILESTONE -- "Chạm mốc 7 Ngày liên tục" --> P_7DAYS_REWARD["Mở khóa Huy hiệu 'Chiến Binh 7 Ngày' 🛡️<br>- Kích hoạt Thưởng Nhân 1.2x Điểm Kinh Nghiệm (EXP)<br>- Hiệu lực trong vòng 24 giờ tới!"]:::successState

    %% 30 Days Milestone
    D_STREAK_MILESTONE -- "Chạm mốc 30 Ngày liên tục" --> P_30DAYS_REWARD["Mở khóa Danh hiệu 'Bậc Thầy Thói Quen' 👑<br>- Kích hoạt Thưởng Nhân 1.5x Điểm Kinh Nghiệm (EXP)<br>- Hiệu lực trong vòng 48 giờ tới!"]:::successState

    P_NORMAL_STREAK_POP --> OUT_STREAK_ACTIVE(["Biểu tượng Ngọn lửa trên thanh điều hướng phát sáng kèm số ngày"]):::startEnd
    P_7DAYS_REWARD --> OUT_STREAK_ACTIVE
    P_30DAYS_REWARD --> OUT_STREAK_ACTIVE
```

#### Bảng State Transition Matrix (Sub-flow 1.1)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1.1.1** | Giao diện bài học | Hoàn thành và nộp đáp án | Bài tập mới chưa từng giải trước đó | Thông báo chúc mừng kèm số điểm kinh nghiệm nhận được | Nút "Tiếp tục bài tiếp theo" |
| **1.1.2** | Màn hình chúc mừng | Quan sát biểu tượng ngọn lửa | Đã giải bài mới trước 23:59 theo giờ cá nhân | Ngọn lửa bốc cháy kèm số ngày tăng lên (+1) | Tự động ghi nhận theo đúng múi giờ nơi học viên sinh sống |
| **1.1.3** | Màn hình chúc mừng | Đạt mốc 7 ngày liên tục | Chuỗi đạt đúng 7 ngày | Hộp thoại trao tặng huy hiệu "Chiến Binh 7 Ngày" | Kích hoạt nhân 1.2x điểm trong 24 giờ tiếp theo |
| **1.1.4** | Màn hình chúc mừng | Đạt mốc 30 ngày liên tục | Chuỗi đạt tròn 1 tháng | Hộp thoại vinh danh "Bậc Thầy Thói Quen" | Kích hoạt nhân 1.5x điểm trong 48 giờ tiếp theo |
| **1.1.5** | Thanh điều hướng | Di chuột vào biểu tượng ngọn lửa | Ngọn lửa đang cháy | Bảng lịch tuần hiển thị các ngày đã hoàn thành | Giúp học viên theo dõi nhịp độ học tập trong tuần |

---

### Sub-flow 1.2: Phản Hồi Khi Ôn Tập Bài Cũ & Cảnh Báo Nguy Cơ Đứt Chuỗi (US-07.01)

Phân biệt rõ ràng giữa việc ôn tập bài cũ và việc chinh phục bài mới, nhắc nhở kịp thời để học viên không bị đứt chuỗi ngày đáng tiếc.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_REVIEW(["Học viên mở lại một bài học đã làm tuần trước"]):::startEnd --> ACT_SUBMIT_OLD["Giải lại và gửi đáp án bài tập cũ"]:::process

    ACT_SUBMIT_OLD --> P_REVIEW_CONFIRM["Thông báo Ôn tập Thành công:<br>- Bạn nhận được điểm thưởng Ôn tập kiến thức<br>- Ghi chú: Bài tập đã làm trước đây không tính vào chuỗi Streak"]:::page

    P_REVIEW_CONFIRM --> D_TODAY_STREAK_STATUS{"Trong ngày hôm nay học viên đã giải bài mới nào chưa?"}:::decision

    %% Already done a new task today
    D_TODAY_STREAK_STATUS -- "Đã giải bài mới từ sáng" --> P_SAFE_STREAK["Ngọn lửa hôm nay đã an toàn! Chuỗi ngày học tiếp tục được bảo toàn"]:::successState

    %% No new task yet
    D_TODAY_STREAK_STATUS -- "Chưa giải bài mới nào trong ngày" --> P_STREAK_WARNING["Hộp thoại Nhắc nhở Thân thiện:<br>🔥 Đừng để ngọn lửa bị tắt!<br>Hãy giải thêm ít nhất 01 bài tập mới trước 23:59 tối nay để giữ chuỗi"]:::errorState

    P_STREAK_WARNING --> ACT_SUGGEST_NEW["Gợi ý 3 bài tập mới vừa sức ngay bên dưới"]:::process

    P_STREAK_WARNING --> D_USER_CHOICE{"Lựa chọn của học viên?"}:::decision
    D_USER_CHOICE -- "Bấm 'Làm bài mới ngay'" --> OUT_DO_NEW(["Mở bài học mới để tiếp tục thắp lửa"]):::startEnd
    D_USER_CHOICE -- "Bấm 'Để sau'" --> OUT_CLOSE_REMIND(["Đóng thông báo, quay về trang chủ học tập"]):::startEnd
```

#### Bảng State Transition Matrix (Sub-flow 1.2)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1.2.1** | Phòng học đã hoàn thành | Giải lại bài tập cũ | Bài tập đã có tích xanh hoàn thành từ trước | Nhận điểm kinh nghiệm ôn tập | Giữ giá trị cho việc ôn lại kiến thức |
| **1.2.2** | Hộp thoại sau bài làm | Xem thông báo Streak | Đã giải bài mới khác trong ngày hôm nay | Thông báo ngọn lửa hôm nay đã an toàn | Yên tâm tiếp tục ôn tập tự do |
| **1.2.3** | Hộp thoại sau bài làm | Xem thông báo Streak | Chưa làm bài mới nào trong ngày | Hộp thoại nhắc nhở ngọn lửa sắp tắt kèm thời gian đếm lùi | Không làm hoang mang, chỉ dẫn cụ thể việc cần làm |
| **1.2.4** | Hộp thoại nhắc nhở | Xem các bài gợi ý | Cần tìm bài mới nhanh chóng | Danh sách 3 bài học mới phù hợp trình độ | Bấm 1-click vào làm ngay bài mới |
| **1.2.5** | Hộp thoại nhắc nhở | Bấm "Để sau" | Người học bận việc khác | Đóng hộp thoại nhắc nhở, trở về Dashboard | Cho phép học viên chủ động sắp xếp thời gian trước 23:59 |

---

### Sub-flow 2.1: Khám Phá Biểu Đồ Radar Năng Lực Trên Hồ Sơ Cá Nhân (US-07.02)

Biểu đồ hình mạng nhện 8 trục sinh động giúp học viên và nhà tuyển dụng dễ dàng nhìn thấy bức tranh tổng thể về chuyên môn mà không cần đọc số liệu phức tạp.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_PROFILE(["Học viên mở Hồ sơ Cá nhân hoặc Bảng điều khiển"]):::startEnd --> P_SKILL_RADAR_SECTION["Khu vực Biểu Đồ Năng Lực 8 Cánh (Skill Radar):<br>- Bảo mật Ứng dụng Web<br>- An ninh Mạng<br>- Khai thác Phần mềm<br>- Mật mã học<br>- Điều tra Sự cố<br>- Hệ thống Doanh nghiệp<br>- Phòng thủ Mạng<br>- Đám mây & Vận hành"]:::page

    P_SKILL_RADAR_SECTION --> ACT_HOVER_AXIS["Học viên rê chuột vào một cánh bất kỳ trên biểu đồ"]:::process

    ACT_HOVER_AXIS --> P_TOOLTIP_DETAIL["Hộp thoại Thông tin Nhanh:<br>- Tên chuyên môn & Tổng điểm tích lũy<br>- Danh hiệu đạt được trong mảng này<br>- Số bài thực hành đã chinh phục thành công"]:::page

    P_TOOLTIP_DETAIL --> D_DESIRE_LEARN{"Học viên muốn cải thiện cánh kỹ năng còn thấp?"}:::decision

    D_DESIRE_LEARN -- "Bấm 'Khám phá bài học nâng cao kỹ năng này'" --> ACT_FILTER_COURSES["Hệ thống tự động lọc ra các bài học thuộc đúng chuyên môn đó"]:::process

    ACT_FILTER_COURSES --> OUT_STUDY_CATEGORY(["Chuyển đến danh sách bài tập chuyên sâu để luyện tập"]):::startEnd

    D_DESIRE_LEARN -- "Tiếp tục xem tổng quan" --> P_SKILL_RADAR_SECTION
```

#### Bảng State Transition Matrix (Sub-flow 2.1)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2.1.1** | Hồ sơ cá nhân | Cuộn chuột đến phần Kỹ năng | Đã đăng nhập hoặc xem trang hồ sơ công khai | Biểu đồ Radar 8 trục màu sắc hiện đại, cân đối | Biểu diễn diện tích trực quan, dễ hiểu |
| **2.1.2** | Biểu đồ Radar | Di chuột vào một đỉnh của biểu đồ | Muốn xem chi tiết một kỹ năng | Khung nổi hiển thị số điểm và cấp độ chuyên môn | Tự động ẩn đi khi di chuột ra ngoài |
| **2.1.3** | Khung nổi chi tiết | Bấm nút "Luyện tập kỹ năng này" | Cánh kỹ năng này điểm còn thấp | Chuyển đến thư viện bài học được lọc sẵn theo chủ đề | Giúp người học định hướng phát triển cân bằng các mảng |
| **2.1.4** | Biểu đồ Radar | Xem trên điện thoại di động | Màn hình kích thước nhỏ | Biểu đồ tự co giãn mượt mà, hỗ trợ chạm ngón tay để xem chi tiết | Đảm bảo trải nghiệm tốt trên mọi thiết bị |

---

### Sub-flow 2.2: Trải Nghiệm Mở Rộng Biểu Đồ Khi Hoàn Thành Bài Tập Đa Kỹ Năng (US-07.02)

Chứng kiến biểu đồ năng lực tự động nở rộng đồng thời trên nhiều hướng khi hoàn thành một bài tập mang tính thực chiến tổng hợp.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_SOLVE_TASK(["Học viên giải xong một bài thực hành tổng hợp"]):::startEnd --> D_CHECK_TAGS{"Loại kỹ năng của bài thực hành này?"}:::decision

    %% Multi-Tag Task
    D_CHECK_TAGS -- "Bài tập Đa kỹ năng (Ví dụ: Đám mây + An ninh Mạng)" --> ACT_ADD_BOTH["Cộng điểm đồng thời cho cả hai trục kỹ năng tương ứng"]:::process

    ACT_ADD_BOTH --> P_ANIMATE_RADAR["Hiệu ứng Hoạt hình Trực quan trên Biểu đồ:<br>- Cánh 'Đám mây' vươn dài thêm (+150 điểm)<br>- Cánh 'An ninh Mạng' vươn dài thêm (+150 điểm)<br>- Diện tích hình mạng nhện nở rộng rõ rệt!"]:::successState

    %% General Theory Task
    D_CHECK_TAGS -- "Bài lý thuyết đại cương (Không thuộc 8 trục)" --> ACT_ADD_GENERAL["Cộng điểm kinh nghiệm vào Tổng điểm cá nhân"]:::process

    ACT_ADD_GENERAL --> P_KEEP_RADAR["Biểu đồ 8 trục giữ nguyên vẹn hình dáng đẹp mắt, tổng điểm tài khoản vẫn tăng đều"]:::page

    P_ANIMATE_RADAR --> OUT_MOTIVATED(["Học viên cảm thấy hào hứng khi thấy năng lực bản thân phát triển"]):::startEnd
    P_KEEP_RADAR --> OUT_MOTIVATED
```

#### Bảng State Transition Matrix (Sub-flow 2.2)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2.2.1** | Màn hình hoàn thành bài | Nộp đáp án bài thực hành liên môn | Bài tập có gắn nhiều nhãn kỹ năng | Thông báo nhận điểm thưởng kèm danh sách các trục được tăng | Hiển thị cụ thể điểm cộng cho từng kỹ năng |
| **2.2.2** | Hồ sơ năng lực | Quan sát biểu đồ sau khi nộp bài | Vừa hoàn thành bài thực hành | Đồ họa hoạt hình biểu đồ nở rộng tại các cánh tương ứng | Cảm giác thành tựu rõ rệt và trực quan |
| **2.2.3** | Màn hình hoàn thành bài | Nộp bài lý thuyết đại cương | Bài học căn bản không chia theo 8 trục | Điểm kinh nghiệm tổng tăng lên, biểu đồ giữ nguyên | Mọi bài tập đều có giá trị nâng cấp tài khoản |
| **2.2.4** | Bảng xếp hạng kỹ năng | Nhấp xem thứ hạng theo mảng | Muốn so tài với cộng đồng | Bảng xếp hạng các học viên xuất sắc nhất trong từng chuyên môn | Nút quay lại hồ sơ cá nhân |

---

### Sub-flow 3.1: Thăng Tiến Cấp Bậc Danh Vọng & Vinh Danh Toàn Màn Hình (US-07.03)

Khoảnh khắc tích lũy đủ điểm kinh nghiệm để vượt ngưỡng, mở khóa danh hiệu mới với hiệu ứng vinh danh toàn màn hình đầy tự hào.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_EXP_ADD(["Học viên nhận thêm điểm thưởng sau khi làm bài"]):::startEnd --> D_CHECK_LEVEL_UP{"Tổng điểm kinh nghiệm có vượt mốc cấp bậc tiếp theo?"}:::decision

    %% Not yet level up
    D_CHECK_LEVEL_UP -- "Chưa đủ mốc (Đang tích lũy)" --> P_PROGRESS_EXP["Thanh tiến trình cấp bậc tăng lên, hiển thị số điểm còn thiếu để lên cấp"]:::page
    P_PROGRESS_EXP --> OUT_KEEP_LEARNING(["Tiếp tục học tập và làm bài tập"]):::startEnd

    %% Level Up!
    D_CHECK_LEVEL_UP -- "Vượt mốc cấp bậc mới (Ví dụ: Chạm mốc 5,000 EXP)" --> P_CELEBRATION_MODAL["Màn hình Chúc Mừng Lên Cấp Toàn Màn Hình 🎉:<br>- Pháo hoa rực rỡ và âm thanh chúc mừng hoành tráng<br>- Thăng hạng từ 'Tân Binh' lên 'Hacker Đích Thực'<br>- Mở khóa Khung viền Avatar mới lấp lánh"]:::successState

    P_CELEBRATION_MODAL --> ACT_UPDATE_BADGES["Hệ thống cập nhật danh hiệu mới trên toàn bộ nền tảng"]:::process

    ACT_UPDATE_BADGES --> P_AVATAR_REFRESH["Huy hiệu cạnh tên người dùng trên thanh điều hướng tự động đổi sang cấp mới"]:::page

    P_CELEBRATION_MODAL --> D_SHARE_PRIDE{"Học viên muốn chia sẻ niềm vui?"}:::decision
    D_SHARE_PRIDE -- "Bấm 'Khoe thành tích'" --> ACT_SHARE_LINK["Tạo tấm thiệp thành tích đẹp mắt để tải về hoặc chia sẻ mạng xã hội"]:::process
    D_SHARE_PRIDE -- "Bấm 'Tuyệt vời, học tiếp'" --> OUT_KEEP_LEARNING
```

#### Bảng State Transition Matrix (Sub-flow 3.1)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **3.1.1** | Màn hình hoàn thành bài | Nhận điểm kinh nghiệm | Chưa chạm ngưỡng mốc cấp bậc mới | Thanh tiến trình tiến thêm một đoạn, hiện rõ số điểm cần thêm | Giúp người học biết còn cách mốc bao xa |
| **3.1.2** | Màn hình hoàn thành bài | Nhận điểm kinh nghiệm | Vượt ngưỡng mốc thăng hạng | Hộp thoại chúc mừng thăng cấp phủ khắp màn hình | Âm thanh sinh động, pháo hoa rực rỡ |
| **3.1.3** | Màn hình chúc mừng thăng cấp | Xem danh hiệu và quà tặng | Đã lên hạng thành công | Hiển thị danh hiệu mới và khung viền đại diện mới | Tự động áp dụng vào ảnh đại diện |
| **3.1.4** | Màn hình chúc mừng | Bấm nút "Khoe thành tích" | Muốn chia sẻ cho bạn bè | Tạo ảnh thiệp mừng cá nhân hóa để tải về | Nút lưu ảnh hoặc chia sẻ 1-click |
| **3.1.5** | Màn hình chúc mừng | Bấm nút "Tiếp tục học" | Đã xem xong phần thưởng | Đóng hộp thoại chúc mừng, trở lại giao diện bài học | Tiếp tục hành trình học tập thuận tiện |

---

### Sub-flow 3.2: Cơ Chế Bảo Toàn Cấp Bậc - Không Bị Giáng Hạng Khi Trừ Điểm (US-07.03)

Tạo cảm giác an tâm tuyệt đối cho người học: Điểm số có thể biến động khi mở gợi ý nhưng danh hiệu và đẳng cấp đã đạt được luôn được giữ vững trọn đời.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_NEED_HINT(["Học viên gặp bế tắc và muốn xem Gợi ý bài giải"]):::startEnd --> ACT_OPEN_HINT["Bấm mở Gợi ý (Có thông báo trừ 20 điểm EXP)"]:::process

    ACT_OPEN_HINT --> D_HINT_CONFIRM{"Học viên xác nhận mở gợi ý?"}:::decision

    D_HINT_CONFIRM -- "Hủy bỏ, tự giải tiếp" --> OUT_CONTINUE_SOLVE(["Quay lại tự suy nghĩ để bảo toàn điểm"]):::startEnd

    D_HINT_CONFIRM -- "Đồng ý trừ điểm để xem gợi ý" --> ACT_DEDUCT_EXP["Trừ nhẹ 20 điểm kinh nghiệm để mở nội dung gợi ý"]:::process

    ACT_DEDUCT_EXP --> D_CHECK_TIER_IMPACT{"Điểm số tạm thời tụt xuống dưới mốc cấp bậc hiện tại?"}:::decision

    %% Rank Protected
    D_CHECK_TIER_IMPACT -- "Điểm số có giảm nhưng đẳng cấp giữ nguyên" --> P_RANK_PROTECTED["Hệ thống áp dụng Quy tắc Bất Biến Cấp Bậc:<br>- Cấp bậc của bạn vẫn giữ vững là 'Hacker' 🛡️<br>- Khung viền và danh hiệu được bảo toàn 100%<br>- Tuyệt đối không bao giờ bị giáng cấp!"]:::successState

    P_RANK_PROTECTED --> P_HINT_SHOWN["Nội dung gợi ý hiển thị giúp người học vượt qua điểm nghẽn"]:::page

    P_HINT_SHOWN --> OUT_CONTINUE_SOLVE
```

#### Bảng State Transition Matrix (Sub-flow 3.2)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **3.2.1** | Khung câu hỏi bài tập | Bấm nút xem Gợi ý | Gợi ý có quy định trừ điểm kinh nghiệm | Hộp thoại nhắc nhở số điểm sẽ bị trừ | Nút "Hủy bỏ" để tự giải nếu không muốn mất điểm |
| **3.2.2** | Hộp thoại gợi ý | Xác nhận mở xem gợi ý | Đồng ý đổi điểm lấy hướng dẫn giải | Nội dung gợi ý mở ra, số điểm giảm nhẹ | Học viên nắm được gợi ý để giải tiếp |
| **3.2.3** | Thanh điều hướng | Quan sát cấp bậc sau khi trừ điểm | Điểm số rơi xuống dưới ngưỡng mốc vừa lên | Cấp bậc và huy hiệu giữ nguyên vẹn 100% | Cam kết bảo toàn danh hiệu, không hạ cấp bậc |
| **3.2.4** | Bảng tiến trình | Xem điểm số hiện tại | Sau khi bị trừ điểm | Điểm kinh nghiệm tích lũy hiển thị chính xác số thực tế | Học viên hoàn toàn yên tâm tiếp tục trải nghiệm |
