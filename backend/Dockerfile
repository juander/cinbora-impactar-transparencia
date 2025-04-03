# Etapa 1: Build
FROM node:18-alpine AS builder

WORKDIR /build

# Copiar arquivos necessários para instalar dependências
COPY package*.json tsconfig.json module-alias.js ./

# Instalar todas as dependências (produção e desenvolvimento)
RUN npm ci --prefer-offline

# Copiar o código-fonte do backend
COPY . ./

# Compilar o TypeScript para JavaScript
RUN npx tsc --project tsconfig.json

# Etapa 2: Produção
FROM node:18-alpine

WORKDIR /app

# Instalar ferramentas adicionais necessárias
RUN apk add --no-cache mongodb-tools bash

# Copiar apenas os arquivos necessários para produção
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/package.json ./package.json
COPY --from=builder /build/package-lock.json ./package-lock.json
COPY --from=builder /build/module-alias.js ./module-alias.js

# Instalar dependências de produção e o driver do MongoDB explicitamente
RUN npm ci --only=production --prefer-offline && \
    npm install mongodb

# Verificar se o arquivo principal existe
RUN test -f dist/src/server.js || { echo "ERROR: Required file dist/src/server.js is missing!"; exit 1; }

# Expor a porta do backend
EXPOSE 3015

# Comando para iniciar o servidor
CMD ["node", "-r", "module-alias/register", "dist/src/server.js"]