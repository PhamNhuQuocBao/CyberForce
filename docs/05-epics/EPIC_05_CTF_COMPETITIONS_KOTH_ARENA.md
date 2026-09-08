# Epic 5: CTF Competitions & Real-Time King of the Hill (KotH) Arena

### Epic: Đấu trường Thi đấu CTF & Đấu trường Đối kháng Thời gian thực King of the Hill (CTF Competitions & Real-Time King of the Hill Arena)

---

#### Story US-05.01: Là một người chơi CTF đối kháng, tôi muốn tham gia phòng đấu King of the Hill (KotH) kéo dài 45 phút, khai thác leo quyền root trên máy chủ mục tiêu chung và ghi mã định danh cá nhân vào tệp `/root/king.txt`, để hệ thống tích lũy điểm thưởng cho tôi sau mỗi chu kỳ Tick 60 giây và vinh danh tôi trên bảng điểm trực tiếp.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Thời lượng trận đấu: Cố định 45 phút mỗi trận; phòng chơi gồm từ 4 đến 10 đấu thủ hoặc đội thi đấu.
  - Mục tiêu: Khai thác lỗ hổng bảo mật để chiếm quyền tối cao (`root`/`SYSTEM`) và ghi chính xác username của mình vào tệp `/root/king.txt`.
  - Bộ máy tính điểm thời gian thực (Tick Engine): Kích hoạt đều đặn mỗi 60 giây (1 Tick).
  - Điều kiện nhận điểm: Tại thời điểm chốt Tick, username trong `/root/king.txt` phải hợp lệ và các dịch vụ SLA trên máy chủ vẫn đang hoạt động $\rightarrow$ Người chơi nhận được `+10 điểm / Tick`.
  - Bảng điểm thời gian thực (Live Leaderboard) được phát sóng tới toàn bộ người chơi trong phòng qua WebSocket.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Chiếm giữ vị trí King và nhận điểm tích lũy theo chu kỳ Tick):**
    - **Given** Trận đấu KotH đang diễn ra (thời gian còn lại 20 phút) và đấu thủ `ZeroDay` đã chiếm được shell root trên máy chủ.
    - **When** `ZeroDay` thực hiện lệnh `echo "ZeroDay" > /root/king.txt` và đồng hồ Tick chạm mốc 60 giây.
    - **Then** Tick Engine đọc file, xác thực chuỗi "ZeroDay" khớp với người chơi đang tham gia trận đấu.
    - **And** Điểm của `ZeroDay` trên bảng xếp hạng trực tiếp tăng thêm `+10 điểm`.
    - **And** Toàn bộ giao diện phòng đấu phát hiệu ứng visual và âm thanh thông báo: "👑 ZeroDay has claimed the Hill!".
  - **Scenario 2 (Ngoại lệ - Không được cộng điểm do tên trong file king.txt không hợp lệ hoặc bị lỗi định dạng):**
    - **Given** Người chơi `Attacker1` thực hiện lệnh ghi chuỗi chứa ký tự lạ: `echo "Attacker1 extra characters" > /root/king.txt`.
    - **When** Đồng hồ Tick chạm mốc 60 giây.
    - **Then** Tick Engine kiểm tra nội dung file và phát hiện chuỗi không khớp hoàn toàn với bất kỳ username hợp lệ nào trong phòng thi.
    - **And** Không có đấu thủ nào được cộng điểm trong Tick đó; bảng điểm giữ nguyên trạng thái cũ.

---

#### Story US-05.02: Là một người tham gia đấu trường KotH, tôi muốn hệ thống có cơ chế kiểm tra SLA dịch vụ liên tục và tự động phục hồi máy chủ (Service Auto-Heal), để ngăn chặn các đối thủ chơi xấu cố tình tắt dịch vụ cốt lõi nhằm ngăn cản người khác tấn công.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Danh mục dịch vụ SLA (Service Level Agreement): Các cổng mạng và ứng dụng quy định trong đề bài (ví dụ: HTTP port 80, SSH port 22, MySQL port 3306) phải luôn ở trạng thái lắng nghe và phản hồi hợp lệ.
  - Daemon Arbiter kiểm tra trạng thái sức khỏe (Health Check) của các dịch vụ định kỳ mỗi 15 giây.
  - Nếu bất kỳ dịch vụ cốt lõi nào bị sập hoặc bị chặn bởi cấu hình tường lửa sai quy định:
    + Tick 60s tương ứng bị đánh dấu là `SLA FAILED` $\rightarrow$ Không một ai (kể cả King hiện tại) được cộng điểm trong Tick đó.
    + Cơ chế Service Auto-heal kích hoạt tự động cưỡng chế khởi động lại dịch vụ hoặc reset cấu hình firewall về mặc định trong vòng tối đa 15 giây.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Mọi dịch vụ chạy ổn định, điểm số được tính toán bình thường):**
    - **Given** Máy chủ KotH đang chạy và Daemon Arbiter kiểm tra tất cả các cổng 80, 22 đều phản hồi HTTP 200 / SSH banner hợp lệ.
    - **When** Đồng hồ Tick Engine kích hoạt mốc 60 giây.
    - **Then** Trạng thái SLA hiển thị màu xanh lá "All Services Operational (SLA 100%)".
    - **And** Người chơi đang giữ King nhận trọn vẹn điểm thưởng của Tick.
  - **Scenario 2 (Ngoại lệ - Dịch vụ bị sập do đối thủ tắt tiến trình và cơ chế Auto-heal kích hoạt):**
    - **Given** Người chơi A chiếm được root và cố tình chạy lệnh `systemctl stop apache2` để không ai khai thác lỗ hổng web được nữa.
    - **When** Daemon Arbiter quét thấy cổng 80 không phản hồi trong chu kỳ kiểm tra.
    - **Then** Bảng điều khiển trận đấu chuyển sang cảnh báo đỏ: "⚠️ SLA ALERT: HTTP Service is down! Tick points frozen".
    - **And** Cơ chế Auto-heal lập tức tự động can thiệp và kích hoạt lại Apache trong vòng 15 giây tiếp theo.
    - **And** Nếu đến mốc Tick mà dịch vụ chưa kịp phục hồi, người chơi A không được nhận điểm của chu kỳ này.

---

#### Story US-05.03: Là một Ban tổ chức giải đấu KotH, tôi muốn hệ thống tự động phát hiện và trừng phạt nghiêm khắc các hành vi phá hoại môi trường thi đấu (Anti-Sabotage Enforcement), để đảm bảo sân chơi công bằng, tôn trọng kỹ năng chuyên môn thay vì phá hoại hệ thống.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Các hành vi bị cấm tuyệt đối trong KotH Arena (Quy chế Phá hoại):
    1. Cấm xóa tệp nhị phân hệ thống cốt lõi (`rm -rf /bin`, `/sbin`, `/usr`).
    2. Cấm khóa file `/root/king.txt` bằng các thuộc tính bất biến (ví dụ: `chattr +i`, `chflags`).
    3. Cấm đổi mật khẩu root hoặc cài đặt rootkit làm sập toàn bộ OS (phải giữ tài khoản backdoors hoặc shell hợp lệ cho đối thủ khác tiếp tục khai thác).
    4. Cấm kích hoạt Fork-bomb hoặc làm tràn cạn kiệt tài nguyên máy chủ.
  - Chế tài xử lý vi phạm:
    + Cưỡng chế gỡ bỏ thuộc tính khóa file trong 15 giây.
    + Trừ điểm phạt của trận đấu hiện tại.
    + Tự động khóa tài khoản thi đấu (Block Account) trong 3 ngày đối với các hành vi cố tình phá hoại hạ tầng.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Người chơi thi đấu văn minh, duy trì quyền kiểm soát bằng kỹ năng phòng thủ hợp lệ):**
    - **Given** Người chơi chiếm quyền root và tiến hành vá các lỗ hổng trên mã nguồn ứng dụng web nhưng vẫn giữ nguyên quyền của file king.txt và các binary hệ thống.
    - **When** Daemon KotH Arbiter quét kiểm tra toàn vẹn định kỳ.
    - **Then** Không có vi phạm nào được ghi nhận và trận đấu tiếp diễn bình thường.
  - **Scenario 2 (Ngoại lệ - Phát hiện và trừng phạt hành vi khóa bất tử file king.txt bằng chattr):**
    - **Given** Người chơi `BadActor` chiếm root và chạy lệnh `chattr +i /root/king.txt` nhằm ngăn đối thủ khác ghi đè tên.
    - **When** Daemon Arbiter phát hiện thuộc tính bất biến trên tệp tin `king.txt`.
    - **Then** Daemon Arbiter tự động gỡ thuộc tính (`chattr -i`) và khôi phục quyền ghi cho tệp tin.
    - **And** Người chơi `BadActor` bị trừ 50 điểm trực tiếp trên bảng xếp hạng.
    - **And** Hệ thống gửi cảnh báo vi phạm; sau khi trận đấu kết thúc, tài khoản của `BadActor` tự động bị khóa quyền tham gia Arena trong 3 ngày kèm email thông báo lý do kỷ luật.

---

#### Story US-05.04: Là một thí sinh tham gia giải thi đấu Jeopardy CTF, tôi muốn hệ thống áp dụng cơ chế tính điểm suy giảm động (Dynamic Decay Scoring) và hỗ trợ đóng băng bảng xếp hạng trước giờ bế mạc, để phản ánh chính xác độ khó thực tế của thử thách và tạo sự kịch tính cho giải đấu.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Mỗi thử thách bắt đầu với số điểm ban đầu (Initial Points, ví dụ: 500 điểm) và giảm dần về điểm tối thiểu (Minimum Points, ví dụ: 100 điểm) theo hàm suy giảm số lượng người giải thành công (Solves Decay Function).
  - Khi có thêm một thí sinh giải thành công thử thách, điểm số của thử thách đó tự động giảm xuống và **hồi tố điểm số** cho tất cả các thí sinh đã giải được thử thách đó trước đây.
  - Hỗ trợ tính năng Đóng băng Bảng điểm (Scoreboard Freeze): Admin có thể cấu hình đóng băng bảng điểm công khai trước khi giải đấu kết thúc (ví dụ: trước 60 phút). Trong thời gian đóng băng, thí sinh vẫn nộp cờ và hệ thống vẫn chấm điểm ngầm, nhưng bảng điểm hiển thị công khai sẽ ngừng cập nhật để giữ bí mật kết quả đến phút chót.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Điểm thử thách suy giảm động và cập nhật hồi tố công bằng cho tất cả người giải):**
    - **Given** Thử thách "Kernel Exploit 01" ban đầu có giá trị 500 điểm và mới chỉ có 1 người giải được.
    - **When** Có thêm 9 thí sinh khác nộp đúng cờ của thử thách này (nâng tổng số lượt giải lên 10 người).
    - **Then** Công thức Dynamic Decay tự động tính lại điểm của thử thách giảm về mức 340 điểm.
    - **And** Điểm thưởng của cả 10 thí sinh đã giải câu này trên bảng xếp hạng đồng loạt được cập nhật về mức 340 điểm.
  - **Scenario 2 (Ngoại lệ - Nộp cờ trong giai đoạn đóng băng bảng xếp hạng Scoreboard Freeze):**
    - **Given** Ban tổ chức kích hoạt tính năng "Freeze Scoreboard" lúc 16:00 (giải kết thúc lúc 17:00).
    - **When** Thí sinh B nộp cờ thành công một bài 400 điểm vào lúc 16:30.
    - **Then** Giao diện cá nhân của Thí sinh B vẫn hiển thị thông báo "Flag Accepted! (Submitted during freeze period)".
    - **And** Cơ sở dữ liệu ghi nhận điểm ngầm cho Thí sinh B.
    - **And** Bảng xếp hạng công cộng hiển thị huy hiệu "Scoreboard is Frozen" và không thay đổi thứ hạng cho đến khi Admin bấm "Unfreeze" sau khi bế mạc.
