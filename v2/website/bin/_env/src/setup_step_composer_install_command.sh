echo "[Setup]: Running composer install command"

${DOCKER_COMPOSE_EXECUTABLE} --env-file $(compileEnvFile) exec -ti ${DEFAULT_SERVICE_NAME} "composer" install
