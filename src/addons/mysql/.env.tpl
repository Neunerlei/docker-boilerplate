# Mysql
# ==========================
MYSQL_ROOT_PASSWORD=root
MYSQL_HOST=mysql
MYSQL_DB_NAME=db
MYSQL_USER=db
MYSQL_PASSWORD=db
MYSQL_PORT=3306

# If you are working with multiple db sources for import/export (think for staging, prod and so on),
# you can configure additional sources by adding more lines like this: The "_PROD" suffix is just a convention
# and can be replaced with any other name you like. Note, that all variables must be suffixed with the same name.
# MYSQL_HOST_PROD=your.host.com
# MYSQL_DB_NAME_PROD=db
# MYSQL_USER_PROD=root
# MYSQL_PASSWORD_PROD=secret
# MYSQL_PORT_PROD=3306

# If you want to use SSH tunneling to connect to your database, you can do so by adding the following.
# This will then automatically open an ssh tunnel to your database host and connect to the database via the tunnel.
# MYSQL_SSH_HOST_PROD=your.host.com
# MYSQL_SSH_USER_PROD=username
# MYSQL_SSH_IDENTITY_FILE_PROD=~/.ssh/identity.pem
# ==========================
