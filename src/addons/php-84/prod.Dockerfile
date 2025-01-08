FROM root

RUN echo "umask 000" >> /root/.bashrc

###BUILDER_COPY --chown=www-data:www-data ###{dist}### /var/www/html/public/frontend

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
