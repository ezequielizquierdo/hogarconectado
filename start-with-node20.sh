#!/bin/bash

# Script para iniciar la app con Node.js 20
echo "🚀 Iniciando Hogar Conectado con Node.js 20..."

# Cargar NVM y usar Node.js 20
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Verificar que el backend esté corriendo
echo "🔍 Verificando backend..."
if curl -s http://localhost:3000/api/categorias > /dev/null 2>&1; then
    echo "✅ Backend corriendo correctamente"
else
    echo "⚠️ Backend no disponible en localhost:3000"
fi

echo ""
echo "🎯 Iniciando Expo..."
npx expo start
