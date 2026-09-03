# Hogar Conectado

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

La web responsive es la prioridad actual, manteniendo compatibilidad con iOS y Android mediante Expo y React Native.

## Users

El usuario principal es el propietario del negocio y, eventualmente, personas de su equipo expresamente autorizadas. Trabajan desde escritorio o celular para vender y administrar productos, con Instagram y WhatsApp como canales comerciales frecuentes.

- Administrador: aprueba accesos, asigna permisos y administra productos e imágenes.
- Vendedor: comparte el catálogo, prepara sus cotizaciones, atiende consultas y registra ventas; ve su comisión y liquidación sin acceder a costos ni administrar productos.
- Operador autorizado: consulta información y realiza las acciones habilitadas por su rol.
- Usuario pendiente o bloqueado: no accede a las funciones de negocio.

## Product Purpose

Reunir catálogo, stock, cálculos, cotizaciones e imágenes comerciales en una sola herramienta para reemplazar planillas y cálculos manuales. El producto tiene éxito cuando una persona autorizada puede encontrar o cargar un producto, obtener precios correctos, preparar una cotización y compartir información comercial sin recurrir a herramientas externas.

## Positioning

Hogar Conectado conecta en un mismo flujo operativo los datos internos del producto y la salida comercial: desde precio base y stock hasta precio contado, cotización y pieza para redes. Esa continuidad evita transcripciones y recálculos entre Excel, mensajes y herramientas de diseño separadas.

## Operating Context

- Uso cotidiano desde navegador de escritorio o celular.
- Administración de un catálogo de electrodomésticos por categoría, marca y modelo.
- Consulta de stock durante la atención comercial.
- Preparación rápida de precios y cotizaciones.
- Copia de valores para utilizarlos en otros canales.
- Creación de historias de producto para Instagram.
- Intercambio de cotizaciones e información mediante WhatsApp.
- Backend gratuito de Render sujeto a períodos de arranque en frío.

## Capabilities and Constraints

- Cargar, editar, buscar y eliminar productos según permisos.
- Consultar stock y filtrar productos.
- Calcular valores de contado, factura y cuotas.
- Preparar cotizaciones coherentes con los precios vigentes.
- Administrar usuarios, estados de aprobación y roles.
- Registrar ventas, acuerdos de entrega, envíos y seguimiento separado de pago y entrega.
- Almacenar imágenes persistentemente en Cloudinary.
- El precio base representa el valor inicial antes de ganancia y financiación.
- El precio contado es el precio comercial principal mostrado para el producto.
- Las fórmulas y factores son responsabilidad exclusiva del backend.
- Una cotización debe preservar los datos y valores utilizados al crearla.
- No se exponen secretos ni reglas sensibles en el bundle del frontend.

## Brand Commitments

- Nombre: Hogar Conectado.
- Voz: cercana, práctica y confiable.
- La experiencia debe sentirse doméstica y comercial, sin volverse corporativa o fría.
- Priorizar claridad y velocidad; la decoración no debe dificultar la operación.
- Dar protagonismo a la imagen del producto sin ocultar marca, modelo y precio contado.
- Mostrar acciones importantes con etiquetas comprensibles y no depender únicamente de iconos.

## Evidence on Hand

- Catálogo y datos reales persistidos en MongoDB Atlas.
- Planilla histórica de productos en `data/stock.xlsx`.
- Recursos de marca e imágenes en `assets/images/`.
- Flujos funcionales de autenticación, productos, stock, calculadora, cotizaciones, usuarios e Instagram implementados en `app/`.
- No hay testimonios, métricas comerciales ni afirmaciones públicas verificadas; no deben inventarse.

## Product Principles

1. Una sola fuente de verdad para productos, permisos y precios.
2. Menos pasos entre encontrar un producto y compartir una propuesta comercial.
3. Lectura rápida y acciones inequívocas en escritorio y celular.
4. Persistencia y trazabilidad antes que soluciones temporales.
5. La autorización efectiva se aplica en el backend, no solo en la interfaz.

## Accessibility & Inclusion

La aplicación debe poder utilizarse con teclado en web, conservar estados de foco visibles, mantener contraste legible y tolerar ampliación de texto y textos largos. Los estados de carga, vacío, error, permiso y confirmación deben comunicarse con texto, no solo mediante color o iconos.
