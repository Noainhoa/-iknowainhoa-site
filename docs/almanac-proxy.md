# Almanac subpath proxy

The Personal Almanac PWA lives in a **separate** Vercel project / GitHub repo:

- App: `https://github.com/Noainhoa/iknowainhoa-almanac`
- Deploy: `https://iknowainhoa-almanac.vercel.app`
- Public URL (via this site): `https://iknowainhoa.com/almanac/`

`next.config.ts` rewrites `/almanac` and `/almanac/:path*` to that origin. Optional env override: `ALMANAC_ORIGIN`.

Middleware short-circuits `/almanac` so locale and Supabase session logic do not interfere with the PWA or its service worker.

If the proxy causes service-worker or caching issues, fall back to `almanac.iknowainhoa.com` pointed at the Almanac Vercel project and remove these rewrites.
