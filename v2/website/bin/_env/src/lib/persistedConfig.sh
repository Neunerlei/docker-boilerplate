readPersistedConfig() {
  local KEY=$1
  local DEFAULT_VALUE=$2

  local STORAGE_FILE=$(getPersistedStorageFilePath)
  local VALUE=$(cat ${STORAGE_FILE} | ${DOCKER_EXECUTABLE} run --rm -i ${PERSISTED_STORAGE_JQ_IMAGE} --raw-output ".${KEY}")

  if [[ ${VALUE} == "null" ]]; then
    echo ${DEFAULT_VALUE}
  else
    echo ${VALUE}
  fi
}

writePersistedConfig() {
  local KEY=$1
  local VALUE=$2

  local STORAGE_FILE=$(getPersistedStorageFilePath)
  local TMP_FILE="${STORAGE_FILE}.tmp"

  $(cat ${STORAGE_FILE} | ${DOCKER_EXECUTABLE} run --rm -i ${PERSISTED_STORAGE_JQ_IMAGE} ".${KEY} = \"${VALUE}\"" > ${TMP_FILE})
  mv "${TMP_FILE}" ${STORAGE_FILE}
}

getPersistedStorageFilePath() {
  local STORAGE_DIRECTORY="${PERSISTED_STORAGE_PATH}"
  local STORAGE_FILE="${STORAGE_DIRECTORY}/${PERSISTED_STORAGE_FILE}"

  if [[ ! -f ${STORAGE_FILE} ]]; then
    mkdir -p ${STORAGE_DIRECTORY}
    echo "{}" > ${STORAGE_FILE}
  fi

  echo ${STORAGE_FILE}
}
