echo "[Setup]: Setting up your hosts file"

if [ $OS_TYPE == 'LINUX' ]; then
  if isWslMachine; then
    echo 'Injecting hosts for wsl machine'

    if [ ! $(which gsudo) ]; then
      echo 'Sorry, but you are probably running a WSL ecosystem but don''t have "gsudo" installed. So I am not allowed to update your windows hosts file for you, skipping this step...'
      return
    fi

    cp -f $(realpath ./${BASH_SOURCE%/*})/_env/hosts.ps1 /mnt/c/tools/hosts.ps1
    gsudo -d "PowerShell -ExecutionPolicy Bypass -File C:\\tools\\hosts.ps1 remove ${DOCKER_PROJECT_DOMAIN} && PowerShell -ExecutionPolicy Bypass  -File C:\\tools\\hosts.ps1 add ${DOCKER_PROJECT_IP} ${DOCKER_PROJECT_DOMAIN}"

    return
  fi

  echo 'Injecting hosts for generic linux machine'
  HAS_MATCHES="$(grep -n "^[^#]*${DOCKER_PROJECT_DOMAIN}" /etc/hosts | cut -f1 -d:)"
    HOST_ENTRY="${DOCKER_PROJECT_IP} ${DOCKER_PROJECT_DOMAIN}"

  if [ ! -z "$HAS_MATCHES" ]
    then
      echo "Updating existing hosts entry."
      # iterate over the line numbers on which matches were found
      while read -r line_number; do
          # replace the text of each line with the desired host entry
          sudo sed -i "${line_number}s/.*/${HOST_ENTRY} /" /etc/hosts
      done <<< "$HAS_MATCHES"
    else
      echo "Adding new hosts entry."
      echo "$HOST_ENTRY" | sudo tee -a /etc/hosts > /dev/null
  fi
fi;
