# syntax = docker/dockerfile:1.2
# =================================================
# Common root image
# =================================================
ARG BASE_IMAGE='###{baseImage}###'
FROM ${BASE_IMAGE} AS app_root

ARG APP_ENV=prod
ENV APP_ENV=${APP_ENV}

# @see https://aschmelyun.com/blog/fixing-permissions-issues-with-docker-compose-and-php/
ARG DOCKER_RUNTIME=docker
ARG DOCKER_GID=1000
ARG DOCKER_UID=1000

###{steps}###
