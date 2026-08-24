# Despliegue del frontend

## Producción

- Plataforma: Render Static Site.
- Repositorio: `ezequielizquierdo/hogarconectado`.
- Rama: `main`.
- Auto-Deploy: `On Commit`.
- Root Directory: vacío.
- Build Command: `npm ci && npx expo export --platform web`.
- Publish Directory: `dist`.

## Variables

Configurar en Render sin registrar valores reales en Git:

- `EXPO_PUBLIC_API_URL`: URL HTTPS del backend terminada en `/api`.
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID`: Client ID web de Google OAuth.
- `NODE_VERSION`: versión de Node compatible con Expo 53.

Las variables `EXPO_PUBLIC_*` se incorporan al bundle y no pueden contener secretos.

## Integraciones externas

- La GitHub App de Render debe tener acceso a los repositorios frontend y backend.
- Google OAuth debe incluir como origen JavaScript autorizado la URL productiva exacta del frontend.
- El backend debe permitir esa misma URL mediante `FRONTEND_URL`.

## Flujo normal

1. Verificar `npm run lint`.
2. Verificar `npx expo export --platform web` en cambios relevantes.
3. Crear un commit `HC-FRONT-DDMMAA-descripcion breve` con autorización.
4. Subir a `main` con autorización.
5. Confirmar que Render detecta el commit y termina el deploy automáticamente.
6. Probar login, navegación y al menos una solicitud autenticada.

## Diagnóstico

Si no comienza el deploy, revisar en este orden:

1. El commit está en `origin/main`.
2. Auto-Deploy continúa en `On Commit`.
3. No existen Build Filters que excluyan los cambios.
4. La GitHub App de Render conserva acceso al repositorio.
5. Las Git Credentials del servicio siguen vinculadas.

Para una emergencia usar `Deploy latest commit`. Evitar `Deploy a specific commit`, porque puede desactivar el despliegue automático.
