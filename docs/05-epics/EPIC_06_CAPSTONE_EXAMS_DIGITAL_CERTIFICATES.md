# Epic 6: Practical Capstone Exams & Verifiable Digital Certificates

### Epic: Khảo thí Thực hành Độc lập & Cấp Chứng chỉ Kỹ thuật số Có Thể Xác thực (Practical Capstone Exams & Verifiable Digital Certificates)

---

#### Story US-06.01: Là một học viên đã hoàn thành lộ trình đào tạo, tôi muốn đăng ký và tham gia kỳ thi thực hành Capstone Exam với thời lượng linh hoạt (6h, 12h, 24h) trong môi trường mạng cô lập đa mục tiêu, để kiểm tra năng lực tổng hợp và được chấm điểm tự động 100% qua việc nộp Flag.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Điều kiện tiên quyết: Học viên phải hoàn thành 100% các phòng học bắt buộc trong Lộ trình đào tạo tương ứng mới được phép mở quyền đăng ký thi.
  - Cấu hình kỳ thi linh hoạt: Thời lượng làm bài được cấu hình bởi Admin theo từng kỳ thi cụ thể (ví dụ: 6 giờ, 12 giờ hoặc 24 giờ).
  - Cấp phát môi trường thi riêng biệt: Hệ thống tự động khởi tạo cụm mạng thực hành ảo hóa cô lập (Multi-node Target Network) gồm nhiều máy mục tiêu đại diện cho mạng doanh nghiệp (Active Directory, Web, Database, DMZ).
  - Kỷ luật phòng thi nghiêm ngặt: Khóa hoàn toàn tính năng xem gợi ý (Hints), khóa diễn đàn thảo luận và khóa chức năng xem walkthrough trong suốt thời gian diễn ra bài thi.
  - Chấm điểm tự động 100% (Automated Flag Grading): Điểm số được tính toán tự động dựa trên số lượng cờ thực hành nộp thành công trước khi hết giờ thi; không yêu cầu nộp file báo cáo thẩm định thủ công ở phiên bản MVP.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Học viên đủ điều kiện bắt đầu bài thi Capstone Exam):**
    - **Given** Học viên đã hoàn thành 100% Lộ trình "Certified Offensive Pentester" và đang ở trang `/exams/cop-01`.
    - **When** Học viên nhấn nút "Start Capstone Exam" và đồng ý với Bản cam kết quy chế thi.
    - **Then** Hệ thống kích hoạt cấp phát cụm mạng thi riêng cho học viên.
    - **And** Đồng hồ đếm ngược thời gian làm bài (ví dụ: `12:00:00`) bắt đầu chạy.
    - **And** Giao diện chuyển sang chế độ phòng thi đặc biệt: Ẩn hoàn toàn nút gợi ý, hiển thị danh mục các cờ cần tìm và ô nộp cờ bài thi.
  - **Scenario 2 (Ngoại lệ - Học viên chưa đủ điều kiện tiên quyết cố tình truy cập bài thi):**
    - **Given** Học viên mới chỉ hoàn thành 60% lộ trình "Pre-Security".
    - **When** Học viên cố tình truy cập vào đường dẫn bài thi Capstone `/exams/cop-01`.
    - **Then** Nút "Start Capstone Exam" ở trạng thái bị vô hiệu hóa (disabled).
    - **And** Giao diện hiển thị thông báo giải thích: "Prerequisites not met! You must complete 100% of required modules in this path before taking the exam (Current: 60%)".

---

#### Story US-06.02: Là một học viên vượt qua kỳ thi Capstone với điểm số đạt chuẩn, tôi muốn hệ thống tự động cấp Chứng chỉ số PDF có mã QR và chữ ký số mật mã trong vòng vài giây sau khi nộp bài, để tôi có thể lưu trữ bản mềm chính thức và chia sẻ thành tích lên LinkedIn.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Tiêu chí vượt qua bài thi (Passing Grade): Đạt điểm số $\ge$ ngưỡng chuẩn (ví dụ: $\ge 70/100$ điểm).
  - Tự động sinh tệp tin PDF chứng chỉ vector chất lượng cao lưu trữ tại MinIO/S3.
  - Quy chuẩn định danh chứng chỉ: Mã định danh duy nhất theo cấu trúc chuẩn `CF-CERT-YYYY-[UUID-6-CHAR]` (ví dụ: `CF-CERT-2026-8891A`).
  - Đảm bảo tính toàn vẹn mật mã: Nhúng chữ ký số (Digital Signature) bằng thuật toán RSA-SHA256 hoặc HMAC-SHA256 được ký bởi Private Key của CyberForce Certificate Authority; có mã QR dẫn trực tiếp tới trang tra cứu công khai `https://cyberforce.io/verify/[CERT_ID]`.
  - Tích hợp nút chia sẻ 1-click lên mạng xã hội nghề nghiệp LinkedIn (Add to Profile với Organization ID và Certificate URL chuẩn hóa).
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Cấp chứng chỉ số tức thì cho học viên đạt điểm chuẩn):**
    - **Given** Học viên hoàn thành bài thi Capstone và đạt 85/100 điểm.
    - **When** Học viên nhấn nút "Finish & Submit Exam" (hoặc đồng hồ đếm ngược bài thi kết thúc).
    - **Then** Hệ thống chốt điểm và hiển thị màn hình chúc mừng "Congratulations! You passed with 85/100".
    - **And** Trong vòng $< 30$ giây, hệ thống hoàn tất việc sinh file PDF chứng chỉ có chữ ký số và mã định danh duy nhất `CF-CERT-2026-8891A`.
    - **And** Xuất hiện nút "Download Official Certificate (PDF)" và nút "Add to LinkedIn Profile".
  - **Scenario 2 (Ngoại lệ - Học viên không đạt điểm chuẩn trong kỳ thi):**
    - **Given** Học viên làm bài thi và chỉ đạt 55/100 điểm khi thời gian thi kết thúc.
    - **When** Hệ thống đóng phiên thi và xử lý kết quả.
    - **Then** Màn hình hiển thị kết quả "Exam Not Passed (Score: 55/100, Required: 70/100)".
    - **And** Hệ thống không sinh chứng chỉ số và cung cấp bảng tổng kết các nhóm kỹ năng chưa đạt.
    - **And** Hiển thị thời gian chờ thi lại (Cool-down Period) là 14 ngày trước khi được phép bấm đăng ký thi lại.

---

#### Story US-06.03: Là một Nhà tuyển dụng hoặc Trưởng phòng An ninh mạng, tôi muốn quét mã QR trên chứng chỉ của ứng viên hoặc nhập mã chứng chỉ vào Cổng tra cứu công khai `https://cyberforce.io/verify/[CERT_ID]`, để kiểm chứng trực tiếp tính xác thực của chứng chỉ, điểm số và các kỹ năng đã được thẩm định mà không sợ ứng viên làm giả bằng cấp.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Cổng tra cứu công khai hoạt động tại `https://cyberforce.io/verify/[CERT_ID]` và cho phép truy cập tự do mà không yêu cầu đăng nhập tài khoản.
  - Khi chứng chỉ hợp lệ:
    + Hiển thị huy hiệu màu xanh lá cây "Verified Authentic Certificate".
    + Hiển thị đầy đủ thông tin: Họ và tên người nhận, Tên chứng chỉ, Ngày cấp, Ngày hết hạn (nếu có), Điểm số đạt được, Danh sách các năng lực chuyên môn đã được kiểm chứng (Verified Skills).
    + Hiển thị trạng thái Chữ ký số mã hóa hợp lệ (Cryptographically Signed by CyberForce CA).
  - Khi chứng chỉ không hợp lệ hoặc đã bị Ban quản trị thu hồi (Revoked) do phát hiện gian lận: Phải hiển thị cảnh báo màu đỏ rõ ràng để cảnh báo nhà tuyển dụng.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Nhà tuyển dụng tra cứu chứng chỉ hợp lệ):**
    - **Given** Chứng chỉ có mã `CF-CERT-2026-8891A` của học viên "Nguyen Van A" đã được lưu trữ trong cơ sở dữ liệu với trạng thái `ACTIVE`.
    - **When** Nhà tuyển dụng dùng điện thoại quét mã QR hoặc truy cập đường dẫn `https://cyberforce.io/verify/CF-CERT-2026-8891A`.
    - **Then** Trang web hiển thị huy hiệu xanh lá "Verified Authentic Certificate".
    - **And** Hiển thị chính xác tên "Nguyen Van A", chứng chỉ "Certified Offensive Pentester", điểm "85/100" và ngày cấp "08/09/2026".
  - **Scenario 2 (Thất bại / Ngoại lệ - Tra cứu mã chứng chỉ không tồn tại hoặc đã bị thu hồi):**
    - **Given** Nhà tuyển dụng nhập một mã chứng chỉ không tồn tại hoặc chứng chỉ `CF-CERT-2026-FAKE01` đã bị Admin đánh dấu `REVOKED` do gian lận.
    - **When** Truy cập vào đường dẫn kiểm tra `/verify/CF-CERT-2026-FAKE01`.
    - **Then** Trang web hiển thị cảnh báo nền đỏ nổi bật: "⚠️ Warning: Certificate Not Found or Revoked!".
    - **And** Nêu rõ lý do (nếu đã bị thu hồi) và khuyến cáo liên hệ bộ phận hỗ trợ của CyberForce để đối soát.
