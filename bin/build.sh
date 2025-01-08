DOCKER_UID="$(id -u)" DOCKER_GID="$(id -g)" docker compose \
    run \
    --rm \
    -ti \
    builder \
    bash -c "npm run build"