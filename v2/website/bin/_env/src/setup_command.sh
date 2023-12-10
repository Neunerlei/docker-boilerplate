if confirmDefaultYes "This script will help you getting all set up in your project. Should we get started?";
then
  echo "Okay, here it goes...";
else
  echo "Okay, let's do that another time!";
  exit
fi

run setup-step prepare-env
run setup-step hosts
run setup-step create-files
run setup-step permissions
run setup-step mkcert
run up --build

echo "Well, that should be it, you should now be able to open your project at $DOCKER_PROJECT_IP:443 or if you adjusted your hosts file: https://$DOCKER_PROJECT_DOMAIN"
