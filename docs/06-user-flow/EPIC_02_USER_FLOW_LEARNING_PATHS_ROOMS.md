# Epic 2: Structured Learning Paths & Interactive Rooms
## Tài liệu Thiết kế Kiến trúc User Flow Chi tiết (Modular UX Architecture & State Transitions)

* **Hệ thống:** CyberForce Cyber Range & Practical Security Platform
* **Tài liệu tham chiếu:** [EPIC_02_LEARNING_PATHS_INTERACTIVE_ROOMS.md](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/05-epics/EPIC_02_LEARNING_PATHS_INTERACTIVE_ROOMS.md)
* **Vai trò phụ trách:** Product Designer (UX Architect)
* **Phiên bản:** 1.0 (Strict Separation: User Journey Focus)

---

## 📑 MỤC LỤC TỔNG QUAN CÁC TIỂU LUỒNG (USER FLOWS)

Toàn bộ trải nghiệm người dùng trong Epic 2 được phân tách thành **7 tiểu luồng chi tiết, trực quan và không có điểm nghẽn**:

- **MODULE 1: LỘ TRÌNH HỌC TẬP & TIẾN ĐỘ (LEARNING PATHS & PROGRESS)**
  - [Sub-flow 1.1: Khám phá Lộ trình & Mở khóa Phòng học Tiên quyết (US-02.01)](#sub-flow-11-khám-phá-lộ-trình--mở-khóa-phòng-học-tiên-quyết-us-0201)
  - [Sub-flow 1.2: Trải nghiệm Cập nhật Nội dung Mới trên Lộ trình đã Hoàn thành (US-02.01)](#sub-flow-12-trải-nghiệm-cập-nhật-nội-dung-mới-trên-lộ-trình-đã-hoàn-thành-us-0201)
- **MODULE 2: KHÔNG GIAN THỰC HÀNH CHIA MÀN HÌNH (SPLIT-PANE WORKSPACE)**
  - [Sub-flow 2.1: Tương tác Không gian Phòng học Split-Pane Đa nhiệm (US-02.02)](#sub-flow-21-tương-tác-không-gian-phòng-học-split-pane-đa-nhiệm-us-0202)
  - [Sub-flow 2.2: Xử lý Mất kết nối Mạng khi Đang Làm bài (US-02.02)](#sub-flow-22-xử-lý-mất-kết-nối-mạng-khi-đang-làm-bài-us-0202)
- **MODULE 3: NỘP CỜ & ĐÁNH GIÁ ĐÁP ÁN (FLAG SUBMISSION & SCORING)**
  - [Sub-flow 3.1: Nộp Cờ Đáp án & Nhận Thưởng EXP Tức thì (US-02.03)](#sub-flow-31-nộp-cờ-đáp-án--nhận-thưởng-exp-tức-thì-us-0203)
  - [Sub-flow 3.2: Xử lý Nộp Sai Nhiều Lần & Tạm khóa Nộp bài 3 Phút (US-02.03)](#sub-flow-32-xử-lý-nộp-sai-nhiều-lần--tạm-khóa-nộp-bài-3-phút-us-0203)
- **MODULE 4: HỆ THỐNG GỢI Ý & LỜI GIẢI CHI TIẾT (PROGRESSIVE HINTS & WALKTHROUGH)**
  - [Sub-flow 4.1: Mở Gợi ý Bậc thang & Trừ điểm Minh bạch (US-02.04)](#sub-flow-41-mở-gợi-ý-bậc-thang--trừ-điểm-minh-bạch-us-0204)
  - [Sub-flow 4.2: Xem Lời giải Chi tiết Walkthrough Trước & Sau khi Giải (US-02.04)](#sub-flow-42-xem-lời-giải-chi-tiết-walkthrough-trước--sau-khi-giải-us-0204)

---

## I. NGUYÊN TẮC THIẾT KẾ TRẢI NGHIỆM (USER EXPERIENCE PRINCIPLES)

1. **Góc nhìn thuần túy Người dùng (User-First Journey):**
   - Tập trung vào: Người dùng nhìn thấy gì? Thao tác gì? Ra quyết định gì? Nhận phản hồi thị giác nào? Đến màn hình nào tiếp theo?
   - Tuyệt đối không đưa các thuật ngữ cài đặt kỹ thuật (Database queries, WebSocket internals, REST endpoints, HMAC hashing, LocalStorage details).
2. **Nguyên tắc "No Dead End" (Không màn hình bế tắc):**
   - Mọi trạng thái khóa phòng (Locked), khóa nộp bài (3-minute Timeout), lỗi mất mạng (Offline state) đều phải có lối thoát hiểm rõ ràng: *Quay lại bài tiên quyết, Xem gợi ý, Đợi bộ đếm giờ hoặc Trở về Tổng quan Lộ trình*.
3. **Phản hồi Tức thì & Minh bạch Điểm số (Instant & Transparent Feedback):**
   - Mọi hành vi nộp bài đúng/sai, mở gợi ý trừ điểm đều được cập nhật thời gian thực vào điểm số và thanh tiến độ để người học luôn kiểm soát được thành tích của mình.

---

## II. CHI TIẾT CÁC TIỂU LUỒNG USER FLOW (MERMAID FLOWCHARTS & MATRICES)

---

### Sub-flow 1.1: Khám phá Lộ trình & Mở khóa Phòng học Tiên quyết (US-02.01)

Mô tả hành trình học viên duyệt danh mục lộ trình nghề nghiệp, kiểm tra tiến độ và cơ chế tự động mở khóa các phòng học nâng cao khi hoàn thành bài tiên quyết.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_PATH(["Bắt đầu: Mở trang Danh mục Lộ trình"]):::startEnd --> P_PATHS_CATALOG["Trang Danh mục Lộ trình Học tập"]:::page
    
    P_PATHS_CATALOG --> ACT_SELECT_PATH["Học viên chọn một Lộ trình - Ví dụ: Pre-Security"]:::process
    ACT_SELECT_PATH --> P_PATH_OVERVIEW["Trang Tổng quan Lộ trình:<br>Hiển thị Thanh tiến độ tổng thể %, danh sách Modules và Rooms"]:::page

    P_PATH_OVERVIEW --> D_SELECT_ROOM{"Học viên nhấp vào một Phòng học - Room?"}:::decision

    %% Room Locked Case
    D_SELECT_ROOM -- "Phòng đang bị Khóa - Biểu tượng Ổ khóa" --> P_LOCKED_MODAL["Thông báo Khóa Tiên quyết:<br>Bạn cần hoàn thành 100% phòng học tiên quyết để mở khóa nội dung này"]:::errorState
    P_LOCKED_MODAL --> D_LOCKED_ACTION{"Lựa chọn của học viên?"}:::decision
    D_LOCKED_ACTION -- "Bấm Chuyển đến phòng tiên quyết" --> P_ROOM_PREREQ["Mở Phòng học Tiên quyết đang dang dở"]:::page
    D_LOCKED_ACTION -- "Đóng thông báo" --> P_PATH_OVERVIEW

    %% Room Available Case
    D_SELECT_ROOM -- "Phòng Sẵn sàng học - Available" --> P_ROOM_WORKSPACE["Mở Không gian Phòng học tương tác"]:::page
    P_ROOM_WORKSPACE --> ACT_COMPLETE_ROOM["Học viên hoàn thành 100% các Task trong phòng"]:::process

    ACT_COMPLETE_ROOM --> ACT_UNLOCK_NEXT["Hệ thống cập nhật tiến độ:<br>- Đánh dấu hoàn thành phòng hiện tại<br>- Tự động mở khóa phòng nâng cao tiếp theo<br>- Tăng phần trăm tiến độ Lộ trình"]:::process
    
    ACT_UNLOCK_NEXT --> OUT_PATH_PROGRESS(["Quay lại Tổng quan Lộ trình:<br>Phòng tiếp theo đổi sang màu xanh Sẵn sàng, thanh tiến độ tăng vọt"]):::successState
```

#### Bảng State Transition Matrix (Sub-flow 1.1)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1.1.1** | Trang Danh mục Lộ trình | Nhấp chọn một lộ trình | Lộ trình đang hoạt động | Trang Tổng quan Lộ trình hiển thị tỷ lệ % tiến độ | Nút quay lại danh mục |
| **1.1.2** | Trang Tổng quan Lộ trình | Nhấp vào phòng học có biểu tượng Ổ khóa | Chưa hoàn thành 100% phòng học tiên quyết | Hộp thoại thông báo phòng bị khóa kèm tên bài cần học trước | Nút "Đi đến phòng tiên quyết" và nút "Đóng" |
| **1.1.3** | Hộp thoại phòng bị khóa | Nhấp "Đi đến phòng tiên quyết" | Phòng tiên quyết đang mở | Chuyển ngay đến phòng học cần làm trước | Học viên tiếp tục học mà không cần tìm kiếm thủ công |
| **1.1.4** | Không gian Phòng học | Giải quyết xong câu hỏi cuối cùng của phòng | Đạt 100% nhiệm vụ của bài học | Thông báo hoàn thành phòng học | Nút "Tiếp tục sang phòng tiếp theo" hoặc "Về Lộ trình" |
| **1.1.5** | Trang Tổng quan Lộ trình | Quay lại sau khi hoàn thành phòng tiên quyết | Phòng tiên quyết đã đạt 100% | Phòng kế tiếp mở khóa (Available), thanh tiến độ Lộ trình nhảy số tăng | Người học sẵn sàng bấm vào phòng tiếp theo |

---

### Sub-flow 1.2: Trải nghiệm Cập nhật Nội dung Mới trên Lộ trình đã Hoàn thành (US-02.01)

Xử lý trải nghiệm học viên khi một Lộ trình họ từng đạt 100% được giảng viên bổ sung thêm các bài thực hành mới.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_UPDATE(["Học viên mở Lộ trình từng đạt 100%"]):::startEnd --> D_CHECK_PATH_UPDATE{"Lộ trình có bài học mới được bổ sung?"}:::decision

    %% No updates
    D_CHECK_PATH_UPDATE -- "Không có nội dung mới" --> P_COMPLETED_PATH["Hiển thị Huy hiệu Đã hoàn thành 100% - Mastered"]:::successState

    %% Has updates
    D_CHECK_PATH_UPDATE -- "Có bài học mới được cập nhật" --> P_UPDATE_BANNER["Trang Lộ trình hiển thị Banner:<br>Lộ trình có nội dung mới cập nhật! Tiến độ hiện tại được tính lại tương ứng"]:::page

    P_UPDATE_BANNER --> ACT_RECALC_UI["Giao diện cập nhật trạng thái:<br>- Trạng thái đổi thành 'Update Available'<br>- Tiến độ giảm tương ứng với số lượng bài mới - Ví dụ: 85%<br>- Các phòng mới được gắn nhãn 'NEW'"]:::process

    ACT_RECALC_UI --> D_STUDENT_CHOICE{"Học viên lựa chọn hành động?"}:::decision

    %% Option 1: Study new rooms
    D_STUDENT_CHOICE -- "Nhấn 'Học ngay bài mới'" --> P_NEW_ROOM["Mở thẳng vào phòng học mới được gắn nhãn NEW"]:::page
    P_NEW_ROOM --> ACT_FINISH_NEW["Hoàn thành các Task mới"]:::process
    ACT_FINISH_NEW --> OUT_RESTORE_100(["Tiến độ phục hồi 100% - Trạng thái Completed được tái kích hoạt"]):::successState

    %% Option 2: Dismiss banner
    D_STUDENT_CHOICE -- "Bấm 'Xem lại sau'" --> P_BROWSE_EXISTING["Tiếp tục xem lại các tài liệu cũ trong lộ trình"]:::page
```

#### Bảng State Transition Matrix (Sub-flow 1.2)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1.2.1** | Trang Tổng quan Lộ trình | Mở lộ trình từng hoàn tất | Lộ trình vừa được thêm 2 phòng mới | Hiển thị Banner thông báo nội dung mới kèm tiến độ mới (ví dụ 85%) | Banner có nút "Học ngay bài mới" và nút "Đóng" |
| **1.2.2** | Danh sách phòng học | Cuộn xem danh sách phòng | Phòng vừa mới xuất hiện | Thấy các phòng mới có nhãn nhấp nháy `NEW` màu cam | Có thể bấm vào học ngay lập tức |
| **1.2.3** | Banner thông báo | Nhấn "Học ngay bài mới" | Đã nhấp vào nút kêu gọi hành động | Điều hướng trực tiếp vào phòng học mới | Tiết kiệm thời gian tìm kiếm bài mới |
| **1.2.4** | Phòng học mới | Hoàn thành tất cả các nhiệm vụ mới | Giải xong toàn bộ task bổ sung | Màn hình chúc mừng khôi phục mốc 100% Mastered | Nhận thêm EXP và cập nhật lại hồ sơ năng lực |

---

### Sub-flow 2.1: Tương tác Không gian Phòng học Split-Pane Đa nhiệm (US-02.02)

Trải nghiệm làm việc trực tiếp trên giao diện chia 3 cột: Đọc tài liệu lý thuyết, gõ lệnh trên máy ảo/terminal và trả lời câu hỏi nộp bài.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_ROOM(["Nhấn mở một Phòng học"]):::startEnd --> P_SPLIT_WORKSPACE["Tải Giao diện All-in-One Split-Pane:<br>- Khung 1: Bài giảng lý thuyết Dark Mode<br>- Khung 2: Danh sách câu hỏi & Ô nộp cờ<br>- Khung 3: Bảng điều khiển máy mục tiêu & Terminal"]:::page

    P_SPLIT_WORKSPACE --> D_WORKSPACE_ACT{"Học viên tương tác với không gian làm việc?"}:::decision

    %% Resize Panes
    D_WORKSPACE_ACT -- "Kéo thanh phân chia giữa các khung" --> ACT_RESIZE["Tự động điều chỉnh kích thước hiển thị và lưu vị trí theo thói quen"]:::process
    ACT_RESIZE --> P_SPLIT_WORKSPACE

    %% Target Machine Launch
    D_WORKSPACE_ACT -- "Bấm 'Start Machine' tại khung máy mục tiêu" --> P_MACHINE_STARTING["Hiển thị trạng thái khởi động máy mục tiêu - Thanh tiến trình"]:::page
    P_MACHINE_STARTING --> P_MACHINE_READY["Máy sẵn sàng:<br>Hiển thị Địa chỉ IP, Bộ đếm lùi thời gian thuê máy và Cửa sổ Terminal"]:::process
    P_MACHINE_READY --> P_SPLIT_WORKSPACE

    %% Read Theory & Solve Questions
    D_WORKSPACE_ACT -- "Đọc lý thuyết và nhập câu trả lời vào ô nộp bài" --> ACT_INPUT_ANSWER["Gõ đáp án hoặc cờ tìm được vào ô Answer"]:::process
    ACT_INPUT_ANSWER --> JUMP_SUBMIT[[Chuyển sang Sub-flow 3.1: Nộp cờ đáp án]]:::process

    %% Need Hint
    D_WORKSPACE_ACT -- "Gặp bế tắc khi giải câu hỏi" --> JUMP_HINT[[Chuyển sang Sub-flow 4.1: Mở gợi ý bài học]]:::process
```

#### Bảng State Transition Matrix (Sub-flow 2.1)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2.1.1** | Trang phòng học | Mở phòng học từ Lộ trình | Phòng ở trạng thái Available | Giao diện Split-Pane 3 vùng hiển thị mượt mà | Thanh điều hướng trên cùng cho phép quay lại Lộ trình |
| **2.1.2** | Giao diện Split-Pane | Dùng chuột kéo dãn biên giới giữa các khung | Muốn mở rộng khung đọc tài liệu hoặc terminal | Kích thước khung co giãn tức thì và lưu lại cấu hình | Có nút "Đặt lại bố cục mặc định" (Reset Layout) |
| **2.1.3** | Khung Máy mục tiêu | Bấm nút "Start Machine" | Máy đang ở trạng thái tắt | Hiển thị vòng xoay chờ máy bật (khoảng 30 giây) | Nút chuyển thành "Hủy khởi động" nếu không muốn chờ |
| **2.1.4** | Khung Máy mục tiêu | Máy đã khởi động xong | Máy đã cấp phát IP thành công | Hiển thị IP, đếm ngược thời gian và nút "Gia hạn thêm giờ" | Nút "Terminate Machine" cho phép tắt máy bất kỳ lúc nào |
| **2.1.5** | Khung Câu hỏi | Nhập đáp án vào ô nộp cờ | Người học đã tìm ra cờ thực hành | Kích hoạt nút "Submit" màu xanh nổi bật | Có nút mở Hint nếu chưa tìm được đáp án |

---

### Sub-flow 2.2: Xử lý Mất kết nối Mạng khi Đang Làm bài (US-02.02)

Bảo toàn toàn bộ câu trả lời của học viên trong lúc đang gõ phím nếu gặp sự cố rớt mạng đột ngột và tự động phục hồi khi có mạng trở lại.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_SOLVING(["Học viên đang soạn câu trả lời trong phòng học"]):::startEnd --> D_NET_STATUS{"Trạng thái đường truyền Internet?"}:::decision

    %% Disconnected
    D_NET_STATUS -- "Mất kết nối mạng đột ngột" --> P_OFFLINE_BAR["Hiển thị Thanh cảnh báo màu vàng phía trên màn hình:<br>Mất kết nối mạng. Đang ở chế độ ngoại tuyến, câu trả lời của bạn được lưu an toàn"]:::errorState

    P_OFFLINE_BAR --> ACT_PRESERVE_TEXT["Tự động giữ nguyên nội dung đã gõ trong ô nhập liệu"]:::process
    ACT_PRESERVE_TEXT --> D_OFFLINE_ATTEMPT{"Học viên bấm nút 'Submit' trong lúc mất mạng?"}:::decision

    D_OFFLINE_ATTEMPT -- "Bấm Submit khi chưa có mạng" --> P_OFFLINE_TOAST["Thông báo: Không thể gửi đáp án lúc này. Hệ thống sẽ tự gửi lại khi có mạng"]:::errorState
    P_OFFLINE_TOAST --> P_WAIT_RECONNECT["Đang chờ tín hiệu Internet..."]:::page

    %% Reconnected
    P_WAIT_RECONNECT --> D_RESTORE_NET{"Có tín hiệu mạng trở lại?"}:::decision
    D_RESTORE_NET -- "Đã kết nối lại thành công" --> P_ONLINE_ALERT["Thanh cảnh báo chuyển sang màu xanh:<br>Đã khôi phục kết nối! Bạn có thể tiếp tục nộp bài"]:::successState

    P_ONLINE_ALERT --> ACT_SUBMIT_READY["Ô nộp bài mở khóa, dữ liệu được giữ nguyên 100%"]:::process
    ACT_SUBMIT_READY --> OUT_BACK_TO_WORK(["Học viên bấm Submit để gửi đáp án bình thường"]):::startEnd
```

#### Bảng State Transition Matrix (Sub-flow 2.2)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2.2.1** | Phòng học tương tác | Đang gõ văn bản vào ô đáp án | Rớt mạng Internet đột ngột | Xuất hiện thanh vàng cảnh báo "Mất kết nối mạng. Chế độ lưu tạm kích hoạt" | Nội dung ô gõ phím được giữ nguyên vẹn |
| **2.2.2** | Thanh cảnh báo mất mạng | Bấm nút Submit thử | Chưa có mạng | Nhắc nhở: "Chưa có mạng, câu trả lời đã được lưu lại" | Nút bấm chuyển sang biểu tượng chờ kết nối |
| **2.2.3** | Màn hình chờ kết nối | Đợi đường truyền phục hồi | Mạng Internet có trở lại | Thanh cảnh báo chuyển sang màu xanh báo "Đã kết nối lại" | Tự động biến mất sau 3 giây để người dùng tập trung làm bài |
| **2.2.4** | Phòng học đã có mạng | Bấm nút Submit | Mạng ổn định | Gửi câu trả lời để hệ thống chấm điểm tức thì | Không bị mất công gõ lại đáp án |

---

### Sub-flow 3.1: Nộp Cờ Đáp án & Nhận Thưởng EXP Tức thì (US-02.03)

Quy trình nộp cờ bài tập (cờ tĩnh, cờ theo mẫu hoặc cờ động cá nhân hóa) và hiệu ứng thị giác chúc mừng khi trả lời đúng.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_FLAG(["Học viên đã tìm thấy chuỗi cờ đáp án"]):::startEnd --> P_INPUT_FLAG["Dán chuỗi cờ vào ô nhập đáp án - Ví dụ: CF{...}"]:::page

    P_INPUT_FLAG --> ACT_CLICK_SUBMIT["Bấm nút 'Submit'"]:::process
    ACT_CLICK_SUBMIT --> D_CHECK_CORRECT{"Chuỗi cờ nhập vào chính xác?"}:::decision

    %% Wrong Flag -> Jump to Lockout sub-flow
    D_CHECK_CORRECT -- "Cờ không chính xác" --> JUMP_WRONG_FLAG[[Chuyển sang Sub-flow 3.2: Xử lý nộp cờ sai]]:::errorState

    %% Correct Flag
    D_CHECK_CORRECT -- "Cờ hoàn toàn chính xác" --> P_SUCCESS_CELEBRATE["Hiệu ứng chúc mừng rực rỡ:<br>- Thông báo: 'Correct Answer! +50 EXP'<br>- Hiệu ứng pháo hoa nhẹ trên màn hình"]:::successState

    P_SUCCESS_CELEBRATE --> ACT_UPDATE_QUESTION_UI["Cập nhật trạng thái câu hỏi:<br>- Ô nhập đổi sang màu xanh lá cây<br>- Hiển thị dấu tick xanh hoàn thành<br>- Khóa ô nhập không cho chỉnh sửa"]:::process

    ACT_UPDATE_QUESTION_UI --> ACT_NAV_EXP_JUMP["Điểm EXP trên thanh điều hướng góc phải tự động nhảy số tăng thêm"]:::process

    ACT_NAV_EXP_JUMP --> D_ROOM_FINISHED{"Tất cả câu hỏi trong phòng đã giải xong?"}:::decision

    D_ROOM_FINISHED -- "Vẫn còn câu hỏi khác chưa giải" --> P_NEXT_QUESTION["Tự động cuộn mượt xuống câu hỏi tiếp theo"]:::page
    D_ROOM_FINISHED -- "Đã giải hết 100% câu hỏi" --> OUT_CONGRATS_ROOM(["Hiển thị Modal chúc mừng hoàn thành Phòng học!<br>Nút: Tiếp tục hành trình"]):::startEnd
```

#### Bảng State Transition Matrix (Sub-flow 3.1)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **3.1.1** | Khung câu hỏi | Dán cờ và bấm nút "Submit" | Cờ không đúng định dạng hoặc sai ký tự | Chuyển sang xử lý nộp sai | Báo lỗi và cho phép nhập lại |
| **3.1.2** | Khung câu hỏi | Dán cờ và bấm nút "Submit" | Cờ trùng khớp hoàn toàn với đáp án | Hiển thị thông báo "Correct Answer! +50 EXP" | Ô nhập đổi sang màu xanh hoàn thành |
| **3.1.3** | Khung câu hỏi đã giải đúng | Quan sát thanh trạng thái | Câu hỏi đã được tính điểm | Điểm EXP trên thanh điều hướng nhảy số tăng ngay lập tức | Ô nhập bị khóa để tránh gửi trùng lặp |
| **3.1.4** | Khung câu hỏi đã giải đúng | Còn các câu hỏi tiếp theo trong Task | Vẫn còn câu hỏi chưa có tick xanh | Màn hình tự động cuộn xuống câu hỏi kế tiếp | Người học tiếp tục mạch làm bài liên tục |
| **3.1.5** | Toàn bộ câu hỏi đã giải xong | Câu hỏi cuối cùng được giải | Toàn bộ câu hỏi trong phòng đạt 100% | Màn hình chúc mừng hoàn thành bài Lab | Nút chuyển đến phòng kế tiếp hoặc quay lại Lộ trình |

---

### Sub-flow 3.2: Xử lý Nộp Sai Nhiều Lần & Tạm khóa Nộp bài 3 Phút (US-02.03)

Cơ chế bảo vệ tính công bằng, chống tấn công đoán mò cờ (brute-force), thông báo rõ ràng số lần thử và bộ đếm ngược tại chỗ.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_WRONG(["Nộp cờ không chính xác"]):::startEnd --> D_CHECK_WRONG_COUNT{"Số lần nộp sai trong vòng 60 giây?"}:::decision

    %% 1 to 4 attempts
    D_CHECK_WRONG_COUNT -- "Lần 1 đến 4" --> P_WRONG_TOAST["Thông báo lỗi màu đỏ:<br>Incorrect answer. Please try again! Cảnh báo: Bạn còn X lần thử"]:::errorState
    P_WRONG_TOAST --> |"Chỉnh sửa cờ và gõ lại"| P_RETRY_INPUT["Ô nộp cờ sẵn sàng cho lần thử tiếp theo"]:::page

    %% 5th attempt
    D_CHECK_WRONG_COUNT -- "Lần thứ 5 liên tiếp" --> ACT_TRIGGER_QUESTION_LOCK["Kích hoạt tạm khóa quyền nộp bài cho câu hỏi này trong 3 phút"]:::process

    ACT_TRIGGER_QUESTION_LOCK --> P_LOCKED_INPUT["Ô nộp bài chuyển sang màu xám và bị vô hiệu hóa (Disabled):<br>Too many incorrect submissions. Submissions locked for 3 minutes<br>Hiển thị đồng hồ đếm ngược: 03:00 ngay tại ô nhập"]:::errorState

    P_LOCKED_INPUT --> D_LOCKED_USER_CHOICE{"Lựa chọn của học viên trong lúc chờ?"}:::decision

    %% Option 1: Wait for timer
    D_LOCKED_USER_CHOICE -- "Chờ hết 3 phút" --> ACT_COUNTDOWN_ZERO["Bộ đếm thời gian trở về 00:00"]:::process
    ACT_COUNTDOWN_ZERO --> P_UNLOCKED_INPUT["Ô nộp bài tự động mở khóa trở lại bình thường"]:::successState

    %% Option 2: Open Hint
    D_LOCKED_USER_CHOICE -- "Bấm nút mở Gợi ý (Hint)" --> JUMP_HINT_FLOW[[Chuyển sang Sub-flow 4.1: Mở gợi ý bài học]]:::process

    %% Option 3: Do other questions
    D_LOCKED_USER_CHOICE -- "Chuyển sang làm câu hỏi khác trong cùng phòng" --> P_OTHER_QUESTION["Làm các câu hỏi khác bình thường, không bị ảnh hưởng"]:::page
```

#### Bảng State Transition Matrix (Sub-flow 3.2)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **3.2.1** | Khung câu hỏi | Nộp sai cờ lần 1 đến 4 | Số lần sai $< 5$ trong 60 giây | Thông báo "Incorrect answer" kèm số lần thử còn lại | Ô nhập tự bôi đen văn bản để người dùng sửa nhanh |
| **3.2.2** | Khung câu hỏi | Nộp sai cờ lần thứ 5 liên tiếp | Đạt đúng 5 lần sai trong 60 giây | Ô nhập bị khóa xám kèm đồng hồ đếm ngược `03:00` | Thông báo giải thích rõ ràng lý do bị khóa |
| **3.2.3** | Ô nộp bài đang bị khóa | Ngồi chờ hết thời gian | Đồng hồ đếm ngược từ `03:00` về `00:00` | Ô nhập tự động mở khóa sáng trở lại | Người học tiếp tục nộp bài mà không cần reload trang |
| **3.2.4** | Ô nộp bài đang bị khóa | Bấm nút "Hint" để tìm sự trợ giúp | Nút Hint vẫn hoạt động bình thường | Mở hộp thoại gợi ý giải bài | Người học có manh mối mới thay vì đoán mò |
| **3.2.5** | Ô nộp bài đang bị khóa | Cuộn sang câu hỏi khác trong bài | Câu hỏi khác không bị vi phạm | Làm bài tại các câu hỏi khác bình thường | Không làm tắc nghẽn toàn bộ bài học |

---

### Sub-flow 4.1: Mở Gợi ý Bậc thang & Trừ điểm Minh bạch (US-02.04)

Cung cấp sự trợ giúp qua từng bậc gợi ý, bắt buộc xác nhận trừ điểm minh bạch trước khi hiển thị nội dung gợi mở.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_NEED_HELP(["Học viên gặp bế tắc tại một câu hỏi"]):::startEnd --> ACT_CLICK_HINT["Nhấp vào nút 'Hint 1'"]:::process
    
    ACT_CLICK_HINT --> P_CONFIRM_HINT_MODAL["Hộp thoại Xác nhận Mở Gợi ý:<br>Mở Gợi ý 1 sẽ trừ 10% điểm tối đa của câu hỏi này. Bạn có chắc chắn muốn mở?"]:::page

    P_CONFIRM_HINT_MODAL --> D_CONFIRM_DECISION{"Quyết định của học viên?"}:::decision

    %% Cancel Hint
    D_CONFIRM_DECISION -- "Bấm 'Hủy bỏ - Tự suy nghĩ tiếp'" --> P_CANCEL_HINT["Đóng hộp thoại, bảo toàn 100% điểm tối đa"]:::page

    %% Confirm Hint 1
    D_CONFIRM_DECISION -- "Bấm 'Xác nhận mở gợi ý'" --> ACT_REDUCE_MAX_SCORE["Cập nhật điểm tối đa có thể nhận: 100 EXP giảm còn 90 EXP"]:::process
    
    ACT_REDUCE_MAX_SCORE --> P_REVEAL_HINT_1["Hiển thị nội dung Gợi ý 1 ngay dưới câu hỏi<br>Huy hiệu điểm tối đa cập nhật thành 'Max: 90 EXP'"]:::successState

    P_REVEAL_HINT_1 --> D_STILL_STUCK{"Đọc xong gợi ý 1, học viên vẫn chưa giải được?"}:::decision

    %% Ask for Hint 2
    D_STILL_STUCK -- "Bấm tiếp vào 'Hint 2'" --> P_CONFIRM_HINT_2["Hộp thoại Xác nhận: Mở Gợi ý 2 sẽ trừ thêm 20% điểm tối đa"]:::page
    P_CONFIRM_HINT_2 --> |"Xác nhận mở Hint 2"| P_REVEAL_HINT_2["Hiển thị Gợi ý 2, điểm tối đa câu hỏi cập nhật còn 'Max: 70 EXP'"]:::successState

    %% Solved after hint
    D_STILL_STUCK -- "Đã hiểu ra vấn đề và tìm ra cờ" --> OUT_SOLVE_WITH_HINT(["Nộp cờ thành công và nhận số điểm thực tế sau khi đã trừ gợi ý"]):::startEnd
```

#### Bảng State Transition Matrix (Sub-flow 4.1)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **4.1.1** | Khung câu hỏi | Bấm nút "Hint 1" | Câu hỏi chưa mở gợi ý 1 | Hộp thoại xác nhận trừ 10% điểm tối đa | Nút "Hủy bỏ" cho phép suy nghĩ thêm |
| **4.1.2** | Hộp thoại xác nhận Hint 1 | Bấm "Hủy bỏ" | Người học muốn tự giải tiếp | Đóng hộp thoại, bảo toàn trọn vẹn điểm số | Tiếp tục làm bài không bị trừ điểm |
| **4.1.3** | Hộp thoại xác nhận Hint 1 | Bấm "Xác nhận mở gợi ý" | Đồng ý với mức trừ điểm | Hộp gợi ý 1 mở ra, nhãn điểm tối đa đổi thành 90 EXP | Nội dung gợi ý hiển thị rõ ràng bên dưới |
| **4.1.4** | Khung câu hỏi | Bấm tiếp vào nút "Hint 2" | Đã mở gợi ý 1 | Hộp thoại xác nhận trừ thêm 20% điểm tối đa | Có lựa chọn Hủy hoặc Xác nhận |
| **4.1.5** | Khung câu hỏi | Nộp đúng cờ sau khi mở cả 2 gợi ý | Cờ nhập vào chuẩn xác | Nhận được 70 EXP (100 - 10 - 20) | Hoàn thành câu hỏi với số điểm minh bạch |

---

### Sub-flow 4.2: Xem Lời giải Chi tiết Walkthrough Trước & Sau khi Giải (US-02.04)

Quy trình xem bài giải từng bước: Đánh đổi điểm số về 0 EXP nếu xem trước khi giải, hoặc xem hoàn toàn miễn phí nếu xem lại sau khi đã giải thành công.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_WALKTHROUGH(["Học viên bấm nút 'View Solution / Walkthrough'"]):::startEnd --> D_CHECK_SOLVED_STATUS{"Câu hỏi này đã được học viên giải đúng trước đó chưa?"}:::decision

    %% Already solved previously (Free review)
    D_CHECK_SOLVED_STATUS -- "Đã giải đúng từ trước (Đã có tick xanh)" --> P_FREE_WALKTHROUGH["Hiển thị toàn bộ Lời giải chi tiết từng bước ngay lập tức<br>Bảo toàn 100% điểm EXP đã tích lũy"]:::successState
    P_FREE_WALKTHROUGH --> OUT_REVIEW_DONE(["Học viên ôn tập lại kiến thức bài giải thoải mái"]):::startEnd

    %% Not solved yet (Trade-off)
    D_CHECK_SOLVED_STATUS -- "Chưa giải được câu hỏi này" --> P_WARN_ZERO_SCORE["Hộp thoại Cảnh báo Nghiêm ngặt:<br>Xem lời giải trước khi giải sẽ khiến bạn nhận 0 EXP cho câu hỏi này. Bạn có chắc chắn muốn xem?"]:::errorState

    P_WARN_ZERO_SCORE --> D_WALKTHROUGH_CHOICE{"Lựa chọn của học viên?"}:::decision

    %% Cancel
    D_WALKTHROUGH_CHOICE -- "Hủy bỏ - Để tự thử sức tiếp" --> P_CLOSE_WARN["Đóng hộp thoại, giữ nguyên cơ hội nhận điểm"]:::page

    %% Confirm 0 EXP
    D_WALKTHROUGH_CHOICE -- "Chấp nhận nhận 0 EXP để học cách làm" --> ACT_SET_ZERO["Cập nhật điểm tối đa của câu hỏi về 0 EXP"]:::process
    ACT_SET_ZERO --> P_SHOW_FULL_SOLUTION["Hiển thị bài giải chi tiết từng bước kèm câu lệnh mẫu"]:::page
    P_SHOW_FULL_SOLUTION --> OUT_LEARN_SOLUTION(["Học viên nắm được phương pháp giải dù không nhận điểm"]):::startEnd
```

#### Bảng State Transition Matrix (Sub-flow 4.2)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **4.2.1** | Khung câu hỏi | Bấm nút "View Full Walkthrough" | Câu hỏi đã được giải đúng trước đó | Bài giải mở ra lập tức, không có cảnh báo trừ điểm | Nút cuộn hoặc đóng khung bài giải |
| **4.2.2** | Khung câu hỏi | Bấm nút "View Full Walkthrough" | Câu hỏi chưa từng giải thành công | Hộp thoại cảnh báo lớn: Nhận 0 EXP nếu xem trước | Nút "Hủy bỏ" nổi bật để khuyên người học tự làm |
| **4.2.3** | Hộp thoại cảnh báo 0 EXP | Bấm "Hủy bỏ" | Người học không muốn mất điểm | Đóng hộp thoại, quay lại làm bài | Cơ hội nhận trọn vẹn điểm số được bảo toàn |
| **4.2.4** | Hộp thoại cảnh báo 0 EXP | Bấm "Tôi chấp nhận 0 EXP để xem cách làm" | Người học thực sự bế tắc và muốn học cách giải | Toàn bộ các bước tấn công mẫu và cờ mẫu hiển thị | Nút đóng bài giải để làm các câu hỏi khác |


