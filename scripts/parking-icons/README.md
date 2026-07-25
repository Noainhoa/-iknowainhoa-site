# Parking icons

## Source

- Primary logo in repo: `public/images/parking/guardamar-parking-logo.png`
  (circular badge; corners were transparent, which iOS shows as black)
- Visual reference with continuous blue corners: `scripts/parking-icons/source-untitled-original.jpg`
  (owner-supplied Untitled export; used to confirm blue `#045C92`)

Do not use alternate regenerated logos as the source.

## Regenerate

```bash
npm run icons:parking
```

Writes versioned assets to `public/parking-icons/v2/` and syncs App Router
`icon.png` / `apple-icon.png` under the parking routes.

## iOS testing

Delete any existing Home Screen shortcut before re-adding the page, so Safari
does not keep a cached black-corner icon.
