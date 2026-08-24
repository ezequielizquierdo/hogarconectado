# Arquitectura del frontend

## Resumen

Hogar Conectado es una aplicación universal construida con Expo, React Native y TypeScript. La misma base de código se exporta como sitio web estático y conserva compatibilidad con dispositivos móviles.

## Capas principales

```text
app/            Rutas y pantallas de Expo Router
components/     Componentes visuales y formularios reutilizables
contexts/       Estado global de autenticación
hooks/          Consulta y composición de estado remoto
services/       Cliente HTTP y contratos con la API
constants/      Tokens visuales y constantes compartidas
assets/         Imágenes y fuentes incluidas en la aplicación
```

Las pantallas no deben acceder directamente a Axios. Toda comunicación con el backend pasa por `services/apiClient.ts` y los servicios de dominio.

## Navegación

- `app/_layout.tsx` monta Google OAuth, autenticación y el navegador raíz.
- `app/(tabs)/_layout.tsx` define la navegación principal.
- Los usuarios no autenticados son enviados a `/login`.
- Los usuarios pendientes o bloqueados son enviados a `/acceso-pendiente`.
- La pestaña de usuarios solo se muestra a administradores; el backend sigue siendo responsable de autorizar las operaciones.

## Datos y API

- URL configurable con `EXPO_PUBLIC_API_URL`.
- El token JWT se conserva mediante AsyncStorage y se adjunta en el interceptor de Axios.
- Una respuesta `401` elimina la sesión local.
- El timeout y los reintentos consideran el arranque en frío del backend gratuito de Render.
- Productos, categorías, usuarios, imágenes y cotizaciones se obtienen mediante los servicios de `services/`.

## Precios

El frontend no es dueño de las fórmulas. Para cálculos dinámicos utiliza `services/preciosService.ts`, que consulta `POST /api/precios/calcular`. Para productos existentes muestra los precios calculados entregados por el backend, particularmente `precios.contado`.

## Imágenes y contenido social

Las imágenes se seleccionan en el cliente, pero se almacenan mediante la API del backend en Cloudinary. MongoDB conserva la referencia correspondiente. La generación para Instagram se realiza en el frontend a partir de los datos y el precio contado actualizado.

## Sistema visual

Los tokens actuales están en `constants/theme.ts` y `constants/Colors.ts`. Los componentes nuevos deben reutilizar esos valores y comprobarse en escritorio y móvil. `DESIGN.md` será la referencia visual canónica cuando quede adoptado.

## Límites de responsabilidad

- Frontend: interacción, navegación, presentación y composición de solicitudes.
- Backend: autenticación, autorización, validación, persistencia, almacenamiento y reglas de precios.
- Render Static Site: compilación y publicación web.
- Google: identidad OAuth.
- MongoDB Atlas: datos persistentes.
- Cloudinary: archivos de imagen persistentes.
