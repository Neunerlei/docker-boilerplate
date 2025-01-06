# =================================================
# Dev image
# =================================================
FROM app_root AS app_dev

ENV DOCKER_RUNTIME=${DOCKER_RUNTIME:-docker}
ENV APP_ENV=dev

# Add sudo command
RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk rm -rf /etc/apk/cache && ln -s /var/cache/apk /etc/apk/cache && \
    apk update && apk upgrade && apk add \
	  sudo

# Add Composer
COPY --from=index.docker.io/library/composer:latest /usr/bin/composer /usr/bin/composer

# Because we inherit from the prod image, we don't actually want the prod settings
COPY docker/php/config/php.dev.ini /usr/local/etc/php/conf.d/zzz.app.dev.ini
RUN rm -rf /usr/local/etc/php/conf.d/zzz.app.prod.ini

# Recreate the www-data user and group with the current users id
RUN --mount=type=cache,id=apk-cache,target=/var/cache/apk rm -rf /etc/apk/cache && ln -s /var/cache/apk /etc/apk/cache && \
	apk update && apk upgrade && apk add shadow \
       && (userdel -r www-data || true) \
       && (groupdel -f www-data || true) \
       && groupadd -g ${DOCKER_GID} www-data \
       && adduser -u ${DOCKER_UID} -D -S -G www-data www-data

USER www-data

###{resource_builder}###

# =================================================
# Final image
# =================================================
FROM app_root AS export

###{resource_builder_copy}###

RUN echo "umask 000" >> /root/.bashrc

USER www-data

# Install the composer dependencies, without running any scripts, this allows us to install the dependencies
# in a single layer and caching them even if the source files are changed
RUN --mount=type=cache,id=composer-cache,target=/var/www/html/.composer-cache \
    --mount=type=bind,from=composer:2,source=/usr/bin/composer,target=/usr/bin/composer \
    export COMPOSER_CACHE_DIR="/var/www/html/.composer-cache" \
    && composer install --no-dev --no-progress --no-interaction --verbose --no-scripts --no-autoloader

# Add the app sources
COPY --chown=www-data:www-data app .

# Ensure correct permissions on the binaries
RUN find /var/www/html/bin -type f -iname "*.sh" -exec chmod +x {} \;

# Dump the autoload file and run the matching scripts, after all the project files are in the image
RUN --mount=type=bind,from=composer:2,source=/usr/bin/composer,target=/usr/bin/composer \
    composer dump-autoload --no-dev --optimize --no-interaction --verbose --no-scripts --no-cache

USER root
