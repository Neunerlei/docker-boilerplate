ARGS=${other_args[*]}

${DOCKER_COMPOSE_EXECUTABLE} --env-file $(compileEnvFile) restart ${ARGS}
