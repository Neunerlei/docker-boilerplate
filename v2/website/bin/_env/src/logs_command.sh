ARGS=${other_args[*]}

${DOCKER_COMPOSE_EXECUTABLE} --env-file $(compileEnvFile) logs ${args[service]:-$SERVICE_NAME_APP} $ARGS
