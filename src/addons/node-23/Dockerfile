# =================================================
# Dev image
# =================================================
FROM app_root AS app_dev
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

ENTRYPOINT [ "node", "/var/www/html/index.js" ]

USER www-data

###{resource_builder}###

# =================================================
# Final image
# =================================================
FROM app_root AS export
WORKDIR /var/www/html

# Add the app sources
COPY --chown=www-data:www-data app .

# Ensure correct permissions on the binaries
RUN find /var/www/html/bin -type f -iname "*.sh" -exec chmod +x {} \;

USER root