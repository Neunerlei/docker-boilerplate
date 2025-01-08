FROM root
WORKDIR /var/www/html

ENV DOCKER_RUNTIME=${DOCKER_RUNTIME:-docker}
ENV APP_ENV=dev

# Add basics
RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk rm -rf /etc/apk/cache && ln -s /var/cache/apk /etc/apk/cache && \
    apk update && apk upgrade && apk add \
    sudo \
    bash \
    curl

# Recreate the www-data user and group with the current users id
RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk rm -rf /etc/apk/cache && ln -s /var/cache/apk /etc/apk/cache && \
    apk update && apk upgrade && apk add shadow \
    && (deluser $(getent passwd ${DOCKER_UID} | cut -d: -f1) || true) \
    && (userdel -r www-data || true) \
    && (groupdel -f www-data || true) \
    && groupadd -g ${DOCKER_GID} www-data \
    && adduser -u ${DOCKER_UID} -D -S -G www-data www-data

ENTRYPOINT [ "npm", "run", "dev" ]

USER www-data