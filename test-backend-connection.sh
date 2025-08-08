#!/bin/bash

echo "🔍 Probando conexiones al backend..."

urls=(
    "http://localhost:3000/api/categorias"
    "http://127.0.0.1:3000/api/categorias"
    "http://192.168.1.68:3000/api/categorias"
    "http://192.168.1.100:3000/api/categorias"
    "http://192.168.0.100:3000/api/categorias"
)

for url in "${urls[@]}"; do
    echo "Probando: $url"
    if curl -s --connect-timeout 5 "$url" > /dev/null 2>&1; then
        echo "✅ FUNCIONA: $url"
        echo "📡 Respuesta completa:"
        curl -s "$url" | head -3
        echo ""
        break
    else
        echo "❌ No responde: $url"
    fi
    echo "---"
done

echo ""
echo "🔍 Verificando procesos en puerto 3000:"
netstat -an | grep ":3000" || echo "No hay procesos escuchando en puerto 3000"

echo ""
echo "🔍 Verificando IP actual:"
ifconfig | grep "inet " | grep -v 127.0.0.1 | head -3
