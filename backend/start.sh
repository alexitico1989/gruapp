#!/bin/bash
set -e

echo "🔄 Ejecutando migraciones de Prisma..."
./node_modules/.bin/prisma migrate deploy

echo "🚀 Iniciando servidor..."
npm run start