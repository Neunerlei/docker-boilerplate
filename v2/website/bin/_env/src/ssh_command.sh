${DOCKER_COMPOSE_EXECUTABLE} --env-file $(compileEnvFile) exec -ti ${args[service]:-$DEFAULT_SERVICE_NAME} ${args[--cmd]}
