getEnvFilePath() {
  ENV_FILE=${ENV_FILE:-"${PROJECT_ROOT_DIR}/.env"}
  echo ${ENV_FILE}
}

getEnvFileLocalTemplatePath() {
  ENV_FILE_TEMPLATE=${ENV_FILE_TEMPLATE:-"$(getEnvFileLocalPath).template"}
  echo ${ENV_FILE_TEMPLATE}
}

getEnvFileLocalPath() {
  ENV_FILE_LOCAL=${ENV_FILE_LOCAL:-"${ENV_FILE}.local"}
  echo ${ENV_FILE_LOCAL}
}

getEnvFileCompiledPath() {
  ENV_FILE_COMPILED=${ENV_FILE_COMPILED:-"${ENV_FILE}.dockerCompose"}
  echo ${ENV_FILE_COMPILED}
}

# Generates a combined output of the .env and .env.local env files and returns the name of the compiled file.
# This file will then be used by docker compose for local development
compileEnvFile() {
	ENV_FILE=$(getEnvFilePath)
	ENV_FILE_LOCAL=$(getEnvFileLocalPath)
	ENV_FILE_COMPILED=$(getEnvFileCompiledPath)

	rm -rf ${ENV_FILE_COMPILED}

	echo "# WARNING: COMPILED FILE! DON'T CHANGE STUFF HERE! THIS IS DONE AUTOMATICALLY" >> ${ENV_FILE_COMPILED}
	echo "# ================================================================================" >> ${ENV_FILE_COMPILED}
	echo "" >> ${ENV_FILE_COMPILED}

	if [ -f ${ENV_FILE} ]; then
		echo "# ................................................................................" >> ${ENV_FILE_COMPILED}
		echo "# CONTENTS OF: ${ENV_FILE}" >> ${ENV_FILE_COMPILED}
		echo "# ................................................................................" >> ${ENV_FILE_COMPILED}
		echo "" >> ${ENV_FILE_COMPILED}
		cat ${ENV_FILE} >> ${ENV_FILE_COMPILED}
	fi

	if [ -f ${ENV_FILE_LOCAL} ]; then
		echo "" >> ${ENV_FILE_COMPILED}
		echo "# ................................................................................" >> ${ENV_FILE_COMPILED}
		echo "# CONTENTS OF: ${ENV_FILE_LOCAL}" >> ${ENV_FILE_COMPILED}
		echo "# ................................................................................" >> ${ENV_FILE_COMPILED}
		echo "" >> ${ENV_FILE_COMPILED}
		cat ${ENV_FILE_LOCAL} >> ${ENV_FILE_COMPILED}
	fi

	echo ${ENV_FILE_COMPILED}
}

# Loads the script environment file or dies if it does not exist
loadEnvFile(){
  ENV_FILE=$(getEnvFilePath)

  if [ ! -f ${ENV_FILE} ]; then
    echo "Missing ${ENV_FILE} file! Please copy .env.tpl and add the secrets to it before continuing!";
    exit 1;
  fi

  source ${ENV_FILE}

  # We have to check if there is a *.local override version for the env file now...
  ENV_FILE_LOCAL=${ENV_FILE_LOCAL:-"${ENV_FILE}.local"}

  if [ -f ${ENV_FILE_LOCAL} ]; then
  	source ${ENV_FILE_LOCAL}
  fi
}
