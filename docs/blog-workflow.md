# Blog Workflow

This site already supports blog posts as markdown files in `content/blog/YYYY/MM-month/`
(for example `content/blog/2026/07-july/`).

You do not need a separate HTML page each time.

The public URL uses only the post `slug` from frontmatter — never the month folder:

`https://iknowainhoa.com/blog/your-slug`

## The simple model

1. Create a new draft from the template.
2. Write in markdown.
3. Paste HTML only for special blocks like embeds or image galleries.
4. Preview locally.
5. Run `npm run post:publish -- path/to/post.md` (sets draft false, commits, pushes).
6. Vercel auto-deploys production from `main`.

## Create a new post

```bash
npm run post:new -- "Life in the UK: Hotspot Writing Setup"
```

That creates a draft file in the current year and numbered month folder
(e.g. `content/blog/2026/07-july/life-in-the-uk-hotspot-writing-setup.md`).

## Write the post

Open the generated file and fill in:

- `title`
- `description`
- `tags`
- `coverImage`
- body content

Keep `draft: true` while writing. Change it to `draft: false` when ready to publish.
Keep `slug` short and stable — that is what appears in the URL.

## Add richer content

- Normal text: markdown
- Links to products or references: markdown links
- Affiliate links: same format, just disclose that some links may be affiliate links
- Embedded video: paste iframe HTML from the template
- Image gallery: paste the gallery block from the template anywhere in the post

## Preview locally

```bash
npm run dev
```

Open `http://localhost:3000/blog`.

## Publish (auto-deploys)

This site is connected to Vercel. Any push to `main` triggers a production deploy automatically — including blog posts.

One-command publish (sets `draft: false`, commits the post + related images, pushes):

```bash
npm run post:publish -- content/blog/2026/07-july/your-post.md
```

You can also pass just the filename or slug:

```bash
npm run post:publish -- your-post.md
npm run post:publish -- your-post
```

After the push, Vercel builds and the post goes live at:

`https://iknowainhoa.com/blog/your-slug`

### Manual publish (same result)

```bash
git add content/blog/YYYY/MM-month/your-post.md public/images/blog/YYYY/MM-month
git commit -m "Publish your-post"
git push
```

## Post families inside this site

Use one blog, not four separate sections. Separate them by tags:

- `daily` for everyday posts and travel notes
- `solution` for tutorials, fixes, and how-tos
- `ideas` for half-formed thinking and experiments
- `life-in-uk` for citizenship, paperwork, systems, and lived experience

This keeps publishing simple and lets the blog index stay unified.
