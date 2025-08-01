# 🏠 Hogar Conectado - Estructura del Proyecto

## 📁 Estructura Organizada

```
📦 hogarconectado/
├── 📱 app/                    # Pantallas principales de la aplicación
│   ├── (tabs)/               # Navegación por pestañas
│   ├── producto/             # Pantallas de productos individuales
│   └── _layout.tsx           # Layout principal
├── 🎨 assets/                # Recursos estáticos (imágenes, fuentes)
├── 🏗️ backend/               # Servidor y API
│   ├── models/               # Modelos de datos
│   └── routes/               # Rutas de la API
├── 🧩 components/            # Componentes reutilizables
│   ├── archive/              # Componentes no utilizados (respaldo)
│   ├── display/              # Componentes de visualización
│   ├── forms/                # Formularios y campos de entrada
│   ├── modals/               # Componentes modales
│   ├── product/              # Componentes específicos de productos
│   ├── search/               # Componentes de búsqueda
│   └── ui/                   # Componentes básicos de UI
├── ⚙️ constants/             # Constantes y configuraciones
├── 📊 data/                  # Archivos de datos (Excel, etc.)
├── 🔧 dev-scripts/           # Scripts de desarrollo y análisis
├── 📚 docs/                  # Documentación del proyecto
├── 🎣 hooks/                 # Custom hooks de React
├── 📋 scripts/               # Scripts de construcción
└── 🌐 services/              # Servicios de API y cliente
```

## 🔄 Cambios Realizados en la Reorganización

### ✅ Archivos Movidos y Organizados:

- **Scripts de desarrollo** → `dev-scripts/`
- **Documentación** → `docs/`
- **Datos Excel** → `data/`
- **Componentes organizados por categoría**:
  - Formularios → `components/forms/`
  - UI básicos → `components/ui/`
  - No utilizados → `components/archive/`

### 🗑️ Archivos Eliminados:

- Carpeta duplicada `hogarconectado/`
- Carpeta duplicada `_vscode/`

### 🔧 Actualizaciones:

- ✅ Importaciones actualizadas en todos los archivos
- ✅ Referencias a archivos corregidas
- ✅ Estructura modular implementada

## 🚀 Scripts Disponibles

```bash
# Instalar dependencias
npm install

# Desarrollo
npm start              # Iniciar Expo Dev Server
npm run android        # Abrir en Android
npm run ios           # Abrir en iOS
npm run web           # Abrir en Web

# Scripts de desarrollo
node dev-scripts/read-excel.js        # Leer datos Excel
node dev-scripts/analyze-formulas.js  # Analizar fórmulas
```

## 📋 Funcionalidad Preservada

✅ **Todas las funcionalidades existentes se mantienen intactas**:

- Sistema de cotización
- Gestión de productos
- Filtros y búsqueda
- Formularios dinámicos
- API backend
- Navegación por pestañas

## 🎯 Próximos Pasos Sugeridos

1. **Completar componentes vacíos** en `components/display/` y `components/forms/`
2. **Implementar componentes modulares** para cotización y productos
3. **Optimizar importaciones** usando barrel exports
4. **Agregar tests** para componentes críticos
5. **Documentar APIs** del backend
