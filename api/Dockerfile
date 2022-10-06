FROM node:16-slim

# Fix for prisma arm64 issue
RUN apt-get update
RUN apt-get install -y openssl

WORKDIR /app

COPY ../*.env ./*.env
COPY ./package.json ./package-lock.json* .
RUN \
  if [ -f ./package-lock.json ]; then npm ci; \
  else echo "package-lock.json not found, execute [npm i --prefix ./api] to generate it" && exit 1; \
  fi

COPY . .
