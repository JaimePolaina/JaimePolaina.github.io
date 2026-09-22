const ALLOWED_ORIGIN = 'https://jaimepolaina.github.io';
const RECIPIENT = 'jaime.pg.arq@gmail.com';
const SENDER = 'Portfolio <onboarding@resend.dev>';
const PAGE_NAMES = new Map([
  ['/', 'Inicio'],
  ['/projects', 'Proyectos'],
  ['/projects/bilbao', 'Bilbao'],
  ['/projects/marbella', 'Senior Living Marbella'],
  ['/projects/cedaceros-9', 'Cedaceros, 9'],
  ['/projects/castellana-a-b', 'Castellana A + B'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
  ['/cv', 'CV'],
  ['/other', 'Otra página'],
]);

function reply(status, origin) {
  const headers = {
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  };
  if (origin === ALLOWED_ORIGIN) {
    headers['Access-Control-Allow-Origin'] = ALLOWED_ORIGIN;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
  }
  return new Response(null, { status, headers });
}

function madridDateTime(date) {
  const parts = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type).value;
  return {
    date: `${value('day')}/${value('month')}/${value('year')}`,
    time: `${value('hour')}:${value('minute')}`,
  };
}

function approximateLocation(cf) {
  const city = typeof cf?.city === 'string' ? cf.city.trim().replace(/[\r\n<>]/g, '').slice(0, 80) : '';
  const country = typeof cf?.country === 'string' && /^[A-Z]{2}$/.test(cf.country) ? cf.country : '';
  return [city, country].filter(Boolean).join(', ') || 'No disponible';
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const url = new URL(request.url);
    if (url.pathname !== '/visit') return reply(404, origin);
    if (origin !== ALLOWED_ORIGIN) return reply(403, origin);
    if (request.method === 'OPTIONS') return reply(204, origin);
    if (request.method !== 'POST') return reply(405, origin);
    const parameters = [...url.searchParams];
    if (parameters.length > 1 || (parameters.length === 1 && parameters[0][0] !== 'page')) return reply(400, origin);
    const page = parameters.length ? PAGE_NAMES.get(parameters[0][1]) : 'No indicada';
    if (!page) return reply(400, origin);
    if (!env.RESEND_API_KEY || !env.VISIT_RATE_LIMITER) return reply(503, origin);

    const { success } = await env.VISIT_RATE_LIMITER.limit({ key: 'portfolio-visits' });
    if (!success) return reply(429, origin);

    const { date, time } = madridDateTime(new Date());
    const location = approximateLocation(request.cf);
    try {
      const sent = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: SENDER,
          to: [RECIPIENT],
          subject: 'Portfolio abierto',
          text: `Se ha registrado una nueva visita a tu portfolio.\n\nFecha: ${date}\nHora: ${time} (Europe/Madrid)\nPágina inicial: ${page}\nCiudad y país aproximados: ${location}`,
        }),
      });
      return reply(sent.ok ? 204 : 502, origin);
    } catch {
      return reply(502, origin);
    }
  },
};
