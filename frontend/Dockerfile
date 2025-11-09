# ───────────────────────────────────────────────────────────────────────────────
#  Etapa 1: Build da aplicação React
# ───────────────────────────────────────────────────────────────────────────────
FROM node:16-alpine AS build

# Define diretório de trabalho
WORKDIR /app

# Copia package.json e package-lock.json para instalar dependências
COPY package.json package-lock.json ./

# Instala dependências exatas usando npm ci (clean install)
RUN npm ci

# Copia todo o restante do código-fonte do frontend
COPY . .

# Gera a versão otimizada para produção (build estático em /app/build)
RUN npm run build

# ───────────────────────────────────────────────────────────────────────────────
#  Etapa 2: Serve os arquivos estáticos com Nginx
# ───────────────────────────────────────────────────────────────────────────────
FROM nginx:stable-alpine

# Remove qualquer conteúdo default do /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos gerados no stage “build” para onde o Nginx espera
COPY --from=build /app/build /usr/share/nginx/html

# Expõe a porta 80 para servir estático
EXPOSE 80

# Inicia o Nginx (em foreground)
CMD ["nginx", "-g", "daemon off;"]
