# Hogar Conectado - App React Native

Una aplicación React Native desarrollada con Expo para controlar dispositivos del hogar inteligente.

## 🚀 Características

- **Multiplataforma**: Funciona en iOS, Android y Web
- **Expo Router**: Navegación moderna basada en archivos
- **TypeScript**: Desarrollo tipado y seguro
- **Componentes modernos**: UI moderna y responsiva

## 📱 Estructura del Proyecto

```
hogarconectado/
├── app/                    # Pantallas de la aplicación (Expo Router)
│   ├── (tabs)/            # Navegación por pestañas
│   │   ├── index.tsx      # Pantalla principal
│   │   └── explore.tsx    # Pantalla de exploración
│   └── _layout.tsx        # Layout principal
├── components/            # Componentes reutilizables
├── constants/             # Constantes (colores, temas, etc.)
├── hooks/                 # Custom hooks
└── assets/               # Imágenes, iconos, fuentes
```

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Node.js 18+ (recomendado: actualizar desde v16.13.0)
- npm o yarn
- Expo CLI
- Para desarrollo móvil: Expo Go app en tu dispositivo

### Configuración inicial

1. **Navegar al directorio del proyecto:**

   ```bash
   cd hogarconectado
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm start
   ```

## 🎯 Comandos disponibles

| Comando           | Descripción                           |
| ----------------- | ------------------------------------- |
| `npm start`       | Inicia el servidor de desarrollo Expo |
| `npm run android` | Abre la app en Android                |
| `npm run ios`     | Abre la app en iOS                    |
| `npm run web`     | Abre la app en el navegador           |
| `npm run lint`    | Ejecuta el linter                     |

## 🔧 Tareas de VS Code

He configurado varias tareas en VS Code para facilitar el desarrollo:

- **Ctrl+Shift+P** → "Tasks: Run Task" → Selecciona:
  - "Iniciar Expo Dev Server"
  - "Abrir en Android"
  - "Abrir en iOS"
  - "Abrir en Web"
  - "Instalar dependencias"

## 📱 Desarrollo

### Testing en dispositivos

1. **Dispositivo físico:**

   - Instala Expo Go desde App Store/Google Play
   - Escanea el QR code que aparece en la terminal

2. **Emulador Android:**

   - Instala Android Studio
   - Configura un AVD (Android Virtual Device)
   - Ejecuta `npm run android`

3. **Simulador iOS (Solo macOS):**

   - Instala Xcode
   - Ejecuta `npm run ios`

4. **Navegador web:**
   - Ejecuta `npm run web`
   - Se abrirá automáticamente en tu navegador

## 🎨 Personalización

### Temas y colores

Los colores y temas se configuran en `constants/Colors.ts`

### Componentes

Los componentes reutilizables están en la carpeta `components/`

### Navegación

La navegación se maneja automáticamente con Expo Router basado en la estructura de archivos en `app/`

## 🚨 Notas importantes

### Versión de Node.js

Tu sistema tiene Node.js v16.13.0, pero React Native recomienda v18+. Considera actualizar:

```bash
# Con nvm (recomendado)
nvm install 18
nvm use 18

# O descarga directamente desde nodejs.org
```

### Desarrollo recomendado

1. Usa Expo Go para testing rápido en dispositivos reales
2. Usa emuladores para testing más completo
3. Usa la versión web para desarrollo de UI rápido

## 📚 Recursos útiles

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Navigation](https://reactnavigation.org/)

## 🤝 Desarrollo en equipo

Este proyecto está configurado con:

- ESLint para mantener código consistente
- TypeScript para desarrollo tipado
- Prettier (recomendado configurar en VS Code)

¡Happy coding! 🎉
