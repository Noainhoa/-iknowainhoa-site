# Parking SEO launch checklist

Live URL: https://iknowainhoa.com/parking-guardamar-centro  
Repo: `iknowainhoa-site` (not the standalone Parking Jun 26 app)

## Canonical rules

| Locale | Public URL |
|--------|------------|
| ES (primary) | `/parking-guardamar-centro` |
| EN | `/parking-guardamar-centro?lang=en` |
| FR | `/parking-guardamar-centro?lang=fr` |

- `?lang=es` and invalid `lang` redirect to the bare Spanish URL
- hreflang + `x-default` point at the Spanish bare URL
- Sitemap lists bare + EN + FR only (same for `/privacidad`)

## Search Console

1. Confirm property for `https://iknowainhoa.com`
2. Inspect Spanish URL → request indexing after deploy
3. Inspect EN/FR URLs
4. Submit / re-fetch `https://iknowainhoa.com/sitemap.xml`
5. Check Coverage / Page indexing for soft-404 or duplicate-canonical issues
6. Validate rich results (ParkingFacility / FAQ) with the Rich Results Test

## Analytics hook

`lib/parking/analytics.ts` is a privacy-safe stub (no PII).

Events: `parking_view`, `parking_dates_selected`, `parking_whatsapp_click`, `parking_map_click`, `parking_language_change`, `parking_form_error`.

To enable measurement later, plug GA4/Plausible inside `trackParkingEvent` and set the vendor ID in env — do not log name, registration, or comments.

## Live verification (after deploy)

- [ ] Title / meta description (ES/EN/FR)
- [ ] `<link rel="canonical">` and hreflang
- [ ] JSON-LD `@graph` with verified geo `38.08556260856233`, `-0.6488313283580208`
- [ ] No fabricated `openingHoursSpecification`
- [ ] FAQ / Sobre esta plaza / breadcrumb / intro in HTML **after** the enquiry form
- [ ] Calendar still disables reserved (red) dates
- [ ] WhatsApp enquiry still opens with dates + estimate
- [ ] Sitemap omits `?lang=es`
