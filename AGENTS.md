# Hogar Conectado — Frontend

## Propósito

Aplicación universal para administrar productos, consultar stock, calcular precios y preparar cotizaciones. Debe funcionar correctamente en web de escritorio y móvil, y conservar compatibilidad con Expo/React Native.

## Arquitectura

- Expo 53, React 19, React Native y TypeScript.
- Expo Router con rutas en `app/` y navegación principal en `app/(tabs)/`.
- Base PWA web en `public/manifest.webmanifest`, `public/sw.js` y `components/pwa/`.
- Componentes reutilizables en `components/`.
- Acceso al backend exclusivamente mediante `services/`.
- Estado de autenticación y permisos en `contexts/AuthContext.tsx`.
- Hooks reutilizables en `hooks/`.
- Tokens visuales compartidos en `constants/theme.ts` y `constants/Colors.ts`.

## Comandos habituales

```bash
npm install
npm run web
npm test
npm run lint
npx expo export --platform web
```

Antes de entregar cambios de código, ejecutar como mínimo `npm test` y `npm run lint`. Para cambios que puedan afectar producción web, ejecutar también `npx expo export --platform web`.

GitHub Actions repite tests, lint, TypeScript y exportación web en pull requests y pushes a `main`. El workflow valida pero no despliega; Render conserva esa responsabilidad.

## Configuración

Variables públicas utilizadas por el frontend:

- `EXPO_PUBLIC_API_URL`: URL base de la API, normalmente terminada en `/api`.
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID`: cliente OAuth web de Google.

No incorporar secretos al frontend ni versionar archivos `.env` locales.

## Reglas funcionales

- El backend es la fuente de verdad de los cálculos de precios.
- No copiar fórmulas ni factores de precios dentro de componentes, pantallas o hooks.
- Utilizar `services/preciosService.ts` y `/api/precios/calcular` para cálculos dinámicos.
- Para productos, el precio de venta mostrado es `producto.precios.contado`.
- Las imágenes persistentes se cargan y eliminan mediante la API; Cloudinary se configura únicamente en el backend.
- La navegación del catálogo es pública; la autenticación utiliza Google y un JWT emitido por el backend para la operación interna.
- Visitantes y perfiles no administradores ven Productos como única solapa operativa; su acceso real también debe estar restringido por el backend.
- El flujo público de consulta debe conservar contexto del producto, consentimiento explícito, validación visible y protección contra doble envío.
- La bandeja de consultas, su contador y los cambios de estado son exclusivos de administradores; las cards conservan el snapshot comercial y muestran el responsable cuando una consulta ya fue tomada.
- El permiso de notificaciones web debe solicitarse únicamente a administradores, después de una interacción explícita; no solicitar permisos al cargar la aplicación.
- Respetar los estados de acceso `activo`, `pendiente` y `bloqueado`.
- Las funciones administrativas deben respetar el rol del usuario; no confiar solamente en ocultar controles en la interfaz.
- Todo cambio visual debe revisarse tanto en escritorio como en viewport móvil.
- Reutilizar tokens y componentes existentes antes de introducir estilos aislados.

## Seguridad y calidad

- No registrar tokens, credenciales ni datos sensibles.
- Mantener el manejo centralizado de respuestas `401` en `services/apiClient.ts`.
- No ignorar errores de lint o build sin documentar la causa.
- Preservar accesibilidad, contraste, estados de foco, textos largos, carga, vacío y error.
- No editar archivos de respaldo (`*.backup*`) como implementación activa.

## Git y despliegue

- Rama productiva: `main`.
- Render despliega automáticamente cada push a `main`.
- Para una emergencia usar `Deploy latest commit`; evitar `Deploy a specific commit`, porque puede desactivar el auto-deploy.
- Formato de commit: `HC-FRONT-DDMMAA-descripcion breve`.
- No crear commits, hacer push ni desplegar sin autorización explícita del usuario.

## Forma de colaboración

- Se permiten inspecciones y diagnósticos de solo lectura.
- Consultar antes de modificar archivos.
- Solicitar autorización separada antes de commit, push, despliegue, migración, eliminación o cambios en datos.
- Preservar cambios existentes que no pertenezcan a la tarea.
- Nunca incluir valores reales de secretos en documentación, código, logs o respuestas.

## Mantenimiento de este documento

Revisar este archivo cuando cambien arquitectura, comandos, variables, reglas de precios, autenticación, almacenamiento, pruebas o despliegue. Hacer además una revisión breve cada 2–3 meses. Mantenerlo conciso y retirar instrucciones obsoletas.
