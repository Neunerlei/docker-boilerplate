workDir="$(realpath "$(dirname -- $0)/..")"
cd "${workDir}"

if [ "$1" = 'ssh' ]; then
    docker compose exec -ti builder bash
    exit
fi;

if [ "$1" = 'install' ]; then
    docker compose exec -ti builder bash -c "npm install"
    exit
fi;

if [ "$1" = 'build' ]; then
    docker compose exec -ti builder bash -c "npm run build"
    exit
fi;

docker compose down
DOCKER_UID="$(id -u)" DOCKER_GID="$(id -g)" docker compose \
  -f docker-compose.yml -f docker-compose.dev.yml up -d "$@"
