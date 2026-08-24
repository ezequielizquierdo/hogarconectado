---
name: Hogar Conectado
description: Una vidriera operativa para administrar, calcular y compartir productos del hogar.
colors:
  lavanda-operativa: "#a8b5ff"
  lavanda-operativa-intensa: "#8b99e8"
  menta-disponible: "#b8f5d1"
  menta-disponible-intensa: "#9ae6b9"
  durazno-cercano: "#ffd6a8"
  durazno-cercano-intenso: "#ffb380"
  fondo-lavanda: "#faf8ff"
  superficie: "#ffffff"
  superficie-catalogo: "#f8faff"
  texto-principal: "#4a5568"
  texto-secundario: "#718096"
  texto-suave: "#a0aec0"
  borde-suave: "#e2e8f0"
  error-suave: "#ffb8b8"
  advertencia-suave: "#ffeaa8"
  informacion-suave: "#b8e6ff"
  navegacion-teal: "#0a7ea4"
typography:
  display:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.25
  headline:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.35
rounded:
  sm: "6px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.lavanda-operativa}"
    textColor: "{colors.texto-principal}"
    rounded: "{rounded.md}"
    padding: "16px 24px"
    height: "48px"
  card-product:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.texto-principal}"
    rounded: "{rounded.lg}"
    padding: "16px"
  input-default:
    backgroundColor: "{colors.superficie}"
    textColor: "{colors.texto-principal}"
    rounded: "{rounded.md}"
    padding: "16px"
    height: "56px"
  chip-selected:
    backgroundColor: "{colors.lavanda-operativa}"
    textColor: "{colors.superficie}"
    rounded: "{rounded.sm}"
    padding: "8px"
---

# Design System: Hogar Conectado

## Overview

**Creative North Star: "La Vidriera Operativa"**

Hogar Conectado combina la claridad de una herramienta de trabajo con la capacidad de exhibir un producto de manera comercial. La interfaz debe permitir reconocer rápidamente imagen, marca, modelo, stock y precio, y pasar sin fricción a calcular, cotizar o compartir.

El carácter es cálido, ordenado y eficiente. Las superficies claras y los acentos pastel aportan cercanía, mientras la jerarquía, el espaciado y la respuesta de los controles mantienen precisión operativa. La identidad evita tres extremos: el panel administrativo genérico y frío, el ecommerce saturado de promociones y la interfaz infantil o excesivamente decorativa.

**Key Characteristics:**

- Imágenes de producto protagonistas y datos comerciales escaneables.
- Capas suaves mediante fondos tonales, bordes claros y sombras ambientales.
- Controles amables y precisos, con etiquetas comprensibles y estados visibles.
- Densidad adaptativa: compacta sin truncar en móvil y mejor aprovechada en escritorio.
- Color funcional antes que ornamental.

## Colors

La paleta combina una base lavanda muy clara con acentos pastel que comunican acción, disponibilidad y atención sin competir con las imágenes del catálogo.

### Primary

- **Lavanda Operativa** (`#a8b5ff`): acciones principales, selección y foco de marca.
- **Lavanda Operativa Intensa** (`#8b99e8`): énfasis, estados presionados y contraste complementario.

### Secondary

- **Menta Disponible** (`#b8f5d1`): disponibilidad, confirmación y resultados positivos.
- **Menta Disponible Intensa** (`#9ae6b9`): estado activo con mayor contraste.

### Tertiary

- **Durazno Cercano** (`#ffd6a8`): atención contextual y acentos cálidos.
- **Durazno Cercano Intenso** (`#ffb380`): advertencias amables y énfasis secundario.

### Neutral

- **Fondo Lavanda** (`#faf8ff`): fondo general con temperatura de marca.
- **Superficie** (`#ffffff`): formularios, cards y modales.
- **Superficie Catálogo** (`#f8faff`): agrupación tonal de información.
- **Texto Principal** (`#4a5568`): títulos, valores y controles.
- **Texto Secundario** (`#718096`): metadatos y explicaciones.
- **Texto Suave** (`#a0aec0`): placeholder y contenido de baja prioridad.
- **Borde Suave** (`#e2e8f0`): separación estructural.

**The Functional Pastel Rule.** Cada pastel tiene una tarea. No usar lavanda, menta o durazno como decoración sin significado.

**The Teal Containment Rule.** El teal de navegación (`#0a7ea4`) es un token heredado de la navegación de Expo; no extenderlo a nuevos componentes hasta decidir si se unifica con Lavanda Operativa.

## Typography

**Display Font:** fuente del sistema con fallbacks nativos.
**Body Font:** fuente del sistema con fallbacks nativos.
**Label/Mono Font:** Space Mono solo cuando el contenido verdaderamente sea técnico o tabular.

**Character:** La tipografía es directa, familiar y de rápida lectura. El peso crea jerarquía; no se depende de familias decorativas para producir carácter.

### Hierarchy

- **Display** (700, 32 px, 1.25): títulos excepcionales y entradas de sección.
- **Headline** (700, 24 px, 1.3): encabezados principales de pantalla y modal.
- **Title** (700, 18 px, 1.35): nombres de producto, bloques y resultados.
- **Body** (400, 16 px, 1.5): formularios, ayudas y contenido operativo.
- **Label** (600, 12 px, 1.35): estados, etiquetas y metadatos; mayúsculas solo para rótulos breves como `PRECIO CONTADO`.

**The Scan Before Style Rule.** Marca, modelo, stock y precio deben distinguirse al recorrer la pantalla sin leer cada línea completa.

## Layout

El sistema utiliza una escala base de 4, 8, 16, 24, 32 y 48 px. En móvil prioriza una sola columna, controles táctiles y navegación inferior; en escritorio utiliza barra lateral, grillas y mayor espacio horizontal. Las cards de producto deben aumentar el protagonismo de la imagen en pantallas amplias, evitando crear columnas tan estrechas que trunquen los datos.

Los formularios mantienen etiquetas encima del control. Los modales concentran una tarea y deben conservar acciones principales visibles sin ocultar contenido importante. En iOS se respetan safe areas y objetivos táctiles mínimos de 44 pt; en Android se respetan insets, Back del sistema y objetivos mínimos de 48 dp.

## Elevation & Depth

La filosofía es de **capas suaves**. La separación principal proviene de cambios tonales y bordes claros; las sombras son ambientales, teñidas de lavanda y de baja intensidad. Los estados interactivos pueden aumentar ligeramente la profundidad, pero no deben convertir cada bloque en una card flotante.

### Shadow Vocabulary

- **Ambient Small** (`0 1px 3px rgba(168, 181, 255, 0.15)`): campos y controles discretos.
- **Ambient Medium** (`0 2px 6px rgba(168, 181, 255, 0.15)`): botones y cards habituales.
- **Ambient Large** (`0 4px 12px rgba(168, 181, 255, 0.25)`): modales o superficies temporalmente elevadas.

**The Soft Layers Rule.** Empezar con tono y borde; agregar sombra solo cuando aclare jerarquía o interacción.

## Shapes

Las formas son redondeadas y amables, con radios de 6 px para chips compactos, 12 px para controles, 16 px para cards y 24 px para superficies protagonistas. Los radios completos se reservan para indicadores o avatares. Bordes finos y continuos delimitan contenido sin endurecerlo.

## Components

### Buttons

- **Shape:** rectángulos amables de 12 px y altura mínima de 48 px.
- **Primary:** Lavanda Operativa, texto oscuro, padding de 16 × 24 px y peso 600.
- **Pressed / Focus:** ligera reducción de escala en táctil; foco visible mediante borde o anillo lavanda intenso en web.
- **Secondary / Accent / Danger:** Menta Disponible, Durazno Cercano o Error Suave según significado, nunca por variedad decorativa.

### Chips

- **Style:** radio de 6 px, padding compacto y texto de 12–14 px.
- **State:** selección lavanda con texto blanco; disponibilidad menta con texto oscuro.

### Cards / Containers

- **Corner Style:** 16 px.
- **Background:** Superficie o Superficie Catálogo.
- **Shadow Strategy:** Ambient Medium solo cuando la card necesita separarse del fondo.
- **Border:** 1 px en Borde Suave.
- **Internal Padding:** 16 px; 24 px en composiciones amplias.
- **Producto:** imagen dominante, información escaneable y acciones separadas del contenido mediante divisor.

### Inputs / Fields

- **Style:** superficie blanca, borde de 1–2 px, radio de 12 px y altura mínima de 56 px.
- **Focus:** transición hacia Lavanda Operativa, sin depender únicamente de una animación de escala.
- **Error / Disabled:** mensaje textual asociado; el color complementa y no reemplaza la explicación.

### Navigation

- En móvil, navegación inferior con destinos principales y etiquetas visibles.
- En escritorio, filtros laterales y contenido central; aprovechar el ancho sin estirar líneas o formularios innecesariamente.
- Mantener affordances nativas de Back, safe areas y tamaño táctil en iOS y Android.

### Instagram Story

La imagen es el elemento protagonista. La información opcional libera espacio para ampliarla; precio contado, marca, modelo y categoría conservan jerarquía cuando se muestran. La pieza evita parecer un banner promocional saturado.

## Do's and Don'ts

### Do:

- **Do** utilizar la escala de espaciado compartida y los tokens de `constants/theme.ts`.
- **Do** comprobar escritorio, web móvil, iOS y Android según el alcance del cambio.
- **Do** mantener etiquetas de acción explícitas junto a iconos importantes.
- **Do** reservar Menta Disponible para estados positivos o disponibilidad.
- **Do** dar prioridad visual a imagen, modelo y precio contado en el catálogo.

### Don't:

- **Don't** convertir la aplicación en un panel administrativo genérico, gris y sin identidad.
- **Don't** imitar un ecommerce saturado de banners, descuentos, badges y llamados simultáneos.
- **Don't** usar emojis, pasteles o animaciones de forma infantil o meramente decorativa.
- **Don't** anidar cards dentro de cards cuando espacio, borde o alineación sean suficientes.
- **Don't** agregar colores hex aislados cuando exista un token semántico equivalente.
- **Don't** ocultar funciones esenciales detrás de iconos sin etiqueta o targets táctiles pequeños.
