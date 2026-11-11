# Parking and Click icons

## Source

- Parking: `public/images/parking/guardamar-parking-badge.png`
- Click: `public/images/tech/guardamar-click-badge-v2.png`

Both are circular badges with transparent corners. iOS shows transparent
corners as black, so the generator continues each badge's rim colour out to
the square edges.

## Regenerate

```bash
npm run icons:parking
```

Writes `public/parking-icons/v2/` and `public/tech-icons/v1/`, and syncs the
App Router `icon.png` / `apple-icon.png` files on those routes.

## iOS testing

Delete any existing Home Screen shortcut before re-adding the page, so Safari
does not keep a cached icon.
