FROM root
WORKDIR /var/www/html

# Add the app sources
COPY --chown=www-data:www-data app .

# Ensure correct permissions on the binaries
RUN find /var/www/html/bin -type f -iname "*.sh" -exec chmod +x {} \;

USER root

ENTRYPOINT [ "npm", "run", "prod" ]
