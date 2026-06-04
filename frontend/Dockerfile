# syntax=docker/dockerfile:1
# Multi-stage build for the React SPA.
# VITE_API_URL is baked in at build time (Vite replaces `import.meta.env.*`
# statically), so we accept it as a build arg.

# ---------- Stage 1: build ----------
FROM node:20-alpine AS build
WORKDIR /app

# Copy lockfile first for layer caching.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:5286/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ---------- Stage 2: nginx static serve ----------
FROM nginx:1.27-alpine AS final

# Replace the default site config with our SPA fallback.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
