# Addon: Mysql

This addon allows you to spin up a mysql container alongside your application container.

## Installation

To install this addon, you need to modify some of the files, but first, copy the content of `files`
into the project directory (where you normally call `bin/env`).

Then open up your docker-compose.yml and add the following:

```yaml
services:
  # This node must be merged into your application container definition
  app:
    depends_on:
      - mysql

  mysql:
    restart: "no"
    container_name: '${COMPOSE_PROJECT_NAME}-mysql'
    image: 'mysql:8.0'
    command: [ "--default-authentication-plugin=mysql_native_password", "--max_connections=2000" ]
    environment:
      MYSQL_ROOT_PASSWORD: $MYSQL_ROOT_PASSWORD
      MYSQL_DATABASE: $MYSQL_DB_NAME
      MYSQL_USER: $MYSQL_USER
      MYSQL_PASSWORD: $MYSQL_PASSWORD
    # Allow more connections to the database @see https://medium.com/@kauminikg/how-to-increase-max-connections-in-mysql-docker-container-772ae17e3526
    ulimits:
      nofile:
        soft: 65536
        hard: 65536
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "$DOCKER_PROJECT_IP:$MYSQL_PORT:3306"

volumes:
  mysql_data:
    driver: local
```

Add the following environment variables to your `.env` file:

```dotenv
# Mysql
# ==========================

MYSQL_ALLOWED_SOURCES=local
MYSQL_ROOT_PASSWORD=root
MYSQL_HOST=mysql
MYSQL_DB_NAME=db
MYSQL_USER=db
MYSQL_PASSWORD=db
MYSQL_PORT=3306

# ==========================
```

Modify the `bin/_env/src/bashly.yml` by adding the following lines:

```yaml
  - name: mysql
    alias: db
    help: a list of database related sub-commands
    commands:
      - name: dump
        help: allows you to DUMP the state of a database onto your harddive
        args:
          - name: type
            help: Defines the database you want to execute the dump for
            default: '@select'
            validate: mysql_addon_isAllowedType
      - name: load
        help: Loads a database dump from your harddrive and replaces all data in the main project database table with it.
        args:
          - name: type
            help: Defines the database you want to load the dump for
            default: '@select'
            validate: mysql_addon_isAllowedType
      - name: list
        help: List all available database types to dump/load
```

Finally run the `bin/env rebuild-cli` script. After that you should be good to go.

## Adding multiple db sources

If you are working with multiple db sources for import/export (think for staging, prod and so on),
you can configure additional sources by adding the following to your `.env.local` file:

```dotenv
MYSQL_HOST_PROD=localhost
MYSQL_DB_NAME_PROD=db
MYSQL_USER_PROD=root
MYSQL_PASSWORD_PROD=secret
MYSQL_PORT_PROD=3306
```

after that you must modify the `MYSQL_ALLOWED_SOURCES` to include the suffix you used for the variable names:

```dotenv
MYSQL_ALLOWED_SOURCES=local,prod
```

## Using SSH tunneling

If you want to use SSH tunneling to connect to your database, you can do so by adding the following to your `.env.local`
file:

```dotenv
MYSQL_SSH_HOST_PROD=your.host.com
MYSQL_SSH_USER_PROD=username
MYSQL_SSH_IDENTITY_FILE_PROD=~/.ssh/identity.pem
```

This will then automatically open an ssh tunnel to your database host and connect to the database via the tunnel.
