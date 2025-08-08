#!/bin/bash

echo "🔍 Detectando IP de red para desarrollo..."

# Método 1: ifconfig (más común en macOS)
IP1=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')

# Método 2: usando route
IP2=$(route get default | grep interface | awk '{print $2}' | xargs ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}')

# Método 3: usando networksetup (específico de macOS)
INTERFACE=$(route get default | grep interface | awk '{print $2}')
IP3=$(ifconfig $INTERFACE 2>/dev/null | grep "inet " | awk '{print $2}')

echo "📡 IPs detectadas:"
[ ! -z "$IP1" ] && echo "  Método 1: $IP1"
[ ! -z "$IP2" ] && echo "  Método 2: $IP2" 
[ ! -z "$IP3" ] && echo "  Método 3: $IP3"

# Elegir la primera IP válida
FINAL_IP=""
for ip in "$IP1" "$IP2" "$IP3"; do
    if [[ $ip =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        FINAL_IP=$ip
        break
    fi
done

if [ ! -z "$FINAL_IP" ]; then
    echo ""
    echo "✅ IP recomendada: $FINAL_IP"
    echo ""
    echo "🔧 Para actualizar automáticamente el código:"
    echo "sed -i '' 's/192\.168\.1\.68/$FINAL_IP/g' services/apiClient.ts"
    echo ""
    echo "🔧 Para actualizar manualmente, cambia en apiClient.ts:"
    echo "   return 'http://192.168.1.68:3000/api';"
    echo "   ↓"
    echo "   return 'http://$FINAL_IP:3000/api';"
    echo ""
    echo "🧪 Para probar la conexión:"
    echo "curl http://$FINAL_IP:3000/api/categorias"
else
    echo "❌ No se pudo detectar una IP válida"
    echo "💡 Intenta manualmente:"
    echo "   ifconfig"
    echo "   Busca la línea con 'inet' que NO sea 127.0.0.1"
fi
