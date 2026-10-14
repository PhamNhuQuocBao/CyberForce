#!/bin/sh
set -eu

: "${VNC_PASSWORD:?VNC_PASSWORD is required}"
umask 077
mkdir -p "$HOME/.vnc"
mkdir -p "$HOME/.config/autostart"
printf '[Desktop Entry]\nType=Application\nName=Screensaver\nHidden=true\n' \
  > "$HOME/.config/autostart/xfce4-screensaver.desktop"
printf '%s\n' "$VNC_PASSWORD" | tigervncpasswd -f > "$HOME/.vnc/passwd"
unset VNC_PASSWORD

Xtigervnc :1 -geometry 1280x800 -depth 24 -rfbport 5900 \
  -localhost=0 -SecurityTypes=VncAuth -PasswordFile "$HOME/.vnc/passwd" \
  -AlwaysShared=1 -AcceptSetDesktopSize=1 -nolisten tcp &
vnc_pid=$!
trap 'kill "$vnc_pid" 2>/dev/null || true' TERM INT
for _ in 1 2 3 4 5 6 7 8 9 10; do
  [ -S /tmp/.X11-unix/X1 ] && break
  sleep 1
done
xset -display :1 s off -dpms
dbus-launch --exit-with-session startxfce4 >/tmp/xfce.log 2>&1 &
vncconfig -nowin >/tmp/vncconfig.log 2>&1 &
wait "$vnc_pid"
