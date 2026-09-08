# Prompt: Xây Dựng User Flow Chi Tiết (Product Designer / UX Architect)

[ROLE]
Bạn là Product Designer (UX Architect).

[TASK]
Dựa vào các User Stories và Acceptance Criteria (docs/05-epics/EPIC_01_USER_IDENTITY_PROFILES_RBAC.md), hãy dựng User Flow chi tiết từ điểm bắt đầu (Start) đến khi đạt mục tiêu (Outcome).

[CONSTRAINTS]
- Không chỉ vẽ luồng chính (Happy path), bắt buộc phải có các nhánh rẽ điều kiện (Decision nodes) cho luồng ngoại lệ (vd: mất mạng, nhập sai thông tin, hủy giữa chừng).
- Không để sót điểm nghẽn hoặc "dead end" (màn hình không có lối thoát).

[OUTPUT FORMAT]
1. Sơ đồ dạng **Mermaid.js flowchart** (để có thể render trực quan).
2. Bảng giải thích chi tiết các bước chuyển tiếp (State Transitions) và điểm người dùng tương tác:
   | Bước | Màn hình/Trạng thái | Hành động người dùng | Điều kiện kiểm tra | Màn hình tiếp theo |
