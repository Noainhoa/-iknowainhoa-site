# Stripe Payment Links

Use Stripe Payment Links for each product (no cart). Keep the donation checkout (`/api/checkout`) as-is.

## Steps
1. In Stripe, create a **Payment Link** for the product.
2. Set the post-payment redirect to `https://iknowainhoa.com/thanks`.
3. Copy the generated `https://buy.stripe.com/...` URL.
4. Open `content/stripe-payment-links.json` and paste the URL under the matching product slug.

Notes:
- Only Stripe Payment Links (`https://buy.stripe.com/...`) are accepted. Invalid URLs are ignored in dev with a warning.
- If a product frontmatter `ctaUrl` contains `example.com`, it is ignored so placeholders never ship.
