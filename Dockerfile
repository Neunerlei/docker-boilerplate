FROM node:23-bookworm

ARG UID
ARG GID
ENV UID=${UID}
ENV GID=${GID}

# Install sudo
RUN apt-get -y update \
    && apt-get -y install sudo \
    && apt-get clean

# Add a non-root user
RUN (userdel -r $(getent passwd "${UID}" | cut -d: -f1) || true) \
   && (groupdel -f $(getent group "${GID}" | cut -d: -f1) || true) \
   && groupadd -g $GID builder \
   && adduser --uid ${UID} --gid ${GID} --disabled-password --gecos "" builder \
   && echo "builder ALL=(ALL) NOPASSWD: ALL" > /etc/sudoers.d/builder

# Install ruby and bashly
# @see https://bashly.dannyb.co/installing-ruby/#apt---ubuntu--debian
RUN apt-get -y update \
    && apt-get -y install build-essential libyaml-dev ruby-dev \
    && gem install bashly \
    && mkdir -p /opt/bashly-sources

# Install latest stable version of npm
RUN npm install -g npm@latest

USER ${UID}
