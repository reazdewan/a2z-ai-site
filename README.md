# A2Z AI website

Store home page for A2Z AI: free downloads, early access for premium products, and email collection.
Live at **https://shop.a2zaidaily.com**. Hosting: **Cloudflare Workers** (free, deployed from GitHub). Emails are saved in **Cloudflare D1** (free database).

```
public/               the website (what visitors see)
  index.html
  privacy.html
  assets/styles.css
  assets/app.js       product list, popup, form logic  <- edit products here
  downloads/          put your free PDFs here
src/
  worker.js           routes /api/* and serves the website
  subscribe.js        saves every signup into the database
  export.js           downloads your list as a CSV file
  import.js           imports a CSV list (used by /admin/import.html)
wrangler.jsonc        Worker settings, including the database connection (DB)
schema.sql            database table (already created in your account)
```

## Video tutorials

- How to connect GitHub to Cloudflare Pages (2026): https://www.youtube.com/watch?v=KlNPhoQQjmw
- How to deploy a GitHub project on Cloudflare Pages (2026): https://www.youtube.com/watch?v=yIsqQqc--tI
- Official docs, Workers static assets: https://developers.cloudflare.com/workers/static-assets/

## Setup status

- Database `a2z-ai-subscribers`: created, table ready.
- Database connection: already set in `wrangler.jsonc` (binding `DB`), no dashboard binding needed.
- Worker: connected to this GitHub repo. Every push deploys automatically.

### The one step left: export password
Worker > **Settings** > **Variables and Secrets** > **Add** > Type **Secret**, Name **EXPORT_KEY**,
Value: a long password you keep private. Save and deploy.

If the Worker in your dashboard has a different name than `a2z-ai-site`,
change `"name"` in `wrangler.jsonc` to match, or the build will fail.

## See your emails

- **Download CSV (all):** `https://shop.a2zaidaily.com/api/export?key=YOUR_EXPORT_KEY`
- **Only early access:** add `&form=early-access`
- **Only free downloads:** add `&form=free-download`
- **Only hero newsletter form:** add `&form=newsletter`
- Or in Cloudflare: D1 > `a2z-ai-subscribers` > Console:
  `SELECT * FROM subscribers ORDER BY created_at DESC;`

Columns: date, first name, last name, email, form, product, country, page.

## Import an existing list

1. Open `https://shop.a2zaidaily.com/admin/import.html` (private page, hidden from search engines).
2. Choose a CSV with columns `Email`, `First Name`, `Last Name`, and optionally `timestamp`, `user_agent`.
3. Enter your EXPORT_KEY password and click **Import**.

Imported contacts are saved with no form or product label. Any email already in the database is skipped,
so running the same file twice is safe.
Import the CSV into any email tool (Kit, MailerLite, Brevo) when you want to send emails.

## Everyday changes

Every change pushed to GitHub goes live automatically in about a minute.

- **Products:** `public/assets/app.js` > the `FREE` and `PAID` lists at the top.
- **Free download files:** add PDFs to `public/downloads/` using the names in that folder's text file,
  or replace each `download:` value with a Google Drive link.
- **Text on the page:** `public/index.html`.
- **Placeholders to fill:** `[YOUR REFUND POLICY]` in index.html, and `[DATE]`, `[SUPPORT EMAIL]`,
  `[COMPANY ADDRESS]` in privacy.html.

## Custom domain
Connected: `shop.a2zaidaily.com`. To add more, Worker > **Domains** > **Add domain**.

## Free limits (enough for a long time)
- D1 free: 100,000 signups written per day, 5 GB storage.
- Workers free: 100,000 API requests per day; static pages are free.
