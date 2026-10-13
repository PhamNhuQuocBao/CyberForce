FROM golang:1.24-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -o /orchestrator ./cmd/server

FROM alpine:3.21
RUN addgroup -S app && adduser -S -G app app
COPY --from=build /orchestrator /usr/local/bin/orchestrator
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod 755 /usr/local/bin/entrypoint.sh
EXPOSE 8081
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
