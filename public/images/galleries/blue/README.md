# Blue gallery — upload guide

Drop files here. Mix portrait, landscape, and square so the page stays a **patchwork**, not an Instagram grid.

Live page: `/gallery/blue`

## Folders

| Folder | Use for |
|--------|---------|
| `photos/` | Still images |
| `videos/` | Short clips |

After uploading, add (or ask to add) an entry in `lib/galleries/blue.ts` with `date`, optional `location`, and `src`.

## Photos

- Prefer `.jpg` / `.webp` (convert `.heic`)
- Longest side **1600–2400 px**, JPEG ~80–85%
- Keep natural aspect ratios (do not force 1:1)

## Videos

- Prefer `.mp4` (H.264) for Chrome + Safari
- `.mov` works mainly on Safari / iPhone
- Prefer under ~15 MB, 1080p max

## Instagram posts & reels

You can include public Instagram URLs in `lib/galleries/blue.ts` as:

- `kind: "instagram-post"`
- `kind: "instagram-reel"`
- `instagramUrl: "https://www.instagram.com/p/SHORTCODE/"`

The page embeds them with Instagram’s official embed script (the real post card, not a screenshot). Instagram must remain public for embeds to load.

## Stamps

Each item can carry:

- `date` (timeline order)
- `location.label` + `location.mapsUrl` (opens Google Maps)
