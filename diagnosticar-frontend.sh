#!/bin/bash

# Script de diagnóstico del frontend para Hogar Conectado
# Este script verifica la conectividad con el backend

echo "🔍 Diagnóstico del Frontend - Hogar Conectado"
echo "=============================================="
echo ""

# Función para verificar URL
check_url() {
    local url=$1
    local description=$2
    echo "🌐 Verificando $description: $url"
    
    if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
        echo "✅ $description: ACCESIBLE"
        
        # Obtener información adicional
        local response=$(curl -s --max-time 5 "$url")
        if [[ $url == *"/productos"* ]]; then
            local count=$(echo "$response" | grep -o '"data":\[' | wc -l | xargs)
            if [ "$count" -gt 0 ]; then
                echo "   📊 Respuesta recibida con datos"
                # Intentar extraer número de productos si es posible
                echo "$response" | head -c 200
                echo "..."
            else
                echo "   ⚠️  Respuesta sin datos o formato inesperado"
            fi
        fi
    else
        echo "❌ $description: NO ACCESIBLE"
    fi
    echo ""
}

# URLs a verificar según el tipo de desarrollo
echo "🏠 Verificando URLs del backend..."

# Para desarrollo local (web/emulador)
check_url "http://localhost:3000/api" "Backend local (localhost)"
check_url "http://localhost:3000/api/productos?limite=5" "Endpoint productos local"

# Para dispositivo físico/IP específica
check_url "http://192.168.1.68:3000/api" "Backend IP específica (192.168.1.68)"
check_url "http://192.168.1.68:3000/api/productos?limite=5" "Endpoint productos IP específica"

# Verificar la IP anterior por si acaso
check_url "http://192.168.1.13:3000/api" "Backend IP anterior (192.168.1.13)"

echo "🔧 Información del sistema:"
echo "Platform: $(uname -s)"
echo "Network interfaces:"
if command -v ifconfig >/dev/null 2>&1; then
    ifconfig | grep "inet " | grep -v "127.0.0.1"
elif command -v ip >/dev/null 2>&1; then
    ip addr show | grep "inet " | grep -v "127.0.0.1"
fi

echo ""
echo "📱 Para usar con React Native:"
echo "- Emulador iOS/Android: usar localhost"
echo "- Dispositivo físico: usar IP de la red local"
echo ""
echo "🎯 URL actual configurada en el frontend:"
echo "   Dispositivo físico/móvil: http://192.168.1.68:3000/api"
echo "   Web/localhost: http://localhost:3000/api"
