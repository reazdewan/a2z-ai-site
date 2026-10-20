// GET /api/export?key=YOUR_EXPORT_KEY            -> all signups as CSV
// GET /api/export?key=YOUR_EXPORT_KEY&form=early-access   -> only one form
// Protected by the secret EXPORT_KEY set in Cloudflare (Worker > Settings > Variables and Secrets).

const FORMS = new Set(['newsletter', 'free-download', 'early-access']);
const COLUMNS = ['created_at', 'first_name', 'last_name', 'email', 'form', 'product', 'country', 'page'];

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function csvCell(value) {
  let s = String(value ?? '');
  // Stop spreadsheet formula injection.
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export async function handleExport(request, env) {
  const url = new URL(request.url);
  const key = (url.searchParams.get('key') || '').trim();
  const serverKey = typeof env.EXPORT_KEY === 'string' ? env.EXPORT_KEY.trim() : '';

  if (!serverKey || !safeEqual(key, serverKey)) {
    // Slow down password guessing: every wrong attempt waits 2 seconds.
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return new Response('Not found', { status: 404 });
  }
  if (!env.DB) return new Response('Database is not connected yet.', { status: 500 });

  const form = url.searchParams.get('form');
  const stmt = FORMS.has(form)
    ? env.DB.prepare(`SELECT ${COLUMNS.join(', ')} FROM subscribers WHERE form = ?1 ORDER BY created_at DESC`).bind(form)
    : env.DB.prepare(`SELECT ${COLUMNS.join(', ')} FROM subscribers ORDER BY created_at DESC`);

  const { results } = await stmt.all();
  const lines = [COLUMNS.join(',')].concat(
    (results || []).map((row) => COLUMNS.map((c) => csvCell(row[c])).join(','))
  );

  const date = new Date().toISOString().slice(0, 10);
  return new Response(lines.join('\n') + '\n', {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="a2z-ai-subscribers-${form || 'all'}-${date}.csv"`,
      'cache-control': 'no-store'
    }
  });
}
