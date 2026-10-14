FROM guacamole/guacd:1.6.0

COPY entrypoint.sh /usr/local/bin/cyberforce-guacd-entrypoint
USER root
RUN chmod 755 /usr/local/bin/cyberforce-guacd-entrypoint
USER guacd
ENTRYPOINT ["/usr/local/bin/cyberforce-guacd-entrypoint"]
