SERVICE=${args[service]:-$DEFAULT_SERVICE_NAME}
CMD=${args[--cmd]:-bash}

if ! isDockerComposeServiceRunning; then
  run up
fi
CONTAINER_ID=$(getContainerIdFromServiceName $SERVICE)

$DOCKER_EXECUTABLE \
  exec -ti \
  ${CONTAINER_ID} \
  bash -c "${CMD}"
