# Epic 2: Structured Learning Paths & Interactive Rooms

### Epic: Lộ trình Học tập Chuẩn hóa & Không gian Phòng học Tương tác (Structured Learning Paths & Interactive Rooms)

---

#### Story US-02.01: Là một người học, tôi muốn duyệt danh mục lộ trình học tập và theo dõi tiến độ hoàn thành theo từng Task, để tôi có thể định hướng quá trình rèn luyện bài bản từ cơ bản đến nâng cao theo từng vị trí nghề nghiệp.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Lộ trình học (Learning Path) được cấu thành từ nhiều Module; mỗi Module chứa một hoặc nhiều Phòng học (Rooms); mỗi Room chứa danh sách các Nhiệm vụ (Tasks).
  - Tỷ lệ hoàn thành Lộ trình (%) được tính theo trọng số số lượng Task bắt buộc đã giải thành công so với tổng số Task.
  - Hỗ trợ cơ chế khóa logic (Prerequisite Locking): Một số Room nâng cao chỉ mở khóa (status: Available) khi học viên đã hoàn thành 100% các Room tiên quyết.
  - Khi tác giả cập nhật thêm Task mới vào Lộ trình đã học xong (100%), hệ thống tự động chuyển trạng thái lộ trình sang `Update Available` và tính toán lại phần trăm tiến độ tương ứng.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Tự động mở khóa phòng học tiếp theo khi hoàn thành phòng tiên quyết):**
    - **Given** Học viên đã hoàn thành 100% các Task trong Room "Linux Fundamentals 1".
    - **When** Học viên quay lại trang tổng quan Lộ trình "Pre-Security".
    - **Then** Trạng thái của Room tiếp theo "Linux Fundamentals 2" chuyển từ `Locked` sang `Available`.
    - **And** Thanh tiến độ tổng thể của Lộ trình tự động tăng tương ứng (ví dụ: từ 25% lên 50%).
  - **Scenario 2 (Ngoại lệ - Xử lý tính toán lại tiến độ khi Lộ trình được cập nhật thêm nội dung mới):**
    - **Given** Học viên đã đạt trạng thái `Completed` (100%) của Lộ trình "Web Application Pentesting".
    - **When** Quản trị viên/Giảng viên bổ sung thêm 2 Room mới vào Lộ trình này.
    - **Then** Trạng thái Lộ trình của học viên chuyển thành `Update Available`.
    - **And** Tỷ lệ phần trăm tiến độ được tự động tính toán giảm về theo tỷ lệ mới (ví dụ: từ 100% về 85%).
    - **And** Giao diện hiển thị thông báo: "New modules have been added to this path! Complete them to maintain 100% mastery".

---

#### Story US-02.02: Là một học viên, tôi muốn trải nghiệm giao diện phòng học tương tác dạng chia màn hình (Split-Pane Workspace) tích hợp đồng thời tài liệu lý thuyết MDX, câu hỏi thực hành và cửa sổ terminal/máy ảo, để tôi có thể vừa đọc tài liệu, vừa gõ lệnh thực hành và nộp bài trên cùng một màn hình duy nhất.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Giao diện phòng học áp dụng kiến trúc All-in-One Split-pane:
    + Cột trái/trên: Nội dung lý thuyết bài giảng hỗ trợ chuẩn định dạng Markdown/MDX (code highlight, bảng, hình ảnh, alerts).
    + Cột giữa/dưới: Danh sách câu hỏi, ô nhập flag, nút gợi ý (Hints) và nút nộp bài.
    + Cột phải: Khung hiển thị máy mục tiêu (IP, đếm ngược thời gian thuê, nút khởi chạy/dừng máy, cửa sổ AttackBox/Terminal nhúng).
  - Tự động lưu vị trí cuộn trang (scroll position) và trạng thái thu/phóng từng khung làm việc trên trình duyệt (Local Storage).
  - Hệ thống tự động đồng bộ trạng thái giải bài thời gian thực qua WebSocket/REST API.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Mở phòng học và tải giao diện Split-pane mượt mà):**
    - **Given** Học viên đã đăng nhập và nhấn vào Room "SQL Injection Basics".
    - **When** Trang phòng học `/rooms/sql-injection-basics` tải hoàn tất.
    - **Then** Toàn bộ nội dung lý thuyết hiển thị rõ ràng với định dạng Dark Mode, code syntax highlighting đầy đủ.
    - **And** Danh sách các Task và câu hỏi nộp cờ hiển thị bên cạnh với trạng thái đã hoàn thành (tick xanh) hoặc chưa hoàn thành (chấm xám).
    - **And** Khung điều khiển máy mục tiêu hiển thị nút "Start Machine" sẵn sàng kích hoạt.
  - **Scenario 2 (Ngoại lệ - Mất kết nối Internet trong lúc đang làm bài trong phòng học):**
    - **Given** Học viên đang mở phòng học và soạn thảo câu trả lời trong ô input.
    - **When** Kết nối Internet của học viên bị mất đột ngột.
    - **Then** Giao diện hiển thị thanh cảnh báo màu vàng phía trên: "Network disconnected. Working in offline mode. Answers are cached locally".
    - **And** Khi có mạng trở lại, hệ thống tự động kết nối lại và cho phép học viên gửi nộp câu trả lời mà không bị mất nội dung đã gõ.

---

#### Story US-02.03: Là một học viên, tôi muốn nộp Flag để kiểm tra đáp án và nhận phản hồi tức thì về tính đúng sai, đồng thời hệ thống tự động chống gian lận chia sẻ flag tĩnh, để tạo môi trường học tập minh bạch, công bằng và rèn luyện kỹ năng thực chất.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Hỗ trợ 3 cơ chế chấm cờ:
    1. Static Flag: Chuỗi cờ cố định định dạng `CF{...}` (dành cho bài lab lý thuyết/căn bản).
    2. Regex Flag: Chấp nhận đáp án khớp biểu thức chính quy (dành cho câu hỏi mở/IP/chuỗi hash).
    3. Dynamic Salted Flag: Mã cờ sinh động theo phiên của từng học viên bằng thuật toán HMAC-SHA256 (`CF{user_id_salt_hash}`), ngăn chặn hoàn toàn việc sao chép cờ giữa các tài khoản.
  - Quy tắc chống dò đáp án (Brute-force Protection): Cho phép tối đa 5 lần nộp cờ sai trong vòng 60 giây. Nếu vượt quá, khóa quyền nộp cờ của câu hỏi đó trong vòng 3 phút.
  - Khi nộp cờ đúng: Cộng điểm EXP vào tổng điểm học viên, cộng điểm vào các trục Radar kỹ năng tương ứng và kích hoạt hiệu ứng chúc mừng.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Nộp đúng Dynamic Flag và nhận thưởng EXP tức thì):**
    - **Given** Học viên đang giải Task 2 của phòng lab có gán cờ động `CF{f8a1290bc4d_sql_master}` (trị giá 50 EXP).
    - **When** Học viên dán chuỗi cờ vào ô nộp bài và nhấn nút "Submit".
    - **Then** Hệ thống phản hồi tức thì ($< 300\text{ms}$) với thông báo thành công "Correct Answer! +50 EXP".
    - **And** Ô nộp bài chuyển sang màu xanh lá cây, hiển thị biểu tượng hoàn thành và khóa ô nhập.
    - **And** Tổng điểm EXP trên thanh điều hướng tự động nhảy số tăng thêm 50 điểm.
  - **Scenario 2 (Thất bại / Ngoại lệ - Nộp sai cờ quá 5 lần liên tiếp):**
    - **Given** Học viên nộp sai cờ liên tiếp 4 lần trong vòng 40 giây.
    - **When** Học viên tiếp tục gửi đáp án sai lần thứ 5.
    - **Then** Ô nộp bài bị vô hiệu hóa (disabled).
    - **And** Hệ thống hiển thị thông báo lỗi: "Too many incorrect submissions. Submissions locked for 3 minutes".
    - **And** Hiển thị đồng hồ đếm ngược `03:00` trực tiếp tại ô nộp bài và chỉ mở khóa lại khi thời gian kết thúc.

---

#### Story US-02.04: Là một học viên gặp bế tắc khi giải một câu hỏi thực hành, tôi muốn mở các gợi ý theo từng bậc thang kèm mức trừ điểm minh bạch, để tôi có thể tự gỡ rối bài tập mà vẫn giữ được tính thử thách và công bằng điểm số.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Gợi ý được chia thành nhiều cấp bậc:
    + Gợi ý Cấp 1 (Hint 1): Trừ 10% điểm tối đa của câu hỏi.
    + Gợi ý Cấp 2 (Hint 2): Trừ thêm 20% điểm tối đa của câu hỏi.
    + Xem Lời giải chi tiết (Walkthrough/Solution): Chỉ khả dụng sau khi đã mở hết gợi ý hoặc sau khi câu hỏi đã được giải thành công; nếu xem trước khi giải thì điểm EXP nhận được cho câu hỏi đó là 0 điểm.
  - Học viên phải bấm xác nhận (Modal Confirmation) trước khi hệ thống trừ điểm và hiển thị nội dung gợi ý.
  - Khi học viên đã giải đúng câu hỏi trước đó, việc mở lại gợi ý hoặc xem walkthrough sẽ hoàn toàn miễn phí và không bị trừ bất kỳ điểm nào.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Mở gợi ý Cấp 1 sau khi xác nhận trừ điểm):**
    - **Given** Câu hỏi có giá trị ban đầu là 100 EXP và có 2 mức gợi ý.
    - **When** Học viên nhấn nút "Hint 1" và chọn "Confirm (Deduct 10 EXP)" trên hộp thoại xác nhận.
    - **Then** Hộp thoại đóng lại và nội dung Gợi ý 1 hiển thị rõ ràng dưới câu hỏi.
    - **And** Mức điểm thưởng tối đa có thể nhận được của câu hỏi này tự động cập nhật giảm từ 100 EXP xuống còn 90 EXP.
    - **And** Nút "Hint 2" vẫn ở trạng thái đóng cho đến khi học viên chủ động mở tiếp.
  - **Scenario 2 (Ngoại lệ - Học viên đã hoàn thành task xem lại Walkthrough giải pháp):**
    - **Given** Học viên đã giải đúng câu hỏi từ trước và đã nhận trọn vẹn 100 EXP.
    - **When** Học viên mở lại phòng học và nhấn nút "View Full Walkthrough".
    - **Then** Toàn bộ bài giải chi tiết từng bước hiển thị ngay lập tức mà không hiển thị cảnh báo trừ điểm.
    - **And** Tổng điểm EXP đã tích lũy của học viên được giữ nguyên không đổi.
