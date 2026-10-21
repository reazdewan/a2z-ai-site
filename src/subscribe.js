// POST /api/subscribe (called from src/worker.js)
// Saves a signup (email, first name, last name, user agent) into the D1 database bound as `DB`.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

function clean(value, max) {
  return String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, max);
}

export async function handleSubscribe(request, env) {
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
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  if (!firstName || !lastName) return json({ ok: false, error: 'Please enter your first and last name.' }, 400);

  if (!env.DB) return json({ ok: false, error: 'Database is not connected yet.' }, 500);

  const userAgent = clean(request.headers.get('user-agent'), 300);

  try {
    await env.DB.prepare(
      `INSERT INTO subscribers (email, first_name, last_name, user_agent)
       VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(email) DO UPDATE SET
         first_name = excluded.first_name,
         last_name = excluded.last_name,
         updated_at = CURRENT_TIMESTAMP`
    ).bind(email, firstName, lastName, userAgent).run();
  } catch (err) {
    console.error('D1 insert failed', err);
    return json({ ok: false, error: 'Could not save your signup. Please try again.' }, 500);
  }

  return json({ ok: true });
}
