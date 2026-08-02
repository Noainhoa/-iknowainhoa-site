# Content translations (blog & work)

UI chrome (nav, Work title, buttons) lives in [`lib/i18n/shared.ts`](../lib/i18n/shared.ts).

**Your writing** (blog posts and work cases) lives in the markdown files.

## Pattern (one file, bilingual)

### Frontmatter

Use a base English field plus `_es` (and later `_fr` if needed):

```yaml
title: "Rent your parking space"
title_es: "Alquila tu plaza de parking"
description: "..."
description_es: "..."
summary: "..."
summary_es: "..."
cta:
  text: "See the live example"
  text_es: "Ver el ejemplo en vivo"
  link: "https://iknowainhoa.com/parking-guardamar-centro"
```

You can also use nested maps:

```yaml
title:
  en: "Rent your parking space"
  es: "Alquila tu plaza de parking"
```

### Body

Mark language sections in the same file:

```markdown
<!-- lang:en -->

English paragraphs…

<!-- lang:es -->

Párrafos en español…
```

If there are no markers, the whole body is used for every language (backward compatible).

### Locale selection

The site uses the existing language preference (`getLocale()` / `?lang=` + cookie). Work pages resolve title, description, summary, CTA label, and body for that locale, falling back to English.

## Work extras

- `logo:` — compact brand mark on the case page (skips the full-bleed cover hero)
- `coverImage:` — used on the Work index card

## Blog (same pattern next)

Blog posts can adopt the same `title_es` / `<!-- lang:es -->` markers. Wire blog pages through `lib/contentLocale.ts` when you start translating posts; the helpers already exist.

## Example

See [`content/projects/rent-your-parking-space.md`](../content/projects/rent-your-parking-space.md).
