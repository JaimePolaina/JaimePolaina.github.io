# Aviso de visita

Este Worker acepta únicamente `POST /visit` desde `https://jaimepolaina.github.io`, limita los envíos a 10 por minuto y manda un mensaje fijo a `jaime.pg.arq@gmail.com`. Acepta solo una ruta del portfolio incluida en una lista cerrada, para indicar la página inicial de la sesión. El correo incluye ciudad y país aproximados derivados de Cloudflare; pueden ser inexactos y no identifican al estudio. No procesa el cuerpo, la dirección IP ni otros identificadores del visitante. El límite es por ubicación de Cloudflare; la cabecera `Origin` puede falsificarse fuera del navegador, así que son protecciones básicas, no autenticación.

## Configuración actual

El Worker está publicado en `https://portfolio-visit-notice.jaime-pg-arq.workers.dev/visit`. La clave de Resend está guardada como secreto `RESEND_API_KEY` de Cloudflare. La observabilidad del Worker está desactivada para evitar registros de solicitudes.

## Volver a desplegar

1. En esta carpeta ejecuta `npm install` y `npx wrangler login` si hace falta.
2. Ejecuta `npx wrangler deploy` para publicar una versión nueva del código.
3. Si cambias la clave de Resend, ejecuta `npx wrangler secret put RESEND_API_KEY` e introdúcela en el prompt, nunca en un archivo del repositorio.
4. La URL pública está configurada en `visit-config.js`. Abre `https://jaimepolaina.github.io` en una ventana privada para generar una sesión nueva y comprueba la bandeja de entrada de `jaime.pg.arq@gmail.com`.

La dirección de destino y el contenido del correo están fijados en `worker.js`; el navegador no puede cambiarlos. El único secreto es `RESEND_API_KEY`, guardado en Cloudflare. El aviso falla en silencio y la página continúa funcionando. Los navegadores que no ejecutan JavaScript no generan avisos.

## Pruebas locales

Desde la raíz del repositorio: `node --test visit-notice.test.mjs visit-worker/worker.test.mjs`.
