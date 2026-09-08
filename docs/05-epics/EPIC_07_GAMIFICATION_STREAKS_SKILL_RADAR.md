# Epic 7: Gamification, Streaks & 8-Axis Skill Radar

### Epic: Trò chơi hóa Học tập, Chuỗi Ngày Học Liên tục & Biểu đồ Năng lực 8 Trục Kỹ năng (Gamification, Streaks & 8-Axis Skill Radar)

---

#### Story US-07.01: Là một học viên, tôi muốn hệ thống ghi nhận chuỗi ngày học liên tục (Daily Streak) khi tôi hoàn thành ít nhất một bài tập mới trong ngày theo đúng múi giờ địa phương của tôi, để tôi duy trì thói quen học tập đều đặn và nhận các phần thưởng hệ số nhân điểm EXP.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Múi giờ chuẩn xác: Chu kỳ 1 ngày học được tính từ `00:00:00` đến `23:59:59` theo đúng Múi giờ địa phương (Local Timezone) đã lưu trong hồ sơ của học viên (mặc định lấy từ trình duyệt khi đăng nhập).
  - Tiêu chí tăng/giữ Streak: Chỉ được tính khi học viên giải thành công **ít nhất 01 Task mới lần đầu tiên** (chưa từng giải trước đó). Việc giải lại các Task cũ đã hoàn thành từ trước chỉ mang tính chất ôn tập và nhận EXP ôn tập, tuyệt đối không tính để duy trì chuỗi Streak.
  - Phần thưởng Streak:
    + Đạt chuỗi 7 ngày: Mở khóa huy hiệu "7-Day Warrior" và kích hoạt hệ số thưởng `1.2x EXP Multiplier` cho toàn bộ bài tập trong 24 giờ tiếp theo.
    + Đạt chuỗi 30 ngày: Mở khóa huy hiệu "Cyber Habit Master" và kích hoạt hệ số thưởng `1.5x EXP Multiplier` trong 48 giờ.
  - Đứt chuỗi Streak: Nếu trong ngày học viên không giải task mới nào trước 23:59:59, chuỗi Streak sẽ tự động quay về `0`.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Giải task mới trước 23:59 và thăng tiến chuỗi Streak lên 7 ngày):**
    - **Given** Học viên đang có chuỗi Streak 6 ngày và múi giờ tài khoản là `Asia/Ho_Chi_Minh` (GMT+7).
    - **When** Học viên hoàn thành và nộp đúng cờ của một Task mới vào lúc 22:30 tối cùng ngày.
    - **Then** Chuỗi Streak của học viên tự động tăng lên `7 ngày`.
    - **And** Giao diện kích hoạt popup chúc mừng mở khóa huy hiệu "7-Day Warrior".
    - **And** Biểu tượng lửa Streak bốc cháy kèm tag hiển thị trạng thái "1.2x EXP Active for 24 hours".
  - **Scenario 2 (Ngoại lệ - Học viên giải lại task cũ đã hoàn thành từ trước trong ngày):**
    - **Given** Học viên đang có chuỗi Streak 5 ngày và chưa giải bài mới nào trong ngày hôm nay.
    - **When** Học viên mở lại phòng lab đã giải tuần trước và nộp lại cờ của Task cũ đó.
    - **Then** Hệ thống thông báo nộp cờ đúng và chỉ cộng điểm EXP ôn tập.
    - **And** Số ngày Streak vẫn giữ nguyên ở mức 5 ngày và hiển thị lời nhắc nhở: "You solved a previously completed task! Solve at least 1 new task today before 23:59 to keep your streak burning".

---

#### Story US-07.02: Là một học viên, tôi muốn theo dõi sự phát triển năng lực của bản thân thông qua Biểu đồ Radar 8 trục chuyên môn bằng điểm tích lũy tuyệt đối và được cộng điểm song song khi giải bài tập đa kỹ năng, để tôi nhận biết rõ ràng thế mạnh và lỗ hổng kiến thức thực tế của mình.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Chuẩn hóa 8 trục năng lực an ninh mạng cốt lõi:
    1. `Web Application Security` (Bảo mật Ứng dụng Web)
    2. `Network Penetration Testing` (Kiểm thử Xâm nhập Mạng)
    3. `Binary Exploitation & Pwn` (Khai thác Lỗ hổng Phần mềm & Nhị phân)
    4. `Cryptography & PKI` (Mật mã học & Hạ tầng Khóa công khai)
    5. `Digital Forensics & Incident Response - DFIR` (Điều tra Số & Ứng cứu Sự cố)
    6. `Windows & Active Directory Attacks` (Tấn công Môi trường Doanh nghiệp AD/Windows)
    7. `Defensive & Blue Team / SOC` (Phòng thủ Mạng, Giám sát SOC & SIEM)
    8. `Cloud & DevSecOps` (An ninh Điện toán Đám mây & CI/CD)
  - Phương thức tính điểm: Áp dụng thang điểm tích lũy tuyệt đối (Absolute Cumulative EXP) để phản ánh trung thực tổng công sức người học đã bỏ ra trên từng mảng.
  - Cơ chế cộng điểm song song đa nhãn (Multi-Tag Parallel Scoring): Một bài tập/phòng lab mang nhiều nhãn kỹ năng sẽ được cộng điểm song song vào tất cả các trục tương ứng (ví dụ: Task "AWS AD Privilege Escalation" trị giá 100 EXP mang 2 tag "Cloud & DevSecOps" và "Windows & AD" $\rightarrow$ cả 2 trục trên biểu đồ đều được cộng thêm 100 điểm).
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Cộng điểm song song vào nhiều trục radar khi giải task tích hợp):**
    - **Given** Task "Kubernetes API Exploitation" (trị giá 150 EXP) được gắn 2 tag: `Cloud & DevSecOps` và `Network Penetration Testing`.
    - **And** Điểm hiện tại của học viên trên trục Cloud là 300 điểm và trục Network là 500 điểm.
    - **When** Học viên nộp cờ thành công Task này.
    - **Then** Điểm trục Cloud tăng lên 450 điểm và điểm trục Network tăng lên 650 điểm.
    - **And** Biểu đồ Radar 8 trục trên Dashboard và Public Profile tự động vẽ lại và mở rộng diện tích tương ứng ngay lập tức.
  - **Scenario 2 (Ngoại lệ - Task bài tập lý thuyết chung không gán tag chuyên môn):**
    - **Given** Task "Introduction to Cyber Ethics" không gắn nhãn nào trong 8 trục chuyên môn mà chỉ mang tag "General".
    - **When** Học viên hoàn thành và nộp bài Task này (+30 EXP).
    - **Then** Tổng điểm EXP tài khoản của học viên tăng thêm +30 điểm.
    - **And** Điểm số của cả 8 trục trên Biểu đồ Radar giữ nguyên không đổi và biểu đồ không bị lỗi tính toán (NaN / Null).

---

#### Story US-07.03: Là một học viên, tôi muốn hệ thống tự động thăng tiến cấp bậc (Rank Tier) và trao tặng các huy hiệu thành tích khi tôi đạt các cột mốc EXP và kỳ thi, để tôi cảm thấy được công nhận năng lực và tự tin thể hiện danh hiệu trước cộng đồng.
* **Business Rules (Ràng buộc nghiệp vụ):**
  - Thang cấp bậc chuẩn hóa theo mốc tổng EXP tích lũy:
    + `Novice`: $0 - 999\text{ EXP}$
    + `Script Kiddie`: $1,000 - 4,999\text{ EXP}$
    + `Hacker`: $5,000 - 14,999\text{ EXP}$
    + `Pro Hacker`: $15,000 - 34,999\text{ EXP}$
    + `Elite Hacker`: $35,000 - 69,999\text{ EXP}$
    + `Cyber Guru`: $\ge 70,000\text{ EXP}$
  - Quy tắc bất biến của cấp bậc: Cấp bậc chỉ thăng tiến, không bao giờ bị giáng cấp kể cả khi điểm số bị trừ do mở gợi ý hoặc phạt điểm tạm thời trong trận đấu KotH.
  - Tự động gán huy hiệu thành tích đặc biệt khi hoàn thành các thử thách đặc thù (ví dụ: "First Blood" cho người đầu tiên giải được đề trong CTF, "King of the Hill Champion" khi thắng giải đấu đối kháng, "Capstone Certified" khi thi đỗ kỳ thi khảo thí).
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công - Thăng cấp bậc khi vừa vượt ngưỡng điểm yêu cầu):**
    - **Given** Học viên đang có 4,950 EXP ở cấp bậc "Script Kiddie".
    - **When** Học viên hoàn thành một bài lab và nhận được +100 EXP (tổng điểm đạt 5,050 EXP).
    - **Then** Hệ thống tự động nâng cấp bậc của học viên lên "Hacker".
    - **And** Giao diện hiển thị hiệu ứng pháo hoa toàn màn hình kèm âm thanh vinh danh chúc mừng thăng hạng.
    - **And** Khung viền avatar và huy hiệu cấp bậc trên thanh điều hướng tự động chuyển đổi sang biểu tượng của "Hacker".
  - **Scenario 2 (Ngoại lệ - Trừ điểm do mở gợi ý không làm tụt cấp bậc của học viên):**
    - **Given** Học viên vừa thăng cấp lên "Hacker" với số điểm đúng 5,000 EXP.
    - **When** Học viên mở gợi ý Hint 2 của một câu hỏi khó và bị khấu trừ 20 EXP (điểm tạm thời giảm về 4,980 EXP).
    - **Then** Cấp bậc của học viên vẫn được duy trì là "Hacker".
    - **And** Hệ thống không hạ bậc của học viên về "Script Kiddie".
