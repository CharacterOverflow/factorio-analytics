FROM debian:stable-slim

LABEL maintainer="https://github.com/CharacterOverflow/factorio-analytics"

ARG USER=factorio
ARG GROUP=factorio
ARG PUID=845
ARG PGID=845
ARG BOX64_VERSION=v0.2.4
ARG VARIANT=Query

ENV VARIANT="$VARIANT" \
    PORT=3001 \
    PG_CACHE_HOST=127.0.0.1 \
    PG_CACHE_PORT=5432 \
    PG_CACHE_USER=factory \
    PG_CACHE_PASS=factory \
    FACTORIO_USER=username \
    FACTORIO_TOKEN=token \
    AWS_ACCESS_ID=access_id \
    AWS_SECRET_KEY=secret_key \
    NAME=docker_test \
    PUID="$PUID" \
    PGID="$PGID"

SHELL ["/bin/bash", "-eo", "pipefail", "-c"]
RUN set -ox pipefail \
    && mkdir -p /opt /factorio \
    && mkdir /opt/factorio \
    && apt-get -q update \
    && DEBIAN_FRONTEND=noninteractive apt-get -qy install ca-certificates curl jq pwgen xz-utils procps --no-install-recommends \
    && chmod ugo=rwx /opt/factorio \
    && apt install npm nodejs git -y \
    && git clone https://github.com/CharacterOverflow/factorio-analytics /opt/factorio \
    && cd /opt/factorio \
    && npm install -g typescript \
    && npm install \
    && tsc \
    && rm -rf /var/lib/apt/lists/*

EXPOSE $PORT/tcp $PORT/udp
WORKDIR /opt/factorio
ENTRYPOINT ["node", "dist/scripts/runWorkerBackend.js"]
