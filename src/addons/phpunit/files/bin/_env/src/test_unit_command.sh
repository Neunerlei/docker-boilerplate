if ! areComposerDependenciesInstalled ; then
  run composer install
fi

ARGS="${other_args[*]}"

if [[ ${args[--coverage]} ]]; then
  run ssh -c "composer run test:unit:coverage $ARGS"
else
  run ssh -c "composer run test:unit $ARGS"
fi
