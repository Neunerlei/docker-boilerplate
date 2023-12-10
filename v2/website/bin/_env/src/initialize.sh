PROJECT_ROOT_DIR=$(realpath ./${BASH_SOURCE%/*}/..)

OS_TYPE=$(determineHostType)

if [[ $OS_TYPE == 'unsupported' ]]; then
  echo 'Sorry, but we currently don''t support your operating system!'
  exit 1
fi

OS_PLATFORM=$(determineOsPlatform)

loadEnvFile

DOCKER_EXECUTABLE=$(determineDockerExecutable)
DOCKER_COMPOSE_EXECUTABLE=$(determineDockerComposeExecutable)
DOCKER_RUNTIME_TYPE=$(determineDockerRuntimeType)

DEFAULT_SERVICE_NAME=${SERVICE_NAME:-app}
DEFAULT_CONTAINER_NAME="${PROJECT_NAME:-project-without-name}-${DEFAULT_SERVICE_NAME}"
DEFAULT_UID=${ENV_UID:-$(id -u)}
DEFAULT_GID=${ENV_GID:-$(id -g)}
DEFAULT_BASE_DOMAIN=${BASE_DOMAIN:-dev.local}

INITIAL_LOCAL_DEV_IP=127.88.8.1

PERSISTED_STORAGE_PATH=${PERSISTED_STORAGE_PATH:-${HOME}/.dev-local-boilerplate}
PERSISTED_STORAGE_FILE=${PERSISTED_STORAGE_FILE:-config.json}
PERSISTED_STORAGE_JQ_IMAGE=${PERSISTED_STORAGE_JQ_IMAGE:-ghcr.io/jqlang/jq:1.7}

DOCKER_PROJECT_PROTOCOL=${DOCKER_PROJECT_PROTOCOL:-${APP_PROTOCOL:-https}}
DOCKER_PROJECT_DOMAIN=${DOCKER_PROJECT_DOMAIN:-${APP_DOMAIN:-${COMPOSE_PROJECT_NAME}.${DEFAULT_BASE_DOMAIN}}}

DOCKER_SSL_DIR=${PROJECT_ROOT_DIR}/docker/nginx/config/ssl

$(provideDockerEnvironmentVariablesBasedOnRuntimeType)
