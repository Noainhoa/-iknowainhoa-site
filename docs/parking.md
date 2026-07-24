# Parking Guardamar Centro

Self-contained availability tool at `/parking-guardamar-centro/` (not linked from the main site). Admin at `/parking-guardamar-centro/admin/` (noindex).

Old URLs `/parking` and `/parking/admin` redirect permanently to the new paths.

Brand name: **Parking Guardamar Centro**

## Setup

1. Create a Supabase project.
2. Run `supabase/parking.sql` in the SQL editor.
3. Authentication → Users → create an admin user (email/password).
4. Copy project URL + anon key into Vercel / `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Deploy. Public URL: `https://iknowainhoa.com/parking-guardamar-centro/`

## Behaviour

- Public calendar shows only Available / Unavailable (no private fields).
- ES / EN via the same `?lang=` + `preferred_locale` cookie as the main site; first visit uses `Accept-Language`.
- Prices shown on the public page (high season / September / Oct–May).
- Arrival and departure use before/after midday selects (no clock times).
- Range selection builds a WhatsApp message to `+34 636 670 103`.
- Selecting dates does **not** create a booking.

## Local

```bash
npm run dev
# http://localhost:3000/parking-guardamar-centro/
# http://localhost:3000/parking-guardamar-centro/admin/
```
