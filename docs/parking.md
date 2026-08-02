# Parking Guardamar Centro

Self-contained availability tool at `/parking-guardamar-centro/` (not linked from the main site). Admin at `/parking-guardamar-centro/admin/` (noindex).

Old URLs `/parking` and `/parking/admin` redirect permanently to the new paths.

Brand name: **Parking Guardamar Centro**

## Setup

1. Create a Supabase project.
2. Run `supabase/parking.sql` in the SQL editor.
3. Run `supabase/parking-rates.sql` (public seasonal tariffs + admin Tarifas editor).
4. Authentication → Users → create an admin user (email/password).
5. Copy project URL + anon key into Vercel / `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Also set the same two variables in **Vercel → Project → Settings → Environment Variables** (Production), then redeploy.

6. **Auth redirect URLs** (required for password reset emails):

In [Authentication → URL Configuration](https://supabase.com/dashboard/project/cbvpybxuwraovlxxbdpk/auth/url-configuration):

- **Site URL:** `https://iknowainhoa.com`
- **Redirect URLs** (add both):
  - `https://iknowainhoa.com/parking-guardamar-centro/admin`
  - `http://localhost:3000/parking-guardamar-centro/admin` (local only)

If Site URL stays as `http://localhost:3000`, reset emails will open localhost instead of production.

7. Deploy. Public URL: `https://iknowainhoa.com/parking-guardamar-centro/`

## Behaviour

- Public calendar shows only Available / Unavailable (no private fields).
- Selecting dates does **not** create a booking; WhatsApp enquire only.
- **Checkout day is free:** a booking from day 1 to day 10 occupies days 1–9; day 10 (exit) stays available for the next arrival. Run `supabase/parking-checkout-day.sql` if the project was created with the old inclusive overlap rule.

## Admin confirmation

When you save a **reserved** booking, fill in:

- Name, surnames, DNI/NIE, phone, dates, payment amount

The admin generates a **confirmation PNG** (name, DNI, dates, payment, Jorge Juan 13) and downloads it. Use **Abrir WhatsApp del cliente** and attach the image manually (WhatsApp links cannot auto-attach files).

For reservas, also upload a **DNI photo/PDF** (stored privately in Supabase Storage bucket `parking-dni`).

If the table already exists, run `supabase/parking-dni-storage.sql` (adds column + private bucket + storage policies). Also run `supabase/parking-booking-fields.sql` for name fields if needed.

## Local

```bash
npm run dev
# http://localhost:3000/parking-guardamar-centro/
# http://localhost:3000/parking-guardamar-centro/admin/
```
