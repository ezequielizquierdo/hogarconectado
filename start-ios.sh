#!/bin/bash

echo "🚀 Iniciando Expo para iOS..."
echo ""
echo "📱 Pasos para ver en tu iPhone:"
echo "1. Descarga 'Expo Go' desde la App Store"
echo "2. Conecta tu iPhone a la misma red Wi-Fi que tu Mac"
echo "3. Escanea el QR que aparecerá abajo con la app Expo Go"
echo ""
echo "🔧 Iniciando servidor..."

# Intentar diferentes opciones dependiendo del problema de red
if npx expo start --tunnel 2>/dev/null; then
    echo "✅ Servidor iniciado con túnel (mejor para redes diferentes)"
elif npx expo start --lan 2>/dev/null; then
    echo "✅ Servidor iniciado en LAN (misma red Wi-Fi)"
elif npx expo start --localhost 2>/dev/null; then
    echo "✅ Servidor iniciado en localhost"
else
    echo "❌ Error al iniciar. Intenta manualmente:"
    echo "   npx expo start --tunnel"
    echo "   o"
    echo "   npx expo start --lan"
fi
