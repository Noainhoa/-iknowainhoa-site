# Contact Form via OVH SMTP (Vercel)

Use OVH's SMTP to send contact form submissions from Vercel without a third-party form service.

## 1) Set environment variables in Vercel
- Go to **Vercel → Project → Settings → Environment Variables**
- Add the following (no quotes):
  - `SMTP_HOST = smtp.mail.ovh.net`
  - `SMTP_PORT = 465`
  - `SMTP_USER = hola@iknowainhoa.com`
  - `SMTP_PASS = <set in Vercel / .env.local — do not commit>`
  - `CONTACT_TO = hola@iknowainhoa.com`
  - `CONTACT_FROM = hola@iknowainhoa.com` (optional; defaults to SMTP_USER)
- Save, then trigger a redeploy.

## 2) Local development
- Copy `.env.example` to `.env.local` and fill in the values.
- Run `npm run dev` and submit the form at `/contact`.

## 3) Smoke test
- After deploy, open `/contact` and send a test message.
- Check the inbox for `CONTACT_TO` to confirm delivery.

Notes
- Port 465 uses `secure: true`; other ports (e.g., 587) use STARTTLS automatically.
- If required env vars are missing, the API returns `SERVER_CONFIG_INCOMPLETE` and the UI shows a configuration hint.
