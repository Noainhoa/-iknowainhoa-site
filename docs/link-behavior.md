# Link behavior

Always use the helpers in [`lib/links.ts`](../lib/links.ts).

## Rule

| Destination | Tab |
|-------------|-----|
| Same site (`/…`, `https://iknowainhoa.com/…`) | Same tab |
| `mailto:`, `tel:`, `#…` | Same tab |
| Other http(s) sites | New tab + `rel="noopener noreferrer"` |

## In React

```tsx
import { externalAnchorProps } from "@/lib/links";

<a href={href} {...externalAnchorProps(href)}>…</a>
```

Use Next.js `<Link>` for internal routes. Do not put `target="_blank"` on same-origin links.

## In markdown HTML

`openExternalLinksInNewTab` (used from `lib/content.ts`) applies the same rule when rendering content.
