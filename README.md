# AIntelligent Editor

## Setting up

```sh
pnpm dlx create-turbo@latest

? Where would you like to create your Turborepo? aintelligent-editor
? Which package manager do you want to use? pnpm
```

```sh
rm -fr apps/docs
rm -fr apps/web/*

sh -c 'rsync -av --remove-source-files "$1/" $2 && find "$1" -type d -empty -delete' _ <V0_CODE_PATH> ./apps/web
rm -f apps/web/pnpm-lock.yaml

pnpm install
```