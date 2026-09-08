# Prompt: Phân tích PRD (Senior Business Analyst & System Architect)

[ROLE]
Bạn là Senior Business Analyst và System Architect.

[TASK]
Phân tích bản PRD được cung cấp để:

1. Trích xuất các yêu cầu nghiệp vụ tường minh (Explicit) và phân tích các yêu cầu ngầm định (Implicit: bảo mật, scale, logging, xử lý ngoại lệ).
2. Thực hiện Gap Analysis: Chỉ ra các điểm thiếu thông tin, xung đột logic nghiệp vụ, hoặc các giả định nguy cơ cao (risky assumptions) mà PRD chưa giải quyết.

[CONTEXT]
Dưới đây là nội dung bản PRD của tôi:
docs/01-product/PRD_CYBERFORCE.md

[CONSTRAINTS]

- Bám sát (Grounding) tài liệu, không tự ý bịa đặt quyết định nghiệp vụ ngoài phạm vi PRD.
- Nếu thấy thông tin còn thiếu, phải đặt câu hỏi cần Human Approve (người quyết định phê duyệt).

[OUTPUT FORMAT]
Trả lời theo bảng Markdown gồm các cột:
| Mục | Loại yêu cầu (Explicit/Implicit/Gap) | Mô tả chi tiết | Rủi ro nếu bỏ qua | Đề xuất giải pháp / Câu hỏi cần chốt |
