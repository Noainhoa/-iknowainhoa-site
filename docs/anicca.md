# Anicca reminder token

Landing page: `/anicca` · canonical `https://iknowainhoa.com/anicca`

## Commercial config (edit here)

[`lib/anicca/config.ts`](../lib/anicca/config.ts)

- `ANICCA_PRICE_EUR`
- `ANICCA_VARIANTS[].stock`
- `ANICCA_VARIANTS[].stripePaymentUrl` ← paste each Stripe Payment Link
- `ANICCA_DISPATCH_ESTIMATE` (confirm before launch)
- `ANICCA_SHIPPING_MESSAGE`

Keys also mirrored (optional) in [`content/stripe-payment-links.json`](../content/stripe-payment-links.json): `anicca-en`, `yathabhutam-en`, `anicca-es`.

Default / hero inscription: `anicca-en` (Anicca — English).

## Photographs

Real photographs in [`public/anicca/`](../public/anicca/) currently used on the page:

| File | Use |
|------|-----|
| `anicca-front.jpg` / `anicca-back.jpg` | Hero + selector, English Anicca |
| `yathabhutam-front.jpg` / `yathabhutam-back.jpg` | Hero when Yathābhūtaṃ is selected |
| `spanish-front.jpg` / `spanish-back.jpg` | Hero when Spanish Anicca is selected |
| `token-necklace.jpg`, `token-desk.jpg`, `token-wallet.jpg`, `token-keyring.jpg` | Editorial “kept close” section |
| `anicca-front-2.jpg` | Open Graph / Twitter (until a 1200×630 crop exists) |

Placeholders — **not rendered** on the public page:

- `velvet-pouch.jpg`, `note.jpg`, `flat-lay.jpg`, `og-social.jpg`
- `hero-token.jpg` (three tokens together; kept off the hero so one object leads)
- `token-desk0.jpg` (same scene as `token-desk.jpg`)

## Stripe

1. Create three Payment Links (€14 + shipping in Stripe).
2. Success URL: `https://iknowainhoa.com/thanks` (`publicPages.thanks` is already on).
3. Paste URLs into `stripePaymentUrl` in `lib/anicca/config.ts`.

Currently only **Anicca — English** has a Payment Link.

Purchase completion is not attributed from the site. Client events stop at `anicca_checkout_clicked`. Stripe Dashboard is the source for completed payments.

## Analytics

`lib/anicca/analytics.ts` emits:

- `anicca_view`
- `anicca_variant_selected` (+ `variantId`)
- `anicca_checkout_clicked` (+ `variantId`)
- `anicca_checkout_blocked` (sold out or missing Payment Link)

Events forward to `gtag` / `dataLayer` when present. No analytics vendor is configured on the site yet.

## Still needs owner confirmation

- Dispatch estimate copy
- Shipping regions / costs (shown in Stripe)
- Site-wide returns policy (FAQ currently points to email; no invented policy)
- Site-wide privacy policy for product sales (FAQ currently points to email + Stripe)
- Stripe Payment Links for Yathābhūtaṃ and Spanish Anicca
- Real photographs of pouch, note, and packed set
- Dedicated 1200×630 Open Graph image
