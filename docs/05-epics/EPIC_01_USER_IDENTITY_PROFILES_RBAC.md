# Epic 1: User Identity, Profiles & Granular RBAC

### Epic: Quản lý Định danh, Hồ sơ Năng lực Cá nhân & Phân quyền Người dùng (User Identity, Profiles & Granular RBAC)

---

#### Story US-01.01: Là một người dùng mới, tôi muốn đăng ký và đăng nhập 1-click thông qua GitHub hoặc Google OAuth2, để tôi có thể bắt đầu học tập và thực hành ngay lập tức mà không phải qua nhiều bước xác minh email phức tạp.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Hỗ trợ 2 nhà cung cấp định danh chính thống: GitHub và Google OAuth2.
  - Tự động gán vai trò mặc định là `Student`, cấp bậc ban đầu `Novice`, 0 EXP và khởi tạo chuỗi `Streak: 1 ngày`.
  - Nếu email từ OAuth provider đã tồn tại trên hệ thống thông qua phương thức đăng ký khác, hệ thống không được tự động gộp (merge) tài khoản để phòng chống chiếm quyền điều khiển tài khoản (Account Takeover), mà phải kích hoạt quy trình liên kết tài khoản thủ công (Account Linking Flow).
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Đăng ký mới lần đầu qua GitHub):**
    - **Given** Người dùng mới chưa từng có tài khoản tại CyberForce và đang ở trang `/register`.
    - **When** Người dùng nhấn nút "Continue with GitHub" và cấp quyền truy cập email, profile.
    - **Then** Hệ thống tạo tài khoản mới trong cơ sở dữ liệu với vai trò `Student`.
    - **And** Khởi tạo hồ sơ học viên với Rank: `Novice`, EXP: `0`, Streak: `1`.
    - **And** Trả về mã JWT hợp lệ, tự động đăng nhập và điều hướng người dùng tới `/dashboard` với thông điệp chào mừng "Welcome to CyberForce!".
  - **Scenario 2 (Ngoại lệ - Xử lý trùng email giữa các OAuth Provider):**
    - **Given** Người dùng đã có tài khoản liên kết email `quocbao@example.com` tạo qua Google OAuth.
    - **When** Người dùng nhấn "Continue with GitHub" và GitHub trả về cùng địa chỉ email `quocbao@example.com`.
    - **Then** Hệ thống từ chối tự động đăng nhập và không ghi đè định danh.
    - **And** Hiển thị màn hình thông báo "Email already registered via Google. Please authenticate with your existing account to link GitHub identity".
    - **And** Sau khi người dùng xác thực thành công tài khoản hiện có (nhập mật khẩu hoặc OTP gửi về email), định danh GitHub mới được liên kết vào User ID hiện hành.

---

#### Story US-01.02: Là một người dùng, tôi muốn đăng ký và đăng nhập bằng Email và Mật khẩu truyền thống kèm mã xác thực an toàn, để tôi vẫn có thể tham gia nền tảng ngay cả khi không muốn sử dụng tài khoản mạng xã hội bên thứ ba.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Mật khẩu phải có độ dài tối thiểu 8 ký tự, bao gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt.
  - Mật khẩu phải được băm an toàn bằng thuật toán Argon2id hoặc bcrypt (work factor $\ge 12$).
  - Áp dụng cơ chế Rate Limiting: Cho phép tối đa 5 lần thử sai trong vòng 60 giây; nếu vượt quá sẽ khóa tạm thời quyền đăng nhập từ IP/tài khoản đó trong 15 phút.
  - Sử dụng chuẩn JWT với Access Token (hạn 15 phút) và Refresh Token xoay vòng (hạn 7 ngày) lưu trong HttpOnly, Secure Cookie.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Đăng nhập tài khoản bằng Email/Password hợp lệ):**
    - **Given** Người dùng đã kích hoạt tài khoản có email `user@cyberforce.io` và mật khẩu đã lưu trong hệ thống.
    - **When** Người dùng nhập đúng email, mật khẩu tại trang `/login` và nhấn nút "Sign In".
    - **Then** Hệ thống xác thực danh tính thành công và sinh cặp Access Token (15m) cùng Refresh Token (7d).
    - **And** Đặt Refresh Token vào HttpOnly Cookie và chuyển hướng người dùng vào giao diện học tập.
  - **Scenario 2 (Thất bại - Nhập sai mật khẩu liên tiếp quá số lần cho phép):**
    - **Given** Người dùng đang ở màn hình đăng nhập `/login`.
    - **When** Người dùng nhập sai mật khẩu lần thứ 5 liên tiếp trong vòng 60 giây.
    - **Then** Hệ thống từ chối đăng nhập và hiển thị thông báo lỗi: "Too many failed attempts. Your account is temporarily locked for 15 minutes".
    - **And** Ghi nhận log bảo mật kèm địa chỉ IP client và gửi email cảnh báo đăng nhập bất thường cho chủ tài khoản.

---

#### Story US-01.03: Là một học viên, tôi muốn có trang hồ sơ cá nhân công khai (Public Profile) hiển thị thành tích, cấp bậc, huy hiệu và biểu đồ năng lực 8 trục, để tôi có thể chia sẻ đường dẫn vào CV hoặc gửi cho nhà tuyển dụng để chứng minh năng lực thực tế.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Hồ sơ công khai hiển thị tại đường dẫn `/user/[username]`.
  - Mặc định người dùng có thể bật hoặc tắt tùy chọn `Public Profile` trong phần cài đặt bảo mật cá nhân.
  - Khi ở chế độ Public: Hiển thị Avatar, Username, Rank Tier, Tổng EXP, Chuỗi Streak hiện tại, Biểu đồ Radar 8 trục, Danh sách Huy hiệu (Badges) và Danh sách Chứng chỉ Capstone đã đạt được kèm liên kết xác thực.
  - Tuyệt đối không để lộ thông tin nhạy cảm: Email cá nhân, Lịch sử nộp cờ lỗi, IP kết nối VPN hay thông tin thanh toán.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Khách vãng lai xem hồ sơ công khai của học viên):**
    - **Given** Học viên `quocbao` đã bật tính năng "Public Profile" trong cài đặt tài khoản.
    - **When** Một nhà tuyển dụng chưa đăng nhập truy cập vào đường dẫn `https://cyberforce.io/user/quocbao`.
    - **Then** Trang web tải nhanh ($< 1$ giây) hiển thị chính xác tên, ảnh đại diện, danh hiệu `Hacker` và tổng số `12,450 EXP`.
    - **And** Hiển thị Biểu đồ Radar kỹ năng 8 trục trực quan cùng danh sách các huy hiệu và chứng chỉ số có thể click để kiểm tra.
  - **Scenario 2 (Ngoại lệ - Truy cập hồ sơ của người dùng đặt chế độ Riêng tư):**
    - **Given** Người dùng `hidden_user` đã tắt tùy chọn "Public Profile" (chế độ Private).
    - **When** Khách truy cập vào đường dẫn `/user/hidden_user`.
    - **Then** Hệ thống không hiển thị thông tin điểm số, huy hiệu hay biểu đồ radar.
    - **And** Hiển thị giao diện thông báo "This profile is private" kèm mã phản hồi HTTP 404 hoặc 403 phù hợp.

---

#### Story US-01.04: Là một Quản trị viên (Admin), tôi muốn quản lý phân quyền người dùng theo vai trò (RBAC) và xét duyệt các yêu cầu cấp quyền Creator/Instructor, để kiểm soát chất lượng nội dung bài lab và tránh việc tùy tiện khởi tạo máy ảo gây quá tải hạ tầng.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Hệ thống gồm các vai trò cố định: `Student` (mặc định), `Creator` / `Instructor`, `Admin`.
  - Học viên muốn trở thành Creator phải nộp hồ sơ đăng ký qua biểu mẫu "Become a Creator".
  - Chỉ tài khoản có vai trò `Admin` mới có quyền truy cập menu `/admin/roles` để phê duyệt (Approve) hoặc từ chối (Reject) yêu cầu.
  - Mọi thao tác thay đổi phân quyền phải được ghi lại trong bảng Audit Log hệ thống.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Admin phê duyệt yêu cầu trở thành Creator):**
    - **Given** Học viên `instructor_viet` đã nộp yêu cầu xin quyền Creator và trạng thái yêu cầu là `PENDING`.
    - **When** Admin đăng nhập vào Dashboard, mở mục "Role Requests" và nhấn nút "Approve" cho `instructor_viet`.
    - **Then** Vai trò của tài khoản `instructor_viet` được cập nhật thành `Creator` trong cơ sở dữ liệu.
    - **And** Hệ thống gửi thông báo và email chúc mừng đến người dùng, kích hoạt menu "Lab Creator Studio" trên thanh điều hướng của họ.
    - **And** Ghi log kiểm toán: `ADMIN_ROLE_CHANGE: Target=instructor_viet, NewRole=Creator, By=admin_user`.
  - **Scenario 2 (Thất bại / Ngoại lệ - Người dùng không có quyền cố tình gọi API nâng quyền):**
    - **Given** Người dùng chỉ có vai trò `Student`.
    - **When** Người dùng gửi trực tiếp request `POST /api/v1/admin/users/assign-role` bằng Postman hoặc curl.
    - **Then** Hệ thống API Gateway chặn request và trả về mã lỗi `403 Forbidden`.
    - **And** Phản hồi thông báo JSON: `{"error": "Access denied. Required role: Admin"}`.
