# Enlaces de vendedores

El backend asigna al aprobar el rol vendedor un alias único basado en inicial y apellido, por ejemplo `eizquierdo`. Si está ocupado, prueba `ezizquierdo`, luego más letras del nombre y finalmente un número. El alias no cambia automáticamente si el usuario modifica su nombre. `codigoVendedor` se conserva para que los enlaces anteriores sigan funcionando.

El enlace compartido es `https://hogarconectado.onrender.com/v/<alias>`. El frontend se publica como sitio estático de Expo; por eso Render necesita esta regla en el sitio **hogarconectado** (Redirects/Rewrites):

| Source | Destination | Action |
| --- | --- | --- |
| `/v/*` | `/v.html` | Rewrite |

`v.html` redirige al catálogo con `ref=<alias>`. El backend valida que el vendedor esté activo y transforma el alias al código interno. Un enlace inventado o de un vendedor bloqueado no atribuye consultas. Los enlaces anteriores `/productos?ref=v-...` siguen vigentes.

Antes de compartir enlaces nuevos, comprobar en producción que `/v/eizquierdo` abre Productos, muestra al vendedor correcto y registra una consulta de prueba atribuida. No otorgar roles ni modificar usuarios de producción por script; cada persona debe iniciar sesión con Google y luego el administrador aprobarla desde Usuarios.
