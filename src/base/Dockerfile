# syntax = docker/dockerfile:1.2
FROM base
ARG APP_ENV=prod
ENV APP_ENV=${APP_ENV}
# @see https://aschmelyun.com/blog/fixing-permissions-issues-with-docker-compose-and-php/
ARG DOCKER_RUNTIME=docker
ARG DOCKER_GID=1000
ARG DOCKER_UID=1000