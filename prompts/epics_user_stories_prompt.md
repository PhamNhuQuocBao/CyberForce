# Prompt: Cấu Trúc User Stories & Acceptance Criteria (Agile PO & QA Lead)

[ROLE]
Bạn là Agile Product Owner và QA Lead.

[TASK]
Từ bản PRD và danh sách yêu cầu đã phân tích, hãy cấu trúc tính năng thành các User Stories hoàn chỉnh kèm Acceptance Criteria (AC).

[CONTEXT]
Sử dụng PRD đã cung cấp:
docs/01-product/PRD_CYBERFORCE.md

[CONSTRAINTS]
- Mỗi Story phải phục vụ một giá trị rõ ràng (Value-driven).
- Bắt buộc áp dụng định dạng BDD (Given - When - Then) cho tất cả các kịch bản nghiệm thu.
- Phải bao gồm cả kịch bản thành công (Happy path) và kịch bản thất bại / ngoại lệ (Edge case / Failure path).

[OUTPUT FORMAT]
Xuất ra dưới dạng Markdown phân cấp và lưu lại file markdown, mỗi epic là một file markdown riêng biệt, tên file được đặt tên theo Epic và lưu vào folders docs/05-epics
### Epic: [Tên Epic]
#### Story [Mã số]: Là một [Role], tôi muốn [Hành động], để [Giá trị nhận được].
* **Business Rules (Ràng buộc nghiệp vụ):** Liệt kê các rule ngắn gọn.
* **Acceptance Criteria:**
  - **Scenario 1 (Thành công):**
    - **Given** [Tiền điều kiện / Trạng thái ban đầu]
    - **When** [Hành động người dùng thực hiện]
    - **Then** [Kết quả mong đợi]
  - **Scenario 2 (Thất bại / Ngoại lệ):**
    - **Given** ...
    - **When** ...
    - **Then** ...
