echo "[Setup]: Using mkcert to create a local SSL certificate"

# If "mkcert" is already installed
if [[ -z "$(which mkcert)" ]]; then
  if [ -f /etc/redhat-release ]; then
    sudo yum update
    sudo yum install nss-tools
  fi

  if [ -f /etc/lsb-release ]; then
    sudo apt update
    sudo apt install libnss3-tools
  fi

  sudo rm -rf /usr/local/bin/mkcert
  LATEST_RELEASE=$(curl -Ls -o /dev/null -w %{url_effective} https://github.com/FiloSottile/mkcert/releases/latest | cut -d'/' -f8)
  VERSION_MKCERT=${VERSION_MKCERT:-$LATEST_RELEASE}
  echo "[mkcert] Required version $VERSION_MKCERT"
  curl -JLO "https://github.com/FiloSottile/mkcert/releases/download/${VERSION_MKCERT}/mkcert-${VERSION_MKCERT}-linux-${OS_PLATFORM}"
  checkLastExitCodeOrDie $?
  chmod +x mkcert-v*-linux-amd64
  sudo cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert
  rm -rf mkcert-v*-linux-amd64
fi

echo "[mkcert] Installed version $VERSION_MKCERT"

mkcert -install

rm -rf ${DOCKER_SSL_DIR}
mkdir -p ${DOCKER_SSL_DIR}

mkcert -key-file ${DOCKER_SSL_DIR}/key.pem -cert-file ${DOCKER_SSL_DIR}/cert.pem $DOCKER_PROJECT_DOMAIN
