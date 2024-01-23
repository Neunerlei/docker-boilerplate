determineDockerExecutable(){
  local DOCKER_EXECUTABLE=$(which docker)
  if [[ ${DOCKER_EXECUTABLE} ]]; then
    echo ${DOCKER_EXECUTABLE}
    return
  fi

  local PODMAN_EXECUTABLE=$(which podman)
  if [[ ${PODMAN_EXECUTABLE} ]]; then
    echo ${PODMAN_EXECUTABLE}
    return
  fi

  echo "Sorry, but I did not find docker or podman on your system" >&2
  exit 1
}

determineDockerComposeExecutable() {
  # Special switch for pod-man
  local PODMAN_PATH=$(which podman-compose)
	if [[ ${PODMAN_PATH} ]]; then
		echo ${PODMAN_PATH}
		return
	fi

	local COMPOSE_VERSION=$(docker compose version)

	if [[ ${COMPOSE_VERSION} == *v2* ]]; then
		echo "docker compose"
		return
	fi

	local COMPOSE_PATH=$(which docker-compose)

  local PODMAN_PATH=$(which podman)
  if [[ ${PODMAN_PATH} ]]; then
    echo ${PODMAN_PATH} compose
  return

  echo "Sorry, but I did not find docker-compose or 'docker compose' on your system" >&2
  exit 1
}

determineDockerRuntimeType(){
  local COMPOSE_EXECUTABLE=$(determineDockerComposeExecutable)
  if [[ ${COMPOSE_EXECUTABLE} == *podman* ]]; then
    echo "podman"
    return
  fi

  echo "docker"
}

provideDockerEnvironmentVariablesBasedOnRuntimeType(){
  echo "export BUILDKIT_PROGRESS=plain"
  echo "export COMPOSE_DOCKER_CLI_BUILD=1"
  echo "export DOCKER_BUILDKIT=1"

  if [[ ${DOCKER_RUNTIME_TYPE} == "podman" ]]; then
    echo "export DOCKER_RUNTIME=podman"
    echo "export DOCKER_USER=root"
  else
    echo "export DOCKER_RUNTIME=docker"
    echo "export DOCKER_USER=${DEFAULT_UID}:${DEFAULT_GID}"
    echo "export DOCKER_UID=${DEFAULT_UID}"
    echo "export DOCKER_GID=${DEFAULT_GID}"
  fi
}

isDockerContainerRunning(){
  local containerName=${1:-${DEFAULT_CONTAINER_NAME}}
  local containerId=$($DOCKER_EXECUTABLE ps -q -f name=${containerName})
  if [[ ${containerId} ]]; then
    return 0
  fi
  return 1
}
