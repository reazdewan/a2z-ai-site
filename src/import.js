// POST /api/import  (used by /admin/import.html)
// Body: { key: EXPORT_KEY, rows: [{ email, first_name, last_name, created_at, user_agent }] }
// Saves rows as plain subscribers (no form or product label). Existing emails are skipped.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_ROWS = 400;      // per request
const PER_STATEMENT = 20;  // 20 rows x 5 values = 100 bound values (D1 limit)

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function clean(value, max) {
  return String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max);
}

// Accepts ISO dates like 2026-02-01T08:03:10.177Z or "2026-02-01 08:03:10". Returns "YYYY-MM-DD HH:MM:SS" or null.
function toSqlDate(value) {
  const s = clean(value, 40);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})/);
  if (m) return `${m[1]} ${m[2]}`;
  const d = s ? new Date(s) : null;
  if (d && !isNaN(d)) return d.toISOString().slice(0, 19).replace('T', ' ');
  return null;
}

export async function handleImport(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid request' }, 400);
  }

  const serverKey = typeof env.EXPORT_KEY === 'string' ? env.EXPORT_KEY.trim() : '';
  if (!serverKey) {
    return json({ ok: false, error: 'EXPORT_KEY is not set on the live Worker. Add it as a Secret under Settings > Variables and Secrets (not the Build section), then deploy.' }, 401);
  }
  if (!safeEqual(String(body.key || '').trim(), serverKey)) {
    return json({ ok: false, error: 'Wrong password (the server has an EXPORT_KEY, but it does not match what you typed)' }, 401);
  }
  if (!env.DB) return json({ ok: false, error: 'Database is not connected yet.' }, 500);

  const input = Array.isArray(body.rows) ? body.rows : [];
  if (input.length > MAX_ROWS) return json({ ok: false, error: `Send at most ${MAX_ROWS} rows per request` }, 400);

  const rows = [];
  let invalid = 0;
  for (const r of input) {
    const email = clean(r.email, 254).toLowerCase();
    if (!EMAIL_RE.test(email)) { invalid++; continue; }
    rows.push([
      email,
      clean(r.first_name, 80),
      clean(r.last_name, 80),
      toSqlDate(r.created_at),
      clean(r.user_agent, 300)
    ]);
  }

  const statements = [];
  for (let i = 0; i < rows.length; i += PER_STATEMENT) {
    const chunk = rows.slice(i, i + PER_STATEMENT);
    const placeholders = chunk.map(() => '(?, ?, ?, ?, ?)').join(', ');
    // Skip any email that is already in the database, whatever form it came from.
    statements.push(
      env.DB.prepare(
        `INSERT OR IGNORE INTO subscribers (email, first_name, last_name, created_at, user_agent, form, product)
         SELECT v.column1, v.column2, v.column3, COALESCE(v.column4, CURRENT_TIMESTAMP), v.column5, '', ''
         FROM (VALUES ${placeholders}) AS v
         WHERE NOT EXISTS (SELECT 1 FROM subscribers s WHERE s.email = v.column1)`
      ).bind(...chunk.flat())
    );
  }

  let inserted = 0;
  if (statements.length) {
    try {
      const results = await env.DB.batch(statements);
      for (const res of results) inserted += (res.meta && res.meta.changes) || 0;
    } catch (err) {
      console.error('Import failed', err);
      return json({ ok: false, error: 'Database error. Nothing in this batch was saved, try again.' }, 500);
    }
  }

  return json({ ok: true, received: input.length, inserted, skipped: rows.length - inserted, invalid });
}
