# Backlog de experiencia de usuario

## Propósito

Este documento ordena las mejoras de experiencia de Hogar Conectado alrededor del recorrido principal:

> Encontrar un producto → comprender stock y precio → cotizar → compartir.

El backlog complementa `PRODUCT.md`, `DESIGN.md` y `docs/ui-audit-2026-08-24.md`. No reemplaza esos documentos ni autoriza cambios por sí mismo.

## Criterio de priorización

- **P1 — Experiencia esencial:** problemas que afectan tareas cotidianas, comprensión, acceso o uso adaptable.
- **P2 — Venta y comunicación:** mejoras que reducen pasos al cotizar y compartir.
- **P3 — Calidad continua:** rendimiento, consistencia y mecanismos preventivos.

Dentro de una misma prioridad se recomienda avanzar en el orden documentado. Cada tarea debe implementarse, validarse y aprobarse antes de comenzar la siguiente.

## Definición de terminado

Una tarea de interfaz se considera terminada cuando:

- Cumple sus criterios de aceptación funcionales.
- Se verificó en escritorio y viewport móvil web.
- Conserva compatibilidad con Expo, iOS y Android según su alcance.
- Incluye estados de carga, vacío, error y confirmación cuando correspondan.
- Mantiene foco visible, nombres accesibles y áreas táctiles adecuadas.
- Usa los tokens de `constants/theme.ts` y respeta `DESIGN.md`.
- No duplica fórmulas de precios ni controles de autorización del backend.
- Supera `npm run lint`, TypeScript y la exportación web cuando corresponda.

---

## P1 — Experiencia esencial

### UX-001 — Navegación adaptable y comprensible

**Estado:** Completada  
**Objetivo:** permitir que cada destino principal sea reconocible y accesible sin textos truncados.

**Historia de usuario:** como persona que usa la aplicación desde celular o escritorio, quiero identificar y alcanzar rápidamente cada sección para no perder tiempo buscando funciones.

**Criterios de aceptación:**

- En móvil, la navegación inferior conserva etiquetas legibles y objetivos táctiles de al menos 44–48 px.
- En escritorio, la navegación aprovecha el ancho disponible y no se comporta como una barra móvil estirada.
- La sección activa se reconoce mediante texto, color y estado, no solo por el icono.
- Calculadora, cotizaciones, stock, productos, usuarios y perfil se presentan según permisos.
- Navegación con teclado y foco visible en web.
- No hay desbordes ni truncamientos críticos en anchos de 360, 390, 768, 1280 y 1440 px.

**Validación:** recorrido completo por todas las rutas con rol administrador y con un rol limitado.

**Implementación preparada:**

- Barra inferior limitada a cinco destinos en móvil.
- Acceso móvil a Usuarios desde Perfil para administradores.
- Barra superior horizontal y compacta desde 1024 px en web.
- Estado activo con superficie, texto e icono; foco de teclado visible en escritorio.
- Operación en el centro; Contacto, Usuarios y Perfil como destinos secundarios según contexto y permisos.
- Validación visual confirmada en móvil y escritorio; se eliminó la composición lateral que generaba espacio vacío en el catálogo.

### UX-002 — Catálogo adaptable y escaneable

**Estado:** En validación  
**Objetivo:** convertir el catálogo en una vidriera operativa donde imagen, modelo, precio contado y stock se comprendan de inmediato.

**Historia de usuario:** como vendedor, quiero reconocer productos y sus datos principales de un vistazo para responder rápido durante una consulta.

**Criterios de aceptación:**

- La imagen es protagonista y utiliza un encuadre consistente sin deformarse.
- Marca, modelo, precio contado y stock tienen una jerarquía estable.
- Las cards tienen una composición específica para móvil y otra para escritorio.
- El escritorio evita tanto cards excesivamente anchas como grillas de columnas demasiado estrechas.
- Las acciones de compartir, editar y eliminar tienen nombre accesible y ayuda visible.
- Los productos sin imagen muestran un estado neutro coherente, no un espacio vacío confuso.
- Textos largos se resuelven sin ocultar los datos comerciales principales.

**Validación:** catálogo con imágenes verticales, cuadradas, horizontales y ausentes; modelos y descripciones de distinta longitud.

**Implementación preparada:**

- Grilla de dos columnas en escritorio con composición horizontal e imagen protagonista.
- Jerarquía estable de stock, categoría, marca, modelo, descripción y precio contado.
- Precio contado anclado en la zona inferior de la información para facilitar comparaciones.
- Estado explícito “Sin imagen” con acceso orientativo para administradores.
- Card completa accesible como acción para abrir el detalle; acciones administrativas con nombres específicos.

### UX-003 — Búsqueda y filtros eficientes

**Estado:** En validación  
**Objetivo:** reducir el tiempo necesario para encontrar un producto.

**Historia de usuario:** como vendedor, quiero buscar por marca, modelo o categoría y comprender qué filtros están aplicados para llegar al producto correcto sin recorrer todo el catálogo.

**Criterios de aceptación:**

- El buscador es visible y usable tanto en móvil como en escritorio.
- Los filtros móviles se abren en una superficie adecuada y pueden cerrarse sin perder el contexto.
- Los filtros de escritorio permanecen accesibles sin reducir excesivamente el catálogo.
- Los filtros activos se reconocen y pueden limpiarse de forma individual o conjunta.
- Se informa la cantidad de resultados y se diferencia “sin productos” de “sin coincidencias”.
- La búsqueda tolera mayúsculas, minúsculas y espacios accidentales.

**Validación:** búsquedas con cero, uno y muchos resultados; combinaciones de categoría y texto.

**Implementación preparada:**

- Conteo de resultados visible y actualizado en escritorio y mobile.
- Búsqueda incluida en el estado general de filtros y en la acción de limpieza.
- Filtros estructurados representados mediante chips removibles en mobile.
- Estados diferenciados para catálogo vacío y búsqueda sin coincidencias, con recuperación explícita.
- El modal móvil anticipa cuántos productos se verán antes de cerrarse.
- Las consultas concurrentes conservan el filtro más reciente y descartan respuestas obsoletas.

### UX-004 — Estados de carga, error, vacío y recuperación

**Estado:** En validación  
**Objetivo:** evitar pantallas silenciosas y explicar qué está sucediendo, especialmente durante el arranque en frío del backend.

**Historia de usuario:** como usuario, quiero saber si la aplicación está cargando, no encontró datos o necesita una acción mía para no interpretar una demora como una falla.

**Criterios de aceptación:**

- Cada pantalla de datos presenta estados diferenciados de carga, vacío y error.
- El arranque en frío se comunica únicamente cuando existe una demora real.
- Los errores recuperables ofrecen una acción explícita para reintentar.
- Las confirmaciones de crear, modificar, copiar y eliminar son claras y temporales.
- Los mensajes usan voz amable y precisa; no exponen detalles técnicos internos.
- Los estados se comunican con texto además de color o iconos.

**Validación:** simular demora, respuesta vacía, falta de red, `401`, `403` y error del servidor.

**Implementación preparada:**

- Panel reutilizable para carga, error y ausencia de datos con comunicación accesible.
- El catálogo diferencia carga inicial, catálogo vacío y búsqueda sin coincidencias.
- Los errores de conexión ofrecen “Reintentar” y explican el arranque del servicio sin detalles internos.
- La administración de usuarios diferencia carga, lista vacía, acceso restringido y error recuperable.
- Los selectores de categorías permiten reintentar la consulta sin recargar toda la pantalla.
- Las búsquedas sin resultados ofrecen recuperación inmediata limpiando los filtros.

### UX-005 — Carga y edición de productos

**Estado:** En validación  
**Objetivo:** hacer que el formulario sea rápido, comprensible y seguro.

**Historia de usuario:** como administrador, quiero cargar o corregir un producto sin dudas sobre los datos requeridos ni sobre el resultado del guardado.

**Criterios de aceptación:**

- Los campos se agrupan por identidad, precio/stock, descripción e imagen.
- Los campos obligatorios y sus formatos se explican antes del envío.
- Los errores se muestran junto al campo correspondiente y el foco llega al primer error.
- La imagen seleccionada tiene vista previa, reemplazo y eliminación comprensibles.
- Crear y guardar edición tienen estados de progreso y evitan envíos duplicados.
- Cerrar con cambios sin guardar solicita confirmación.
- La eliminación exige confirmación con marca y modelo del producto.

**Validación:** alta completa, alta inválida, edición parcial, reemplazo de imagen, cierre accidental y eliminación.

**Implementación preparada:**

- El formulario agrupa identidad, precio/disponibilidad y descripción/imagen.
- Los campos obligatorios se explican y validan junto al control correspondiente.
- Una validación fallida lleva el formulario al comienzo para hacer visibles los primeros errores.
- Crear y editar bloquean envíos duplicados y comunican el progreso de guardado.
- Cerrar un formulario modificado solicita confirmación antes de descartar los cambios.
- La imagen conserva acciones explícitas para agregar, reemplazar y eliminar.

### UX-006 — Accesibilidad operativa básica

**Estado:** Completada  
**Objetivo:** asegurar que las tareas esenciales puedan completarse con teclado, lector de pantalla y objetivos táctiles adecuados.

**Historia de usuario:** como usuario con distintas capacidades o dispositivos de entrada, quiero comprender y operar los controles sin depender exclusivamente de su apariencia.

**Criterios de aceptación:**

- Botones e iconos interactivos declaran nombre, rol y estado accesible.
- Todos los controles web importantes admiten teclado y foco visible.
- Los diálogos conservan el foco, tienen título y pueden cerrarse de forma predecible.
- Los campos poseen etiquetas asociadas y mensajes de error identificables.
- El contraste de texto y controles principales es suficiente.
- Las áreas táctiles respetan mínimos de plataforma.

**Validación:** recorrido por teclado y revisión con herramientas de accesibilidad en login, catálogo, formulario y cotización.

**Implementación preparada:**

- La navegación de escritorio declara estructura de pestañas, selección y foco visible.
- Inputs y selectores anuncian etiqueta, obligatoriedad, estado expandido, selección y errores.
- Botones principales y acciones iconográficas exponen nombre, estado y área táctil mínima.
- Los filtros comunican selección mediante semántica además de color.
- Las acciones de agregar, reemplazar y eliminar imágenes poseen nombres accesibles.
- Validación manual completada mediante recorrido operativo con teclado en web.

---

## P2 — Venta y comunicación

### UX-007 — Calculadora orientada a copia rápida

**Estado:** Pendiente  
**Objetivo:** obtener y reutilizar valores comerciales con el mínimo de pasos.

**Criterios de aceptación:**

- Valor inicial y porcentaje tienen etiquetas, formato y validación inequívocos.
- Precio contado, factura y cuotas poseen jerarquía diferenciada.
- Cada resultado incluye una acción “Copiar”.
- Existe una acción para copiar un resumen completo con formato legible.
- La interfaz confirma exactamente qué valor fue copiado.
- Los cálculos se obtienen de la API y no se replican en el frontend.

### UX-008 — Flujo de cotización consistente

**Estado:** Pendiente  
**Objetivo:** preparar, revisar y conservar una cotización confiable.

**Criterios de aceptación:**

- El usuario reconoce producto, cantidades, condiciones y totales antes de confirmar.
- Los errores indican qué dato falta o es inválido.
- La cotización conserva una instantánea de los datos y precios utilizados.
- La vista previa funciona en móvil y escritorio sin contenido cortado.
- El resultado diferencia claramente contado, factura y cuotas.
- Repetir o editar una cotización no altera silenciosamente la versión anterior.

### UX-009 — Compartir cotizaciones por WhatsApp

**Estado:** Pendiente  
**Objetivo:** producir un mensaje comercial breve y legible sin edición manual obligatoria.

**Criterios de aceptación:**

- El mensaje identifica producto, condición comercial, precio y vigencia cuando corresponda.
- No incluye campos vacíos, valores duplicados ni formato técnico.
- Antes de compartir existe una vista previa editable o confirmable.
- En móvil abre el flujo nativo disponible; en escritorio ofrece alternativa de copia o WhatsApp Web.
- Se prueba con una y varias líneas de producto.

### UX-010 — Historias de Instagram flexibles

**Estado:** Pendiente  
**Objetivo:** generar piezas coherentes donde la imagen mantenga protagonismo y la información elegida sea legible.

**Criterios de aceptación:**

- La imagen crece cuando se desactivan campos informativos.
- Categoría, modelo, marca, precio contado, stock y descripción responden correctamente a sus controles.
- La composición evita huecos innecesarios y desbordes con textos largos.
- La vista previa coincide con el archivo exportado.
- El resultado se verifica en al menos dos tamaños de teléfono.
- La pieza respeta `DESIGN.md` y no se convierte en un banner saturado.

### UX-011 — Estados de usuarios y permisos comprensibles

**Estado:** Pendiente  
**Objetivo:** hacer segura y clara la administración de accesos.

**Criterios de aceptación:**

- Pendiente, activo y bloqueado se explican con texto y estado visual.
- Aprobar, bloquear y cambiar rol solicitan confirmación proporcional al riesgo.
- La pantalla informa el efecto de cada rol antes de guardarlo.
- Los controles no autorizados no se muestran y las operaciones siguen protegidas por el backend.
- El usuario afectado obtiene un mensaje comprensible al intentar acceder.

---

## P3 — Calidad continua

### UX-012 — Rendimiento del catálogo

**Estado:** Pendiente  
**Objetivo:** conservar fluidez con catálogos grandes y conexiones móviles.

**Criterios de aceptación:**

- Los listados principales utilizan virtualización o paginación efectiva.
- Las imágenes cargan de manera progresiva y reservan su espacio para evitar saltos.
- Buscar o filtrar no provoca solicitudes ni renders innecesarios.
- Se documenta una línea base y una comparación posterior.

### UX-013 — Consolidación de tokens y temas

**Estado:** Pendiente  
**Objetivo:** reducir inconsistencias y estilos aislados.

**Criterios de aceptación:**

- Los nuevos componentes no incorporan colores hexadecimales si existe un token equivalente.
- Lavanda, menta y durazno mantienen su significado funcional.
- Se decide y documenta el destino del teal heredado.
- Se completa el modo oscuro o se retira su exposición hasta implementarlo correctamente.
- Espaciado, radios, tipografía y sombras utilizan vocabulario compartido.

### UX-014 — Validación visual repetible

**Estado:** Pendiente  
**Objetivo:** detectar regresiones en las pantallas principales antes del despliegue.

**Criterios de aceptación:**

- Se definen capturas de referencia para login, catálogo, producto, calculadora, cotización e Instagram.
- Cada superficie se captura al menos en escritorio y móvil.
- Las diferencias se presentan para revisión humana; no se actualizan referencias automáticamente.
- El procedimiento puede ejecutarse localmente y en integración continua.

### UX-015 — Medición y retroalimentación

**Estado:** Pendiente  
**Objetivo:** priorizar mejoras mediante uso real y no solo percepción visual.

**Criterios de aceptación:**

- Se registra tiempo y cantidad de pasos de los recorridos principales sin almacenar datos sensibles.
- Existe un formato breve para anotar problema, contexto, frecuencia e impacto.
- El backlog se revisa con evidencia de uso al menos una vez al mes durante la etapa activa.
- Las tareas cerradas conservan una nota breve de validación y resultado.

### UX-016 — Evolución del sistema visual

**Estado:** Pendiente  
**Objetivo:** mejorar la calidad visual general sin comprometer la operación estable ni iniciar una migración tecnológica innecesaria.

**Criterios de aceptación:**

- Se realiza primero una auditoría visual de las superficies principales y se identifican problemas concretos de jerarquía, densidad, tipografía y consistencia.
- Se compara continuar con componentes propios frente a Tamagui, React Native Paper y Gluestack según compatibilidad real con Expo y React Native Web.
- La evaluación incluye costo de migración, tamaño del bundle, accesibilidad, mantenimiento y capacidad de expresar `DESIGN.md`.
- Se construye un prototipo aislado de una superficie representativa antes de adoptar una librería.
- La decisión queda documentada con evidencia y no obliga a reescribir pantallas operativamente estables.
- La migración, si se aprueba, se realiza gradualmente y con validación visual en escritorio y móvil.

---

## Skills propuestas

### SKILL-001 — `hogar-conectado-release`

**Estado:** Propuesta  
**Resultado esperado:** informe repetible de preparación para entrega.

- Frontend: lint, TypeScript y exportación web.
- Backend: pruebas y comprobación de arranque relevante.
- Revisión de secretos, archivos involuntarios y estado de Git.
- Verificación del formato de commit.
- Nunca realiza commit, push, deploy o cambios de datos sin autorización explícita.

### SKILL-002 — `hogar-conectado-ux-review`

**Estado:** Propuesta  
**Resultado esperado:** auditoría de una superficie contra `PRODUCT.md`, `DESIGN.md` y este backlog.

- Evalúa escritorio y móvil.
- Revisa jerarquía, adaptabilidad, accesibilidad, estados y claridad del texto.
- Produce hallazgos priorizados y criterios de aceptación.
- No modifica la interfaz durante una auditoría de solo lectura.

### SKILL-003 — `hogar-conectado-domain-safety`

**Estado:** Propuesta  
**Resultado esperado:** revisión preventiva de reglas sensibles.

- Detecta cálculos de precios duplicados fuera del backend.
- Revisa límites de autorización y permisos.
- Señala riesgos en cotizaciones, imágenes, autenticación y operaciones de datos.
- Exige respaldo y autorización para migraciones o cambios masivos.

## Automatizaciones propuestas

### AUTO-001 — Integración continua del frontend

**Prioridad:** Alta  
**Estado:** Propuesta

- Ejecutar lint, TypeScript y exportación web en cada pull request y push relevante.
- Bloquear una integración si falla una validación obligatoria.
- No desplegar desde la automatización; Render conserva el despliegue por commit en `main`.

### AUTO-002 — Integración continua del backend

**Prioridad:** Alta  
**Estado:** Propuesta

- Ejecutar pruebas del backend en cada pull request y push relevante.
- Incorporar gradualmente pruebas de autenticación, precios, productos e imágenes.

### AUTO-003 — Smoke test posterior al despliegue

**Prioridad:** Alta  
**Estado:** Propuesta

- Comprobar disponibilidad del frontend y `/health` del backend.
- Verificar una operación pública segura sin credenciales ni datos sensibles.
- Informar fallos; no ejecutar rollback automáticamente.

### AUTO-004 — Auditoría de dependencias

**Prioridad:** Media  
**Estado:** Propuesta

- Ejecutar semanalmente una auditoría de frontend y backend.
- Separar dependencias de desarrollo de vulnerabilidades alcanzables en producción.
- Generar un informe revisable y no aplicar actualizaciones mayores automáticamente.

### AUTO-005 — Revisión de documentación

**Prioridad:** Media  
**Estado:** Propuesta

- Revisar mensualmente durante la etapa activa y cada 2–3 meses en mantenimiento.
- Detectar diferencias entre código, variables, comandos, arquitectura, despliegue y documentación.
- Proponer cambios sin publicarlos automáticamente.

### AUTO-006 — Regresión visual

**Prioridad:** Media  
**Estado:** Propuesta

- Capturar superficies principales en escritorio y móvil.
- Comparar contra referencias aprobadas.
- Requerir decisión humana para aceptar diferencias.

---

## Secuencia sugerida de ejecución

1. `UX-001` — Navegación adaptable.
2. `UX-002` — Catálogo adaptable.
3. `UX-003` — Búsqueda y filtros.
4. `UX-004` — Estados y recuperación.
5. `UX-005` — Carga y edición.
6. `UX-006` — Accesibilidad transversal de las superficies anteriores.
7. `AUTO-001` y `AUTO-002` — Validaciones automáticas antes de ampliar cambios.
8. Bloque P2 en el orden definido.
9. Bloque P3 según evidencia de uso.

## Revisión del backlog

- Revisar semanalmente mientras haya trabajo activo de experiencia de usuario.
- Reordenar solamente con una razón documentada: impacto, frecuencia, dependencia, riesgo o aprendizaje de uso real.
- No marcar una tarea como completada sin registrar cómo se validó.
- Los cambios de alcance relevantes deben reflejarse también en `PRODUCT.md`, `DESIGN.md` o `AGENTS.md` cuando corresponda.
