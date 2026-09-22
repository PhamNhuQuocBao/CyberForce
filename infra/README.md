# CyberForce Infrastructure & Local Deployment

Thư mục này chứa toàn bộ cấu hình hạ tầng cho môi trường phát triển cục bộ và production:
- `docker-compose.yml`: Cụm dịch vụ cục bộ (PostgreSQL, Redis, MinIO, Traefik).
- `traefik/`: Cấu hình Reverse Proxy, Ingress, SSL Termination và WebSocket routing.
- `wireguard/`: Cấu hình WireGuard VPN Gateway và firewall rules.
- `guacd/`: Cấu hình Apache Guacamole server daemon.
