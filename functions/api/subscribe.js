// POST /api/subscribe
// Saves a signup (newsletter, free download or early access) into the D1 database bound as `DB`.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FORMS = new Set(['newsletter', 'free-download', 'early-access']);

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

function clean(value, max) {
  return String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max);
}

export async function onRequestPost({ request, env }) {
  let data;
  try {
    const type = request.headers.get('content-type') || '';
    data = type.includes('application/json')
      ? await request.json()
      : Object.fromEntries(await request.formData());
  } catch {
    return json({ ok: false, error: 'Invalid request' }, 400);
  }

  // Honeypot: real people never fill the hidden "company" field. Pretend success for bots.
  if (clean(data.company, 200)) return json({ ok: true });

  const email = clean(data.email, 254).toLowerCase();
  const firstName = clean(data.first_name, 80);
  const lastName = clean(data.last_name, 80);
  const form = FORMS.has(data.form) ? data.form : 'newsletter';
  const product = clean(data.product, 160);
  const page = clean(data.page, 200);

  if (!EMAIL_RE.test(email)) return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  if (!firstName || !lastName) return json({ ok: false, error: 'Please enter your first and last name.' }, 400);

  if (!env.DB) return json({ ok: false, error: 'Database is not connected yet.' }, 500);

  const country = (request.cf && request.cf.country) || '';
  const userAgent = clean(request.headers.get('user-agent'), 300);

  try {
    await env.DB.prepare(
      `INSERT INTO subscribers (email, first_name, last_name, form, product, country, page, user_agent)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
       ON CONFLICT(email, form, product) DO UPDATE SET
         first_name = excluded.first_name,
         last_name = excluded.last_name,
         updated_at = CURRENT_TIMESTAMP`
    ).bind(email, firstName, lastName, form, product, country, page, userAgent).run();
  } catch (err) {
    console.error('D1 insert failed', err);
    return json({ ok: false, error: 'Could not save your signup. Please try again.' }, 500);
  }

  return json({ ok: true });
}
