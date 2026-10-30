FROM golang:1.24-alpine AS build
WORKDIR /src
COPY go.mod ./
COPY runner ./runner
RUN CGO_ENABLED=0 go build -trimpath -o /koth-runner ./runner

FROM alpine:3.21
RUN addgroup -S app && adduser -S -G app app
COPY --from=build /koth-runner /usr/local/bin/koth-runner
USER app
ENTRYPOINT ["/usr/local/bin/koth-runner"]
