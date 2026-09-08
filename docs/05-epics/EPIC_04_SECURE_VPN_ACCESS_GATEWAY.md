# Epic 4: Secure VPN Access Gateway

### Epic: Cổng Kết nối Mạng Riêng Ảo An toàn (Secure VPN Access Gateway)

---

#### Story US-04.01: Là một chuyên viên kiểm thử xâm nhập (Pentester) sử dụng máy thật cá nhân (Kali Linux / Parrot OS), tôi muốn tải file cấu hình VPN (WireGuard hoặc OpenVPN) cá nhân hóa chỉ với 1 click, để tôi có thể kết nối máy trạm của mình trực tiếp vào dải mạng phòng lab và truy cập máy mục tiêu bằng các công cụ chuyên sâu trên máy thật.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Hỗ trợ ưu tiên giao thức WireGuard (tốc độ cao, độ trễ thấp, kết nối tức thì) và hỗ trợ dự phòng OpenVPN (.ovpn).
  - Tự động sinh cặp khóa WireGuard duy nhất (Private Key & Public Key) cho từng tài khoản; Private Key chỉ cho phép tải về một lần hoặc tải file `.conf` đã tích hợp đầy đủ thông tin.
  - Toàn bộ dải IP cấp cho VPN Client và Máy lab mục tiêu phải nằm trên subnet chuyên dụng `100.64.0.0/10` (RFC 6598 - CGNAT) để triệt tiêu hoàn toàn khả năng xung đột bảng định tuyến (Route Conflict) với dải mạng LAN gia đình, trường học hoặc văn phòng công ty (`192.168.0.0/16`, `10.0.0.0/8`, `172.16.0.0/12`).
  - Cho phép người dùng bấm nút "Regenerate VPN Keys" khi nghi ngờ lộ khóa, hệ thống sẽ thu hồi (revoke) ngay lập tức khóa cũ và tạo bộ cấu hình mới.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Tạo và tải về cấu hình WireGuard cá nhân hóa):**
    - **Given** Học viên đã đăng nhập và truy cập vào trang quản lý kết nối `/access/vpn`.
    - **When** Học viên chọn tab "WireGuard" và nhấn nút "Download Configuration".
    - **Then** Trình duyệt tự động tải xuống tệp tin cấu hình chuẩn `cyberforce-[username].conf`.
    - **And** Nội dung tệp chứa địa chỉ IP gán cho client thuộc dải `100.64.x.x/10`, thông tin Endpoint máy chủ VPN của CyberForce và dải định tuyến được phép (AllowedIPs = `100.64.0.0/10`).
    - **And** Giao diện hiển thị hướng dẫn 3 bước ngắn gọn về cách kích hoạt bằng lệnh `wg-quick up`.
  - **Scenario 2 (Ngoại lệ - Thu hồi khóa cũ khi bấm "Regenerate Keys"):**
    - **Given** Học viên đang có một kết nối WireGuard đang hoạt động từ máy cá nhân bằng cấu hình cũ.
    - **When** Học viên nhấn nút "Regenerate VPN Keys" trên trang web và xác nhận cảnh báo.
    - **Then** Gateway VPN của CyberForce lập tức gỡ bỏ Public Key cũ khỏi danh sách Peers của WireGuard interface.
    - **And** Kết nối VPN cũ trên máy cá nhân của học viên bị mất phiên ngay tức khắc.
    - **And** Hệ thống sinh tệp cấu hình mới sẵn sàng để học viên tải về thay thế.

---

#### Story US-04.02: Là một học viên kết nối VPN, tôi muốn giao diện web hiển thị huy hiệu trạng thái kết nối trực tiếp (Live Status Indicator) và công cụ kiểm tra thông mạng, để tôi biết chắc chắn máy tính của mình đã kết nối thành công vào lab trước khi bắt đầu bài tập.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Trạng thái kết nối VPN được cập nhật thời gian thực qua WebSocket từ Gateway về Web Client trong vòng tối đa 2 giây kể từ khi handshake thành công.
  - Các trạng thái hiển thị:
    + `Disconnected` (Chấm xám/đỏ): Chưa có kết nối.
    + `Connected` (Chấm xanh lá): Đã kết nối, hiển thị IP được cấp (ví dụ: `Connected (100.64.10.45)`).
  - Cung cấp nút tiện ích "Test Ping Target": Cho phép gửi ICMP Echo Request trực tiếp từ máy mục tiêu về IP của học viên để xác nhận thông luồng hai chiều.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Nhận diện kết nối VPN thành công trong thời gian thực):**
    - **Given** Học viên đang mở trang bài lab và huy hiệu VPN đang ở trạng thái `Disconnected`.
    - **When** Học viên chạy lệnh `sudo wg-quick up cyberforce-user.conf` trên terminal máy cá nhân.
    - **Then** Trong vòng $< 2$ giây, huy hiệu VPN trên thanh điều hướng tự động chuyển sang màu xanh lá và hiển thị: `Connected (100.64.10.45)`.
    - **And** Một thông báo dạng toast xuất hiện: "VPN Tunnel established! You can now access target machines".
  - **Scenario 2 (Ngoại lệ - Cảnh báo khi học viên thao tác ping thất bại):**
    - **Given** Học viên đã bật VPN nhưng cấu hình tường lửa cục bộ trên máy học viên chặn gói tin hoặc mạng công ty chặn cổng UDP 51820.
    - **When** Học viên nhấn nút "Test Ping Target" trên giao diện bài lab.
    - **Then** Sau 5 giây thử ping không nhận được gói phản hồi, hệ thống hiển thị thông báo chẩn đoán: "Ping failed! UDP port 51820 might be blocked by your network provider or firewall. Try switching to OpenVPN TCP mode".

---

#### Story US-04.03: Là một Quản trị viên An ninh Nền tảng, tôi muốn hệ thống cổng VPN áp dụng chính sách cô lập mạng đa người dùng (Client-to-Client Isolation) và chặn quét mạng ngoài (Anti-Pivot / Zero Egress), để bảo vệ an toàn cho các học viên khác và ngăn ngừa máy lab bị lợi dụng làm bàn đạp tấn công.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Tường lửa cấp Kernel (iptables / nftables / eBPF) trên VPN Gateway phải cưỡng chế chính sách cách ly tuyệt đối giữa các máy khách (Client-to-Client Isolation): Gói tin từ một VPN client gửi tới IP của bất kỳ VPN client nào khác sẽ bị drop ngay lập tức.
  - Mỗi VPN Client chỉ được phép giao tiếp duy nhất với địa chỉ IP của Máy mục tiêu (Target Machine) đang được cấp phát cho chính phiên làm việc của người dùng đó.
  - Cấm toàn bộ lưu lượng định tuyến ra ngoài Internet công cộng từ dải VPN (No Egress / Strict Routing).
  - Ghi nhận và kích hoạt cảnh báo an ninh tức thì nếu một IP phát sinh lưu lượng quét mạng bất thường (ví dụ: quét toàn bộ dải `/10` bằng Nmap).
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Học viên gửi lưu lượng tấn công hợp lệ tới máy mục tiêu của mình):**
    - **Given** Học viên đã kết nối VPN thành công và máy mục tiêu được cấp IP là `100.64.12.50`.
    - **When** Học viên thực hiện lệnh quét cổng `nmap -sS -p 80,443,22 100.64.12.50` từ máy cá nhân.
    - **Then** Toàn bộ gói tin đi qua tunnel VPN trơn tru và trả về kết quả dịch vụ chính xác trong vòng vài giây.
  - **Scenario 2 (Ngoại lệ - Ngăn chặn hành vi quét mạng máy của học viên khác):**
    - **Given** Học viên A đang kết nối VPN tại IP `100.64.10.15` và Học viên B đang kết nối tại IP `100.64.10.20`.
    - **When** Học viên A chạy lệnh tấn công hoặc quét cổng nhắm vào IP của Học viên B: `nmap 100.64.10.20`.
    - **Then** Tường lửa VPN Gateway tự động drop 100% các gói tin này; Học viên A nhận kết quả "Host unreachable".
    - **And** Hệ thống Security Monitor ghi nhận sự kiện vi phạm quy chế: `BLOCKED_CROSS_CLIENT_SCAN: Source=100.64.10.15, Target=100.64.10.20, Action=DROP`.
