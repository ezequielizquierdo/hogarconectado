#!/bin/bash

# Script alternativo para iniciar la app cuando Expo CLI falla
echo "🚀 Iniciando Hogar Conectado con método alternativo..."

# Verificar que el backend esté corriendo
echo "🔍 Verificando backend..."
if curl -s http://localhost:3000/api/categorias > /dev/null 2>&1; then
    echo "✅ Backend corriendo correctamente"
else
    echo "❌ Backend no disponible. Iniciando..."
    # Aquí podrías agregar el comando para iniciar tu backend si lo tienes
fi

echo ""
echo "📱 Opciones disponibles:"
echo "1. Probar en navegador web (recomendado)"
echo "2. Usar Expo Go en móvil con QR"
echo "3. Simular en iOS (si tienes Xcode)"
echo ""

# Intentar con modo web primero
echo "🌐 Intentando modo web..."
if command -v npx > /dev/null 2>&1; then
    echo "Iniciando en modo web..."
    npx expo start --web --port 8081
else
    echo "❌ npx no disponible"
fi
