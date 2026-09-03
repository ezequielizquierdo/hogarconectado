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

### UX-000 — Investigación de referentes mobile de ecommerce

**Estado:** Pendiente
**Objetivo:** revisar patrones de navegación y presentación mobile respaldados por casos actuales, comentarios de uso y buenas prácticas verificables antes de rediseñar la interfaz general.

**Criterios de investigación:**

- Comparar al menos cinco ecommerce reconocidos por su experiencia móvil.
- Priorizar evidencia de usabilidad, accesibilidad y navegabilidad por encima de tendencias visuales.
- Analizar navegación, búsqueda, filtros, cards, detalle de producto y acciones comerciales.
- Separar patrones transferibles de decisiones propias de cada marca.
- Documentar capturas, fuentes, hallazgos y una recomendación aplicable a Hogar Conectado.
- Validar cualquier propuesta tanto en Safari iPhone como en Android y escritorio.

**Dependencia:** realizar cuando el flujo operativo prioritario esté estabilizado.

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
- Piloto de encabezado operativo unificado en Productos: identidad, sección activa y navegación comparten una única barra en escritorio; se eliminó el encabezado duplicado.
- El logo utiliza directamente su forma circular turquesa, sin un segundo contenedor blanco, y la superficie del encabezado emplea un lavanda claro para conservar jerarquía y contraste.

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
- Piloto posterior inspirado en patrones de ecommerce: encabezado cromático sin fotografía y cards verticales de tres o cuatro columnas según el ancho disponible.
- Área multimedia blanca, amplia y sin borde interior; la imagen utiliza `contain` para conservar su proporción y queda centrada con márgenes consistentes.
- En viewports angostos, composición vertical: imagen protagonista, información debajo y acciones iconográficas con nombre accesible.
- Jerarquía estable de stock, categoría, marca, modelo, descripción y precio contado.
- Precio contado anclado en la zona inferior de la información para facilitar comparaciones.
- Estado explícito “Sin imagen” con acceso orientativo para administradores.
- En escritorio, los productos sin imagen reducen el área multimedia a un estado compacto con borde discontinuo, evitando cards visualmente vacías de gran altura.
- Card completa accesible como acción para abrir el detalle; acciones administrativas con nombres específicos.
- Se reservó espacio para la navegación inferior y se limitó el ancho del contenido para evitar recortes y desplazamiento horizontal.

**Validación visual parcial:** en viewport móvil de aproximadamente 390 × 844 se confirmó la composición vertical, la imagen protagonista y la ausencia de compresión horizontal. Se ajustaron luego las etiquetas de navegación truncadas y el estado contradictorio “Disponible · 0”. Resta comprobar una card sin imagen y textos excepcionalmente largos.

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
- Precio base y porcentaje comercial se editan por separado; el formulario muestra el porcentaje efectivo actual y valida un rango de 0 a 100.
- Los productos existentes que aún no poseen un porcentaje propio conservan el porcentaje global como respaldo, sin exigir una migración masiva inmediata.
- Los selectores de marca y categoría permiten buscar mientras se escribe, ignoran diferencias de mayúsculas y acentos y reducen la lista inmediatamente.
- Una marca inexistente puede utilizarse desde el mismo selector; una categoría inexistente puede crearse sin cerrar el formulario y queda seleccionada al finalizar.
- En escritorio, el panel de opciones se limita a un ancho compacto; en móvil conserva el ancho disponible.

**Validación funcional parcial:** se confirmó en entorno local que modificar el porcentaje de un producto persiste el nuevo valor y actualiza su precio contado en el catálogo. Resta completar las pruebas del formulario con errores, cierre accidental y reemplazo de imagen.

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

**Estado:** En validación
**Objetivo:** obtener y reutilizar valores comerciales con el mínimo de pasos.

**Criterios de aceptación:**

- Valor inicial y porcentaje tienen etiquetas, formato y validación inequívocos.
- Precio contado, factura y cuotas poseen jerarquía diferenciada.
- Cada resultado incluye una acción “Copiar”.
- Existe una acción para copiar un resumen completo con formato legible.
- La interfaz confirma exactamente qué valor fue copiado.
- Los cálculos se obtienen de la API y no se replican en el frontend.

**Implementación preparada:**

- Valor inicial y porcentaje poseen formato, límites y errores contextualizados.
- Los resultados mantienen jerarquías específicas para contado, factura y cuotas.
- Cada resultado conserva una acción de copia con confirmación temporal y accesible.
- Se puede copiar un resumen completo con valor inicial, porcentaje, contado, factura y cuotas.
- La pantalla continúa consumiendo exclusivamente los cálculos oficiales de la API.

### UX-008 — Flujo de cotización consistente

**Estado:** En validación
**Objetivo:** preparar, revisar y conservar una cotización confiable.

**Criterios de aceptación:**

- El usuario reconoce producto, cantidades, condiciones y totales antes de confirmar.
- Los errores indican qué dato falta o es inválido.
- La cotización conserva una instantánea de los datos y precios utilizados.
- La vista previa funciona en móvil y escritorio sin contenido cortado.
- El resultado diferencia claramente contado, factura y cuotas.
- Repetir o editar una cotización no altera silenciosamente la versión anterior.

**Implementación preparada:**

- La preparación solicita cliente, teléfono, cantidad y modalidad antes de generar el resultado.
- La vista previa diferencia contado, factura, cuota, total financiado y total de la condición elegida.
- Los errores se presentan junto al dato que requiere corrección.
- La confirmación guarda en MongoDB una nueva cotización con datos del cliente y una instantánea del producto, porcentaje y precios usados.
- Cualquier cambio posterior invalida la vista previa anterior y obliga a generar una nueva versión antes de guardarla.
- El backend recalcula y conserva el porcentaje seleccionado con la misma fuente oficial de precios utilizada por la aplicación.

### UX-009 — Compartir cotizaciones por WhatsApp

**Estado:** En validación
**Objetivo:** producir un mensaje comercial breve y legible sin edición manual obligatoria.

**Criterios de aceptación:**

- El mensaje identifica producto, condición comercial, precio y vigencia cuando corresponda.
- No incluye campos vacíos, valores duplicados ni formato técnico.
- Antes de compartir existe una vista previa editable o confirmable.
- En móvil abre el flujo nativo disponible; en escritorio ofrece alternativa de copia o WhatsApp Web.
- Se prueba con una y varias líneas de producto.

**Implementación preparada:**

- La vista comercial muestra únicamente la modalidad elegida y evita mezclar alternativas no cotizadas.
- Contado destaca el total; las modalidades financiadas muestran cantidad de cuotas, valor de cuota y total financiado.
- El mensaje para WhatsApp contiene cliente, producto, cantidad y solo la condición seleccionada, sin campos comerciales alternativos.
- Existe una vista previa de texto independiente con acciones para copiar y abrir WhatsApp o WhatsApp Web.
- En Safari/PWA móvil, el enlace universal reemplaza la vista actual para conservar la apertura de WhatsApp después de preparar el mensaje; en escritorio se reserva la pestaña durante el clic para evitar bloqueos del navegador.
- El mensaje de éxito dejó de mostrarse ante una apertura bloqueada y el error ofrece `Copiar texto` como alternativa explícita.
- La columna de escritorio ahora permite desplazamiento y conserva espacio inferior para evitar que el total o las acciones queden cortados.
- La imagen generada utiliza la misma condición seleccionada que la cotización textual.

### UX-010 — Historias de Instagram flexibles

**Estado:** En validación
**Objetivo:** generar piezas coherentes donde la imagen mantenga protagonismo y la información elegida sea legible.

**Criterios de aceptación:**

- La imagen crece cuando se desactivan campos informativos.
- Categoría, modelo, marca, precio contado, stock y descripción responden correctamente a sus controles.
- La composición evita huecos innecesarios y desbordes con textos largos.
- La vista previa coincide con el archivo exportado.
- El resultado se verifica en al menos dos tamaños de teléfono.
- La pieza respeta `DESIGN.md` y no se convierte en un banner saturado.

**Implementación preparada:**

- La imagen utiliza el espacio liberado cuando se desactivan datos y deja de estar limitada por un alto máximo fijo.
- El panel informativo desaparece por completo cuando ninguno de sus campos visibles contiene información.
- Categoría, modelo, marca, precio contado, stock, descripción y llamado a consulta conservan controles independientes.
- Categoría y marca se limitan a una línea, modelo a dos y descripción a tres para evitar desbordes con contenido largo.
- La exportación captura exactamente el mismo componente que se utiliza como vista previa en cada plataforma.
- En web móvil, primero se prepara el archivo PNG y un segundo toque directo abre la hoja nativa del sistema cuando el navegador admite compartir archivos.
- En navegadores sin soporte y en escritorio, la misma acción descarga el PNG y explica cómo continuar en Instagram.
- La acción muestra un spinner con el estado “Preparando imagen…” y evita solicitudes duplicadas mientras genera la historia.
- Cualquier cambio en los datos visibles invalida el archivo preparado para evitar compartir una versión anterior.
- Queda pendiente la comprobación manual en dos anchos de teléfono antes de marcar la tarea como completada.

### UX-011 — Estados de usuarios y permisos comprensibles

**Estado:** En validación
**Objetivo:** hacer segura y clara la administración de accesos.

**Criterios de aceptación:**

- Pendiente, activo y bloqueado se explican con texto y estado visual.
- Aprobar, bloquear y cambiar rol solicitan confirmación proporcional al riesgo.
- La pantalla informa el efecto de cada rol antes de guardarlo.
- Los controles no autorizados no se muestran y las operaciones siguen protegidas por el backend.
- El usuario afectado obtiene un mensaje comprensible al intentar acceder.

**Implementación preparada:**

- Pendiente, activo y bloqueado poseen etiquetas, color semántico y una explicación de su efecto.
- La pantalla incluye una guía permanente de consulta, editor y administrador antes de presentar las acciones.
- Aprobar, cambiar rol, bloquear y reactivar requieren confirmación con nombre, rol resultante y consecuencia.
- Las confirmaciones funcionan mediante diálogo del navegador en web y alerta nativa en dispositivos móviles.
- Las acciones se bloquean mientras una actualización está en curso y la cuenta propia queda identificada sin controles de riesgo.
- La protección administrativa permanece en el backend y las sesiones pendientes o bloqueadas reciben mensajes específicos.

### UX-012 — Catálogo público y consultas comerciales

**Estado:** Completada — flujo público, bandeja, contador y Web Push validados en producción
**Objetivo:** permitir que cualquier persona explore los productos sin iniciar sesión y pueda dejar una consulta trazable que los administradores atiendan desde una bandeja propia.

**Decisión funcional propuesta:** navegar el catálogo no crea automáticamente un usuario con rol `consulta`. La persona permanece como visitante público; autenticación, roles y permisos continúan reservados para la operación interna.

**Historias de usuario:**

- Como visitante, quiero ver los productos sin iniciar sesión para conocer rápidamente la oferta disponible.
- Como visitante interesado, quiero dejar mi nombre y teléfono asociados a un producto para recibir una respuesta.
- Como administrador, quiero recibir y gestionar las consultas desde una bandeja central para no perder oportunidades ni responderlas dos veces.

**Acceso y navegación:**

- La ruta pública inicial abre Productos sin exigir Google Login.
- El catálogo público recibe de la API solo campos seguros: identificador, categoría, marca, modelo, descripción comercial, imagen, stock público y precio contado.
- Crear, editar, eliminar, cotizar, calcular, consultar stock, administrar usuarios y acceder a consultas continúan protegidos por el backend.
- Visitantes y usuarios no administradores ven únicamente Productos en la navegación principal.
- Los administradores conservan toda la operación y obtienen una nueva sección `Consultas` con contador de pendientes.
- La interfaz diferencia con claridad `Ingresar como administrador` de la navegación pública; cerrar sesión regresa al catálogo y no a una barrera de acceso.

**Flujo público “Consultar”:**

1. Cada card presenta una acción principal `Consultar` para visitantes y perfiles sin permisos administrativos.
2. La acción abre un formulario contextual que conserva visible el producto e incluye nombre y teléfono obligatorios.
3. Nombre se valida y normaliza; teléfono acepta un formato comprensible y conserva código de país cuando se ingresa.
4. Antes de enviar aparece la confirmación `¿Querés consultar por este producto?`, con `Sí, enviar consulta` y `No, seguir mirando`.
5. `No` cierra únicamente la confirmación y conserva la navegación. `Sí` crea la consulta una sola vez, aun ante doble toque o reintento.
6. El éxito comunica `Recibimos tu consulta. Te contactaremos a la brevedad.` y permite continuar en el catálogo.
7. Carga, validación, error de red y envío duplicado poseen estados visibles y accesibles; nunca se muestra información interna ni de administradores.

**Bandeja administrativa de consultas:**

- Nueva ruta protegida `/consultas`, visible únicamente para administradores.
- Lista priorizada por consultas nuevas, con búsqueda y filtros por estado, fecha, producto y responsable.
- Cada registro muestra producto consultado, imagen, marca/modelo, nombre, teléfono, fecha, origen y estado.
- Estados mínimos: `nueva`, `en gestión`, `contactada` y `cerrada`; cada transición registra fecha y administrador responsable.
- El detalle conserva una instantánea del producto para que la consulta siga siendo comprensible si después cambian el precio, la imagen o el stock.
- Acciones rápidas: copiar teléfono, llamar, abrir WhatsApp y marcar estado; el sistema evita que dos administradores la gestionen sin advertencia.
- El tablero distingue consultas pendientes mediante texto, contador y color, no solo con una notificación transitoria.

**Notificaciones:**

- Primera etapa: contador persistente en la navegación administrativa y aviso dentro de la aplicación al detectar una consulta nueva.
- Segunda etapa: Web Push opt-in para administradores que instalen la web en la pantalla de inicio y concedan permiso mediante una acción explícita.
- Texto inicial: `Tenés una consulta por responder`; puede incorporar marca y modelo sin incluir nombre ni teléfono en la pantalla bloqueada.
- Tocar la notificación abre directamente `/consultas/:id`; si la sesión venció, solicita login y luego recupera ese destino.
- Las suscripciones se asocian al administrador y al dispositivo, pueden revocarse y se eliminan cuando dejan de ser válidas.
- La entrega push es complementaria: una consulta siempre queda disponible en la bandeja aunque la notificación falle.
- Si en el futuro se adopta una app nativa, evaluar `expo-notifications`; su servicio no cubre Web Push, por lo que no debe mezclarse con la primera implementación web.

**Seguridad, privacidad y abuso:**

- Endpoint público específico para crear consultas; nunca reutiliza rutas administrativas ni confía en roles del frontend.
- Validación y normalización en backend, límite de tamaño, rate limiting por IP/contexto e identificador idempotente por envío.
- Honeypot y límites progresivos inicialmente; evaluar CAPTCHA solo si existe evidencia de abuso para no degradar el flujo normal.
- Informar brevemente para qué se solicita el teléfono y limitar su uso a responder esa consulta.
- Definir retención y eliminación de datos de contacto; no registrar teléfonos completos en logs ni incluirlos en notificaciones push.
- La respuesta pública es genérica y no permite enumerar consultas, usuarios ni productos privados.

**Modelo mínimo sugerido:**

- `productoId` y `productoSnapshot`.
- `nombreContacto` y `telefonoContactoNormalizado`.
- `estado`, `createdAt`, `updatedAt`, `atendidaAt` y `cerradaAt`.
- `asignadaA`, historial de estados y canal de origen.
- Metadatos técnicos mínimos para idempotencia y prevención de abuso, sin almacenar información innecesaria.

**Implementación por etapas:**

1. Abrir lectura segura del catálogo y adaptar rutas/navegación por permisos.
2. Crear modelo, endpoint público y flujo confirmado de consulta.
3. Construir bandeja administrativa, detalle, estados y acciones de contacto.
4. Incorporar contador y actualización dentro de la aplicación.
5. Ejecutar un prototipo de Web Push/PWA en los dispositivos reales de los administradores antes de comprometer la entrega como requisito.

**Etapa 1 preparada en código:**

- Productos y categorías admiten lectura anónima; las mutaciones siguen exigiendo autenticación y rol en el backend.
- La respuesta pública de productos excluye precio base, porcentaje de ganancia, identificadores de almacenamiento y metadatos internos.
- Visitantes y perfiles no administradores son dirigidos al catálogo y no ven cotizaciones, stock interno, calculadora ni usuarios.
- El catálogo conserva una entrada explícita al login y los usuarios autenticados mantienen el acceso a su cuenta sin agregar otra solapa operativa.

**Etapa 2 preparada en código:**

- Las cards públicas presentan `Consultar` y mantienen visible la imagen, marca, modelo y precio durante el flujo.
- El formulario solicita nombre y teléfono, explica su finalidad y valida ambos campos antes de avanzar.
- Una segunda vista pregunta `¿Querés consultar por este producto?`; volver no envía nada y conserva los datos ingresados.
- El backend normaliza el contacto, limita la frecuencia, valida que el producto continúe activo y usa una clave idempotente para evitar duplicados.
- La consulta guarda una instantánea comercial del producto y finaliza con `Te contactaremos a la brevedad`.
- La visualización administrativa, los estados y las notificaciones permanecen pendientes para la etapa 3.

**Etapa 3 preparada en código:**

- La ruta administrativa `Consultas` lista los contactos por fecha y permite filtrar por nueva, en gestión, contactada y cerrada.
- Cada card conserva la instantánea del producto, nombre, teléfono, fecha y accesos para copiar el número o iniciar una respuesta por WhatsApp.
- Tomar una consulta asigna al administrador; cada transición agrega historial y las consultas atendidas o cerradas registran su fecha correspondiente.
- Si otro administrador ya tomó el caso, el backend rechaza silencios de concurrencia y comunica que la consulta está siendo gestionada.
- El menú administrativo muestra un contador persistente de consultas nuevas y lo actualiza al entrar o cambiar estados.
- La notificación Web Push no condiciona la disponibilidad de la bandeja.

**Etapas 4 y 5 validadas:**

- El contador se actualiza mediante mensajes del service worker, recuperación de foco y una comprobación periódica liviana.
- La PWA solicita permiso únicamente mediante la acción explícita `Activar avisos` de un administrador.
- Se verificó en producción el registro del dispositivo, el envío de prueba y el aviso automático creado por una consulta real.
- Una configuración VAPID inválida devuelve un error visible y seguro; las claves se validan antes de crear la suscripción.
- Las notificaciones muestran marca y modelo, pero no nombre ni teléfono del contacto; los datos personales permanecen en la bandeja protegida.
- Las suscripciones incompatibles con una clave VAPID reemplazada se regeneran automáticamente.

**Criterios de aceptación:**

- Una ventana privada puede navegar Productos sin autenticación y no accede a ninguna ruta operativa.
- Un visitante completa y confirma una consulta con teclado o interacción táctil sin envíos duplicados.
- La consulta aparece en la bandeja administrativa con producto, nombre y teléfono correctos.
- Un no administrador no ve ni puede consultar por API la bandeja, stock interno, calculadora, cotizaciones o usuarios.
- El administrador puede abrir WhatsApp, cambiar el estado y reconocer quién gestiona la consulta.
- La bandeja sigue siendo la fuente confiable aunque el push esté denegado, demorado o no disponible.
- En iPhone se documenta que Web Push requiere una web agregada a la pantalla de inicio y permiso solicitado tras una acción del administrador.

**Validación:** modo incógnito, sesión administrador y sesión no administradora; envío doble; teléfono inválido; error de red; dos administradores concurrentes; push permitido, denegado y no compatible; apertura profunda con sesión activa y vencida.

**Referencias técnicas:** [Web Push para apps web en iOS/iPadOS — WebKit](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/) y [Using push notifications — Expo](https://docs.expo.dev/guides/using-push-notifications-services/).

---

## P3 — Calidad continua

### UX-013 — Rendimiento del catálogo

**Estado:** En progreso — infraestructura y primeras superficies preparadas
**Objetivo:** conservar fluidez con catálogos grandes y conexiones móviles.

**Criterios de aceptación:**

- Los listados principales utilizan virtualización o paginación efectiva.
- Las imágenes cargan de manera progresiva y reservan su espacio para evitar saltos.
- Buscar o filtrar no provoca solicitudes ni renders innecesarios.
- Se documenta una línea base y una comparación posterior.

### UX-014 — Consolidación de tokens y temas

**Estado:** En validación
**Objetivo:** reducir inconsistencias y estilos aislados.

**Decisión aprobada:** la identidad visual aplicada al login, la navegación y los encabezados —“La Vidriera Operativa”, con Lavanda Operativa, Menta Disponible, Durazno Cercano y capas suaves— se adopta como estándar para el resto del proyecto. La extensión se realizará gradualmente para preservar los flujos que ya funcionan.

**Criterios de aceptación:**

- Los nuevos componentes no incorporan colores hexadecimales si existe un token equivalente.
- Lavanda, menta y durazno mantienen su significado funcional.
- Se decide y documenta el destino del teal heredado.
- Se completa el modo oscuro o se retira su exposición hasta implementarlo correctamente.
- Espaciado, radios, tipografía y sombras utilizan vocabulario compartido.
- Todas las pantallas activas convergen hacia la identidad aprobada sin conservar estilos heredados o provisionales visibles.
- Cada migración de superficie se valida en móvil y escritorio antes de considerarse terminada.

**Implementación preparada:**

- La paleta heredada de Expo dejó de introducir teal y un modo oscuro incompleto en componentes temáticos.
- Los esquemas del sistema utilizan temporalmente la identidad clara aprobada hasta diseñar un modo oscuro completo.
- Se incorporó una jerarquía tipográfica compartida para cuerpo, énfasis, títulos y etiquetas.
- Enlaces, navegación, sombras, estados destructivos e Instagram consumen tokens semánticos centralizados.
- El login reemplaza su presentación provisional por logo real, capas ambientales, jerarquía tipográfica y estados de carga y error alineados al sistema.
- Los encabezados de escritorio y móvil comparten overlay, contraste, tipografía y tratamiento del logotipo.
- La identidad resultante fue aprobada visualmente y se convierte en referencia para las demás superficies del producto.
- La adopción continuará por superficie para retirar valores aislados sin alterar de forma masiva pantallas estables, comenzando por catálogo, cotizaciones, calculadora, stock, usuarios y perfil.
- El catálogo adopta capas tonales, acento lavanda, filtros con iconografía consistente y acciones administrativas con etiquetas visibles.
- Los estados de stock, filtros activos y acciones conservan color funcional, texto explícito y contraste independiente de los emojis heredados.
- La Calculadora elimina el encabezado fotográfico duplicado y adopta el encabezado operativo integrado de Cotizaciones; en mobile reduce la altura de campos y estados vacíos para acercar los resultados sin alterar cálculos ni acciones de copia.
- La bandeja de Consultas compacta el bloque de avisos, conserva las pruebas push bajo un control desplegable, muestra todos los filtros sin desplazamiento lateral en mobile y utiliza una grilla de dos columnas en escritorio para reducir espacio vacío.
- Usuarios y Perfil adoptan encabezados operativos, tarjetas con acento lavanda, superficies compactas y acciones semánticas; se preservan las confirmaciones, permisos y operaciones existentes.

### UX-015 — Validación visual repetible

**Estado:** Pendiente  
**Objetivo:** detectar regresiones en las pantallas principales antes del despliegue.

**Criterios de aceptación:**

- Se definen capturas de referencia para login, catálogo, producto, calculadora, cotización e Instagram.
- Cada superficie se captura al menos en escritorio y móvil.
- Las diferencias se presentan para revisión humana; no se actualizan referencias automáticamente.
- El procedimiento puede ejecutarse localmente y en integración continua.

**Implementación preparada:**

- Playwright captura Login, Productos, Calculadora, Cotizaciones, Usuarios y Perfil en 1440 × 900 y 390 × 844.
- Las respuestas de API y la sesión administrativa utilizan fixtures deterministas sin credenciales ni datos reales.
- CI compara contra referencias versionadas y publica diferencias como artefacto cuando falla; nunca reemplaza referencias automáticamente.
- La aceptación de nuevas referencias queda limitada al comando local explícito `npm run test:visual:update`.
- Queda pendiente incorporar el detalle/modal de producto y el compositor de Historia de Instagram para completar todas las superficies definidas.

### UX-016 — Medición y retroalimentación

**Estado:** Pendiente  
**Objetivo:** priorizar mejoras mediante uso real y no solo percepción visual.

**Criterios de aceptación:**

- Se registra tiempo y cantidad de pasos de los recorridos principales sin almacenar datos sensibles.
- Existe un formato breve para anotar problema, contexto, frecuencia e impacto.
- El backlog se revisa con evidencia de uso al menos una vez al mes durante la etapa activa.
- Las tareas cerradas conservan una nota breve de validación y resultado.

### UX-017 — Evolución del sistema visual

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
**Estado:** Implementada

- Ejecuta tests, lint, TypeScript y exportación web en cada pull request y push a `main`.
- Usa instalación reproducible mediante `npm ci` y Node 20.19.4.
- Cancela ejecuciones anteriores de la misma rama cuando son reemplazadas por un cambio más reciente.
- Opera con permisos de solo lectura y variables públicas ficticias para validar la compilación.
- No despliega: Render conserva el despliegue automático por commit en `main`.

### AUTO-002 — Integración continua del backend

**Prioridad:** Alta
**Estado:** Implementada

- Ejecuta instalación reproducible, validación de sintaxis y pruebas del backend en cada pull request y push a `main`.
- El lockfile fue validado con la misma versión principal de npm utilizada en integración continua.
- Las pruebas de autenticación, precios, productos e imágenes continuarán ampliándose gradualmente.

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

### UX-018 — PWA y notificaciones de consultas

**Prioridad: Alta**

**Estado:** Completada — instalación, suscripción, entrega y recuperación validadas en producción

- Publicar manifiesto, icono y service worker sin introducir cache offline de datos privados.
- Verificar instalación en escritorio y mediante “Agregar a pantalla de inicio” en iPhone/iPad.
- Solicitar permiso solamente a administradores y mediante una acción explícita.
- Mantener la bandeja y su contador como fuente de verdad aunque las notificaciones estén desactivadas.
- Al abrir una notificación, navegar a la bandeja administrativa de consultas.
- Guardar y revocar suscripciones por usuario y dispositivo desde el backend.
- Enviar la notificación después de persistir una consulta, sin hacer fallar el registro si el proveedor Push no responde.
- Validar el formato de la clave pública VAPID, recuperar suscripciones antiguas incompatibles y comunicar errores sin exponer secretos.
- Evitar datos personales en el aviso visible fuera de la bandeja autenticada.

### UX-019 — Productos como centro operativo

**Prioridad:** Alta

**Estado:** En progreso — selección, compositor e historial multiproducto implementados

**Objetivo:** reducir cambios de pantalla y selecciones repetidas al cotizar o administrar stock de un producto ya identificado en el catálogo.

- La card administrativa ofrece una única acción principal: `+ Cotizar`. Al agregarlo cambia a `Agregado ✓` y permite quitarlo sin abandonar el catálogo.
- La selección de cotización persiste entre recargas, evita duplicados y permite modificar cantidades, quitar productos o vaciar el borrador.
- Una barra flotante resume productos, unidades y total contado estimado; abre un panel de revisión sin perder la posición del catálogo.
- Cotizaciones recibe el identificador, consulta la fuente de verdad y precarga categoría, marca, modelo, descripción, precio base y porcentaje del producto.
- Una nueva cotización del mismo producto vuelve a iniciar el flujo aunque la pantalla permanezca montada.
- La card permite copiar una consulta de stock usando directamente el identificador, categoría, marca y modelo del producto visible.
- Las acciones se agrupan por jerarquía: cotizar es la acción principal; editar se mantiene como acceso contextual visible; historia, copiar consulta de stock y eliminar viven en un menú secundario con confirmación para la acción destructiva.
- La siguiente etapa evaluará si la actualización de cantidad de stock debe resolverse desde el detalle, preservando confirmación y permisos.
- `Consulta Stock` se retiró de la navegación porque su utilidad quedó reemplazada por la consulta contextual del producto; su ruta permanece sin acceso visible durante la validación.
- El borrador abre un compositor compacto con datos del cliente, una modalidad coherente para toda la propuesta, cantidades editables, subtotales y total.
- El compositor diferencia contado, valor facturado en un pago con ganancia, 3 cuotas y 6 cuotas; en modalidades financiadas muestra valor de cada cuota y total financiado tanto en la edición como en la vista previa y el historial.
- Antes de guardar se presenta una vista previa modal con el contenido comercial definitivo; volver a editar no descarta la selección.
- El guardado utiliza el contrato multiproducto existente y conserva el porcentaje aplicado de cada artículo para que el backend genere la instantánea comercial.
- Cotizaciones funciona como historial y seguimiento: permite buscar por cliente o teléfono, filtrar por estado, revisar el snapshot multiproducto, copiar o abrir el mensaje de WhatsApp y actualizar el estado comercial.
- Al confirmar una cotización se registra quién la confirmó y cuándo; la card y el detalle muestran el dinero a rendir y la ganancia del vendedor calculados por el backend según la modalidad y congelados en el snapshot de confirmación.
- La creación comienza desde Productos; la bandeja conserva una acción directa para regresar al catálogo sin duplicar el formulario anterior.
- La eliminación permanece limitada a administradores y requiere confirmación explícita.

**Validación parcial en producción:** en escritorio se confirmó que dos productos pueden agregarse sin duplicados, que aumentar una cantidad actualiza unidades y total contado, que el borrador persiste después de recargar y que el compositor recibe los productos y cantidades correctos.

**Validación pendiente:** comprobar en móvil la selección, cantidades, modalidades y modales; confirmar visualmente los totales de 3 y 6 cuotas; validar vaciado, búsqueda por cliente y teléfono, cambios de estado y que los modales no queden tapados por la navegación.

---

### UX-020 — Administración de marcas y categorías

**Prioridad:** Media

**Estado:** Pendiente

**Objetivo:** permitir que administradores corrijan y consoliden marcas o categorías existentes sin editar producto por producto ni generar referencias duplicadas.

**Criterios de aceptación:**

- Marcas y categorías existentes pueden renombrarse desde una superficie administrativa clara.
- Antes de guardar se informa cuántos productos serán afectados y se solicita confirmación explícita.
- La comparación ignora diferencias accidentales de mayúsculas, espacios y acentos para prevenir duplicados equivalentes.
- Si el nombre de destino ya existe, el flujo propone unificar ambas referencias y explica el impacto antes de continuar.
- El cambio se aplica de forma consistente a todos los productos afectados y no deja actualizaciones parciales.
- Los selectores, filtros, cards, cotizaciones nuevas y consultas de stock reflejan el nombre actualizado.
- Las cotizaciones ya guardadas conservan su snapshot histórico y no se reescriben retroactivamente.
- La operación está restringida a administradores, registra un resultado comprensible y ofrece recuperación ante errores.

**Validación:** renombrado sin colisión, unificación con un nombre existente, nombre inválido, error de red, usuario sin permisos y verificación posterior en catálogo, filtros y formulario de producto.

### UX-021 — Historias de Instagram en lote

**Prioridad:** Media

**Estado:** Pendiente de investigación

**Objetivo:** seleccionar varios productos y generar una historia individual por cada uno, conservando el diseño y los controles actuales.

**Criterios de aceptación:**

- Productos permite activar selección múltiple, ordenar la selección y quitar elementos antes de generar.
- Una configuración visual común puede aplicarse al lote sin impedir ajustes individuales.
- Se genera y previsualiza una pieza independiente por producto, con progreso, errores y reintentos identificables.
- En la primera etapa se pueden descargar o compartir todas las imágenes sin perder su orden.
- Se investiga y documenta la mejor alternativa gratuita vigente para publicación automática, comparando límites, privacidad, mantenimiento y requisitos de Meta.
- Si se utiliza la API oficial, los recursos temporales se alojan de forma segura, los tokens permanecen en el backend y se respetan permisos y límites de publicación.
- Una falla en una historia no obliga a regenerar todo el lote.

**Validación:** lotes de 2, 10 y 30 productos en escritorio y móvil; cancelación, reordenamiento, descarga, reintento parcial y publicación cuando la integración lo permita.

### UX-022 — Alta de productos asistida por imágenes

**Prioridad:** Alta — siguiente evolución prioritaria

**Estado:** En investigación

**Objetivo:** cargar una o varias imágenes de productos, extraer automáticamente su información y preparar cards editables antes de guardarlas.

**Criterios de aceptación:**

- El alta permite seleccionar varias imágenes desde archivos, galería o cámara.
- El sistema distingue si las imágenes corresponden a productos diferentes o complementan un mismo producto y permite corregir el agrupamiento.
- Se propone marca, modelo, categoría, descripción, precio base, stock visible y otros datos reconocibles, indicando campos dudosos o ausentes.
- Cada propuesta conserva su imagen principal y permite elegir otra imagen del mismo grupo.
- Ningún producto se guarda automáticamente: el usuario revisa, corrige, descarta o confirma cada card.
- Se detectan posibles duplicados por marca, modelo y códigos reconocidos antes de guardar.
- El procesamiento muestra progreso por imagen y permite reintentar solamente las fallidas.
- Se investiga primero una solución gratuita o con nivel gratuito suficiente, evaluando precisión en español, privacidad, límites y costo operativo futuro.
- Las credenciales y el procesamiento externo quedan exclusivamente en el backend.

**Validación:** imágenes limpias, flyers con mucho texto, fotografías inclinadas, varias fotos del mismo producto, imágenes de productos diferentes y datos incompletos.

---

## Secuencia sugerida de ejecución

1. `UX-001` — Navegación adaptable.
2. `UX-002` — Catálogo adaptable.
3. `UX-003` — Búsqueda y filtros.
4. `UX-004` — Estados y recuperación.
5. `UX-005` — Carga y edición.
6. `UX-006` — Accesibilidad transversal de las superficies anteriores.
7. `AUTO-001` y `AUTO-002` — Validaciones automáticas antes de ampliar cambios.
8. `UX-022` — Alta de productos asistida por imágenes.
9. Bloque P2 en el orden definido, incluyendo el catálogo público y las consultas comerciales por etapas.
10. `UX-021` — Historias de Instagram en lote.
11. Bloque P3 según evidencia de uso.

## Revisión del backlog

- Revisar semanalmente mientras haya trabajo activo de experiencia de usuario.
- Reordenar solamente con una razón documentada: impacto, frecuencia, dependencia, riesgo o aprendizaje de uso real.
- No marcar una tarea como completada sin registrar cómo se validó.
- Los cambios de alcance relevantes deben reflejarse también en `PRODUCT.md`, `DESIGN.md` o `AGENTS.md` cuando corresponda.
