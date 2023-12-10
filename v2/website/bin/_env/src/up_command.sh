ARGS=${other_args[*]}

if ! [ ${args[--attach]} ]; then
	ARGS+=" -d"
fi

$DOCKER_COMPOSE_EXECUTABLE --env-file $(compileEnvFile) up $ARGS
