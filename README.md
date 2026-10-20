# A2Z AI website

Store home page for A2Z AI: free downloads, early access for premium products, and email collection.
Hosting: **Cloudflare Pages** (free). Emails are saved in **Cloudflare D1** (free database).

```
public/               the website (what visitors see)
  index.html
  privacy.html
  assets/styles.css
  assets/app.js       product list, popup, form logic  <- edit products here
  downloads/          put your free PDFs here
functions/api/
  subscribe.js        saves every signup into the database
  export.js           downloads your list as a CSV file
schema.sql            creates the database table (run once)
```

## Video tutorials

- How to connect GitHub to Cloudflare Pages (2026): https://www.youtube.com/watch?v=KlNPhoQQjmw
- How to deploy a GitHub project on Cloudflare Pages (2026): https://www.youtube.com/watch?v=yIsqQqc--tI
- Official docs, D1 bindings for Pages: https://developers.cloudflare.com/pages/functions/bindings/

## One-time setup (about 15 minutes)

### 1. Put the code on GitHub
1. Go to github.com > **New repository** > name it `a2z-ai-site` > Create.
2. Click **uploading an existing file** and drag in everything from this folder (keep the folders).
   Or let Claude push it for you once GitHub is connected.

### 2. Create the Cloudflare Pages project
1. dash.cloudflare.com > **Workers & Pages** > **Create** > **Pages** > **Connect to Git**.
2. Pick the `a2z-ai-site` repository.
3. Build settings:
   - Framework preset: **None**
   - Build command: *(leave empty)*
   - Build output directory: **public**
4. **Save and Deploy**. Your site is live at `a2z-ai-site.pages.dev`.

### 3. Create the database
1. Cloudflare > **Storage & Databases** > **D1** > **Create database** > name it `a2z-ai-subscribers`.
2. Open it > **Console** > paste everything from `schema.sql` > **Execute**.

### 4. Connect the database to the site
1. Workers & Pages > your project > **Settings** > **Bindings** > **Add** > **D1 database**.
2. Variable name: **DB** (exactly this) > Database: `a2z-ai-subscribers` > Save.

### 5. Add your export password
1. Same project > **Settings** > **Variables and Secrets** > **Add**.
2. Type: **Secret**, Name: **EXPORT_KEY**, Value: a long random password you keep private.

### 6. Redeploy
Project > **Deployments** > latest deployment > **...** > **Retry deployment**.
(The database and secret only start working after a new deployment.)

### 7. Test
Open your site, sign up with your own email, then check step "See your emails" below.

## See your emails

- **Download CSV (all):** `https://YOUR-SITE.pages.dev/api/export?key=YOUR_EXPORT_KEY`
- **Only early access:** add `&form=early-access`
- **Only free downloads:** add `&form=free-download`
- **Only hero newsletter form:** add `&form=newsletter`
- Or in Cloudflare: D1 > `a2z-ai-subscribers` > Console:
  `SELECT * FROM subscribers ORDER BY created_at DESC;`

Columns: date, first name, last name, email, form, product, country, page.
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
Project > **Custom domains** > **Set up a custom domain** > follow the steps.

## Free limits (enough for a long time)
- D1 free: 100,000 signups written per day, 5 GB storage.
- Pages free: unlimited static requests.
