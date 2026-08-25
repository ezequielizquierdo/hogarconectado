# Posts sugeridos

## Propósito

Bitácora de ideas breves para compartir aprendizajes reales de Hogar Conectado en LinkedIn y X. Se actualiza cuando una decisión, herramienta o problema del proyecto deje una enseñanza útil.

Los textos deben:

- Ser concretos y atractivos desde la primera línea.
- Explicar una experiencia real, no vender resultados inventados.
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

### X

Una UI puede funcionar y aun así hacerte perder tiempo.

Usé Impeccable para auditar un catálogo y el problema principal no era visual: la navegación móvil también se mostraba en escritorio.

La lección: adaptar no es agrandar. Es repensar la experiencia según el contexto.

---

## 4. Cuando una mejora responsive también introduce un problema

**Tema:** validación visual y navegación adaptable  
**Estado:** Borrador

### LinkedIn

Una mejora de interfaz puede pasar lint, TypeScript y el build… y todavía verse mal.

Al adaptar la navegación de un proyecto para escritorio, la primera solución lateral era funcional, pero terminó compitiendo con los filtros del catálogo y generando un gran espacio vacío. El problema no estaba en los componentes individuales, sino en cómo el navegador componía toda la pantalla.

La corrección fue reemplazarla por una barra superior horizontal y conservar la navegación inferior en mobile.

Aprendizaje: las validaciones automáticas protegen el código; la validación visual protege la experiencia. Necesitamos ambas.

### X

Una UI puede pasar lint, TypeScript y el build… y todavía verse mal.

Una navegación lateral funcionaba, pero rompía la composición del catálogo. La cambié por una barra superior en desktop y mantuve la inferior en mobile.

El código se valida. La experiencia también.

---

## 2. Incorporar skills a un proyecto personal

**Tema:** instrucciones reutilizables para asistentes de código  
**Estado:** Borrador

### LinkedIn

Empecé a incorporar skills en un proyecto personal y entendí algo importante: una buena skill no intenta “saber todo”.

Funciona mejor cuando encapsula una tarea concreta y repetible. Por ejemplo: revisar una pantalla contra el sistema de diseño, validar una entrega o proteger reglas sensibles de precios y permisos.

El beneficio no es solamente ahorrar tiempo. También reduce decisiones inconsistentes entre sesiones y obliga a dejar por escrito qué significa hacer bien una tarea.

Mi recomendación: empezar con una skill pequeña, ejecutarla varias veces y mejorarla con evidencia real antes de crear un gran agente generalista.

### X

Una buena skill no intenta saber todo.

En mi proyecto personal funcionan mejor las skills pequeñas y repetibles: revisar UI, validar una entrega o proteger reglas de negocio.

Menos “agente que hace todo”; más procedimientos claros, verificables y mejorables.

---

## 3. Por qué agregar login no alcanza

**Tema:** identidad, permisos y seguridad  
**Estado:** Borrador

### LinkedIn

Agregar “Ingresar con Google” fue solo el comienzo.

En una aplicación que administra productos, precios e imágenes, autenticar una cuenta responde quién es la persona. Todavía falta decidir qué puede hacer.

Por eso separamos identidad, estado de acceso y rol: una cuenta puede estar pendiente, activa o bloqueada; y un usuario activo puede consultar, editar o administrar.

La interfaz oculta las acciones que no corresponden, pero la autorización real se aplica nuevamente en el backend. Si la seguridad depende solo de esconder un botón, no es seguridad.

### X

“Ingresar con Google” confirma identidad, no permisos.

En una app de productos y precios también necesitás estados de acceso, roles y autorización en el backend.

Ocultar un botón mejora la UX. Validar la operación en el servidor aporta seguridad.

---

## 5. Un formulario seguro también es experiencia de usuario

**Tema:** validación contextual y prevención de pérdida de datos  
**Estado:** Borrador

### LinkedIn

Un buen formulario no espera al final para decirte que algo salió mal.

Al mejorar la carga de productos de un ecommerce, reemplazamos alertas genéricas por errores junto a cada campo, agrupamos la información según la tarea y agregamos protección frente al cierre accidental.

También bloqueamos envíos repetidos mientras se guarda. Son cambios pequeños, pero reducen dudas, datos incompletos y operaciones duplicadas.

Aprendizaje: prevenir errores también es diseñar una experiencia más amable.

### X

Un formulario seguro no solo valida datos:

- explica qué falta junto al campo;
- evita envíos duplicados;
- advierte antes de descartar cambios.

Prevenir errores también es UX.

---

## 6. Una cotización debe guardar el contexto, no solo el total

**Tema:** integridad de datos y reglas comerciales
**Estado:** Borrador

### LinkedIn

Mientras mejoraba el flujo de cotizaciones de un ecommerce apareció una diferencia sutil: la interfaz permitía elegir un porcentaje, pero el servidor podía volver a calcular con su valor predeterminado.

La solución fue tratar cada cotización como una instantánea: producto, cantidad, porcentaje, modalidad y precios quedan guardados juntos. Si el catálogo cambia mañana, la cotización de hoy sigue explicando exactamente qué se ofreció.

Aprendizaje: en operaciones comerciales no alcanza con guardar un total. También hay que conservar el contexto que lo produjo.

### X

Una cotización no debería guardar solo el total.

Producto, cantidad, porcentaje, modalidad y precios forman una instantánea comercial. Así, un cambio futuro en el catálogo no reescribe silenciosamente lo que ofreciste hoy.

---

## Rutina editorial sugerida

Al final de una jornada con cambios relevantes, responder:

1. ¿Qué problema real apareció?
2. ¿Qué decisión o herramienta ayudó?
3. ¿Qué aprendimos que pueda servirle a otra persona?
4. ¿Tenemos evidencia suficiente para contarlo sin exagerar?

Si las cuatro respuestas son claras, agregar un borrador nuevo. La publicación efectiva siempre requiere revisión humana.
