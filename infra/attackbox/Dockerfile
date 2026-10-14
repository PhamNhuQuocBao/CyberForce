FROM kalilinux/kali-rolling:latest

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      kali-desktop-xfce xvfb x11vnc dbus-x11 xterm \
      nmap sqlmap metasploit-framework wireshark john burpsuite \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --shell /bin/bash kali

# Kali gives nmap file capabilities. Drop them so TCP connect scans still run
# inside a container that has every ambient capability removed.
RUN setcap -r /usr/lib/nmap/nmap

COPY entrypoint.sh /usr/local/bin/attackbox-entrypoint
RUN chmod 755 /usr/local/bin/attackbox-entrypoint

USER kali
ENV HOME=/home/kali DISPLAY=:1
WORKDIR /home/kali
EXPOSE 5900
ENTRYPOINT ["/usr/local/bin/attackbox-entrypoint"]
