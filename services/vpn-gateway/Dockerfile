FROM golang:1.24-alpine AS build
WORKDIR /src
COPY services/vpn-gateway/go.mod ./
COPY services/vpn-gateway/*.go ./
RUN CGO_ENABLED=0 go build -trimpath -o /vpn-gateway .

FROM alpine:3.21
RUN apk add --no-cache iproute2 wireguard-tools iptables
COPY --from=build /vpn-gateway /usr/local/bin/vpn-gateway
COPY infra/wireguard/setup-iptables.sh /usr/local/bin/setup-iptables.sh
EXPOSE 51820/udp 8082/tcp
ENTRYPOINT ["/usr/local/bin/vpn-gateway"]
