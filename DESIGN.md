---
name: CyberForce Modern Minimal — Navy & Electric Lime
version: 3.0.0
description: Approved redesign direction; frontend migration is not implemented in this documentation delivery.
colors:
  primary: "#A3EA2A"
  primary-foreground: "#151C2B"
  primary-hover: "#92D323"
  primary-active: "#80BC1D"
  primary-subtle: "#EFFBDD"
  secondary: "#212C42"
  secondary-foreground: "#F9F9FB"
  secondary-hover: "#2B3852"
  accent: "#1550F5"
  accent-foreground: "#FFFFFF"
  background: "#F9F9FB"
  surface: "#FFFFFF"
  surface-muted: "#EEEFF2"
  foreground: "#182031"
  muted-foreground: "#596579"
  subtle-foreground: "#727C92"
  border: "#DFE3E9"
  control-border: "#727C92"
  input: "#FFFFFF"
  ring: "#1550F5"
  link: "#1550F5"
  link-hover: "#103BC0"
  disabled-background: "#E5E7EB"
  disabled-foreground: "#6B7280"
  success: "#15803D"
  success-background: "#DCFCE7"
  success-foreground: "#166534"
  warning: "#B45309"
  warning-background: "#FEF3C7"
  warning-foreground: "#92400E"
  error: "#DC2626"
  error-background: "#FEE2E2"
  error-foreground: "#991B1B"
  info: "#1550F5"
  info-background: "#EAF0FF"
  info-foreground: "#1E40AF"
  dark-background: "#151C2B"
  dark-surface: "#182031"
  dark-surface-muted: "#212C42"
  dark-surface-alt: "#182337"
  dark-surface-deep: "#091020"
  dark-surface-interactive: "#3E475A"
  dark-foreground: "#F9F9FB"
  dark-muted-foreground: "#B8C1D1"
  dark-border: "#344158"
  dark-control-border: "#B8C1D1"
  dark-input: "#212C42"
  dark-link: "#B8C1D1"
  dark-link-hover: "#F9F9FB"
  dark-ring: "#A3EA2A"
  dark-disabled-background: "#212C42"
  dark-disabled-foreground: "#B8C1D1"
  dark-success: "#86EFAC"
  dark-warning: "#FCD34D"
  dark-error: "#FCA5A5"
  dark-info: "#93C5FD"
typography:
  headline-display: { fontFamily: Inter, fontSize: 48px, fontWeight: 600, lineHeight: 1.15, letterSpacing: -0.03em }
  headline-lg: { fontFamily: Inter, fontSize: 32px, fontWeight: 600, lineHeight: 1.25, letterSpacing: -0.02em }
  headline-md: { fontFamily: Inter, fontSize: 24px, fontWeight: 600, lineHeight: 1.3, letterSpacing: -0.01em }
  headline-sm: { fontFamily: Inter, fontSize: 20px, fontWeight: 600, lineHeight: 1.4 }
  body-lg: { fontFamily: Inter, fontSize: 18px, fontWeight: 400, lineHeight: 1.6 }
  body-md: { fontFamily: Inter, fontSize: 16px, fontWeight: 400, lineHeight: 1.6 }
  body-sm: { fontFamily: Inter, fontSize: 14px, fontWeight: 400, lineHeight: 1.5 }
  label-md: { fontFamily: Inter, fontSize: 14px, fontWeight: 500, lineHeight: 1.4 }
  label-sm: { fontFamily: Inter, fontSize: 12px, fontWeight: 500, lineHeight: 1.5 }
  code-md: { fontFamily: JetBrains Mono, fontSize: 14px, fontWeight: 400, lineHeight: 1.6 }
rounded:
  none: 0px
  control: 4px
  panel: 8px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  section: 48px
  marketing: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label-md}"
    rounded: "{rounded.control}"
    height: 44px
    padding: 16px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.primary-foreground}"
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.primary-foreground}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    height: 44px
  button-secondary-dark:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
  button-disabled:
    backgroundColor: "{colors.disabled-background}"
    textColor: "{colors.disabled-foreground}"
  button-disabled-dark:
    backgroundColor: "{colors.dark-disabled-background}"
    textColor: "{colors.dark-disabled-foreground}"
  input:
    backgroundColor: "{colors.input}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    height: 44px
  input-dark:
    backgroundColor: "{colors.dark-input}"
    textColor: "{colors.dark-foreground}"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.panel}"
    padding: 24px
  panel-dark:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.dark-foreground}"
---

# CyberForce — Modern Minimal

## Overview

Hệ thống đào tạo an ninh mạng cho học viên, người thi đấu, giảng viên, quản trị viên và tổ chức. Phân cấp theo nhiệm vụ: học tiếp, thực hành, nộp bài, kiểm tra kết quả. Dùng typography và khoảng cách để làm rõ thông tin; màu chỉ hỗ trợ hành động hoặc trạng thái.

Nguồn màu là [cybersecurity-theme.md](docs/cybersecurity-theme.md). Người dùng đã duyệt light mặc định, dark mode, Inter + JetBrains Mono, workspace hai vùng và loại bỏ các hiệu ứng trang trí. Tài liệu này thay thế design system Neo-Brutalism v2. **Frontend hiện có chưa được chuyển sang v3.** Xem [wireframe](docs/07-wireframes/modern-minimal/README.md).

## Colors

Màu từ theme được giữ nguyên. `control-border` bổ sung để ranh giới input đủ rõ; `border` chỉ dùng phân cách trang trí. Link và focus trong dark mode dùng màu sáng từ palette thay vì dùng xanh dương tối trực tiếp trên navy. Các màu trạng thái dark sáng là token bổ sung cho chữ dễ đọc, không phải màu trích xuất từ ảnh nguồn.

| Vai trò | Light | Dark |
|---|---|---|
| Nền | background | dark-background |
| Bề mặt / bề mặt phụ | surface / surface-muted | dark-surface / dark-surface-muted |
| Chữ chính / phụ | foreground / muted-foreground | dark-foreground / dark-muted-foreground |
| Viền phân cách / input | border / control-border | dark-border / dark-control-border |
| Input | input | dark-input |
| Link / hover | link / link-hover | dark-link / dark-link-hover, luôn underline |
| Focus | ring | dark-ring |
| Disabled | disabled-background / disabled-foreground | dark-disabled-background / dark-disabled-foreground |
| CTA chính | primary + primary-foreground | Giữ cùng cặp màu |
| Thông báo trạng thái | Nền nhạt + foreground tương ứng | dark-surface + dark-success/warning/error/info |

`subtle-foreground` chỉ cho chi tiết không thiết yếu khi đã kiểm tra tương phản; placeholder dùng muted-foreground. Không dùng lime làm chữ nhỏ trên nền trắng. Không dùng màu để thay thế nhãn trạng thái. Không giả định token nguồn đều đạt tương phản ở mọi cặp nền/chữ.

## Typography

Inter cho chữ giao diện và nội dung, JetBrains Mono cho code/terminal/IP/flag. Font có bộ ký tự tiếng Việt, tự host khi triển khai. Không chuyển toàn bộ tiêu đề sang monospace hoặc uppercase.

Mobile: display 32 px, tiêu đề trang 28 px, tiêu đề vùng 20 px; body 16 px và nhãn 14 px. Text 12 px chỉ cho metadata phụ, không cho hướng dẫn hoặc lỗi. Số điểm/thời gian dùng tabular-nums. Đoạn đọc tối đa 65–72 ký tự mỗi dòng.

## Layout

Container trang 1280 px; auth 440 px; workspace tối đa 1600 px. Gutter 16/24/32 px theo kích thước. Khoảng cách nhóm 24–32 px; section 48 px; marketing 64 px. Không áp dụng khoảng trống marketing vào editor hay bảng quản trị.

Phòng lý thuyết có một vùng nhiệm vụ toàn chiều rộng, không có thanh máy hoặc terminal. Phòng thực hành từ 1024 px có bài học + câu hỏi 45%, thực hành 55%, co giãn tối thiểu 360 px mỗi vùng. Dưới ngưỡng này dùng tab, giữ phiên và nháp. Thông tin IP/timer/cảnh báo không nằm trong tab. Xem quy tắc responsive và navigation tại [FOUNDATION](docs/07-wireframes/modern-minimal/FOUNDATION.md).

## Elevation & Depth

Phân lớp bằng khoảng cách, viền 1 px và nền đặc. Không dùng bóng offset hoặc hiệu ứng nhấc card. Dialog dùng backdrop đặc bán trong suốt và viền; không blur/glass. Không dùng gradient, glow, lưới công nghệ hoặc hiệu ứng nền chuyển động.

## Shapes

Control 4 px, panel/dialog 8 px. Không pill hoặc badge trang trí. Avatar có thể tròn vì biểu thị danh tính, không áp dụng rounded-full cho nút, tag hoặc card. Giữ vùng chạm ít nhất 44 × 44 px.

## Components

- Button chính: lime với chữ navy; mỗi vùng tác vụ có một nút chính. Hover/active thay sắc độ, không dịch chuyển. Nút phụ nền trung tính có viền; destructive có nhãn rõ và chữ/màu error đạt tương phản trên nền tương ứng.
- Input: label luôn hiện, border dùng control-border, lỗi có mô tả. Focus ring 2 px, offset 2 px. Không dùng placeholder thay label.
- Dashboard: bọc riêng bốn nhóm Lộ trình của bạn, Thành tích gần đây, Tiến độ cá nhân và Năng lực đã tích lũy bằng panel nền surface, viền nhẹ, bo 8 px. Không bọc riêng mỗi dòng bên trong.
- Nhiệm vụ phòng học: mỗi task là một accordion chứa lý thuyết và câu hỏi; cuộn cả danh sách nhiệm vụ trong vùng bài học. Giữ nháp và trạng thái mở khi thu gọn/chuyển tab.
- Panel: chỉ nhóm nội dung có quan hệ, không bọc từng dòng thành thẻ. Bảng ưu tiên cho thông tin cần so sánh; hàng mobile có nhãn đầy đủ.
- Tabs: nhãn chữ với underline hoặc nét viền đánh dấu đang chọn; không tô lime cho cả thanh. Hỗ trợ phím mũi tên, focus độc lập selection.
- Status: chữ rõ ràng cạnh đối tượng; màu ngữ nghĩa hỗ trợ. Mất mạng và dữ liệu cũ có dấu thời gian. Thành công tại chỗ, không confetti/modal chúc mừng.
- Dialog: giữ cho hành động có hậu quả. Tiêu đề nêu hành động, nội dung nêu đối tượng và tác động, có hủy, focus trap và trả focus.
- Tiến độ: con số x/y task là thông tin chính; thanh ngang nhỏ tùy chọn kèm nhãn số. Không biến tiến độ thành phần trang trí lớn.
- Biểu đồ: radar có bảng EXP 8 trục; heatmap có giá trị số và chú giải, phân biệt thiếu dữ liệu. Không gradient CSS. Dark mode dùng nét/nhãn sáng, nền navy.
- Terminal: nền dark-surface-deep với dark-foreground, mã màu ANSI cần kiểm tra riêng. Không mô phỏng terminal giả trên trang chủ/auth.
- Liên kết sao chép: có phản hồi thành công/lỗi và khả năng chọn văn bản thủ công.

## Do's and Don'ts

Giữ đủ điều kiện tiên quyết, điểm bị trừ, thời hạn, trạng thái nộp, quyền riêng tư và thông tin xác thực. Nội dung tham khảo có thể thu gọn; thông tin quyết định hành động không bị giấu. Hỗ trợ reduced motion và bàn phím.

Không emoji, decorative badge/pill, linear/radial gradient, bóng cứng, chữ xoay, thông số giả, đoạn marketing sáo rỗng hoặc âm thanh tự phát. Huy hiệu thành tích nghiệp vụ vẫn được lưu và trình bày bằng tên/điều kiện/ngày đạt. Không bỏ xác nhận mất điểm hoặc mất dữ liệu để giảm số lần click.
