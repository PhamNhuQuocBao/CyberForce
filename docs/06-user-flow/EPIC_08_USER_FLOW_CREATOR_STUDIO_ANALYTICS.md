# Epic 8: Lab Creator Studio & University/Enterprise Analytics
## Tài liệu Thiết kế Kiến trúc User Flow Chi tiết (User Journey & Experience Flows)

* **Hệ thống:** CyberForge Cyber Range & Practical Security Platform
* **Tài liệu tham chiếu:** [EPIC_08_LAB_CREATOR_STUDIO_ANALYTICS.md](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/05-epics/EPIC_08_LAB_CREATOR_STUDIO_ANALYTICS.md)
* **Vai trò phụ trách:** Product Designer (UX Architect)
* **Phiên bản:** 1.0 (Strict Non-Tech User Experience Focus)

---

## 📑 MỤC LỤC TỔNG QUAN CÁC TIỂU LUỒNG (USER FLOWS)

Toàn bộ trải nghiệm quản trị nội dung đào tạo, không gian sáng tạo bài giảng và cổng phân tích năng lực tổ chức được thiết kế dưới góc nhìn **hoàn toàn phi kỹ thuật (non-tech)** qua **5 tiểu luồng trực quan**:

- **MODULE 1: QUẢN TRỊ NỘI DUNG ĐÀO TẠO DÀNH CHO ADMIN (CONTENT CMS)**
  - [Sub-flow 1.1: Tạo Mới & Xuất Bản Phòng Học Hoàn Chỉnh (US-08.01)](#sub-flow-11-tạo-mới--xuất-bản-phòng-học-hoàn-chỉnh-us-0801)
- **MODULE 2: XƯỞNG SÁNG TẠO BÀI HỌC DÀNH CHO GIẢNG VIÊN (LAB CREATOR STUDIO)**
  - [Sub-flow 2.1: Soạn Thảo Bài Giảng & Xem Trước Hiển Thị Thời Gian Thực (US-08.02)](#sub-flow-21-soạn-thảo-bài-giảng--xem-trước-hiển-thị-thời-gian-thực-us-0802)
  - [Sub-flow 2.2: Chạy Thử Nghiệm Chất Lượng & Gửi Duyệt Bài Giảng (US-08.02)](#sub-flow-22-chạy-thử-nghiệm-chất-lượng--gửi-duyệt-bài-giảng-us-0802)
- **MODULE 3: BÁO CÁO PHÂN TÍCH NĂNG LỰC DOANH NGHIỆP & ĐẠI HỌC (ENTERPRISE / UNIVERSITY ANALYTICS)**
  - [Sub-flow 3.1: Khám Phá Ma Trận Lỗ Hổng Kỹ Năng Đội Ngũ (US-08.03)](#sub-flow-31-khám-phá-ma-trận-lỗ-hổng-kỹ-năng-đội-ngũ-us-0803)
  - [Sub-flow 3.2: Phản Hồi Trực Quan Khi Nhóm Mới Chưa Có Dữ Liệu Học Tập (US-08.03)](#sub-flow-32-phản-hồi-trực-quan-khi-nhóm-mới-chưa-có-dữ-liệu-học-tập-us-0803)

---

## I. NGUYÊN TẮC THIẾT KẾ TRẢI NGHIỆM CHO NGƯỜI DÙNG NON-TECH

1. **Góc nhìn Người dùng Phi Kỹ thuật (Non-Tech Human Perspective):**
   - Tập trung vào các thao tác trực quan quen thuộc: *Biểu mẫu nhập liệu có hướng dẫn rõ ràng, trình soạn thảo bài giảng có khung xem trước như văn bản thông thường, nút 'Chạy thử nghiệm' để bảo đảm bài tập hoạt động tốt trước khi xuất bản, biểu đồ nhiệt màu sắc giúp nhìn thấy ngay điểm mạnh/điểm yếu của nhân sự*.
   - Loại bỏ hoàn toàn các chi tiết kỹ thuật phức tạp (không nhắc đến kho container, hạ tầng ảo hóa, lệnh điều khiển máy chủ, cổng mạng hay truy vấn cơ sở dữ liệu).
2. **Cơ chế "No Dead End" (Không có lối cụt):**
   - Nhập thiếu thông tin bài học: Hệ thống viền đỏ vị trí cần bổ sung và giữ nguyên vẹn nội dung đã gõ.
   - Chưa chạy thử bài tập: Hiển thị hướng dẫn từng bước kích hoạt chạy thử trước khi gửi duyệt.
   - Lớp học mới chưa có bài làm: Giao diện hiển thị trạng thái chào đón kèm nút hành động hữu ích để bắt đầu giao bài tập đầu tiên.
3. **Minh bạch & Đảm bảo Chất lượng Đào tạo:**
   - Người sáng tạo bài giảng luôn an tâm vì có thể kiểm tra bài làm của chính mình trước khi đến tay học viên; người quản lý doanh nghiệp có trong tay báo cáo sắc nét để trình bày trực tiếp với ban giám đốc.

---

## II. CHI TIẾT CÁC TIỂU LUỒNG USER FLOW (MERMAID FLOWCHARTS & MATRICES)

---

### Sub-flow 1.1: Tạo Mới & Xuất Bản Phòng Học Hoàn Chỉnh (US-08.01)

Quản trị viên sử dụng biểu mẫu trực quan để khởi tạo bài học mới, thiết lập nội dung lý thuyết, cấu hình phần thưởng và xuất bản lên thư viện cho học viên.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_ADMIN_CMS(["Quản trị viên mở Trang Quản lý Nội dung"]):::startEnd --> ACT_CLICK_NEW_ROOM["Nhấn nút 'Tạo Phòng Học Mới'"]:::process

    ACT_CLICK_NEW_ROOM --> P_ROOM_FORM["Biểu Mẫu Thiết Lập Phòng Học:<br>- Tiêu đề bài học & Mô tả ngắn<br>- Nội dung tài liệu bài giảng<br>- Chọn gói máy thực hành từ Thư viện Mẫu<br>- Thiết lập câu hỏi, đáp án cờ và điểm thưởng EXP"]:::page

    P_ROOM_FORM --> ACT_SUBMIT_PUBLISH["Nhấn nút 'Xuất Bản Phòng Học'"]:::process

    ACT_SUBMIT_PUBLISH --> D_VALIDATE_FIELDS{"Kiểm tra tính đầy đủ của biểu mẫu?"}:::decision

    %% Missing or Invalid Fields
    D_VALIDATE_FIELDS -- "Thiếu tên bài hoặc điểm thưởng không hợp lệ" --> P_FORM_ERRORS["Đánh dấu viền đỏ các mục chưa hợp lệ:<br>- 'Vui lòng chọn gói máy thực hành cho bài học'<br>- 'Điểm thưởng phải là số nguyên lớn hơn 0'<br>Dữ liệu đã nhập được giữ nguyên 100%"]:::errorState

    P_FORM_ERRORS --> |"Bổ sung thông tin còn thiếu"| P_ROOM_FORM

    %% Valid Fields
    D_VALIDATE_FIELDS -- "Mọi thông tin đầy đủ và chuẩn xác" --> ACT_PUBLISH_SUCCESS["Hệ thống lưu trữ và chuyển trạng thái phòng học sang 'Đã Xuất Bản'"]:::process

    ACT_PUBLISH_SUCCESS --> P_SUCCESS_TOAST["Thông báo màu xanh lá:<br>Xuất bản phòng học thành công! Bài học đã sẵn sàng cho học viên"]:::successState

    P_SUCCESS_TOAST --> OUT_VIEW_IN_CATALOG(["Bài học mới xuất hiện ngay trên Danh mục Thư viện của Học viên"]):::startEnd
```

#### Bảng State Transition Matrix (Sub-flow 1.1)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1.1.1** | Bảng quản trị nội dung | Nhấn nút "Tạo Phòng Học Mới" | Có quyền quản trị nội dung (Admin) | Biểu mẫu thiết lập phòng học chi tiết | Nút "Hủy bỏ" quay lại danh sách bài học |
| **1.1.2** | Biểu mẫu phòng học | Nhập thông tin bài giảng và câu hỏi | Đang trong quá trình soạn thảo | Nội dung được tự động lưu tạm (Auto-draft) | Không lo mất dữ liệu nếu lỡ tắt trình duyệt |
| **1.1.3** | Biểu mẫu phòng học | Nhấn nút "Xuất Bản Phòng Học" | Bỏ trống tiêu đề hoặc điểm thưởng là số âm | Viền đỏ ô nhập sai kèm thông báo hướng dẫn cụ thể | Toàn bộ văn bản đã gõ được giữ nguyên vẹn |
| **1.1.4** | Biểu mẫu phòng học | Nhấn nút "Xuất Bản Phòng Học" | Đầy đủ tiêu đề, gói bài tập và điểm thưởng hợp lệ | Màn hình thông báo xuất bản thành công | Nút xem trước bài học thực tế trên giao diện học viên |
| **1.1.5** | Danh mục bài học | Kiểm tra bài vừa tạo | Đã ở trạng thái Đã Xuất Bản | Bài học hiển thị trên danh mục chung cho người học | Nút "Sửa bài" nếu muốn cập nhật thêm nội dung |

---

### Sub-flow 2.1: Soạn Thảo Bài Giảng & Xem Trước Hiển Thị Thời Gian Thực (US-08.02)

Giảng viên sử dụng không gian làm việc chia hai cột tiện lợi: Cột soạn bài bên trái và Cột xem trước hiển thị trực quan bên phải y như giao diện học viên.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_CREATOR_STUDIO(["Giảng viên mở Xưởng Sáng Tạo Bài Học (Creator Studio)"]):::startEnd --> P_SPLIT_STUDIO["Không Gian Soạn Thảo Hai Cột:<br>- Cột Trái: Ô soạn thảo văn bản bài giảng & câu hỏi<br>- Cột Phải: Khung Xem Trước Trực Tiếp (Hiển thị y hệt màn hình học viên)<br>- Nút 'Lưu Bản Nháp' & Nút 'Gửi Duyệt' (Đang tạm khóa)"]:::page

    P_SPLIT_STUDIO --> ACT_TYPE_CONTENT["Giảng viên gõ nội dung bài giảng, thêm hình ảnh minh họa"]:::process

    ACT_TYPE_CONTENT --> ACT_LIVE_UPDATE["Cột Xem Trước bên phải tự động cập nhật mượt mà theo từng ký tự gõ"]:::process

    ACT_LIVE_UPDATE --> D_SAVE_OR_PREPARE{"Lựa chọn tiếp theo của Giảng viên?"}:::decision

    %% Save Draft
    D_SAVE_OR_PREPARE -- "Nhấn 'Lưu Bản Nháp'" --> ACT_SAVE_DRAFT["Hệ thống lưu lại toàn bộ tiến độ vào mục Bài giảng nháp"]:::process
    ACT_SAVE_DRAFT --> P_DRAFT_SAVED["Thông báo: Đã lưu bản nháp an toàn! Bạn có thể quay lại sửa bất kỳ lúc nào"]:::successState

    %% Ready for Test
    D_SAVE_OR_PREPARE -- "Đã soạn xong bài và muốn chuyển sang bước kiểm thử" --> JUMP_TEST_FLOW[["Chuyển sang Sub-flow 2.2: Chạy thử nghiệm máy bài lab"]]:::process
```

#### Bảng State Transition Matrix (Sub-flow 2.1)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2.1.1** | Trang chủ Creator | Mở một bài giảng đang biên soạn | Đã được cấp quyền Giảng viên (Creator) | Không gian làm việc 2 cột tiện lợi | Nút "Trở về Danh sách Bài giảng của tôi" |
| **2.1.2** | Cột soạn thảo bên trái | Gõ nội dung bài giảng và chèn ảnh | Người dùng thao tác gõ phím bình thường | Khung bên phải phản chiếu ngay lập tức định dạng văn bản | Hỗ trợ thanh công cụ định dạng trực quan (đậm, nghiêng, danh sách) |
| **2.1.3** | Khung làm việc Studio | Nhấn nút "Lưu Bản Nháp" | Muốn tạm dừng để hôm sau soạn tiếp | Thông báo đã lưu bản nháp thành công | Cho phép thoát ra ngoài mà không bị mất chữ nào |
| **2.1.4** | Khung làm việc Studio | Kéo dãn thanh chia giữa hai cột | Muốn mở rộng khung xem trước bài giảng | Kích thước hai cột co giãn linh hoạt theo ý muốn | Có nút đặt lại kích thước cân bằng mặc định |

---

### Sub-flow 2.2: Chạy Thử Nghiệm Chất Lượng & Gửi Duyệt Bài Giảng (US-08.02)

Cơ chế kiểm thử bắt buộc giúp giảng viên tự trải nghiệm và giải thử bài tập của chính mình, bảo đảm bài học không bị lỗi trước khi gửi tới Ban Quản trị xét duyệt.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_TEST_PHASE(["Giảng viên đã soạn thảo xong bài học"]):::startEnd --> P_BUTTONS_STATUS["Thanh Công Cụ Xét Duyệt:<br>- Nút 'Gửi Duyệt' đang bị KHÓA MỜ<br>- Nút 'Chạy Thử Nghiệm Bài Học' màu cam nổi bật"]:::page

    P_BUTTONS_STATUS --> D_ATTEMPT_SUBMIT{"Giảng viên tương tác với nút nào?"}:::decision

    %% Click disabled button
    D_ATTEMPT_SUBMIT -- "Bấm vào nút 'Gửi Duyệt' khi chưa chạy thử" --> P_TEST_REMINDER["Bong bóng hướng dẫn xuất hiện:<br>Vui lòng bấm 'Chạy Thử Nghiệm' và giải đúng cờ thử nghiệm trước khi gửi bài duyệt"]:::errorState
    P_TEST_REMINDER --> P_BUTTONS_STATUS

    %% Click Test Run
    D_ATTEMPT_SUBMIT -- "Bấm nút 'Chạy Thử Nghiệm Bài Học'" --> ACT_SPIN_TEST_LAB["Hệ thống kích hoạt môi trường làm bài thử nghiệm riêng cho Giảng viên"]:::process

    ACT_SPIN_TEST_LAB --> P_TEST_ROOM["Màn hình Phòng Thực Hành Thử Nghiệm:<br>Giảng viên nhập đáp án cờ thử nghiệm để đối soát"]:::page

    P_TEST_ROOM --> ACT_SOLVE_OWN_LAB["Giảng viên tự giải và nhập cờ đáp án vào ô kiểm tra"]:::process

    ACT_SOLVE_OWN_LAB --> D_VERIFY_FLAG{"Kết quả kiểm tra cờ đáp án?"}:::decision

    %% Failed Test
    D_VERIFY_FLAG -- "Đáp án không khớp với cấu hình bài học" --> P_FLAG_MISMATCH["Thông báo đỏ: Đáp án chưa chính xác, vui lòng kiểm tra lại cấu hình đáp án trong bài giảng"]:::errorState
    P_FLAG_MISMATCH --> |"Chỉnh sửa lại câu hỏi hoặc đáp án"| P_SPLIT_STUDIO

    %% Passed Test
    D_VERIFY_FLAG -- "Đáp án hoàn toàn trùng khớp" --> P_TEST_PASSED["Huy hiệu xanh: Đã kiểm thử thành công! Bài học sẵn sàng gửi duyệt"]:::successState

    P_TEST_PASSED --> ACT_ENABLE_SUBMIT["Nút 'Gửi Duyệt Cho Ban Quản Trị' lập tức mở khóa màu xanh lá"]:::process

    ACT_ENABLE_SUBMIT --> ACT_CLICK_SUBMIT["Giảng viên nhấn 'Gửi Duyệt Cho Ban Quản Trị'"]:::process

    ACT_CLICK_SUBMIT --> OUT_PENDING_REVIEW(["Bài học chuyển sang trạng thái 'Đang Chờ Duyệt', có thông báo kết quả qua email"]):::startEnd
```

#### Bảng State Transition Matrix (Sub-flow 2.2)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2.2.1** | Thanh công cụ duyệt bài | Bấm thử nút "Gửi Duyệt" | Chưa thực hiện bước chạy thử nghiệm | Nút bị khóa, hiện gợi ý cần chạy thử trước | Hướng dẫn rõ ràng, không làm người dùng bối rối |
| **2.2.2** | Thanh công cụ duyệt bài | Bấm nút "Chạy Thử Nghiệm Bài Học" | Đã soạn đầy đủ câu hỏi và cờ | Mở phòng thực hành chạy thử nghiệm | Có nút hủy chạy thử nếu muốn sửa tiếp |
| **2.2.3** | Phòng chạy thử | Nhập cờ đáp án tự giải | Cờ không khớp đáp án đã lưu | Báo lỗi đáp án không trùng khớp | Cho phép quay lại biểu mẫu sửa lại đáp án đúng |
| **2.2.4** | Phòng chạy thử | Nhập cờ đáp án tự giải | Cờ hoàn toàn chính xác | Thông báo đã hoàn thành kiểm thử chất lượng bài học | Nút "Gửi duyệt" chuyển sang màu xanh khả dụng |
| **2.2.5** | Phòng sáng tạo | Nhấn nút "Gửi Duyệt Cho Ban Quản Trị" | Đã vượt qua bước kiểm thử | Thông báo bài học đã gửi vào hàng đợi xét duyệt | Dashboard cập nhật nhãn trạng thái "Đang chờ duyệt" |

---

### Sub-flow 3.1: Khám Phá Ma Trận Lỗ Hổng Kỹ Năng Đội Ngũ (US-08.03)

Quản lý đào tạo doanh nghiệp hoặc Trưởng khoa Đại học theo dõi bức tranh năng lực an ninh mạng của toàn bộ nhân viên/sinh viên thông qua biểu đồ nhiệt màu sắc trực quan và tải báo cáo trình ban lãnh đạo.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_B2B_ANALYTICS(["Quản lý Đào tạo mở Cổng Báo Cáo Doanh Nghiệp"]):::startEnd --> P_ORG_OVERVIEW["Bảng Điều Khiển Năng Lực Tổ Chức:<br>- Danh sách các Phòng ban / Lớp học<br>- Tỷ lệ hoàn thành đào tạo tổng quan"]:::page

    P_ORG_OVERVIEW --> ACT_SELECT_GROUP["Chọn một phòng ban cụ thể (Ví dụ: Đội Giám Sát An Ninh - 15 Thành viên)"]:::process

    ACT_SELECT_GROUP --> P_SKILL_HEATMAP["Ma Trận Lỗ Hổng Kỹ Năng (Skill Gap Heatmap):<br>- 8 cột đại diện cho 8 mảng năng lực chuyên môn<br>- Màu Xanh Lá: Năng lực vững vàng (Điểm cao)<br>- Màu Cam / Đỏ: Điểm yếu cần bồi dưỡng (Điểm thấp)<br>- Điểm trung bình của toàn đội trên từng mảng"]:::page

    P_SKILL_HEATMAP --> P_GAP_INSIGHTS["Hộp Nhận Định Tự Động:<br>⚠️ Cảnh báo Lỗ hổng: Mảng 'An ninh Đám mây' đang là điểm yếu lớn nhất (Trung bình: 24/100, 70% thành viên dưới chuẩn)<br>- Đề xuất Lộ trình Đào tạo bổ sung ngay bên dưới"]:::errorState

    P_GAP_INSIGHTS --> D_MANAGER_ACTION{"Hành động tiếp theo của Quản lý?"}:::decision

    %% Assign Recommended Training
    D_MANAGER_ACTION -- "Bấm 'Giao Lộ trình Bổ sung cho cả đội'" --> ACT_ASSIGN_PATH["Hệ thống tự động thêm lộ trình học tập vào bảng nhiệm vụ của 15 thành viên"]:::process
    ACT_ASSIGN_PATH --> P_ASSIGN_SUCCESS["Thông báo: Đã giao bài tập bổ sung cho đội ngũ thành công!"]:::successState

    %% Export Report
    D_MANAGER_ACTION -- "Bấm 'Tải Báo Cáo Phân Tích (PDF / Excel)'" --> ACT_DOWNLOAD_REPORT["Tải bản báo cáo màu sắc chỉn chu kèm số liệu để báo cáo Ban Giám Đốc"]:::process
    ACT_DOWNLOAD_REPORT --> P_SKILL_HEATMAP
```

#### Bảng State Transition Matrix (Sub-flow 3.1)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **3.1.1** | Cổng Báo cáo Doanh nghiệp | Chọn phòng ban muốn phân tích | Đã đăng nhập tài khoản Quản lý Doanh nghiệp/Trường học | Mở bảng Ma trận Kỹ năng chi tiết của nhóm đó | Có menu chuyển nhanh sang các phòng ban khác |
| **3.1.2** | Ma trận Kỹ năng (Heatmap) | Quan sát bảng màu nhiệt | Nhóm đã có dữ liệu thực hành | Bảng nhiệt trực quan: Xanh (tốt), Cam/Đỏ (yếu) | Rê chuột vào từng ô xem điểm thành viên cụ thể |
| **3.1.3** | Khung Nhận định tự động | Đọc phân tích lỗ hổng kỹ năng | Hệ thống tự phát hiện mảng điểm thấp nhất | Khung nổi bật chỉ rõ lỗ hổng và đề xuất lộ trình khắc phục | Giúp người quản lý ra quyết định đào tạo đúng đắn |
| **3.1.4** | Khung Nhận định | Bấm "Giao Lộ trình Bổ sung" | Muốn nâng cao kỹ năng cho đội | Xác nhận giao lộ trình học cho toàn bộ thành viên trong nhóm | Thành viên sẽ nhận được thông báo học tập mới |
| **3.1.5** | Ma trận Kỹ năng | Bấm "Tải Báo Cáo (PDF / Excel)" | Cần tài liệu báo cáo lãnh đạo | Trình duyệt tải ngay tệp báo cáo định dạng chuyên nghiệp | Có lựa chọn tải bản PDF in màu hoặc file Excel số liệu |

---

### Sub-flow 3.2: Phản Hồi Trực Quan Khi Nhóm Mới Chưa Có Dữ Liệu Học Tập (US-08.03)

Trải nghiệm tinh tế, thân thiện khi người quản lý mở xem một nhóm nhân viên hoặc sinh viên mới nhập học chưa từng làm bài tập nào, bảo đảm giao diện gọn gàng và hướng dẫn bước tiếp theo rõ ràng.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_NEW_GROUP(["Quản lý chọn xem một Lớp học hoặc Nhóm nhân sự mới nhập ngũ"]):::startEnd --> D_CHECK_GROUP_DATA{"Nhóm này đã có thành viên nào làm bài tập chưa?"}:::decision

    %% Has Data
    D_CHECK_GROUP_DATA -- "Đã có bài tập được hoàn thành" --> JUMP_HEATMAP[["Chuyển sang Sub-flow 3.1: Hiển thị Ma Trận Nhiệt"]]:::process

    %% No Data Yet
    D_CHECK_GROUP_DATA -- "Nhóm mới tinh - Chưa có ai làm bài (Dữ liệu = 0)" --> P_EMPTY_STATE["Màn hình Chào Đón Nhóm Mới Thân Thiện:<br>- Điểm trung bình các kỹ năng hiển thị '0/100' gọn gàng<br>- Hình ảnh minh họa: 'Đội ngũ của bạn đã sẵn sàng bắt đầu hành trình!'<br>- Không phát sinh lỗi màn hình"]:::page

    P_EMPTY_STATE --> D_ONBOARD_CHOICE{"Lựa chọn tiếp theo của Quản lý?"}:::decision

    %% Assign first training
    D_ONBOARD_CHOICE -- "Bấm 'Giao Lộ trình Nhập môn Đầu tiên'" --> ACT_PICK_ONBOARDING["Mở danh mục các Lộ trình Nhập môn cơ bản để giao cho cả nhóm"]:::process
    ACT_PICK_ONBOARDING --> P_ASSIGN_DONE["Thông báo: Đã giao bài tập nhập môn thành công!"]:::successState

    %% Send welcome reminder
    D_ONBOARD_CHOICE -- "Bấm 'Gửi Email Khởi động cho Thành viên'" --> ACT_SEND_INVITE["Gửi email chào mừng và hướng dẫn đăng nhập làm bài cho cả nhóm"]:::process
    ACT_SEND_INVITE --> P_INVITE_SENT["Thông báo: Đã gửi email nhắc nhở bắt đầu học tập!"]:::successState

    P_ASSIGN_DONE --> OUT_GROUP_READY(["Nhóm mới sẵn sàng bước vào quá trình đào tạo"]):::startEnd
    P_INVITE_SENT --> OUT_GROUP_READY
```

#### Bảng State Transition Matrix (Sub-flow 3.2)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **3.2.1** | Danh sách phòng ban | Chọn nhóm nhân viên mới | Chưa có thành viên nào giải bài tập | Màn hình trạng thái trống được thiết kế đẹp mắt | Điểm số hiển thị 0/100 an toàn, không gây hiểu lầm |
| **3.2.2** | Màn hình nhóm mới | Xem thông tin nhóm | Không có lịch sử hoạt động | Hình vẽ minh họa truyền cảm hứng kèm nút hành động khởi động | Người quản lý biết chính xác cần làm gì tiếp theo |
| **3.2.3** | Màn hình nhóm mới | Bấm "Giao Lộ trình Nhập môn" | Muốn chỉ định bài học bắt buộc | Cửa sổ chọn bài học cơ bản và bấm giao cho cả nhóm | Tiện lợi, không cần giao từng người một |
| **3.2.4** | Màn hình nhóm mới | Bấm "Gửi Email Khởi động" | Muốn nhắc nhở nhân viên đăng nhập | Hệ thống gửi thư mời kèm đường dẫn bài học | Có thông báo xác nhận số lượng email đã gửi thành công |
| **3.2.5** | Màn hình nhóm mới | Bấm "Quay lại danh sách nhóm" | Muốn xem các phòng ban khác | Trở lại danh sách các phòng ban trong tổ chức | Điều hướng linh hoạt, thuận tiện |
