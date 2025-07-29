# ⚠️ Actualización de Node.js Requerida

## Problema Actual

Tu proyecto React Native se ha creado exitosamente, pero hay un problema de compatibilidad con tu versión actual de Node.js:

- **Versión actual**: Node.js v16.13.0
- **Versión requerida**: Node.js v18.0.0 o superior

## Error Encontrado

```
ReferenceError: ReadableStream is not defined
```

Este error se debe a que las dependencias modernas de Expo y React Native requieren APIs que solo están disponibles en Node.js v18+.

## Soluciones Recomendadas

### Opción 1: Usar nvm (Recomendada)

Si tienes nvm instalado:

```bash
# Instalar Node.js 18
nvm install 18

# Usar Node.js 18
nvm use 18

# Verificar la versión
node --version

# Navegar al proyecto e iniciar
cd hogarconectado
npm start
```

### Opción 2: Instalar Node.js manualmente

1. Ve a [nodejs.org](https://nodejs.org/)
2. Descarga la versión LTS (actualmente v18 o v20)
3. Instálala siguiendo las instrucciones
4. Reinicia tu terminal
5. Verifica con `node --version`

### Opción 3: Usar Volta (Alternativa a nvm)

```bash
# Instalar Volta (si no lo tienes)
curl https://get.volta.sh | bash

# Instalar Node.js 18
volta install node@18

# Verificar
node --version
```

## Una vez actualizado Node.js

```bash
# Navegar al directorio del proyecto
cd hogarconectado

# Limpiar dependencias (opcional pero recomendado)
rm -rf node_modules package-lock.json

# Reinstalar dependencias
npm install

# Iniciar el proyecto
npm start
```

## Usar VS Code Tasks

Una vez actualizado Node.js, podrás usar las tareas configuradas en VS Code:

1. Presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
2. Escribe "Tasks: Run Task"
3. Selecciona "Iniciar Expo Dev Server"

## Verificar que todo funciona

Cuando el servidor de desarrollo esté ejecutándose, verás:

```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

## Próximos pasos después de actualizar

1. **Expo Go App**: Instala Expo Go en tu teléfono
2. **Desarrollo web**: El proyecto también funciona en navegador
3. **Emuladores**: Configura emuladores para Android/iOS

## ¿Necesitas ayuda?

Si tienes problemas con la actualización de Node.js, avísame y te ayudo con los pasos específicos para tu sistema operativo (macOS).

---

**Nota**: Este error es muy común cuando se trabaja con React Native moderno en versiones antiguas de Node.js. La actualización resolverá completamente el problema.
