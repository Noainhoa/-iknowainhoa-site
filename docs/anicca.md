# Anicca reminder token

Landing page: `/anicca` · canonical `https://iknowainhoa.com/anicca`

Commerce: `/anicca/shipping-returns`

## Commercial config (edit here)

[`lib/anicca/config.ts`](../lib/anicca/config.ts)

- `ANICCA_PRICE_EUR`
- `ANICCA_VARIANTS[].stock`
- `ANICCA_VARIANTS[].stripePaymentUrl`
- Public dispatch: `ANICCA_DISPATCH_PUBLIC`
- Unconfirmed same-day rule: `ANICCA_DISPATCH_ESTIMATE_UNCONFIRMED` (do not publish until confirmed)

Payment Links also mirrored in [`content/stripe-payment-links.json`](../content/stripe-payment-links.json).

Default inscription: `anicca-en`.

Current first-edition stock: Anicca English 19 · Yathābhūtaṃ English 20 · Anicca Español 5.

## Stripe (Dashboard, not this repo)

Payment Links already in config. Configure in Stripe:

- Collect shipping address
- Spain as allowed destination
- Standard delivery €0 (included in €14)
- Optional tracked delivery €5.74 (Correos Carta Certificada)
- Success URL: `https://iknowainhoa.com/thanks`

Do not create or edit Stripe resources from the codebase.

## Photographs

Real photographs in [`public/anicca/`](../public/anicca/) currently used on the page:

| File | Use |
|------|-----|
| `anicca-front.jpg` / `anicca-back.jpg` | Hero, English Anicca |
| `yathabhutam-front.jpg` / `yathabhutam-back.jpg` | Hero when Yathābhūtaṃ is selected |
| `spanish-front.jpg` / `spanish-back.jpg` | Hero when Spanish Anicca is selected |
| `token-necklace.jpg`, `token-desk.jpg`, `token-wallet.jpg`, `token-keyring.jpg` | “The first ones never stayed in the box” |
| `anicca-front-2.jpg` | Open Graph |

Placeholders are not rendered.

## Analytics

`anicca_view`, `anicca_variant_selected`, `anicca_checkout_clicked`. Purchase completion is only in Stripe Dashboard.

## Owner confirmation still needed

- Same-day dispatch before 12:00 CET (currently unpublished; page says working-day posting from Spain)
- EU 14-day withdrawal wording on `/anicca/shipping-returns` (plain consumer-rights summary; not legal advice)
- Site-wide privacy policy for product sales
- Dedicated 1200×630 Open Graph image
