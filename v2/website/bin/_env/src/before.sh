if [[ $action != setup* ]]; then
  if [[ -z "${COMPOSE_PROJECT_NAME}" ]]; then
    echo "Please set the COMPOSE_PROJECT_NAME environment variable to the name of your project!"
    exit 1
  fi
  if [[ -z "${DOCKER_PROJECT_IP}" ]]; then
    echo "Please set the DOCKER_PROJECT_IP environment variable to the ip of your project!"
    exit 1
  fi
fi
