# Epic 6: Practical Capstone Exams & Verifiable Digital Certificates
## Tài liệu Thiết kế Kiến trúc User Flow Chi tiết (User Journey & Experience Flows)

* **Hệ thống:** CyberForce Cyber Range & Practical Security Platform
* **Tài liệu tham chiếu:** [EPIC_06_CAPSTONE_EXAMS_DIGITAL_CERTIFICATES.md](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/05-epics/EPIC_06_CAPSTONE_EXAMS_DIGITAL_CERTIFICATES.md)
* **Vai trò phụ trách:** Product Designer (UX Architect)
* **Phiên bản:** 1.0 (Strict Non-Tech User Experience Focus)

---

## 📑 MỤC LỤC TỔNG QUAN CÁC TIỂU LUỒNG (USER FLOWS)

Toàn bộ hành trình trải nghiệm của Học viên thi lấy chứng chỉ và Nhà tuyển dụng kiểm tra bằng cấp được xây dựng dưới góc nhìn **hoàn toàn phi kỹ thuật (non-tech)** qua **6 tiểu luồng trực quan**:

- **MODULE 1: ĐĂNG KÝ & THAM GIA KỲ THI ĐÁNH GIÁ NĂNG LỰC (EXAM REGISTRATION & TEST ENVIRONMENT)**
  - [Sub-flow 1.1: Kiểm tra Điều kiện Tiên quyết & Đăng ký Bài thi (US-06.01)](#sub-flow-11-kiểm-tra-điều-kiện-tiên-quyết--đăng-ký-bài-thi-us-0601)
  - [Sub-flow 1.2: Trải nghiệm Trong Phòng Thi & Nộp Bài Đánh giá (US-06.01)](#sub-flow-12-trải-nghiệm-trong-phòng-thi--nộp-bài-đánh-giá-us-0601)
- **MODULE 2: KẾT QUẢ THI & QUẢN LÝ CHỨNG CHỈ SỐ (EXAM OUTCOMES & DIGITAL CERTIFICATES)**
  - [Sub-flow 2.1: Nhận Kết quả Thi Đạt Chuẩn & Nhận Chứng chỉ Số (US-06.02)](#sub-flow-21-nhận-kết-quả-thi-đạt-chuẩn--nhận-chứng-chỉ-số-us-0602)
  - [Sub-flow 2.2: Xử lý Kết quả Chưa Đạt & Hướng dẫn Ôn tập Thi lại (US-06.02)](#sub-flow-22-xử-lý-kết-quả-chưa-đạt--hướng-dẫn-ôn-tập-thi-lại-us-0602)
- **MODULE 3: TRA CỨU & XÁC THỰC CHỨNG CHỈ CÔNG KHAI (PUBLIC CERTIFICATE VERIFICATION)**
  - [Sub-flow 3.1: Nhà Tuyển dụng Quét Mã QR hoặc Nhập Mã Tra cứu Chứng chỉ (US-06.03)](#sub-flow-31-nhà-tuyển-dụng-quét-mã-qr-hoặc-nhập-mã-tra-cứu-chứng-chỉ-us-0603)
  - [Sub-flow 3.2: Màn hình Kết quả Xác thực: Chứng chỉ Hợp lệ vs Bị thu hồi (US-06.03)](#sub-flow-32-màn-hình-kết-quả-xác-thực-chứng-chỉ-hợp-lệ-vs-bị-thu-hồi-us-0603)

---

## I. NGUYÊN TẮC THIẾT KẾ TRẢI NGHIỆM CHO NGƯỜI DÙNG NON-TECH

1. **Góc nhìn Thuần túy Người dùng Thường (Non-Tech Human Perspective):**
   - Tập trung vào những gì một người dùng bình thường nhìn thấy, hiểu được và cảm nhận: *Thẻ bài thi, nút bấm bắt đầu, thanh tiến trình % hoàn thành, đồng hồ đếm ngược giờ thi, bằng cấp PDF đẹp mắt, mã QR quét bằng camera điện thoại, nút chia sẻ lên mạng xã hội*.
   - Tuyệt đối không dùng thuật ngữ kỹ thuật chuyên sâu (không nói về thuật toán mã hóa, chuỗi băm, hạ tầng máy chủ, cổng kết nối hay cơ sở dữ liệu).
2. **Nguyên tắc "No Dead End" (Không có lối cụt):**
   - Học viên chưa đủ điều kiện thi được dẫn dắt quay lại hoàn thành các bài học còn thiếu.
   - Thí sinh thi trượt nhận được phân tích điểm yếu kèm lộ trình ôn tập và đồng hồ báo ngày được thi lại.
   - Nhà tuyển dụng quét phải bằng giả/hết hạn được cung cấp số điện thoại hoặc email liên hệ để đối soát.
3. **Minh bạch, Tin cậy & Tạo Động lực:**
   - Chứng chỉ được trình bày trang trọng, có đầy đủ căn cứ xác thực trực quan (huy hiệu xanh, dấu mộc chứng nhận, mã số tra cứu) giúp người học tự hào chia sẻ và nhà tuyển dụng hoàn toàn an tâm.

---

## II. CHI TIẾT CÁC TIỂU LUỒNG USER FLOW (MERMAID FLOWCHARTS & MATRICES)

---

### Sub-flow 1.1: Kiểm tra Điều kiện Tiên quyết & Đăng ký Bài thi (US-06.01)

Học viên kiểm tra tính hợp lệ về tiến độ hoàn thành bài học trước khi được phép kích hoạt kỳ thi thực hành năng lực tổng hợp.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_EXAM_HUB(["Học viên mở Trang Kỳ thi Đánh giá Năng lực"]):::startEnd --> P_EXAM_INTRO["Màn hình Giới thiệu Kỳ thi:<br>- Tên chứng chỉ mục tiêu<br>- Thời lượng làm bài (Ví dụ: 12 tiếng)<br>- Tiêu chí đậu: Đạt từ 70/100 điểm trở lên"]:::page

    P_EXAM_INTRO --> D_PREREQUISITE{"Kiểm tra tiến độ hoàn thành lộ trình học tập?"}:::decision

    %% Path Not Completed (<100%)
    D_PREREQUISITE -- "Chưa hoàn thành 100% lộ trình (Ví dụ: 60%)" --> P_NOT_QUALIFIED["Thông báo Chưa đủ điều kiện:<br>Thanh tiến độ hiển thị 60%<br>Nút 'Bắt đầu làm bài thi' bị khóa màu xám"]:::errorState

    P_NOT_QUALIFIED --> ACT_CLICK_CONTINUE["Học viên bấm 'Tiếp tục hoàn thành bài học còn thiếu'"]:::process
    ACT_CLICK_CONTINUE --> OUT_GO_STUDY(["Chuyển về danh sách bài tập của Lộ trình để học tiếp"]):::startEnd

    %% Path Completed (100%)
    D_PREREQUISITE -- "Đã hoàn thành xuất sắc 100% lộ trình" --> P_QUALIFIED["Thông báo Đủ điều kiện dự thi:<br>Huy hiệu xanh: Đã hoàn tất mọi bài học tiên quyết!<br>Nút 'Bắt đầu làm bài thi' mở khóa màu xanh lá"]:::successState

    P_QUALIFIED --> ACT_CLICK_START_EXAM["Học viên nhấn nút 'Bắt đầu làm bài thi'"]:::process

    ACT_CLICK_START_EXAM --> P_HONOR_CODE["Hộp thoại Cam kết Quy chế Phòng thi:<br>- Làm bài độc lập, không gian lận<br>- Chức năng xem gợi ý và diễn đàn sẽ tạm khóa<br>- Nút 'Tôi đồng ý và Bắt đầu tính giờ'"]:::page

    P_HONOR_CODE --> D_USER_CONSENT{"Lựa chọn của học viên?"}:::decision
    D_USER_CONSENT -- "Bấm 'Hủy bỏ - Để lúc khác thi'" --> P_QUALIFIED
    D_USER_CONSENT -- "Bấm 'Đồng ý & Bắt đầu tính giờ'" --> OUT_START_TEST(["Hệ thống tính giờ làm bài và đưa vào phòng thi"]):::startEnd
```

#### Bảng State Transition Matrix (Sub-flow 1.1)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1.1.1** | Trang giới thiệu bài thi | Nhấp xem thông tin kỳ thi | Đã đăng nhập tài khoản học viên | Màn hình tóm tắt thể lệ, thời lượng và tiêu chí đậu | Có nút quay lại Trang chủ hoặc Lộ trình |
| **1.1.2** | Màn hình giới thiệu | Quan sát nút bắt đầu thi | Chưa học xong 100% các bài học | Nút thi bị khóa mờ, kèm thanh phần trăm còn thiếu | Nút "Tiếp tục học" dẫn thẳng tới bài chưa làm |
| **1.1.3** | Màn hình giới thiệu | Quan sát nút bắt đầu thi | Đã hoàn thành trọn vẹn 100% lộ trình | Nút "Bắt đầu làm bài thi" sáng rõ màu xanh lá | Người học chủ động chọn thời điểm bắt đầu thi |
| **1.1.4** | Màn hình đủ điều kiện | Nhấn nút "Bắt đầu làm bài thi" | Đã sẵn sàng thi | Hộp thoại Cam kết Quy chế Phòng thi | Có nút "Hủy bỏ" nếu chưa muốn bắt đầu ngay |
| **1.1.5** | Hộp thoại cam kết | Bấm "Đồng ý & Bắt đầu tính giờ" | Học viên cam kết thi cử văn minh | Đồng hồ đếm ngược bắt đầu chạy, mở phòng thi | Dẫn thẳng vào giao diện làm bài chính thức |

---

### Sub-flow 1.2: Trải nghiệm Trong Phòng Thi & Nộp Bài Đánh giá (US-06.01)

Không gian làm bài thi nghiêm túc, tập trung với đồng hồ đếm ngược lớn, chấm điểm tự động tức thì và bảo vệ bài làm khi nộp bài.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_IN_EXAM(["Học viên trong Phòng thi Đánh giá Năng lực"]):::startEnd --> P_EXAM_WORKSPACE["Không gian Phòng thi Tập trung:<br>- Đồng hồ đếm lùi thời gian lớn: 11:59:45<br>- Danh mục các thử thách cần hoàn thành<br>- Các tính năng xem gợi ý / thảo luận bị khóa hoàn toàn<br>- Nút 'Nộp bài thi sớm'"]:::page

    P_EXAM_WORKSPACE --> ACT_SOLVE_TASK["Học viên giải bài và nhập kết quả vào ô trả lời"]:::process

    ACT_SOLVE_TASK --> D_SUBMIT_ANSWER{"Hệ thống tự động chấm kết quả?"}:::decision

    %% Correct
    D_SUBMIT_ANSWER -- "Đáp án chính xác" --> P_TASK_SOLVED["Hiển thị dấu tích xanh lá cây: Đã hoàn thành thử thách!<br>Thanh tổng điểm tăng lên tức thì"]:::successState
    P_TASK_SOLVED --> D_EXAM_FINISH{"Điều kiện kết thúc bài thi?"}:::decision

    %% Incorrect
    D_SUBMIT_ANSWER -- "Đáp án chưa đúng" --> P_TASK_RETRY["Thông báo màu đỏ: Kết quả chưa đúng, hãy thử lại!"]:::errorState
    P_TASK_RETRY --> P_EXAM_WORKSPACE

    %% End of Exam Conditions
    D_EXAM_FINISH -- "Học viên chủ động bấm 'Nộp bài thi sớm'" --> P_CONFIRM_SUBMIT["Hộp thoại Xác nhận Nộp bài:<br>Bạn có chắc chắn muốn nộp bài thi ngay lúc này?"]:::page
    D_EXAM_FINISH -- "Đồng hồ đếm ngược hết giờ (00:00:00)" --> ACT_AUTO_SUBMIT["Hệ thống tự động thu bài và đóng phòng thi"]:::process

    P_CONFIRM_SUBMIT --> D_USER_SUBMIT_CONFIRM{"Quyết định nộp bài?"}:::decision
    D_USER_SUBMIT_CONFIRM -- "Bấm 'Quay lại làm tiếp'" --> P_EXAM_WORKSPACE
    D_USER_SUBMIT_CONFIRM -- "Bấm 'Xác nhận nộp bài'" --> ACT_AUTO_SUBMIT

    ACT_AUTO_SUBMIT --> OUT_EXAM_CLOSED(["Phòng thi hoàn tất, chuyển sang màn hình chấm điểm tổng kết"]):::startEnd
```

#### Bảng State Transition Matrix (Sub-flow 1.2)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1.2.1** | Phòng thi chính thức | Theo dõi đồng hồ và đọc đề bài | Đang trong thời gian làm bài | Giao diện phòng thi tối giản, hiển thị các nhiệm vụ cần làm | Có nút trợ giúp về mặt kỹ thuật nếu phòng thi trục trặc |
| **1.2.2** | Ô nộp đáp án | Nhập kết quả bài làm và bấm Gửi | Đáp án chưa chính xác | Báo đỏ nhắc nhở thử lại, không trừ điểm | Học viên tiếp tục thử các phương án khác |
| **1.2.3** | Ô nộp đáp án | Nhập kết quả bài làm và bấm Gửi | Đáp án hoàn toàn chính xác | Tích xanh lá cây xuất hiện, điểm số tổng tăng lên | Thanh tiến độ thi tự động cập nhật phần trăm hoàn thành |
| **1.2.4** | Phòng thi chính thức | Nhấn nút "Nộp bài thi sớm" | Đã làm xong trước thời hạn | Hộp thoại xác nhận nộp bài | Nút "Quay lại làm tiếp" để kiểm tra lại bài làm |
| **1.2.5** | Phòng thi chính thức | Thời gian thi chạm mốc 00:00:00 | Hết giờ làm bài | Tự động lưu toàn bộ các câu đã làm đúng và nộp bài | Không làm mất bất kỳ kết quả nào học viên đã ghi điểm |

---

### Sub-flow 2.1: Nhận Kết quả Thi Đạt Chuẩn & Nhận Chứng chỉ Số (US-06.02)

Màn hình chúc mừng học viên vượt qua kỳ thi với số điểm xuất sắc, nhận Chứng chỉ số chính thức có mã QR chống làm giả và chia sẻ niềm vui lên mạng xã hội nghề nghiệp.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_GRADED(["Hệ thống hoàn tất chấm điểm bài thi"]):::startEnd --> P_CONGRATS["Màn hình Chúc Mừng Vượt Qua Kỳ Thi!<br>- Điểm số: 85/100 (Yêu cầu: 70/100)<br>- Đạt tiêu chuẩn cấp Chứng chỉ Năng lực Chuyên nghiệp"]:::successState

    P_CONGRATS --> ACT_ISSUE_CERT["Hệ thống tạo Chứng chỉ Kỹ thuật số chính thức (trong vòng vài giây)"]:::process

    ACT_ISSUE_CERT --> P_CERT_SHOWCASE["Trang Vinh danh & Bằng Cấp Điện Tử:<br>- Bản xem trước Chứng chỉ sang trọng kèm Mã số định danh duy nhất<br>- Mã QR kiểm tra thật giả trực tiếp<br>- Danh mục các kỹ năng chuyên môn đã được chứng nhận"]:::page

    P_CERT_SHOWCASE --> D_CERT_ACTIONS{"Học viên lựa chọn thao tác?"}:::decision

    %% Download PDF
    D_CERT_ACTIONS -- "Bấm 'Tải Chứng chỉ về máy (PDF)'" --> ACT_DOWNLOAD["Tải tệp tin chứng chỉ PDF sắc nét dùng để in ấn hoặc đính kèm hồ sơ"]:::process
    ACT_DOWNLOAD --> P_CERT_SHOWCASE

    %% Share to LinkedIn
    D_CERT_ACTIONS -- "Bấm 'Thêm vào Hồ sơ LinkedIn'" --> P_LINKEDIN_MODAL["Mở cửa sổ thêm bằng cấp lên LinkedIn với thông tin điền sẵn 1-click"]:::page

    %% View Public Page
    D_CERT_ACTIONS -- "Bấm 'Xem trang tra cứu công khai'" --> OUT_PUBLIC_LINK(["Mở trang xác thực công khai của chứng chỉ để chia sẻ cho nhà tuyển dụng"]):::startEnd
```

#### Bảng State Transition Matrix (Sub-flow 2.1)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2.1.1** | Màn hình chờ kết quả | Xem thông báo điểm | Điểm thi $\ge 70/100$ điểm | Màn hình pháo hoa chúc mừng vượt qua kỳ thi | Có bản tóm tắt điểm số chi tiết từng phần |
| **2.1.2** | Màn hình chúc mừng | Chờ cấp chứng chỉ | Đạt điểm đậu | Trang trưng bày Chứng chỉ Số chính thức | Quá trình diễn ra tự động chỉ trong vài giây |
| **2.1.3** | Trang chứng chỉ số | Nhấn nút "Tải Chứng chỉ PDF" | Muốn lưu về máy hoặc in ấn | Trình duyệt tải ngay file chứng chỉ chất lượng cao | Nút tải lại nếu đường truyền mạng ngắt giữa chừng |
| **2.1.4** | Trang chứng chỉ số | Nhấn nút "Thêm vào LinkedIn" | Muốn làm đẹp hồ sơ xin việc | Hộp thoại liên kết LinkedIn điền sẵn tên bằng và tổ chức cấp | Thao tác 1-click tiện lợi, không cần gõ tay |
| **2.1.5** | Trang chứng chỉ số | Nhấn "Xem trang tra cứu công khai" | Muốn lấy đường dẫn chia sẻ | Mở Cổng tra cứu xác thực chứng chỉ | Nút sao chép đường dẫn (Copy Link) tiện dụng |

---

### Sub-flow 2.2: Xử lý Kết quả Chưa Đạt & Hướng dẫn Ôn tập Thi lại (US-06.02)

Phản hồi nhẹ nhàng, văn minh khi điểm số chưa đạt chuẩn, cung cấp bản phân tích kỹ năng cần cải thiện và đặt lịch thi lại rõ ràng.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_FAIL_GRADE(["Hệ thống hoàn tất chấm điểm bài thi"]):::startEnd --> P_NOT_PASSED["Màn hình Thông báo Kết quả:<br>- Điểm đạt được: 55/100 (Ngưỡng yêu cầu: 70/100)<br>- Trạng thái: Chưa đạt chuẩn kỳ thi lần này"]:::errorState

    P_NOT_PASSED --> P_SKILL_FEEDBACK["Bảng Phân tích Năng lực Cá nhân:<br>- Các kỹ năng đã làm tốt (Màu xanh)<br>- Các chủ đề kiến thức cần củng cố thêm (Màu cam)<br>- Đồng hồ đếm ngược ngày mở thi lại: 14 ngày"]:::page

    P_SKILL_FEEDBACK --> D_STUDY_CHOICE{"Lựa chọn tiếp theo của học viên?"}:::decision

    %% Review Roadmaps
    D_STUDY_CHOICE -- "Bấm 'Ôn tập lại các bài học trọng tâm'" --> ACT_GO_REVIEW["Hệ thống gợi ý các bài thực hành giúp khắc phục điểm yếu"]:::process
    ACT_GO_REVIEW --> OUT_REVIEW_LESSONS(["Chuyển đến danh sách bài học cần ôn luyện"]):::startEnd

    %% Set Reminder
    D_STUDY_CHOICE -- "Bấm 'Nhắc tôi khi đến ngày thi lại'" --> ACT_SET_REMINDER["Đăng ký nhận email thông báo khi hết 14 ngày chờ"]:::process
    ACT_SET_REMINDER --> P_REMINDER_SET["Thông báo: Đã đặt lịch nhắc hẹn thi lại thành công!"]:::successState

    P_REMINDER_SET --> OUT_SAFE_DASH(["Quay về Bảng điều khiển học tập cá nhân"]):::startEnd
```

#### Bảng State Transition Matrix (Sub-flow 2.2)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2.2.1** | Màn hình kết quả thi | Đọc thông báo kết quả | Điểm thi $< 70/100$ điểm | Màn hình thông báo chưa đạt kèm lời động viên | Không có cảm giác tiêu cực, luôn có định hướng bước tiếp |
| **2.2.2** | Bảng phân tích kỹ năng | Xem chi tiết điểm số | Chưa vượt qua bài thi | Bảng phân tích điểm mạnh và điểm yếu cụ thể | Giúp học viên biết chính xác mình cần ôn lại phần nào |
| **2.2.3** | Bảng phân tích kỹ năng | Đọc thông tin thời gian thi lại | Quy định giãn cách thi lại 14 ngày | Đồng hồ hiển thị số ngày còn lại để được đăng ký lại | Nút "Nhắc tôi qua email" khi đến ngày mở thi |
| **2.2.4** | Bảng phân tích kỹ năng | Bấm "Ôn tập lại bài học trọng tâm" | Muốn cải thiện điểm số | Danh mục các bài học ôn luyện được đề xuất riêng | Nút đưa thẳng vào bài học cần rèn luyện thêm |
| **2.2.5** | Màn hình kết quả | Bấm "Quay về Dashboard" | Học viên muốn tạm nghỉ ngơi | Trở lại trang chủ học tập cá nhân | Đưa học viên về khu vực an toàn, không bị kẹt ở màn hình thi |

---

### Sub-flow 3.1: Nhà Tuyển dụng Quét Mã QR hoặc Nhập Mã Tra cứu Chứng chỉ (US-06.03)

Quy trình tra cứu cực kỳ dễ dàng cho Nhà tuyển dụng hoặc Khách bên ngoài: Có thể dùng điện thoại quét mã QR trên bản in hoặc nhập mã số trên web mà không cần đăng nhập.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_RECRUITER(["Nhà tuyển dụng muốn thẩm định bằng cấp của ứng viên"]):::startEnd --> D_LOOKUP_METHOD{"Phương thức kiểm tra chứng chỉ?"}:::decision

    %% QR Scan Method
    D_LOOKUP_METHOD -- "Quét mã QR trên bằng cấp bằng Camera điện thoại" --> ACT_SCAN_QR["Camera điện thoại tự động nhận diện và mở đường link xác thực"]:::process
    ACT_SCAN_QR --> JUMP_VERIFY[["Chuyển thẳng sang Sub-flow 3.2: Màn hình Xác thực"]]:::process

    %% Manual Code Search
    D_LOOKUP_METHOD -- "Nhập mã chứng chỉ trên máy tính" --> P_PUBLIC_PORTAL["Cổng Tra cứu Chứng chỉ Công khai (Không cần tài khoản):<br>- Ô tìm kiếm: Nhập mã số chứng chỉ<br>- Ví dụ minh họa: CF-CERT-2026-8891A<br>- Nút 'Kiểm tra ngay'"]:::page

    P_PUBLIC_PORTAL --> ACT_TYPE_CODE["Nhập mã chứng chỉ in trên hồ sơ xin việc"]:::process
    ACT_TYPE_CODE --> ACT_PRESS_VERIFY["Nhấn nút 'Kiểm tra ngay'"]:::process

    ACT_PRESS_VERIFY --> JUMP_VERIFY
```

#### Bảng State Transition Matrix (Sub-flow 3.1)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **3.1.1** | Thiết bị di động / Máy ảnh | Dùng điện thoại soi vào mã QR trên bằng | Mã QR rõ nét, còn nguyên vẹn | Tự động mở đường dẫn tra cứu chứng chỉ trên trình duyệt | Không cần cài đặt thêm ứng dụng nào khác |
| **3.1.2** | Cổng tra cứu trên web | Mở trang kiểm tra chứng chỉ | Không cần tài khoản đăng nhập | Ô nhập mã chứng chỉ to, rõ ràng và thân thiện | Có ảnh hướng dẫn vị trí in mã số trên bằng cấp |
| **3.1.3** | Cổng tra cứu trên web | Nhập mã số và bấm "Kiểm tra ngay" | Đã điền mã số chứng chỉ | Hiển thị biểu tượng đang tìm kiếm dữ liệu | Thời gian phản hồi tức thì dưới 1 giây |

---

### Sub-flow 3.2: Màn hình Kết quả Xác thực: Chứng chỉ Hợp lệ vs Bị thu hồi (US-06.03)

Màn hình hiển thị kết quả thẩm định bằng cấp trực quan: Chứng chỉ chuẩn được dán huy hiệu xanh bảo chứng, chứng chỉ giả hoặc bị thu hồi được cảnh báo rõ ràng để bảo vệ nhà tuyển dụng.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_VERIFY_RESULT(["Nhận kết quả đối soát mã chứng chỉ"]):::startEnd --> D_CHECK_AUTHENTICITY{"Tình trạng mã chứng chỉ trên hệ thống?"}:::decision

    %% Case 1: Valid & Active
    D_CHECK_AUTHENTICITY -- "Chứng chỉ hợp lệ và đang có hiệu lực" --> P_VALID_CERT["Trang Chứng thực Chính hãng (Màu xanh lá):<br>- Dấu mộc xanh: 'Chứng chỉ Đã Xác thực Chính hãng'<br>- Họ và tên người nhận: Nguyễn Văn A<br>- Tên chứng chỉ: Certified Offensive Pentester<br>- Điểm số đạt được: 85/100<br>- Ngày cấp chính thức: 08/09/2026<br>- Danh mục kỹ năng thực hành đã được kiểm chứng"]:::successState

    P_VALID_CERT --> ACT_RECRUITER_ACTION["Nhà tuyển dụng có thể tải bản sao PDF có dấu chứng thực để lưu trữ hồ sơ"]:::page

    %% Case 2: Fake or Revoked
    D_CHECK_AUTHENTICITY -- "Mã không tồn tại hoặc đã bị Thu hồi do vi phạm" --> P_INVALID_ALERT["Trang Cảnh báo Bằng cấp Không Hợp Lệ (Màu đỏ):<br>⚠️ CẢNH BÁO: Bằng cấp này không hợp lệ hoặc đã bị Ban Quản trị thu hồi!<br>Lý do: Phát hiện gian lận hoặc mã số giả mạo."]:::errorState

    P_INVALID_ALERT --> D_REMEDY_VERIFY{"Lựa chọn của Nhà tuyển dụng?"}:::decision
    D_REMEDY_VERIFY -- "Nhập lại mã chứng chỉ khác" --> ACT_RETYPE["Quay lại ô tìm kiếm để kiểm tra lại lỗi gõ nhầm"]:::process
    D_REMEDY_VERIFY -- "Liên hệ hỗ trợ để đối soát" --> P_CONTACT_SUPPORT["Cung cấp số Hotline & Email hỗ trợ đối soát bằng cấp"]:::page
```

#### Bảng State Transition Matrix (Sub-flow 3.2)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **3.2.1** | Màn hình kết quả | Xem thông tin xác thực | Chứng chỉ chuẩn, còn hiệu lực | Màn hình xanh lá cây khẳng định bằng cấp chính hãng | Hiển thị đầy đủ điểm số và danh mục kỹ năng của ứng viên |
| **3.2.2** | Trang chứng chỉ hợp lệ | Bấm nút "Tải bản sao đối soát" | Nhà tuyển dụng cần lưu trữ hồ sơ | Tải file PDF chứng thực có dấu xác nhận điện tử | Tiện lợi cho công tác lưu trữ hồ sơ nhân sự |
| **3.2.3** | Màn hình kết quả | Tra cứu mã không tồn tại | Gõ sai mã hoặc bằng giả mạo | Cảnh báo đỏ: "Chứng chỉ không tồn tại" | Nút "Nhập lại mã" để kiểm tra xem có gõ sai ký tự không |
| **3.2.4** | Màn hình kết quả | Tra cứu mã bị kỷ luật | Chứng chỉ đã bị thu hồi do gian lận | Cảnh báo đỏ: "Chứng chỉ đã bị hủy bỏ hiệu lực" kèm lý do | Giúp nhà tuyển dụng phòng tránh ứng viên không trung thực |
| **3.2.5** | Màn hình cảnh báo đỏ | Cần làm rõ nghi vấn | Nghi ngờ có sự nhầm lẫn | Hiển thị kênh liên hệ hỗ trợ trực tiếp của CyberForce | Có hotline và email hỗ trợ giải đáp thắc mắc ngay |
