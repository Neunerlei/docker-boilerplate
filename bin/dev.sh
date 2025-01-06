workDir="$(realpath "$(dirname -- $0)/..")"
cd "${workDir}"

if [ "$1" = 'ssh' ]; then
    docker compose exec -ti builder bash
    exit
fi;

docker compose down
DOCKER_UID="$(id -u)" DOCKER_GID="$(id -g)" docker compose \
  -f docker-compose.yml -f docker-compose.dev.yml up -d "$@"
