FROM alpine:3.21
RUN apk add --no-cache busybox-extras
COPY flag.txt /www/flag.txt
CMD ["httpd", "-f", "-p", "8080", "-h", "/www"]
