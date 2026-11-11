# Parking and Click icons

## Source

- Parking: `public/images/parking/guardamar-parking-badge.png`
- Click: `public/images/tech/guardamar-click-badge-v2.png`

Both are circular badges with transparent corners.

Parking icons extend the badge rim to the square edges (iOS paints
transparent corners black). Click icons keep the circular badge with
transparent corners for the browser tab.

## Regenerate

```bash
npm run icons:parking
```

Writes `public/parking-icons/v2/` and `public/tech-icons/v2/`, and syncs the
App Router `icon.png` / `apple-icon.png` files on those routes.

## iOS testing

Delete any existing Home Screen shortcut before re-adding the page, so Safari
does not keep a cached icon.
