# Epic 8: Lab Creator Studio & University/Enterprise Analytics

### Epic: Xưởng Sáng tạo Bài Lab & Báo cáo Phân tích Năng lực Doanh nghiệp / Đại học (Lab Creator Studio & University/Enterprise Analytics)

---

#### Story US-08.01: Là một Quản trị viên Nền tảng (Admin), tôi muốn sử dụng giao diện Admin CMS tập trung để quản lý CRUD các Module, Phòng học (Rooms), Nhiệm vụ (Tasks), Cờ (Flags) và gán Docker Image mục tiêu, để duy trì nội dung đào tạo chất lượng cao cho phiên bản phát hành Phase 1 MVP.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Chỉ tài khoản có vai trò `Admin` mới có quyền truy cập vào đường dẫn `/admin/cms`.
  - Hỗ trợ đầy đủ các thao tác Thêm/Sửa/Xóa/Xuất bản (Draft / Published / Archived) cho các thực thể:
    + Learning Paths
    + Modules
    + Rooms
    + Tasks & Questions
  - Cho phép cấu hình chi tiết cho từng máy lab: Tên Docker Image (từ Private Container Registry), giới hạn tài nguyên CPU/RAM, cổng dịch vụ exposed và danh mục Flag (Static, Regex hoặc Dynamic Salt).
  - Bắt buộc kiểm tra tính hợp lệ của dữ liệu đầu vào (Validation): Điểm EXP thưởng phải $> 0$, tiêu đề không được để trống, Docker image phải tồn tại trong kho lưu trữ trước khi chuyển trạng thái sang `Published`.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Admin tạo mới và xuất bản một phòng lab hoàn chỉnh):**
    - **Given** Admin đăng nhập vào hệ thống và truy cập trang `/admin/cms/rooms/new`.
    - **When** Admin điền đầy đủ tiêu đề "Directory Traversal Exploitation", soạn nội dung lý thuyết MDX, nhập tên Docker image `cyberforce/lab-dirtraversal:v1`, cấu hình cờ `CF{dir_trav_success_991}` trị giá 50 EXP và nhấn "Publish Room".
    - **Then** Hệ thống xác thực dữ liệu hợp lệ, lưu vào cơ sở dữ liệu và đánh dấu trạng thái `PUBLISHED`.
    - **And** Phòng học mới lập tức xuất hiện trong danh mục bài lab của học viên và có thể khởi chạy máy lab bình thường.
  - **Scenario 2 (Thất bại / Ngoại lệ - Admin nhập thiếu thông tin Docker Image hoặc điểm số không hợp lệ):**
    - **Given** Admin đang ở màn hình tạo phòng lab mới.
    - **When** Admin để trống trường "Docker Image Name" hoặc nhập điểm thưởng là `-10 EXP` và nhấn "Publish Room".
    - **Then** Hệ thống chặn thao tác gửi dữ liệu và viền đỏ các trường nhập sai.
    - **And** Hiển thị thông báo lỗi cụ thể: "Docker image is required for practical rooms" và "EXP points must be a positive integer greater than 0".

---

#### Story US-08.02: Là một Giảng viên / Chuyên gia Sáng tạo Nội dung (Creator), tôi muốn sử dụng công cụ Lab Creator Studio với tính năng xem trước trực tiếp (Live MDX Preview) và chạy thử nghiệm máy lab trước khi gửi duyệt, để tôi có thể tạo ra các giáo trình an ninh mạng trực quan, không bị lỗi cú pháp hay hỏng hóc máy ảo.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Áp dụng cho người dùng đã được Admin phê duyệt vai trò `Creator` (Giai đoạn Phase 2).
  - Trình soạn thảo Markdown/MDX hỗ trợ chia 2 cột: Cột nhập mã bên trái và Cột xem trước thời gian thực (Live Preview) bên phải.
  - Cơ chế Kiểm thử Bắt buộc (Sandbox Dry-Run Requirement): Creator bắt buộc phải nhấn "Test Run Lab", khởi chạy thành công máy ảo trên môi trường staging và tự nộp đúng cờ bài tập ít nhất 01 lần thì nút "Submit for Review" mới được kích hoạt.
  - Sau khi gửi duyệt, bài lab chuyển sang trạng thái `PENDING_REVIEW` và gửi thông báo tới hàng đợi duyệt của Admin.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Creator soạn thảo, chạy thử nghiệm đạt chuẩn và gửi duyệt bài lab):**
    - **Given** Creator đang ở trong "Creator Studio" và đã hoàn tất việc soạn nội dung bài tập.
    - **When** Creator nhấn nút "Test Run Lab", máy ảo staging khởi chạy thành công và Creator nộp đúng cờ thử nghiệm.
    - **Then** Hệ thống ghi nhận trạng thái kiểm thử: "Test Run Passed: 1/1 Flags verified".
    - **And** Nút "Submit for Review" chuyển từ trạng thái ẩn/khóa sang khả dụng.
    - **And** Khi Creator nhấn Submit, bài lab chuyển sang trạng thái `PENDING_REVIEW` và xuất hiện trong danh sách chờ duyệt của ban quản trị.
  - **Scenario 2 (Ngoại lệ - Creator cố tình gửi bài khi chưa hoàn thành chạy thử nghiệm máy ảo):**
    - **Given** Creator vừa tạo một bài lab mới và chưa thực hiện thao tác "Test Run Lab".
    - **When** Creator di chuột hoặc cố tình click vào nút "Submit for Review".
    - **Then** Nút bị vô hiệu hóa (disabled) và hiển thị tooltip nhắc nhở: "You must run a test session and successfully verify all flags before submitting this lab for review".

---

#### Story US-08.03: Là một Quản lý Đào tạo Doanh nghiệp hoặc Trưởng khoa CNTT Trường Đại học (B2B Admin), tôi muốn xem Bảng phân tích Ma trận Lỗ hổng Kỹ năng (Skill Gap Matrix) của toàn bộ nhân viên/sinh viên trong tổ chức của tôi, để tôi có thể phát hiện các mảng kiến thức an ninh mạng còn yếu và xây dựng kế hoạch đào tạo bổ sung phù hợp.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Tính năng dành riêng cho vai trò `Enterprise Admin` hoặc `University Admin` thuộc tổ chức đã ký kết (Giai đoạn Phase 3).
  - Bảng điều khiển tổng hợp dữ liệu từ Biểu đồ Radar 8 trục và lịch sử hoàn thành bài lab của tất cả các tài khoản trực thuộc tổ chức.
  - Hiển thị ma trận trực quan dạng Heatmap thể hiện mức độ thông thạo (Proficiency Level) của từng thành viên và điểm trung bình của từng phòng ban/lớp học trên 8 trục kỹ năng.
  - Hỗ trợ tính năng xuất báo cáo định dạng PDF và CSV phục vụ công tác báo cáo ban lãnh đạo.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Quản lý xem Ma trận Kỹ năng tổ chức và phát hiện điểm yếu của đội ngũ):**
    - **Given** Quản lý đào tạo của Ngân hàng X đăng nhập vào Cổng Doanh nghiệp `/b2b/analytics`.
    - **When** Quản lý mở tab "Skill Gap Matrix" cho phòng ban "SOC L1 Team" (gồm 15 thành viên).
    - **Then** Hệ thống hiển thị biểu đồ nhiệt (Heatmap) thể hiện điểm số trung bình của 15 thành viên trên 8 trục kỹ năng.
    - **And** Nêu rõ thông tin phân tích: "Cloud & DevSecOps is the critical weak spot (Average: 24/100, 70% of team members below benchmark)".
    - **And** Đề xuất danh sách các Lộ trình học tập tương ứng để cải thiện kỹ năng này.
  - **Scenario 2 (Ngoại lệ - Thành viên mới được thêm vào tổ chức chưa có dữ liệu thực hành):**
    - **Given** Một lớp học viên mới gồm 30 sinh viên vừa được import vào tổ chức qua file CSV và chưa làm bất kỳ bài lab nào.
    - **When** Giảng viên mở bảng ma trận kỹ năng của lớp này.
    - **Then** Hệ thống hiển thị thông báo trạng thái "No activity data available yet for this group".
    - **And** Điểm trung bình hiển thị là `0/100` trên tất cả các trục kỹ năng mà không làm phát sinh lỗi phân chia cho số 0 (Division by zero) hoặc làm hỏng giao diện biểu đồ.
