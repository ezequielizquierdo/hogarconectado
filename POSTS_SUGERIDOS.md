# Posts sugeridos

## Propósito

Bitácora de ideas breves para compartir aprendizajes reales de Hogar Conectado en LinkedIn y X. Se actualiza cuando una decisión, herramienta o problema del proyecto deje una enseñanza útil.

Los textos deben:

- Ser concretos y atractivos desde la primera línea.
- Explicar una experiencia real, no vender resultados inventados.
- Incluir al menos una fuente primaria o publicación reconocida que permita ampliar el tema.
- Explicar brevemente por qué esa referencia es relevante; no agregar enlaces sin contexto.
- Verificar que el enlace siga vigente antes de publicar.
- Evitar credenciales, datos privados y detalles sensibles de infraestructura.
- Adaptarse antes de publicar al tono y límite de cada red.

---

## 1. Diseñar una interfaz no es solamente cambiar colores

**Tema:** Impeccable y auditoría de experiencia  
**Estado:** Borrador

### LinkedIn

Una interfaz puede funcionar y aun así hacerte perder tiempo.

En un proyecto personal de catálogo y cotizaciones utilicé Impeccable para auditar la experiencia antes de seguir agregando funcionalidades. El hallazgo más importante no fue un color o una sombra: estábamos usando la misma navegación móvil también en escritorio.

La mejora surgió de pensar el contexto de uso: barra inferior y pocas opciones en celular; navegación horizontal, compacta y visible en escritorio.

La herramienta ayudó, pero la decisión siguió siendo de producto. Esa combinación —criterios repetibles más revisión humana— me está resultando mucho más útil que “hacerlo más lindo”.

Impeccable es un sistema orientado a crear, revisar y refinar interfaces con asistentes de código. Su documentación incluye comandos específicos para auditar, adaptar y pulir una UI: [documentación oficial de Impeccable](https://impeccable.style/docs/).

### X

Una UI puede funcionar y aun así hacerte perder tiempo.

Usé Impeccable para auditar un catálogo y el problema principal no era visual: la navegación móvil también se mostraba en escritorio.

La lección: adaptar no es agrandar. Es repensar la experiencia según el contexto.

**Referencia:** [Documentación oficial de Impeccable](https://impeccable.style/docs/).

---

## 4. Cuando una mejora responsive también introduce un problema

**Tema:** validación visual y navegación adaptable  
**Estado:** Borrador

### LinkedIn

Una mejora de interfaz puede pasar lint, TypeScript y el build… y todavía verse mal.

Al adaptar la navegación de un proyecto para escritorio, la primera solución lateral era funcional, pero terminó compitiendo con los filtros del catálogo y generando un gran espacio vacío. El problema no estaba en los componentes individuales, sino en cómo el navegador componía toda la pantalla.

La corrección fue reemplazarla por una barra superior horizontal y conservar la navegación inferior en mobile.

Aprendizaje: las validaciones automáticas protegen el código; la validación visual protege la experiencia. Necesitamos ambas.

La guía de [responsive design de MDN](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design) ayuda a entender esta idea: adaptar una interfaz implica responder a distintos tamaños, dispositivos y formas de interacción, no escalar una única composición.

### X

Una UI puede pasar lint, TypeScript y el build… y todavía verse mal.

Una navegación lateral funcionaba, pero rompía la composición del catálogo. La cambié por una barra superior en desktop y mantuve la inferior en mobile.

El código se valida. La experiencia también.

**Referencia:** [Responsive web design — MDN](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design).

---

## 2. Incorporar skills a un proyecto personal

**Tema:** instrucciones reutilizables para asistentes de código  
**Estado:** Borrador

### LinkedIn

Empecé a incorporar skills en un proyecto personal y entendí algo importante: una buena skill no intenta “saber todo”.

Funciona mejor cuando encapsula una tarea concreta y repetible. Por ejemplo: revisar una pantalla contra el sistema de diseño, validar una entrega o proteger reglas sensibles de precios y permisos.

El beneficio no es solamente ahorrar tiempo. También reduce decisiones inconsistentes entre sesiones y obliga a dejar por escrito qué significa hacer bien una tarea.

Mi recomendación: empezar con una skill pequeña, ejecutarla varias veces y mejorarla con evidencia real antes de crear un gran agente generalista.

Anthropic define las Agent Skills como capacidades modulares que reúnen instrucciones, metadatos y recursos opcionales para reutilizar conocimiento especializado cuando una tarea lo necesita: [introducción oficial a Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview).

### X

Una buena skill no intenta saber todo.

En mi proyecto personal funcionan mejor las skills pequeñas y repetibles: revisar UI, validar una entrega o proteger reglas de negocio.

Menos “agente que hace todo”; más procedimientos claros, verificables y mejorables.

**Referencia:** [Agent Skills — documentación de Anthropic](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview).

---

## 3. Por qué agregar login no alcanza

**Tema:** identidad, permisos y seguridad  
**Estado:** Borrador

### LinkedIn

Agregar “Ingresar con Google” fue solo el comienzo.

En una aplicación que administra productos, precios e imágenes, autenticar una cuenta responde quién es la persona. Todavía falta decidir qué puede hacer.

Por eso separamos identidad, estado de acceso y rol: una cuenta puede estar pendiente, activa o bloqueada; y un usuario activo puede consultar, editar o administrar.

La interfaz oculta las acciones que no corresponden, pero la autorización real se aplica nuevamente en el backend. Si la seguridad depende solo de esconder un botón, no es seguridad.

La [guía de autorización de OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) profundiza esta separación y recomienda comprobar permisos en cada solicitud, además de aplicar el principio de mínimo privilegio.

### X

“Ingresar con Google” confirma identidad, no permisos.

En una app de productos y precios también necesitás estados de acceso, roles y autorización en el backend.

Ocultar un botón mejora la UX. Validar la operación en el servidor aporta seguridad.

**Referencia:** [Authorization Cheat Sheet — OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

---

## 5. Un formulario seguro también es experiencia de usuario

**Tema:** validación contextual y prevención de pérdida de datos  
**Estado:** Borrador

### LinkedIn

Un buen formulario no espera al final para decirte que algo salió mal.

Al mejorar la carga de productos de un ecommerce, reemplazamos alertas genéricas por errores junto a cada campo, agrupamos la información según la tarea y agregamos protección frente al cierre accidental.

También bloqueamos envíos repetidos mientras se guarda. Son cambios pequeños, pero reducen dudas, datos incompletos y operaciones duplicadas.

Aprendizaje: prevenir errores también es diseñar una experiencia más amable.

El tutorial de formularios de W3C muestra distintas formas de comunicar errores, confirmaciones y progreso de manera accesible: [User Notifications — WAI](https://www.w3.org/WAI/tutorials/forms/notifications/).

### X

Un formulario seguro no solo valida datos:

- explica qué falta junto al campo;
- evita envíos duplicados;
- advierte antes de descartar cambios.

Prevenir errores también es UX.

**Referencia:** [Notificaciones accesibles en formularios — W3C WAI](https://www.w3.org/WAI/tutorials/forms/notifications/).

---

## 6. Una cotización debe guardar el contexto, no solo el total

**Tema:** integridad de datos y reglas comerciales
**Estado:** Borrador

### LinkedIn

Mientras mejoraba el flujo de cotizaciones de un ecommerce apareció una diferencia sutil: la interfaz permitía elegir un porcentaje, pero el servidor podía volver a calcular con su valor predeterminado.

La solución fue tratar cada cotización como una instantánea: producto, cantidad, porcentaje, modalidad y precios quedan guardados juntos. Si el catálogo cambia mañana, la cotización de hoy sigue explicando exactamente qué se ofreció.

Aprendizaje: en operaciones comerciales no alcanza con guardar un total. También hay que conservar el contexto que lo produjo.

Como lectura conceptual, Martin Fowler explica por qué conservar la historia permite reconstruir estados pasados en [Event Sourcing](https://martinfowler.com/eaaDev/EventSourcing.html). Una instantánea de cotización no implementa ese patrón, pero comparte la necesidad de preservar el contexto histórico en vez de depender solo del estado actual.

### X

Una cotización no debería guardar solo el total.

Producto, cantidad, porcentaje, modalidad y precios forman una instantánea comercial. Así, un cambio futuro en el catálogo no reescribe silenciosamente lo que ofreciste hoy.

**Referencia conceptual:** [Event Sourcing — Martin Fowler](https://martinfowler.com/eaaDev/EventSourcing.html). Una instantánea comercial es una solución más acotada, no una implementación completa del patrón.

---

## 7. Compartir una imagen desde una web no es lo mismo que abrir Instagram

**Tema:** experiencia multiplataforma y Web Share API
**Estado:** Borrador

### LinkedIn

En un ecommerce personal queríamos que una historia generada desde la web llegara a Instagram con un solo botón.

El detalle apareció en el último paso: una web no puede precargar libremente una imagen dentro de Instagram. La experiencia correcta es generar un archivo real, abrir la hoja nativa del teléfono y dejar que la persona elija Instagram. Si el navegador no admite compartir archivos, la alternativa debe ser una descarga clara.

Aprendizaje: una buena experiencia multiplataforma no fuerza el mismo comportamiento en todos los dispositivos. Diseña una salida confiable para cada capacidad disponible.

La [documentación de Web Share API en MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) detalla cómo una web delega al mecanismo nativo del sistema la elección del destino para compartir texto, enlaces o archivos.

### X

“Compartir en Instagram” no significa lo mismo en una app nativa, una web móvil y un escritorio.

La solución: archivo PNG + hoja nativa cuando está disponible + descarga como alternativa.

Diseñar para capacidades reales evita botones que prometen más de lo que la plataforma permite.

**Referencia:** [Web Share API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API).

---

## 8. La vista previa también forma parte del contrato

**Tema:** WYSIWYG, Canvas e historias para redes
**Estado:** Borrador

### LinkedIn

La funcionalidad estaba resuelta: la web generaba una historia y Safari permitía compartirla en Instagram. Sin embargo, la imagen final no coincidía con la vista previa: cambiaban los márgenes, los colores y hasta la proporción del producto.

El problema era depender de una captura del DOM, que cada navegador podía interpretar de manera diferente. Lo reemplazamos por un render determinístico en Canvas de 1080 × 1920. Ahora la vista previa, la descarga y el archivo compartido utilizan exactamente el mismo PNG.

Aprendizaje: WYSIWYG no es solamente una comodidad visual. Cuando una pieza se publica en redes, que “lo que ves sea lo que obtenés” también forma parte del contrato con la persona usuaria.

Para profundizar en el mecanismo utilizado, MDN documenta [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API), que permite dibujar gráficos mediante JavaScript y controlar explícitamente la salida generada.

### X

La historia se podía compartir, pero el PNG final no coincidía con la vista previa.

Reemplazamos la captura del DOM por un Canvas fijo de 1080 × 1920. Vista previa, descarga y compartir ahora usan el mismo archivo.

WYSIWYG también es confianza.

**Referencia:** [Canvas API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API).

---

## 9. Automatizar después de definir qué significa estar bien

**Tema:** integración continua y controles de calidad
**Estado:** Borrador

### LinkedIn

Agregar CI no fue el primer paso del proyecto. Primero definimos qué controles realmente protegían la aplicación: pruebas de reglas sensibles, lint, TypeScript y una exportación web completa.

Recién entonces los convertimos en un workflow automático para cada cambio relevante. La automatización no toma decisiones de producto ni despliega por su cuenta; verifica de manera repetible que el código conserve las condiciones que ya acordamos.

Aprendizaje: automatizar una lista de comandos aporta velocidad. Automatizar una definición clara de calidad aporta confianza.

La guía de [integración continua con GitHub Actions](https://docs.github.com/en/actions/get-started/continuous-integration) explica cómo ejecutar compilaciones y pruebas automáticamente frente a cambios en el repositorio.

### X

CI no empieza creando un archivo YAML.

Primero definimos qué significa que el frontend esté sano: tests, lint, tipos y build web. Después automatizamos esos controles en cada cambio.

Automatizar calidad requiere definirla antes.

**Referencia:** [Continuous integration — GitHub Docs](https://docs.github.com/en/actions/get-started/continuous-integration).

---

## 10. Un sistema visual también es infraestructura

**Tema:** diseño sistemático y deuda visual
**Estado:** Borrador

### LinkedIn

Al mejorar la interfaz de un ecommerce personal encontré dos identidades conviviendo en el código: la paleta actual del producto y colores heredados del proyecto inicial.

Antes de sumar una nueva librería gráfica, centralizamos tipografía, enlaces, estados, sombras y colores semánticos. El cambio no busca “decorar” pantallas: evita que cada componente tome decisiones distintas y hace que las próximas mejoras sean más rápidas y predecibles.

Aprendizaje: un sistema visual no es solo una guía para diseñadores. También es infraestructura que reduce deuda y protege la coherencia del producto.

La [Design Tokens Community Group](https://www.designtokens.org/) trabaja en un formato compartido para intercambiar decisiones de diseño —como color, tipografía y espaciado— entre herramientas y plataformas.

### X

Antes de sumar una librería UI, unificamos los tokens que ya tenía el proyecto: tipografía, enlaces, estados, sombras y color.

Un sistema visual también es infraestructura: reduce decisiones repetidas y evita que cada pantalla termine hablando un idioma distinto.

**Referencia:** [Design Tokens Community Group](https://www.designtokens.org/).

---

## 11. Una interfaz más limpia no siempre tiene menos texto

**Tema:** iconografía, claridad operativa y accesibilidad
**Estado:** Borrador

### LinkedIn

Al consolidar la identidad visual de un catálogo, una de las mejoras más útiles fue también una de las más simples: acompañar con texto las acciones que antes mostraban solamente un icono.

“Historia”, “Editar” y “Eliminar” ocupan más espacio que tres símbolos aislados, pero reducen la interpretación y hacen que una tarea repetitiva sea más rápida y segura. También reemplazamos emojis decorativos por una familia de iconos consistente y reservamos el color para comunicar selección, disponibilidad o riesgo.

La limpieza visual no consiste en retirar toda explicación. Consiste en eliminar ruido sin quitar significado.

Material Design recomienda usar una etiqueta textual para especificar qué sucede al seleccionar un icono de acción: [guía de accesibilidad de Material Design](https://m1.material.io/usability/accessibility.html).

### X

Una interfaz más limpia no siempre tiene menos texto.

En un catálogo reemplazamos acciones con iconos aislados por icono + “Historia”, “Editar” y “Eliminar”. Ocupan un poco más, pero reducen dudas y errores.

Quitar ruido no debería quitar significado.

**Referencia:** [Accessibility — Material Design](https://m1.material.io/usability/accessibility.html).

---

## 12. Responsive no significa encoger la interfaz

**Tema:** ecommerce mobile, componentes flexibles y validación visual
**Estado:** Borrador

### LinkedIn

En la versión mobile de un catálogo de ecommerce detectamos un problema bastante común: la interfaz entraba en la pantalla, pero no se adaptaba realmente a ella. La imagen competía con los datos, las acciones se truncaban y la navegación inferior cubría parte del contenido.

La solución no fue reducir tipografías. Cambiamos la composición de la card según el espacio disponible: imagen protagonista arriba, información comercial debajo, acciones más compactas y espacio reservado para la navegación del teléfono.

Aprendizaje: responsive no es hacer más pequeña una pantalla de escritorio. Es decidir nuevamente qué necesita protagonismo en cada contexto.

El curso [Learn Responsive Design de web.dev](https://web.dev/learn/design/) desarrolla esta idea mediante layouts flexibles, imágenes adaptables, interacción táctil y patrones de interfaz que responden a distintos tamaños.

### X

Responsive no es encoger una pantalla de escritorio.

En un catálogo mobile reorganizamos la card completa: imagen protagonista, datos debajo, acciones compactas y espacio real para la navegación inferior.

El tamaño cambia, pero también debe cambiar la composición.

**Referencia:** [Learn Responsive Design — web.dev](https://web.dev/learn/design/).

---

## 13. Usar referentes no es copiar interfaces

**Tema:** análisis de referentes y decisiones de producto
**Estado:** Borrador

### LinkedIn

Para mejorar el catálogo de un ecommerce estudiamos la estructura de Mercado Libre. No copiamos su amarillo, sus promociones ni su densidad de información: identificamos dos decisiones que sí resolvían nuestros problemas.

La primera fue convertir el encabezado en una firma cromática simple. La segunda, darle a cada producto una superficie de imagen blanca, amplia y consistente. Luego llevamos ambos principios a nuestra propia identidad lavanda y conservamos únicamente los datos que necesita nuestra operación.

Aprendizaje: un buen referente no entrega una plantilla. Ayuda a formular mejores preguntas sobre jerarquía, consistencia y contexto de uso.

Mercado Libre cuenta con Andes, su lenguaje de diseño compartido. Este artículo de su equipo técnico explica cómo un sistema de diseño puede resolver problemas de accesibilidad y consistencia: [What we have learned from working on digital accessibility](https://medium.com/mercadolibre-tech/what-we-have-learned-from-working-on-digital-accessibility-954f275fdff3).

### X

Usar un referente no es copiar una interfaz.

De Mercado Libre tomamos dos principios: encabezado como firma cromática e imágenes de producto sobre superficies amplias y consistentes. Después los adaptamos a nuestra identidad y a nuestros datos reales.

El patrón inspira; el contexto decide.

**Referencia:** [Mercado Libre Tech sobre accesibilidad y Andes](https://medium.com/mercadolibre-tech/what-we-have-learned-from-working-on-digital-accessibility-954f275fdff3).

---

## 14. Cuando dos encabezados deberían ser uno

**Tema:** referentes de ecommerce y jerarquía de navegación
**Estado:** Borrador

### LinkedIn

Tomar un ecommerce reconocido como referencia no significa copiar su encabezado o sus colores.

Al revisar el catálogo de Hogar Conectado frente a Mercado Libre apareció una idea más útil: distintas filas pueden sentirse como una sola estructura si comparten jerarquía e identidad. En nuestra aplicación, sin embargo, había dos encabezados que competían entre sí.

La solución fue específica para el producto: una barra operativa única que reúne marca, sección activa y navegación. Menos altura, menos repetición y más espacio para los productos.

La investigación de Baymard sobre navegación en ecommerce destaca dos principios que guiaron la decisión: mantener visible la navegación principal e identificar con claridad el alcance actual: [Ecommerce Navigation UX Best Practices](https://baymard.com/blog/ecommerce-navigation-best-practice).

Aprendizaje: un referente aporta patrones para pensar; la solución final debe responder al contexto real de uso.

### X

Usar un ecommerce reconocido como referencia no significa copiar su UI.

Al revisar nuestro catálogo, el aprendizaje útil fue otro: marca, sección activa y navegación deben sentirse como una sola estructura.

Menos encabezados. Más espacio para operar.

**Referencia:** [Ecommerce Navigation UX — Baymard](https://baymard.com/blog/ecommerce-navigation-best-practice).

---

## 15. Una regla global también necesita excepciones

**Tema:** evolución de datos, reglas comerciales y compatibilidad
**Estado:** Borrador

### LinkedIn

En un ecommerce pequeño comenzamos con un único porcentaje de ganancia para todos los productos. Era simple y cumplía su función, hasta que la operación necesitó ajustar un producto sin modificar los demás.

La solución no fue duplicar fórmulas en la interfaz. Incorporamos un porcentaje opcional por producto, validado por el backend, y mantuvimos la regla global como respaldo para los registros existentes.

Así logramos dos cosas: mayor flexibilidad comercial y compatibilidad con los datos ya cargados, sin una migración masiva inmediata.

MongoDB documenta una idea relacionada en su patrón de versionado de esquemas: un modelo flexible puede admitir estructuras anteriores y nuevas mientras la aplicación aprende a interpretar ambas: [Maintain Different Schema Versions](https://www.mongodb.com/docs/manual/data-modeling/design-patterns/data-versioning/schema-versioning/).

Aprendizaje: agregar flexibilidad no debería significar perder una única fuente de verdad.

### X

Una regla global de precios funcionó hasta que un producto necesitó una excepción.

Sumamos un porcentaje opcional por producto y conservamos el valor global como respaldo. Más flexibilidad, sin romper los datos existentes ni duplicar fórmulas.

**Referencia:** [Schema Versioning Pattern — MongoDB](https://www.mongodb.com/docs/manual/data-modeling/design-patterns/data-versioning/schema-versioning/).

---

## 16. Quitar el login también es una decisión de seguridad

**Tema:** catálogo público, permisos y consultas comerciales
**Estado:** Borrador

### LinkedIn

En Hogar Conectado apareció una pregunta simple: si alguien solo quiere ver productos, ¿por qué debería iniciar sesión?

La respuesta nos llevó a separar dos experiencias. Ya preparamos un catálogo público que devuelve solamente la ficha comercial; la operación interna —costos, porcentajes, stock operativo, cotizaciones y usuarios— sigue protegida por permisos reales en el backend.

El desafío no consiste solamente en quitar una pantalla de login. Hay que diseñar qué datos expone la API y cómo evitar abuso en un formulario público. En la siguiente iteración incorporamos validación, confirmación antes de enviar, rate limiting y una clave idempotente para que un doble toque no genere dos consultas.

Para los avisos en iPhone estamos evaluando Web Push. WebKit explica que las apps web agregadas a la pantalla de inicio pueden recibir notificaciones desde iOS/iPadOS 16.4, siempre que la persona conceda permiso después de una interacción explícita: [Web Push for Web Apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).

Aprendizaje: reducir fricción para quien visita no debe reducir la protección de quien administra.

### X

Si alguien solo quiere ver productos, el login agrega fricción.

Estamos separando catálogo público de operación privada: navegación abierta, consultas trazables y permisos siempre controlados por el backend.

Menos barreras no significa menos seguridad.

**Referencia:** [Web Push en iOS/iPadOS — WebKit](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/).

---

## 17. Una notificación no reemplaza una bandeja de trabajo

**Tema:** consultas comerciales, estados visibles y continuidad operativa
**Estado:** Borrador

### LinkedIn

Cuando abrimos el catálogo de Hogar Conectado al público, recibir una consulta era solo la mitad del problema. La otra mitad era lograr que no se perdiera entre mensajes ni fuera respondida dos veces.

Por eso construimos primero una bandeja administrativa: producto y contacto en contexto, estados visibles, responsable asignado, historial y acceso directo a WhatsApp. El contador ayuda a detectar novedades, pero la bandeja sigue siendo la fuente confiable incluso si una futura notificación push se demora o está desactivada.

Esta decisión se relaciona con la primera heurística de Nielsen: mantener visible el estado del sistema para que las personas entiendan qué está ocurriendo y qué requiere atención. [Visibility of System Status — Nielsen Norman Group](https://www.nngroup.com/articles/visibility-system-status/).

Aprendizaje: notificar llama la atención; diseñar el seguimiento evita perder el trabajo.

### X

Una notificación puede avisar que llegó una consulta. No puede reemplazar el seguimiento.

Sumamos una bandeja con estados, responsable, historial y acceso a WhatsApp. El contador llama la atención; la bandeja conserva la verdad operativa.

**Referencia:** [Visibility of System Status — NN/g](https://www.nngroup.com/articles/visibility-system-status/).

---

## 18. Instalar una web no la convierte automáticamente en una app

**Tema:** PWA, Web Push e implementación progresiva
**Estado:** Borrador

### LinkedIn

En Hogar Conectado queremos avisar a los administradores cuando llega una nueva consulta, incluso si la web no está abierta.

Antes de conectar notificaciones empezamos por la base: manifiesto, icono, modo standalone y service worker. Sin cachear datos privados ni pedir permisos apenas carga la página. La bandeja administrativa sigue siendo la fuente de verdad; la notificación será solamente una puerta de entrada.

En iPhone hay una condición importante: Web Push está disponible para aplicaciones web agregadas a la pantalla de inicio, y el permiso debe solicitarse después de una interacción explícita de la persona.

WebKit explica el comportamiento y los requisitos oficiales en [Web Push for Web Apps on iOS and iPadOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/). Expo, por su parte, documenta que los archivos de `public/` se incorporan al export web estático: [Publish websites — Expo](https://docs.expo.dev/guides/publishing-websites/).

Aprendizaje: una PWA útil se construye por capas. Primero instalación confiable; después permisos; finalmente notificaciones con una alternativa operativa siempre disponible.

### X

Para sumar avisos de nuevas consultas no empezamos por el popup de permisos.

Primero: manifiesto, icono, service worker y una bandeja que siga funcionando sin Push. Después llegará la suscripción voluntaria del administrador.

**Referencias:** [Web Push en iOS — WebKit](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/) y [publicación web con Expo](https://docs.expo.dev/guides/publishing-websites/).

---

## 19. Push avisa; sincronizar mantiene la interfaz confiable

**Tema:** Web Push, actualización silenciosa y experiencia operativa
**Estado:** Borrador

### LinkedIn

Logramos que Hogar Conectado notificara al administrador cuando alguien consulta por un producto. Pero la primera prueba dejó otro aprendizaje: recibir el aviso no actualiza automáticamente la pantalla que ya estaba abierta.

Completamos el circuito con tres capas: el evento Push llama la atención, el service worker informa a las ventanas activas y la bandeja se sincroniza silenciosamente cuando recupera visibilidad. Además dejamos una comprobación periódica liviana como respaldo.

La Push API permite recibir mensajes mediante el service worker: [evento `push` — MDN](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/push_event). Para detectar cuándo una pestaña vuelve a estar visible usamos la Page Visibility API: [`visibilitychange` — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event).

Aprendizaje: una notificación resuelve la atención; una estrategia de sincronización resuelve la confianza en lo que muestra la interfaz.

### X

Web Push nos avisó que había una nueva consulta, pero la bandeja abierta seguía mostrando datos anteriores.

Sumamos mensaje del service worker, actualización al recuperar visibilidad y una comprobación periódica liviana.

Push llama la atención. Sincronizar mantiene la interfaz confiable.

**Referencias:** [evento Push — MDN](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerGlobalScope/push_event) y [Page Visibility — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event).

---

## 20. El código estaba bien; la configuración no

**Tema:** Web Push, VAPID y diagnósticos seguros en producción
**Estado:** Borrador

### LinkedIn

Una notificación Push puede fallar antes de enviar una sola solicitud de registro. Eso nos pasó en Hogar Conectado: el permiso del navegador estaba concedido y las pruebas locales funcionaban, pero producción volvía silenciosamente al botón “Activar avisos”.

El cambio útil no fue esconder el error, sino hacerlo diagnosticable sin revelar secretos. Validamos la clave pública VAPID antes de suscribir el dispositivo, mostramos un mensaje seguro en la interfaz y normalizamos la configuración del servidor. Así descubrimos que `VAPID_PUBLIC_KEY` estaba mal cargada en el entorno productivo. Después de corregirla, una consulta real generó el aviso automáticamente.

MDN explica que `PushManager.subscribe()` utiliza `applicationServerKey`, una clave pública ECDSA P-256, y que la suscripción debe iniciarse a partir de una acción de la persona: [PushManager.subscribe() — MDN](https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe). web.dev también recomienda generar y conservar como par las claves pública y privada VAPID: [Subscribe a user to push notifications — web.dev](https://web.dev/articles/push-notifications-subscribing-a-user).

Aprendizaje: observar el estado HTTP no siempre alcanza. Un buen diagnóstico también debe señalar en qué capa se detuvo el flujo: navegador, suscripción, API o proveedor Push.

### X

Web Push funcionaba localmente, pero no en producción. El problema no estaba en el permiso ni en el service worker: `VAPID_PUBLIC_KEY` estaba mal configurada.

Agregamos validación temprana, recuperación de suscripciones antiguas y errores visibles sin exponer secretos. La siguiente prueba real llegó correctamente.

**Referencias:** [PushManager.subscribe() — MDN](https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe) y [claves VAPID — web.dev](https://web.dev/articles/push-notifications-subscribing-a-user).

---

## 21. Menos páginas no significa poner todo en una pantalla

**Tema:** flujos centrados en la tarea y reducción de pasos
**Estado:** Borrador

### LinkedIn

En Hogar Conectado teníamos tres lugares relacionados con una misma tarea: Productos, Consulta Stock y Cotizaciones. El vendedor encontraba un producto en el catálogo y después debía volver a seleccionar categoría, marca y modelo para cotizarlo.

Decidimos cambiar el centro del flujo. Ahora la cotización comienza desde la card del producto y reutiliza su identidad, precio base y porcentaje. La consulta de stock también se genera desde allí, sin volver a elegir categoría, marca y modelo. Las herramientas siguen existiendo, pero reciben el contexto que la persona ya había encontrado.

El criterio no fue simplemente “reducir clics”. Nielsen Norman Group advierte que el costo de interacción también incluye esfuerzo mental y que una aparente simplificación puede fallar si rompe las expectativas: [Don’t Prioritize Efficiency Over Expectations](https://www.nngroup.com/articles/efficiency-vs-expectations/). Su artículo sobre flujos disruptivos también destaca el costo de obligar a una persona a recordar o reconstruir contexto entre pasos: [Disruptive Workflow Design](https://www.nngroup.com/articles/disruptive-workflow-design/).

Aprendizaje: unificar no siempre significa amontonar funciones. A veces significa conservar cada herramienta, pero abrirla desde el lugar donde la intención ya está clara.

### X

Encontrar un producto y volver a elegir categoría, marca y modelo para cotizarlo era una fricción innecesaria.

Ahora cotización y consulta de stock comienzan desde la card y conservan el contexto del producto. Menos repetición, sin convertir la card en un formulario gigante.

**Referencias:** [eficiencia y expectativas — NN/G](https://www.nngroup.com/articles/efficiency-vs-expectations/) y [flujos disruptivos — NN/G](https://www.nngroup.com/articles/disruptive-workflow-design/).

---

## 22. Una cotización no debería obligarte a recordar el catálogo

**Tema:** selección multiproducto, persistencia y reducción de fricción
**Estado:** Borrador

### LinkedIn

En Hogar Conectado, cotizar varios productos implicaba repetir el mismo flujo una vez por artículo. El catálogo ayudaba a encontrarlos, pero no conservaba la intención de compra entre una card y la siguiente.

Lo convertimos en un borrador persistente: cada producto tiene una sola acción principal, la selección sobrevive a una recarga y un panel permite cambiar cantidades, quitar artículos y anticipar el total contado. La cotización definitiva vendrá después; primero preservamos el contexto que la persona ya construyó.

Baymard señala que el carrito debe permitir revisar productos y cantidades antes de avanzar, y que la edición del contenido es parte central de esa etapa: [Cart UX benchmark — Baymard Institute](https://baymard.com/checkout-usability/benchmark/step-type/cart). Su investigación de checkout también muestra cuánto pueden deteriorar la experiencia los pasos y fricciones acumuladas: [Current State of Checkout UX — Baymard Institute](https://baymard.com/blog/current-state-of-checkout-ux).

Aprendizaje: persistir un borrador no es solamente una comodidad técnica. Es evitar que la interfaz le pida a la persona reconstruir una decisión que ya tomó.

### X

Cotizar varios productos no debería significar repetir el formulario varias veces.

Sumamos una selección persistente desde el catálogo: agregar/quitar, cantidades y total estimado sin perder el contexto. Después viene el compositor; primero, conservar la intención.

**Referencias:** [Cart UX — Baymard](https://baymard.com/checkout-usability/benchmark/step-type/cart) y [Checkout UX — Baymard](https://baymard.com/blog/current-state-of-checkout-ux).

---

## 23. Una vista previa también es una barrera contra errores

**Tema:** cotizaciones multiproducto, revisión y prevención de errores
**Estado:** Borrador

### LinkedIn

Después de conservar la selección de productos, el siguiente desafío en Hogar Conectado fue convertirla en una propuesta comercial sin volver a llenar un formulario por cada artículo.

Armamos un compositor compacto: datos del cliente una sola vez, modalidad común, cantidades editables, subtotales y total. Antes de guardar aparece una vista previa con exactamente lo que recibirá el cliente. Si algo no cierra, se vuelve a editar sin perder la selección.

El objetivo no era solamente ahorrar clics. Nielsen Norman Group explica que revisar información antes de una acción importante ayuda a prevenir errores y permite reconocerlos antes de que produzcan consecuencias: [Error-Prevention Guidelines — Nielsen Norman Group](https://www.nngroup.com/articles/slips/). El principio también coincide con la heurística de prevención de errores de su lista clásica: [10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/).

Aprendizaje: una buena vista previa no es decoración ni duplicación. Es el último espacio seguro para comprobar cantidades, modalidad y totales antes de crear una instantánea comercial.

### X

Una cotización multiproducto no debería guardarse a ciegas.

Sumamos un compositor con cantidades, modalidad, subtotales y total; después, una vista previa exacta antes de confirmar. Volver a editar no borra el trabajo.

Menos repetición y una barrera concreta contra errores.

**Referencias:** [prevención de errores — NN/G](https://www.nngroup.com/articles/slips/) y [10 heurísticas de usabilidad — NN/G](https://www.nngroup.com/articles/ten-usability-heuristics/).

---

## 24. Crear y gestionar no son la misma tarea

**Tema:** historial de cotizaciones y separación de responsabilidades
**Estado:** Borrador

### LinkedIn

Cuando una cotización se guardaba en Hogar Conectado, técnicamente estaba resuelta: el backend conservaba cliente, productos, cantidades, precios y modalidad. Pero operativamente desaparecía. No había un lugar claro para encontrarla, compartirla o registrar qué ocurrió después.

Separamos dos momentos. Productos sirve para construir una propuesta desde el contexto del catálogo. Cotizaciones pasó a ser una bandeja de trabajo: búsqueda por cliente o teléfono, filtros por estado, detalle del snapshot comercial y acciones para copiar o abrir WhatsApp. La misma información, presentada según la tarea actual.

Nielsen Norman Group define la visibilidad del estado del sistema como una heurística fundamental: la interfaz debe mantener informada a la persona sobre qué está ocurriendo. También recomienda favorecer el reconocimiento por sobre el recuerdo. Una bandeja visible evita depender de MongoDB, de la memoria o de reconstruir una propuesta anterior: [10 Usability Heuristics — NN/G](https://www.nngroup.com/articles/ten-usability-heuristics/).

Aprendizaje: guardar un registro no completa un flujo comercial. El dato empieza a ser útil cuando puede encontrarse, comprenderse y recibir seguimiento.

### X

Guardar una cotización no alcanza si después “desaparece” en la base.

Separamos creación y gestión: Productos construye la propuesta; Cotizaciones permite buscarla, revisar su snapshot, compartirla por WhatsApp y actualizar su estado.

Menos memoria, más visibilidad operativa.

**Referencia:** [10 heurísticas de usabilidad — NN/G](https://www.nngroup.com/articles/ten-usability-heuristics/).

---

## Rutina editorial sugerida

Al final de una jornada con cambios relevantes, responder:

1. ¿Qué problema real apareció?
2. ¿Qué decisión o herramienta ayudó?
3. ¿Qué aprendimos que pueda servirle a otra persona?
4. ¿Tenemos evidencia suficiente para contarlo sin exagerar?

Si las cuatro respuestas son claras, agregar un borrador nuevo. La publicación efectiva siempre requiere revisión humana.
