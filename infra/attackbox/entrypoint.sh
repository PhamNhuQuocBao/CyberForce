#!/bin/sh
set -eu

: "${VNC_PASSWORD:?VNC_PASSWORD is required}"
umask 077
mkdir -p "$HOME/.vnc"
mkdir -p "$HOME/.config/autostart"
printf '[Desktop Entry]\nType=Application\nName=Screensaver\nHidden=true\n' \
  > "$HOME/.config/autostart/xfce4-screensaver.desktop"
x11vnc -storepasswd "$VNC_PASSWORD" "$HOME/.vnc/passwd" >/dev/null
unset VNC_PASSWORD

Xvfb :1 -screen 0 1280x800x24 -nolisten tcp &
for _ in 1 2 3 4 5 6 7 8 9 10; do
  [ -S /tmp/.X11-unix/X1 ] && break
  sleep 1
done
xset -display :1 s off -dpms
dbus-launch --exit-with-session startxfce4 >/tmp/xfce.log 2>&1 &
exec x11vnc -display :1 -rfbauth "$HOME/.vnc/passwd" -forever -shared \
  -listen 0.0.0.0 -rfbport 5900 -noxdamage -quiet
