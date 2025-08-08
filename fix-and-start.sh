#!/bin/bash

echo "🔧 Configurando entorno de desarrollo..."

# Asegurar que estamos usando Node.js 20
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

echo "📱 Verificando Node.js y npm..."
node --version
npm --version

echo "🛠 Configurando timeouts de npm..."
npm config set fetch-timeout 300000

echo "📋 Verificando simuladores iOS..."
xcrun simctl list devices available | head -5

echo "🚀 Iniciando Expo (modo offline primero)..."
echo "Si hay errores de conectividad, se intentará en modo normal..."

# Intentar primero en modo offline
npm start -- --offline &
PID=$!

# Esperar 10 segundos para ver si hay errores
sleep 10

# Si el proceso sigue corriendo, mostrar mensaje de éxito
if kill -0 $PID 2>/dev/null; then
    echo "✅ Expo iniciado exitosamente en modo offline!"
    echo "Presiona Ctrl+C para detener cuando termines."
    wait $PID
else
    echo "⚠️  Modo offline falló, intentando modo normal..."
    npm start
fi
