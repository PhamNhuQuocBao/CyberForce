# CF-402 — Cách ly mạng VPN và lab

## Mục tiêu

VPN client chỉ truy cập target của phiên lab đang chạy thuộc chính mình; mọi luồng client khác, lab khác và Internet đều bị chặn ở gateway. Máy lab vẫn không có egress Internet.

## Phương án đã duyệt và triển khai

1. Giữ mô hình Compose local hiện có. Gateway dùng iptables với `FORWARD` mặc định `DROP`, chỉ cho cặp IP peer → target đã được API Core xác thực theo chủ phiên; gói trả lời chỉ được qua khi thuộc kết nối hợp lệ. NAT chỉ áp dụng cho cặp này vì target trong Docker network `internal` không có route trả về dải VPN. Target nhìn thấy IP gateway trong lab subnet. Không mở forwarding chung cho toàn dải `100.64.0.0/10`.
2. Orchestrator gắn gateway vào Docker network `internal` của đúng instance khi cấp quyền và tháo khi stop/reaper. Gateway không nhận Docker socket. API Core đối chiếu `VpnPeer` với `LabInstance` đang `running`, chưa hết hạn, rồi đồng bộ policy theo spawn, gia hạn, tạo/cấp lại VPN config và khi mở trang VPN. Stop/reaper thu hồi policy trước khi tháo network. Lỗi cấp quyền khiến spawn dọn lab; nếu dọn thất bại, phiên chuyển `terminating` để reaper thử lại.
3. Ghi log kernel các gói bị chặn với giới hạn tần suất để hỗ trợ phát hiện quét mạng; không lưu nội dung gói. Chuẩn bị manifest Cilium theo cùng nguyên tắc cho môi trường Kubernetes sau này, ghi rõ Compose local không thực thi manifest này.
4. Kiểm thử bằng hai VPN client và hai target thật: chỉ cặp cùng phiên truy cập được; chéo client, chéo lab và Internet thất bại; thu hồi/restart xóa quyền; lab không ra Internet. Chạy Go/API tests, lint, typecheck và build liên quan.

## Quyết định phạm vi

- Dùng iptables thực thi ở gateway Compose local; Cilium YAML là tài liệu triển khai cho Kubernetes, chưa kích hoạt vì repo chưa có hạ tầng Cilium.
- Mở VPN chỉ tới target của phiên `running` thuộc user và tự thu hồi khi phiên kết thúc. Không mở quyền tới terminal, AttackBox, guacd, host hoặc dịch vụ Compose.

## Kiểm chứng

- Gateway Compose smoke healthy với `FORWARD DROP`, chain chỉ có log giới hạn và DROP khi chưa có grant.
- Hai client và hai lab thật: A→target A và B→target B ping thành công; A/B→target của nhau, A→peer B, lab→8.8.8.8, VPN→8.8.8.8, VPN→control API trên gateway và A→target A sau revoke đều thất bại.
- Gateway restart xóa mọi grant động; tunnel kết nối lại vẫn không tới target cho tới khi grant được cấp lại. Sau cấp lại, A→target A thành công.
- Orchestrator Docker smoke spawn lab, gắn gateway đúng network nội bộ, stop tháo gateway và dọn network thành công.
- API 116/116 tests, Go gateway/orchestrator tests, API và Web lint/typecheck/build, Compose config qua. Trang VPN đã cập nhật hướng dẫn phạm vi truy cập.

## Vận hành và giới hạn

- Chỉ áp dụng trong Compose local; không thay iptables host hay triển khai production. `infra/wireguard/cilium-policy.yaml` là template tham khảo, chưa được Cilium thực thi.
- Grant chỉ giữ trong bộ nhớ gateway và có hạn bằng lease lab. Gateway restart đóng mọi route; API đồng bộ lại khi học viên xem trạng thái VPN, tạo/cấp lại config hoặc thao tác với lab. WireGuard có thể cần bắt tay lại sau restart.
- Kernel ghi `CF_VPN_BLOCKED` với tối đa 6 log/phút, burst 10. Chưa có pipeline cảnh báo bảo mật tập trung; cần triển khai riêng để đáp ứng phần cảnh báo tức thì của US-04.03.
- Chưa đo throughput/latency dưới tải và chưa kiểm thử môi trường nhiều host/Kubernetes.
