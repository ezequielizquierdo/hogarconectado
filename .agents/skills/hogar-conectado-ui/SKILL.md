---
name: hogar-conectado-ui
description: Implementar, revisar o endurecer la interfaz adaptable de Hogar Conectado respetando su producto, sistema visual, accesibilidad y comportamiento web/iOS/Android. Usar para cambios de pantallas, componentes, navegación, catálogo, cotizaciones, calculadora o historias de Instagram del frontend; no usar para tareas exclusivamente de backend o infraestructura.
---

# Interfaz de Hogar Conectado

Construye una vidriera operativa cálida, ordenada y eficiente sin degradar los flujos comerciales existentes.

## Contexto requerido

Antes de modificar la interfaz:

1. Lee `AGENTS.md` para conocer arquitectura, validaciones y límites de autorización.
2. Lee `PRODUCT.md` para entender el usuario y la función del producto.
3. Lee `DESIGN.md` para aplicar tokens, jerarquía, capas y reglas visuales.
4. Lee `docs/ui-audit-2026-08-24.md` solo si la tarea implica auditoría, accesibilidad, adaptabilidad, rendimiento visual o endurecimiento.

No copies esos documentos dentro de esta skill. Son las fuentes de verdad y deben mantenerse en un solo lugar.

## Criterios de implementación

- Conserva los cálculos y contratos comerciales existentes; un cambio visual no debe alterar precios, permisos, stock ni persistencia.
- Diseña primero el flujo y la jerarquía de lectura. Usa Lavanda Operativa para acciones, Menta Disponible para disponibilidad y Durazno Cercano para acompañamiento.
- Mantén capas suaves y componentes amables y precisos. Evita el panel administrativo frío, la saturación promocional y la decoración infantil.
- Usa los tokens compartidos en lugar de introducir colores, radios, sombras o espaciados locales.
- Trata web, iOS y Android como superficies relacionadas, no idénticas. Usa medidas reactivas y patrones nativos cuando difieran.
- Todo control iconográfico debe tener nombre accesible, rol, estado cuando corresponda y área táctil suficiente.
- Prefiere SF Symbols en iOS y Material Icons en Android/web mediante el mapa común. No uses emojis como único significado de una acción crítica.
- En listas de crecimiento variable, usa virtualización y claves estables. Evita montar catálogos completos dentro de `ScrollView`.

## Flujo

1. Localiza la ruta, componentes y estado afectados.
2. Verifica si ya existe un patrón reutilizable antes de crear otro.
3. Explica cualquier cambio visual material y respeta las autorizaciones definidas en `AGENTS.md`.
4. Implementa el cambio mínimo coherente con `PRODUCT.md` y `DESIGN.md`.
5. Valida lint y exportación web; para cambios adaptables, inspecciona escritorio y al menos dos anchos móviles.
6. Informa por separado los problemas preexistentes y los introducidos por el cambio.

## Uso de Impeccable

Usa Impeccable para análisis o refinamientos especializados cuando la tarea lo justifique. Las auditorías son de solo lectura: presenta primero los hallazgos y no conviertas una auditoría en autorización automática para rediseñar.

## Precedencia

Ante contradicciones, sigue este orden: solicitud actual del usuario, `AGENTS.md`, `PRODUCT.md`, `DESIGN.md`, auditorías históricas.
