if [ -f $(getEnvFileLocalPath) ]; then
  return
fi

if confirmDefaultYes "There is currently no .env.local file. Do you want to create one based on .env.local.template";
then
  echo "Okay, here it goes...";
else
  echo "[SKIP]: Please note that you will probably need to create a .env.local file before you can run the project!";
  exit
fi

local OUTPUT_PATH=$(getEnvFileLocalPath)
local TMP_PATH="${OUTPUT_PATH}.tmp"
rm -rf ${TMP_PATH}
cp $(getEnvFileLocalTemplatePath) ${TMP_PATH}

IP=$(nextIp $(readPersistedConfig "DEV_IP" "${INITIAL_LOCAL_DEV_IP}"))

echo "Please enter the project name (e.g. my-project):"
read PROJECT_NAME

# Ensure the project name string is url safe
PROJECT_NAME=$(echo ${PROJECT_NAME} | sed -e 's/[^A-Za-z0-9_-]/-/g')
DOMAIN="${PROJECT_NAME}.${DEFAULT_BASE_DOMAIN}"

if confirmDefaultYes "I have generated the following domain for you: ${DOMAIN} (${IP}). Is this okay?";
then
  echo "Okay, here it goes...";
else
  echo "Please enter the domain you want to use (e.g. my-project.${DEFAULT_BASE_DOMAIN}):"
  read $DOMAIN
fi

sed -i "s/##COMPOSE_PROJECT_NAME##/${PROJECT_NAME}/g" ${TMP_PATH}
sed -i "s/##DOCKER_PROJECT_DOMAIN##/${DOMAIN}/g" ${TMP_PATH}
sed -i "s/##DOCKER_PROJECT_IP##/${IP}/g" ${TMP_PATH}

writePersistedConfig "DEV_IP" ${IP}

mv ${TMP_PATH} ${OUTPUT_PATH}

# We must re-read the env file here, because otherwise we would not have the new values available
loadEnvFile
