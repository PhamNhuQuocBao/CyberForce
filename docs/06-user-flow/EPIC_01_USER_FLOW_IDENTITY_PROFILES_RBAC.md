# Epic 1: User Identity, Profiles & Granular RBAC
## Tài liệu Thiết kế Kiến trúc User Flow Chi tiết (User Journey & Experience Flows)

* **Hệ thống:** CyberForce Cyber Range & Practical Security Platform
* **Tài liệu tham chiếu:** [EPIC_01_USER_IDENTITY_PROFILES_RBAC.md](file:///home/quocbao/Documents/University/ChuyenDe4/CyberForge/docs/05-epics/EPIC_01_USER_IDENTITY_PROFILES_RBAC.md)
* **Vai trò phụ trách:** Product Designer (UX Architect)
* **Phiên bản:** 3.0 (Strict Separation: User Journey Focus)

---

## 📑 MỤC LỤC TỔNG QUAN CÁC TIỂU LUỒNG (USER FLOWS)

Toàn bộ trải nghiệm người dùng trong Epic 1 được thiết kế xoay quanh hành vi, cảm nhận và tương tác của người dùng:

- **MODULE 1: ĐĂNG KÝ, ĐĂNG NHẬP & BẢO VỆ TÀI KHOẢN (AUTHENTICATION & ACCOUNT SAFETY)**
  - [Sub-flow 1.1: Đăng ký & Đăng nhập 1-Click bằng GitHub / Google (US-01.01)](#sub-flow-11-đăng-ký--đăng-nhập-1-click-bằng-github--google-us-0101)
  - [Sub-flow 1.2: Xử lý Trùng Email & Liên kết Tài khoản - Account Linking (US-01.01)](#sub-flow-12-xử-lý-trùng-email--liên-kết-tài-khoản---account-linking-us-0101)
  - [Sub-flow 1.3: Đăng ký & Đăng nhập bằng Email/Mật khẩu truyền thống (US-01.02)](#sub-flow-13-đăng-ký--đăng-nhập-bằng-emailmật-khẩu-truyền-thống-us-0102)
  - [Sub-flow 1.4: Bảo vệ Tài khoản khi Đăng nhập Sai nhiều lần & Khóa Tạm thời (US-01.02)](#sub-flow-14-bảo-vệ-tài-khoản-khi-đăng-nhập-sai-nhiều-lần--khóa-tạm-thời-us-0102)
- **MODULE 2: HỒ SƠ NĂNG LỰC & QUYỀN RIÊNG TƯ (PROFILES & PRIVACY)**
  - [Sub-flow 2.1: Khám phá Hồ sơ Năng lực Công khai & Kiểm tra Chứng chỉ số (US-01.03)](#sub-flow-21-khám-phá-hồ-sơ-năng-lực-công-khai--kiểm-tra-chứng-chỉ-số-us-0103)
  - [Sub-flow 2.2: Quản lý Thiết lập Quyền riêng tư Hồ sơ (US-01.03)](#sub-flow-22-quản-lý-thiết-lập-quyền-riêng-tư-hồ-sơ-us-0103)
- **MODULE 3: PHÂN QUYỀN VAI TRÒ & XÉT DUYỆT CREATOR (ROLES & CREATOR WORKFLOW)**
  - [Sub-flow 3.1: Học viên Nộp đơn Đăng ký "Become a Creator" (US-01.04)](#sub-flow-31-học-viên-nộp-đơn-đăng-ký-become-a-creator-us-0104)
  - [Sub-flow 3.2: Quản trị viên Xét duyệt Đơn Quyền Creator (US-01.04)](#sub-flow-32-quản-trị-viên-xét-duyệt-đơn-quyền-creator-us-0104)
  - [Sub-flow 3.3: Phản hồi Trải nghiệm khi Truy cập Khu vực Bị giới hạn Quyền (US-01.04)](#sub-flow-33-phản-hồi-trải-nghiệm-khi-truy-cập-khu-vực-bị-giới-hạn-quyền-us-0104)

---

## I. NGUYÊN TẮC THIẾT KẾ TRẢI NGHIỆM (USER EXPERIENCE PRINCIPLES)

1. **Góc nhìn thuần túy Người dùng (User-First Perspective):**
   - Tài liệu mô tả: Người dùng thấy gì? Thao tác gì? Đưa ra lựa chọn nào? Nhận phản hồi gì? Đến màn hình nào tiếp theo?
   - Tuyệt đối không chứa chi tiết cài đặt kỹ thuật (Database, SQL, API endpoints, HTTP status codes, Token, Cookies, Hashing algorithms).
2. **Cơ chế "No Dead End" (Không màn hình bế tắc):**
   - Bất kỳ màn hình lỗi, cảnh báo hay trạng thái chờ nào cũng có nút thoát hiểm: *Thử lại, Đổi phương thức, Khôi phục, hoặc Quay về trang an toàn (Dashboard/Trang chủ)*.
3. **Bảo toàn Dữ liệu người dùng (Data Preservation):**
   - Khi mất mạng hoặc nhập thiếu thông tin, biểu mẫu không bị xóa trắng mà luôn giữ lại các giá trị đã nhập để người dùng không phải làm lại từ đầu.

---

## II. CHI TIẾT CÁC TIỂU LUỒNG USER FLOW (MERMAID FLOWCHARTS & MATRICES)

---

### Sub-flow 1.1: Đăng ký & Đăng nhập 1-Click bằng GitHub / Google (US-01.01)

Mô tả trải nghiệm của người dùng khi chọn phương thức đăng ký/đăng nhập nhanh thông qua tài khoản mạng xã hội.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_OAUTH(["Bắt đầu: Mở trang Đăng nhập hoặc Đăng ký"]):::startEnd --> P_AUTH_PAGE["Trang Đăng nhập hoặc Đăng ký"]:::page
    
    P_AUTH_PAGE --> ACT_CLICK_OAUTH["Người dùng chọn Continue with GitHub hoặc Google"]:::process
    ACT_CLICK_OAUTH --> P_PROVIDER_SCREEN["Màn hình Cấp quyền của Nhà cung cấp"]:::page

    P_PROVIDER_SCREEN --> D_OAUTH_ACTION{"Người dùng đưa ra quyết định?"}:::decision

    %% Cancel
    D_OAUTH_ACTION -- "Nhấn Hủy hoặc Từ chối cấp quyền" --> P_AUTH_CANCEL["Quay về Trang Đăng nhập<br>Thông báo: Bạn đã hủy liên kết với nhà cung cấp"]:::errorState
    P_AUTH_CANCEL --> |"Thử lại"| ACT_CLICK_OAUTH
    P_AUTH_CANCEL --> |"Dùng Email và Mật khẩu"| P_AUTH_PAGE

    %% Connection Lost
    D_OAUTH_ACTION -- "Mất kết nối mạng giữa chừng" --> P_OFFLINE_SCREEN["Màn hình thông báo mất kết nối Internet"]:::errorState
    P_OFFLINE_SCREEN --> |"Thử kết nối lại"| ACT_CLICK_OAUTH
    P_OFFLINE_SCREEN --> |"Về Trang chủ"| START_OAUTH

    %% Approve
    D_OAUTH_ACTION -- "Đồng ý cấp quyền" --> D_CHECK_ACCOUNT{"Tài khoản đã từng tồn tại trên hệ thống?"}:::decision

    %% Already Registered -> Jump to Linking
    D_CHECK_ACCOUNT -- "Đã có tài khoản trước đó" --> JUMP_LINKING[["Chuyển sang Sub-flow 1.2: Liên kết tài khoản"]]:::process

    %% New Account -> Onboard
    D_CHECK_ACCOUNT -- "Chưa có - Người dùng mới" --> ACT_CREATE_PROFILE["Tạo tài khoản học viên mới:<br>Cấp bậc: Novice, 0 EXP, Chuỗi học tập: 1 ngày"]:::process
    
    ACT_CREATE_PROFILE --> OUT_WELCOME(["Chuyển hướng vào Dashboard học tập<br>Hiển thị lời chào: Welcome to CyberForce!"]):::successState
```

#### Bảng State Transition Matrix (Sub-flow 1.1)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1.1.1** | Màn hình Đăng nhập / Đăng ký | Bấm nút "Continue with GitHub / Google" | Đã chọn nút hợp lệ | Màn hình cấp quyền của Google/GitHub | Có nút quay lại hoặc đóng cửa sổ xác thực |
| **1.1.2** | Màn hình cấp quyền Provider | Bấm "Hủy bỏ" hoặc từ chối cấp quyền | Người dùng không muốn chia sẻ thông tin | Quay về màn hình Đăng nhập với thông báo hủy | Nút "Thử lại" hoặc chọn phương thức nhập Email/Mật khẩu |
| **1.1.3** | Màn hình kết nối Provider | Mất tín hiệu mạng khi đang xác thực | Đường truyền Internet bị ngắt | Màn hình thông báo lỗi kết nối mạng | Nút "Thử lại kết nối" hoặc "Quay về Trang chủ" |
| **1.1.4** | Đang xử lý đăng nhập | Hoàn tất cấp quyền từ nhà cung cấp | Email chưa từng được đăng ký trước đây | Tạo hồ sơ học viên mới và đưa thẳng vào Dashboard | Vào học ngay lập tức, hiển thị lời chào mừng |
| **1.1.5** | Đang xử lý đăng nhập | Hoàn tất cấp quyền từ nhà cung cấp | Email đã từng được tạo qua phương thức khác | Màn hình hỏi liên kết tài khoản | Chuyển tiếp sang Sub-flow 1.2 |

---

### Sub-flow 1.2: Xử lý Trùng Email & Liên kết Tài khoản - Account Linking (US-01.01)

Bảo vệ người dùng khỏi nguy cơ bị chiếm quyền tài khoản khi đăng nhập bằng tài khoản mạng xã hội có email trùng với tài khoản đã có sẵn.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_LINK(["Phát hiện email đã có tài khoản sẵn"]):::startEnd --> P_LINKING_SCREEN["Màn hình Liên kết Tài khoản:<br>Email này đã được đăng ký trước đó, xác thực tài khoản gốc để liên kết"]:::page

    P_LINKING_SCREEN --> D_USER_CHOICE{"Người dùng lựa chọn phương án?"}:::decision

    %% Option Cancel
    D_USER_CHOICE -- "Không muốn liên kết hoặc Hủy" --> P_CANCELLED["Hủy phiên liên kết an toàn<br>Quay lại Trang Đăng nhập"]:::page

    %% Option 1: Password
    D_USER_CHOICE -- "Nhập mật khẩu tài khoản gốc" --> P_ENTER_PASS["Màn hình nhập mật khẩu hiện tại"]:::page
    P_ENTER_PASS --> D_CHECK_PASS{"Mật khẩu đúng?"}:::decision

    D_CHECK_PASS -- "Mật khẩu không đúng" --> E_PASS_ERR["Thông báo: Mật khẩu không chính xác"]:::errorState
    E_PASS_ERR --> |"Thử nhập lại"| P_ENTER_PASS
    E_PASS_ERR --> |"Quên mật khẩu?"| P_FORGOT_PASS["Màn hình Khôi phục mật khẩu"]:::page
    E_PASS_ERR --> |"Hủy liên kết"| P_CANCELLED

    %% Option 2: OTP
    D_USER_CHOICE -- "Xác thực qua mã OTP gửi về Email" --> ACT_SEND_CODE["Hệ thống gửi mã xác nhận 6 số về Email"]:::process
    ACT_SEND_CODE --> P_ENTER_OTP["Màn hình nhập mã xác nhận - Thời hạn 5 phút"]:::page
    P_ENTER_OTP --> D_CHECK_CODE{"Mã xác nhận đúng?"}:::decision

    D_CHECK_CODE -- "Mã sai hoặc hết hạn" --> E_CODE_ERR["Thông báo: Mã không đúng hoặc đã hết hạn"]:::errorState
    E_CODE_ERR --> |"Gửi lại mã mới"| ACT_SEND_CODE
    E_CODE_ERR --> |"Hủy liên kết"| P_CANCELLED

    %% Success
    D_CHECK_PASS -- "Mật khẩu chính xác" --> ACT_SUCCESS_LINK["Xác nhận liên kết danh tính thành công"]:::process
    D_CHECK_CODE -- "Mã xác nhận đúng" --> ACT_SUCCESS_LINK

    ACT_SUCCESS_LINK --> OUT_LINK_DONE(["Chuyển hướng vào Dashboard<br>Thông báo: Đã liên kết tài khoản thành công!"]):::successState
```

#### Bảng State Transition Matrix (Sub-flow 1.2)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1.2.1** | Màn hình Liên kết Tài khoản | Nhấn nút "Hủy liên kết" hoặc dấu X | Người dùng không muốn liên kết | Quay lại trang Đăng nhập | Không tạo dữ liệu rác, tài khoản cũ an toàn |
| **1.2.2** | Màn hình Liên kết Tài khoản | Chọn xác thực bằng Mật khẩu và nhập dữ liệu | Mật khẩu không trùng khớp | Thông báo lỗi đỏ dưới ô mật khẩu | Nút "Quên mật khẩu?" hoặc nút "Đổi sang nhận mã qua Email" |
| **1.2.3** | Màn hình Liên kết Tài khoản | Chọn nhận mã OTP qua Email | Đã bấm nút gửi mã | Màn hình nhập mã xác nhận | Nút "Gửi lại mã" sau 60 giây và nút quay lại |
| **1.2.4** | Màn hình nhập mã xác nhận | Nhập mã sai hoặc mã đã hết hạn | Mã không hợp lệ | Thông báo mã không đúng | Nút bấm "Gửi lại mã mới" |
| **1.2.5** | Màn hình nhập Mật khẩu / Mã OTP | Nhập chính xác Mật khẩu hoặc Mã xác nhận | Thông tin xác minh chuẩn xác | Đưa người dùng vào Dashboard học tập | Hiển thị thông báo liên kết thành công |

---

### Sub-flow 1.3: Đăng ký & Đăng nhập bằng Email/Mật khẩu truyền thống (US-01.02)

Quy trình nhập biểu mẫu truyền thống, hỗ trợ kiểm tra độ mạnh mật khẩu trực quan và tự động giữ lại thông tin khi gặp sự cố mạng.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_FORM(["Mở Form Đăng ký hoặc Đăng nhập"]):::startEnd --> P_INPUT_FIELDS["Nhập Email và Mật khẩu"]:::page

    P_INPUT_FIELDS --> D_PASS_RULES{"Mật khẩu đạt yêu cầu an toàn?<br>- Tối thiểu 8 ký tự<br>- Có chữ hoa, thường, số, ký tự đặc biệt"}:::decision

    %% Password Rules Not Met
    D_PASS_RULES -- "Chưa đủ điều kiện" --> P_SHOW_HINTS["Hiển thị gợi ý các tiêu chí còn thiếu bằng màu đỏ<br>Tạm thời khóa nút gửi"]:::errorState
    P_SHOW_HINTS --> |"Người dùng tiếp tục chỉnh sửa"| P_INPUT_FIELDS

    %% Password Rules Met
    D_PASS_RULES -- "Đạt chuẩn an toàn" --> ACT_ENABLE_BUTTON["Mở khóa nút Đăng ký hoặc Đăng nhập"]:::process
    ACT_ENABLE_BUTTON --> ACT_SUBMIT["Người dùng bấm nút Đăng ký hoặc Đăng nhập"]:::process

    %% Network Check
    ACT_SUBMIT --> D_CHECK_ONLINE{"Kiểm tra kết nối mạng?"}:::decision
    D_CHECK_ONLINE -- "Mất kết nối mạng" --> P_OFFLINE_FORM["Thông báo: Mất kết nối mạng, dữ liệu đã nhập được giữ nguyên"]:::errorState
    P_OFFLINE_FORM --> |"Thử gửi lại khi có mạng"| ACT_SUBMIT

    %% Credentials Check
    D_CHECK_ONLINE -- "Có kết nối bình thường" --> D_CHECK_MATCH{"Thông tin đăng nhập chính xác?"}:::decision

    %% Wrong Credentials -> Lockout Sub-flow
    D_CHECK_MATCH -- "Sai Email hoặc Mật khẩu" --> JUMP_LOCKOUT[["Chuyển sang Sub-flow 1.4: Xử lý đăng nhập sai"]]:::errorState

    %% Success
    D_CHECK_MATCH -- "Thông tin chính xác" --> OUT_LOGGED_IN(["Đăng nhập thành công<br>Chuyển hướng vào Dashboard học tập"]):::successState
```

#### Bảng State Transition Matrix (Sub-flow 1.3)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1.3.1** | Form Đăng ký / Đăng nhập | Gõ mật khẩu vào ô nhập liệu | Mật khẩu chưa đủ 8 ký tự hoặc thiếu ký tự đặc biệt | Bảng checklist hướng dẫn hiển thị màu đỏ; nút bấm bị khóa | Người dùng tiếp tục gõ trực tiếp trên màn hình, không bị mất dữ liệu |
| **1.3.2** | Form Đăng ký / Đăng nhập | Nhấn nút gửi biểu mẫu | Bị rớt mạng đột ngột | Thông báo mất kết nối, nút chuyển thành "Thử gửi lại" | Giữ nguyên toàn bộ nội dung đã nhập trong form |
| **1.3.3** | Form Đăng nhập | Nhấn nút gửi biểu mẫu | Email hoặc mật khẩu không khớp | Chuyển sang tiểu luồng cảnh báo số lần thử sai | Hiển thị số lần còn lại và link khôi phục |
| **1.3.4** | Form Đăng nhập | Nhấn nút gửi biểu mẫu | Thông tin đăng nhập hoàn toàn chính xác | Màn hình Dashboard học tập | Đăng nhập thành công, bắt đầu học |

---

### Sub-flow 1.4: Bảo vệ Tài khoản khi Đăng nhập Sai nhiều lần & Khóa Tạm thời (US-01.02)

Bảo vệ tài khoản khi có dấu hiệu đoán mò mật khẩu, thông báo rõ ràng thời gian chờ và cung cấp cách mở khóa khẩn cấp qua Email.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_FAIL(["Đăng nhập không thành công"]):::startEnd --> D_ATTEMPT_COUNT{"Số lần đăng nhập sai liên tiếp trong 60 giây?"}:::decision

    %% Under limit (1-4)
    D_ATTEMPT_COUNT -- "Lần thứ 1 đến lần thứ 4" --> P_WARN_RETRY["Thông báo: Email hoặc mật khẩu không đúng, còn X lần thử"]:::errorState
    P_WARN_RETRY --> |"Thử nhập lại"| P_RETRY_FORM["Quay lại Form Đăng nhập"]:::page
    P_WARN_RETRY --> |"Quên mật khẩu?"| P_RESET_PASS["Trang Yêu cầu Khôi phục Mật khẩu"]:::page

    %% Exceeded limit (5th)
    D_ATTEMPT_COUNT -- "Lần thứ 5 liên tiếp" --> ACT_LOCK_ACCOUNT["Hệ thống tạm khóa tính năng đăng nhập trong 15 phút<br>Tự động gửi email cảnh báo an toàn đến chủ tài khoản"]:::process
    
    ACT_LOCK_ACCOUNT --> P_LOCK_SCREEN["Màn hình Thông báo Khóa Tạm Thời:<br>Tài khoản tạm thời bị khóa trong 15 phút do nhập sai nhiều lần<br>Đồng hồ đếm ngược: 15:00"]:::errorState

    P_LOCK_SCREEN --> D_ESCAPE_LOCK{"Lựa chọn xử lý của người dùng?"}:::decision

    %% Choice 1: Wait
    D_ESCAPE_LOCK -- "Chờ hết thời gian 15 phút" --> ACT_AUTO_UNLOCK["Hết thời gian đếm ngược: Tự động mở khóa form"]:::process
    ACT_AUTO_UNLOCK --> P_RETRY_FORM

    %% Choice 2: Unlock via email
    D_ESCAPE_LOCK -- "Mở khóa ngay qua Email" --> ACT_SEND_LINK["Gửi thư xác thực khôi phục tài khoản về email"]:::process
    ACT_SEND_LINK --> P_CHECK_MAIL["Màn hình: Vui lòng kiểm tra hộp thư để mở khóa tài khoản"]:::page
    P_CHECK_MAIL --> |"Mở link trong thư"| P_NEW_PASS_SCREEN["Trang Đặt Mật Khẩu Mới"]:::page

    %% Choice 3: Home
    D_ESCAPE_LOCK -- "Về Trang chủ" --> OUT_GO_HOME(["Quay về Trang chủ xem nội dung giới thiệu"]):::startEnd
```

#### Bảng State Transition Matrix (Sub-flow 1.4)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1.4.1** | Màn hình Đăng nhập | Nhập sai thông tin lần 1 đến 4 | Số lần thất bại chưa vượt ngưỡng 5 lần | Cảnh báo số lần thử còn lại | Nút "Quên mật khẩu?" giúp tránh việc bị khóa |
| **1.4.2** | Màn hình Đăng nhập | Nhập sai thông tin lần thứ 5 | Vừa đạt đúng 5 lần sai liên tiếp | Chuyển ngay sang Màn hình Khóa Tạm Thời (15:00) | Gửi email thông báo cho chính chủ |
| **1.4.3** | Màn hình Khóa Tạm Thời | Chờ đợi bộ đếm lùi thời gian | Đồng hồ đếm ngược trở về `00:00` | Mở khóa lại Form đăng nhập bình thường | Người dùng thử lại được ngay sau khi hết giờ |
| **1.4.4** | Màn hình Khóa Tạm Thời | Nhấn "Mở khóa ngay qua Email" | Người dùng có quyền truy cập hòm thư | Màn hình thông báo đã gửi liên kết khôi phục | Đường link mở khóa lập tức và cho phép đổi mật khẩu |
| **1.4.5** | Màn hình Khóa Tạm Thời | Nhấn nút "Về Trang chủ" | Người dùng muốn thoát để làm việc khác | Trang chủ CyberForce | Người dùng không bị mắc kẹt trên màn hình lỗi |

---

### Sub-flow 2.1: Khám phá Hồ sơ Năng lực Công khai & Kiểm tra Chứng chỉ số (US-01.03)

Trải nghiệm của khách vãng lai hoặc nhà tuyển dụng khi xem trang thành tích của học viên và kiểm chứng năng lực thực tế.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_VISIT(["Truy cập đường dẫn hồ sơ học viên"]):::startEnd --> D_USER_FOUND{"Tên người dùng có tồn tại?"}:::decision

    %% User not found
    D_USER_FOUND -- "Không tìm thấy người dùng" --> P_NOT_FOUND["Màn hình: Không tìm thấy hồ sơ người dùng này"]:::errorState
    P_NOT_FOUND --> |"Gõ tên khác vào ô Tìm kiếm"| START_VISIT
    P_NOT_FOUND --> |"Xem Bảng xếp hạng"| P_LEADERBOARD["Trang Bảng Xếp Hạng Học Viên"]:::page
    P_NOT_FOUND --> |"Về Trang chủ"| P_HOME["Trang chủ CyberForce"]:::page

    %% Found User
    D_USER_FOUND -- "Tìm thấy người dùng" --> D_CHECK_PRIVACY{"Người dùng đang đặt chế độ hồ sơ?"}:::decision

    %% Private Profile
    D_CHECK_PRIVACY -- "Chế độ Riêng tư" --> JUMP_PRIVATE_FLOW[["Chuyển sang Sub-flow 2.2: Hồ sơ Riêng tư"]]:::errorState

    %% Public Profile
    D_CHECK_PRIVACY -- "Chế độ Công khai" --> P_PUBLIC_VIEW["Hiển thị Hồ sơ Năng lực Công khai:<br>Ảnh đại diện, Tên hiển thị, Cấp bậc, Tổng EXP, Chuỗi học tập<br>Biểu đồ Radar năng lực 8 trục<br>Danh sách Huy hiệu và Chứng chỉ đã đạt được<br>Ẩn hoàn toàn: Email cá nhân, Lịch sử nộp bài sai"]:::page

    P_PUBLIC_VIEW --> D_ACTION_ON_PROFILE{"Tương tác của người xem?"}:::decision

    %% Action 1: Share
    D_ACTION_ON_PROFILE -- "Sao chép liên kết hồ sơ" --> ACT_COPY["Sao chép link vào bộ nhớ tạm<br>Thông báo: Đã sao chép link để đính kèm CV!"]:::process
    ACT_COPY --> P_PUBLIC_VIEW

    %% Action 2: Inspect Badge
    D_ACTION_ON_PROFILE -- "Nhấp vào Huy hiệu bất kỳ" --> P_BADGE_POPUP["Cửa sổ nhỏ hiển thị điều kiện hoàn thành huy hiệu"]:::page
    P_BADGE_POPUP --> P_PUBLIC_VIEW

    %% Action 3: Inspect Certificate
    D_ACTION_ON_PROFILE -- "Nhấp vào Chứng chỉ Capstone" --> P_CERT_MODAL["Cửa sổ Chi tiết Chứng chỉ:<br>Tên bài thi tốt nghiệp, Ngày cấp, Mã chứng thực số"]:::page
    
    P_CERT_MODAL --> D_VERIFY_CHOICE{"Người xem bấm nút?"}:::decision
    D_VERIFY_CHOICE -- "Kiểm tra trên trang chứng thực độc lập" --> P_VERIFY_PAGE["Mở Trang Xác Minh Chứng Chỉ Toàn Nền Tảng"]:::page
    D_VERIFY_CHOICE -- "Đóng hoặc bấm ra ngoài" --> P_PUBLIC_VIEW
```

#### Bảng State Transition Matrix (Sub-flow 2.1)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2.1.1** | Đường dẫn `/user/[username]` | Truy cập link hồ sơ từ CV | Tên người dùng không có trên hệ thống | Màn hình thông báo không tìm thấy hồ sơ | Ô tìm kiếm học viên khác, nút xem Bảng xếp hạng, nút về Trang chủ |
| **2.1.2** | Đường dẫn `/user/[username]` | Truy cập link hồ sơ từ CV | Người dùng có tồn tại và đang bật chế độ Công khai | Màn hình Hồ sơ Năng lực hiển thị đầy đủ biểu đồ 8 trục | Tải nhanh, bảo mật các thông tin cá nhân |
| **2.1.3** | Màn hình Hồ sơ Công khai | Nhấn nút "Sao chép liên kết hồ sơ" | Trang đã nạp xong | Thông báo nhỏ: "Đã sao chép link để đính kèm CV" | Tiếp tục xem trang bình thường |
| **2.1.4** | Màn hình Hồ sơ Công khai | Bấm vào một Chứng chỉ Capstone | Người xem muốn kiểm chứng năng lực | Cửa sổ hiển thị thông tin và mã chứng thực số | Có nút đóng và nút kiểm tra độc lập |
| **2.1.5** | Cửa sổ Chứng chỉ Capstone | Bấm "Kiểm tra trên trang chứng thực độc lập" | Muốn xem trang thẩm định | Mở trang kiểm định chứng chỉ | Người tuyển dụng đối soát kết quả minh bạch |

---

### Sub-flow 2.2: Quản lý Thiết lập Quyền riêng tư Hồ sơ (US-01.03)

Học viên chủ động bảo vệ quyền riêng tư cá nhân và trải nghiệm lịch sự khi người khác truy cập hồ sơ đang bị ẩn.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    %% Branch 1: Owner changes settings
    START_CHANGE(["Học viên vào trang Cài đặt Bảo mật"]):::startEnd --> P_PRIVACY_SETTINGS["Trang Cài đặt Quyền riêng tư"]:::page
    P_PRIVACY_SETTINGS --> ACT_FLIP_SWITCH["Gạt công tắc: Công khai Hồ sơ cá nhân - Public Profile"]:::process
    ACT_FLIP_SWITCH --> P_SAVE_CONFIRM["Thông báo: Đã cập nhật chế độ riêng tư thành công!"]:::successState

    %% Branch 2: Accessing a private profile
    START_VIEW_PRIVATE(["Người khác truy cập link của người dùng đặt Riêng tư"]):::startEnd --> D_WHO_IS_VIEWING{"Người đang xem là ai?"}:::decision

    %% Owner viewing their own private profile
    D_WHO_IS_VIEWING -- "Chính chủ tài khoản đang đăng nhập" --> P_OWNER_VIEW["Xem hồ sơ kèm thanh nhắc nhở:<br>Hồ sơ của bạn đang ở chế độ Riêng tư"]:::page
    P_OWNER_VIEW --> |"Bật công khai ngay"| P_PRIVACY_SETTINGS

    %% Outsider viewing
    D_WHO_IS_VIEWING -- "Khách vãng lai hoặc Người dùng khác" --> P_PRIVATE_NOTICE["Màn hình Thông báo Lịch sự:<br>Hồ sơ này hiện đang được đặt ở chế độ Riêng tư<br>Ẩn toàn bộ điểm số, biểu đồ và huy hiệu"]:::errorState

    P_PRIVATE_NOTICE --> D_PRIVATE_NAV{"Người xem lựa chọn?"}:::decision
    D_PRIVATE_NAV -- "Khám phá các phòng Lab" --> P_EXPLORE_LABS["Trang Danh mục Bài tập Thực hành"]:::page
    D_PRIVATE_NAV -- "Đăng nhập nếu là chủ tài khoản" --> P_LOGIN_SCREEN["Trang Đăng nhập"]:::page
    D_PRIVATE_NAV -- "Về Trang chủ" --> P_HOME_SCREEN["Trang chủ CyberForce"]:::page
```

#### Bảng State Transition Matrix (Sub-flow 2.2)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **2.2.1** | Màn hình Cài đặt Bảo mật | Gạt nút Bật/Tắt chế độ công khai | Học viên muốn thay đổi quyền hiển thị | Thông báo cập nhật thành công | Có thể gạt đổi lại bất kỳ lúc nào |
| **2.2.2** | Link hồ sơ đang ở chế độ Riêng tư | Khách ngoài truy cập vào | Người dùng đang cài đặt chế độ Riêng tư | Màn hình thông báo hồ sơ đang ở chế độ riêng tư | Nút "Khám phá phòng Lab", nút "Đăng nhập", nút "Về Trang chủ" |
| **2.2.3** | Link hồ sơ đang ở chế độ Riêng tư | Chính chủ tài khoản xem hồ sơ của mình | Đang đăng nhập đúng tài khoản đó | Hiển thị hồ sơ kèm thanh nhắc nhở đang ẩn | Nút chuyển nhanh đến cài đặt để bật công khai lại nếu muốn |

---

### Sub-flow 3.1: Học viên Nộp đơn Đăng ký "Become a Creator" (US-01.04)

Quy trình nộp hồ sơ xin cấp quyền tác giả bài lab, có xác nhận khi thoát để tránh mất dữ liệu và hiển thị trạng thái chờ duyệt.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_APPLY(["Học viên tại Dashboard"]):::startEnd --> ACT_CLICK_BECOME["Nhấn vào mục Become a Creator trên thanh menu"]:::process
    ACT_CLICK_BECOME --> P_FORM_APPLY["Biểu mẫu Đăng ký Quyền Creator:<br>Giới thiệu kinh nghiệm chuyên môn<br>Đường link Portfolio, GitHub, Bài viết chia sẻ<br>Tải lên tệp đề cương bài Lab mẫu"]:::page

    P_FORM_APPLY --> D_FORM_INTERACTION{"Thao tác của học viên?"}:::decision

    %% Cancel midway
    D_FORM_INTERACTION -- "Hủy bỏ hoặc Quay lại" --> P_CONFIRM_DIALOG["Hộp thoại xác nhận:<br>Bạn có chắc muốn thoát? Dữ liệu đang điền sẽ không được lưu"]:::decision
    P_CONFIRM_DIALOG -- "Ở lại tiếp tục điền" --> P_FORM_APPLY
    P_CONFIRM_DIALOG -- "Đồng ý thoát" --> P_DASH_BACK["Quay về Dashboard an toàn"]:::page

    %% Submit Form
    D_FORM_INTERACTION -- "Nhấn nút Gửi đơn đăng ký" --> D_CHECK_INPUTS{"Đã điền đầy đủ các mục bắt buộc?"}:::decision

    D_CHECK_INPUTS -- "Còn thiếu thông tin hoặc tệp quá nặng" --> P_SHOW_FORM_ERRORS["Đánh dấu đỏ tại các ô chưa hợp lệ<br>Hiển thị câu nhắc nhở cụ thể"]:::errorState
    P_SHOW_FORM_ERRORS --> |"Bổ sung thông tin"| P_FORM_APPLY

    D_CHECK_INPUTS -- "Thông tin hợp lệ" --> D_CHECK_INTERNET{"Kiểm tra đường truyền mạng?"}:::decision
    D_CHECK_INTERNET -- "Mất mạng khi đang gửi" --> P_RETRY_SUBMIT["Thông báo: Lỗi đường truyền, biểu mẫu đã được lưu tạm"]:::errorState
    P_RETRY_SUBMIT --> |"Bấm thử gửi lại"| D_CHECK_INTERNET

    D_CHECK_INTERNET -- "Gửi thành công" --> P_SUBMIT_OK["Màn hình Thông báo:<br>Đơn đăng ký của bạn đã được gửi thành công và đang chờ xét duyệt!"]:::successState
    P_SUBMIT_OK --> |"Về Dashboard"| P_DASH_PENDING["Dashboard học viên hiển thị huy hiệu trạng thái: Creator Application Pending Review"]:::page
```

#### Bảng State Transition Matrix (Sub-flow 3.1)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **3.1.1** | Dashboard học viên | Bấm chọn "Become a Creator" | Tài khoản đang có vai trò học viên | Biểu mẫu nộp đơn xin cấp quyền Creator | Có nút Hủy để quay về Dashboard |
| **3.1.2** | Biểu mẫu Creator | Bấm "Hủy bỏ" khi đang điền dở | Đã có thông tin được nhập vào form | Hộp thoại xác nhận có chắc chắn muốn hủy | Cho phép chọn "Ở lại điền tiếp" hoặc "Thoát về Dashboard" |
| **3.1.3** | Biểu mẫu Creator | Bấm nút "Gửi đơn đăng ký" | Thiếu tệp đề cương mẫu hoặc bỏ trống link | Đánh dấu đỏ các mục còn thiếu | Giữ nguyên các nội dung khác đã điền |
| **3.1.4** | Biểu mẫu Creator | Bấm nút "Gửi đơn đăng ký" | Mất kết nối trong lúc tải tệp lên | Thông báo lỗi mạng và giữ lại bản nháp | Nút "Thử gửi lại" khi có mạng |
| **3.1.5** | Biểu mẫu Creator | Bấm nút "Gửi đơn đăng ký" | Đầy đủ thông tin và gửi thành công | Màn hình thông báo đơn đã được tiếp nhận | Nút "Về Dashboard"; Dashboard có bảng theo dõi tiến độ |

---

### Sub-flow 3.2: Quản trị viên Xét duyệt Đơn Quyền Creator (US-01.04)

Quy trình quản trị viên thẩm định hồ sơ bài giảng, phê duyệt hoặc từ chối kèm lời khuyên cải thiện cho học viên nộp lại.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_ADMIN(["Quản trị viên mở trang Quản lý Vai trò"]):::startEnd --> P_ADMIN_ROLE_LIST["Danh sách các đơn đăng ký đang chờ duyệt - Pending"]:::page

    P_ADMIN_ROLE_LIST --> ACT_OPEN_APP["Mở xem hồ sơ chi tiết của học viên"]:::process
    ACT_OPEN_APP --> P_APP_DETAIL["Cửa sổ thẩm định:<br>Xem thông tin chuyên môn, link portfolio và tải đề cương mẫu"]:::page

    P_APP_DETAIL --> D_ADMIN_VERDICT{"Quyết định xét duyệt của Quản trị viên?"}:::decision

    %% Reject Branch
    D_ADMIN_VERDICT -- "Từ chối yêu cầu" --> P_INPUT_REASON["Hộp thoại Nhập Lý do Từ chối:<br>Bắt buộc ghi rõ lý do và hướng dẫn học viên cải thiện nội dung"]:::page
    
    P_INPUT_REASON --> D_CONFIRM_REJECT{"Xác nhận từ chối?"}:::decision
    D_CONFIRM_REJECT -- "Bấm Hủy bỏ" --> P_APP_DETAIL
    D_CONFIRM_REJECT -- "Xác nhận gửi phản hồi" --> ACT_SEND_REJECT["Hệ thống cập nhật trạng thái Từ chối<br>Gửi thông báo và email kèm lời khuyên đến học viên"]:::process

    ACT_SEND_REJECT --> P_STUDENT_DASH_REJECTED["Dashboard học viên nhận thông báo:<br>Đơn đăng ký chưa được duyệt kèm nhận xét<br>Nút: Cải thiện hồ sơ và Nộp lại"]:::errorState
    P_STUDENT_DASH_REJECTED --> |"Bấm Nộp lại"| P_REFILL["Mở lại biểu mẫu với thông tin cũ để sửa nhanh"]:::page

    %% Approve Branch
    D_ADMIN_VERDICT -- "Phê duyệt yêu cầu" --> ACT_CONFIRM_APPROVE["Cập nhật tài khoản thành Creator<br>Gửi thông báo chúc mừng qua email và trên hệ thống"]:::process

    ACT_CONFIRM_APPROVE --> OUT_APPROVED(["Hoàn thành: Tài khoản trở thành Creator<br>Menu Lab Creator Studio xuất hiện trên thanh điều hướng"]):::successState
```

#### Bảng State Transition Matrix (Sub-flow 3.2)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **3.2.1** | Màn hình Quản lý Đơn duyệt | Bấm mở một đơn đăng ký | Đơn đang ở trạng thái chờ duyệt | Cửa sổ chi tiết bài nộp và thông tin học viên | Nút đóng để quay lại danh sách |
| **3.2.2** | Cửa sổ chi tiết bài nộp | Quản trị viên nhấn nút "Reject" | Hồ sơ chưa đạt yêu cầu | Hộp thoại yêu cầu nhập lý do từ chối | Nút "Hủy bỏ" nếu lỡ bấm nhầm |
| **3.2.3** | Hộp thoại lý do từ chối | Nhập lời nhận xét và bấm "Xác nhận" | Đã có nội dung hướng dẫn sửa | Cập nhật trạng thái từ chối và gửi tin nhắn cho học viên | Đơn được chuyển vào mục đã xử lý |
| **3.2.4** | Dashboard học viên bị từ chối | Học viên đọc nhận xét của Admin | Đơn bị từ chối | Hiển thị lời góp ý và nút "Cải thiện hồ sơ & Nộp lại" | Nút bấm mở lại form có sẵn dữ liệu cũ, không phải gõ lại |
| **3.2.5** | Cửa sổ chi tiết bài nộp | Quản trị viên nhấn nút "Approve" | Hồ sơ đạt chất lượng | Nâng quyền Creator, gửi email chúc mừng | Học viên thấy menu Studio xuất hiện để bắt đầu tạo lab |

---

### Sub-flow 3.3: Phản hồi Trải nghiệm khi Truy cập Khu vực Bị giới hạn Quyền (US-01.04)

Trải nghiệm thân thiện khi học viên vô tình hoặc cố ý truy cập vào các đường dẫn hoặc tính năng dành riêng cho Quản trị viên.

#### Sơ đồ Flowchart (Mermaid)

```mermaid
flowchart TD
    classDef startEnd fill:#0ea5e9,stroke:#0284c7,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef page fill:#1e293b,stroke:#475569,stroke-width:1.5px,color:#f8fafc;
    classDef decision fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#000000,font-weight:bold;
    classDef errorState fill:#ef4444,stroke:#dc2626,stroke-width:1.5px,color:#ffffff;
    classDef successState fill:#10b981,stroke:#059669,stroke-width:2px,color:#ffffff,font-weight:bold;
    classDef process fill:#334155,stroke:#64748b,stroke-width:1px,color:#f1f5f9;

    START_UNAUTHORIZED(["Người dùng truy cập vào liên kết Quản trị"]):::startEnd --> D_CHECK_USER_ROLE{"Tài khoản hiện tại có vai trò Quản trị viên?"}:::decision

    %% Has Role
    D_CHECK_USER_ROLE -- "Có quyền Quản trị viên" --> P_ADMIN_DASH["Mở Trang Quản trị bình thường"]:::page

    %% No Role
    D_CHECK_USER_ROLE -- "Không có quyền - Chỉ là Học viên" --> P_DENIED_SCREEN["Màn hình Thông báo Giới hạn Quyền:<br>Bạn không có quyền truy cập vào khu vực này.<br>Khu vực này chỉ dành riêng cho Ban Quản trị nền tảng"]:::errorState

    P_DENIED_SCREEN --> D_DENIED_ESCAPE{"Lựa chọn thoát của người dùng?"}:::decision

    D_DENIED_ESCAPE -- "Quay về Dashboard" --> P_SAFE_DASHBOARD["Trở về Dashboard học tập của học viên"]:::successState
    D_DENIED_ESCAPE -- "Đăng nhập tài khoản Quản trị" --> P_RELOGIN["Chuyển đến trang Đăng nhập để đổi tài khoản"]:::page
```

#### Bảng State Transition Matrix (Sub-flow 3.3)

| Bước | Màn hình / Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo | Cơ chế thoát hiểm (No Dead End) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **3.3.1** | Thanh địa chỉ trình duyệt | Truy cập đường dẫn quản trị | Đang đăng nhập tài khoản học viên bình thường | Màn hình thông báo giới hạn quyền truy cập | Có thông báo rõ ràng, không làm đơ ứng dụng |
| **3.3.2** | Màn hình Giới hạn Quyền | Nhấn nút "Quay về Dashboard" | Người dùng muốn quay về việc học tập | Trở về Dashboard học tập | Đưa người dùng về vùng an toàn ngay lập tức |
| **3.3.3** | Màn hình Giới hạn Quyền | Nhấn nút "Đăng nhập tài khoản khác" | Người dùng sở hữu tài khoản Admin khác | Chuyển về màn hình Đăng nhập | Cho phép đổi tài khoản để truy cập quyền quản trị |


