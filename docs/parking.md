# Parking Guardamar Centro

Self-contained Spanish availability tool at `/parking/` (not linked from the main site). Admin at `/parking/admin/` (noindex).

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

5. Deploy. Public URL: `https://iknowainhoa.com/parking/`

## Behaviour

- Public calendar shows only Disponible / No disponible (no private fields).
- Range selection builds a WhatsApp message to `+34 636 670 103` (`https://wa.me/34636670103`).
- Selecting dates does **not** create a booking.
- Admin CRUD uses Supabase Auth; overlap of reserved/blocked ranges is rejected by the DB.

## Local

```bash
npm run dev
# http://localhost:3000/parking/
# http://localhost:3000/parking/admin/
```
