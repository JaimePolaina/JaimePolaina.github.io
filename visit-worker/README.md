# Aviso de visita humana probable

El navegador solicita el aviso cuando la página ha permanecido visible durante siete segundos, el visitante ha interactuado y Cloudflare Turnstile ha validado la sesión. El Worker vuelve a validar el token antes de mandar el correo y solo acepta la página inicial de una lista cerrada.

El correo incluye la página inicial y la ciudad y el país aproximados derivados de Cloudflare. Esta ubicación puede ser inexacta y no identifica por sí sola a una persona ni a un estudio. No se guarda ni se envía la dirección IP.

## Configuración

- `RESEND_API_KEY`: secreto de Resend.
- `TURNSTILE_SECRET_KEY`: secreto privado del widget de Turnstile.
- `VISIT_RATE_LIMITER`: límite de diez intentos por minuto.
- `PORTFOLIO_TURNSTILE_SITE_KEY` en `visit-config.js`: clave pública del widget.

La observabilidad y los registros de solicitudes del Worker permanecen desactivados.

## Pruebas locales

Desde la raíz del repositorio: `node --test visit-notice.test.mjs visit-worker/worker.test.mjs`.
