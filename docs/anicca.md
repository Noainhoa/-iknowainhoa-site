# Anicca reminder token

Landing page: `/anicca` · canonical `https://iknowainhoa.com/anicca`

## Commercial config (edit here)

[`lib/anicca/config.ts`](../lib/anicca/config.ts)

- `ANICCA_PRICE_EUR`
- `ANICCA_VARIANTS[].stock`
- `ANICCA_VARIANTS[].stripePaymentUrl` ← paste each Stripe Payment Link
- `ANICCA_DISPATCH_ESTIMATE` (confirm before launch)
- `ANICCA_SHIPPING_MESSAGE`

Keys also mirrored (optional) in [`content/stripe-payment-links.json`](../content/stripe-payment-links.json): `yathabhutam-en`, `anicca-en`, `anicca-es`.

## Photographs

Replace placeholders in [`public/anicca/`](../public/anicca/):

| File | Use |
|------|-----|
| `hero-token.jpg` | Hero close-up |
| `anicca-front.jpg` / `anicca-back.jpg` | English Anicca |
| `yathabhutam-front.jpg` / `yathabhutam-back.jpg` | English Yathābhūtaṃ |
| `spanish-front.jpg` / `spanish-back.jpg` | Spanish Anicca |
| `velvet-pouch.jpg`, `note.jpg`, `flat-lay.jpg` | Packaging / what arrives |
| `token-wallet.jpg`, `token-desk.jpg`, `token-keyring.jpg`, `token-necklace.jpg` | How to keep it close |
| `og-social.jpg` | Open Graph / Twitter |

## Stripe

1. Create three Payment Links (€14 + shipping in Stripe).
2. Success URL: `https://iknowainhoa.com/thanks` (enable `publicPages.thanks` in `lib/site.ts` when live).
3. Paste URLs into `stripePaymentUrl` in `lib/anicca/config.ts`.

## Still needs owner confirmation

- Dispatch estimate copy
- Shipping regions / costs (shown in Stripe)
- Site-wide returns / privacy / terms pages (not published yet — FAQ notes this)
- Real product photography

## Spanish UI later

Add `es` to `aniccaCopyByLocale` in `lib/anicca/copy.ts`. Do not auto-translate Pali terms.
