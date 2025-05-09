# Fase de Build
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build
