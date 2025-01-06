ARGS=${other_args[*]}

${DOCKER_EXECUTABLE} build --build-arg APP_ENV=prod . ${ARGS}
