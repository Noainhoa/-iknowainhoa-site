# Blog Workflow

This site already supports blog posts as markdown files in `content/blog/YYYY/MM-month/`
(for example `content/blog/2026/07-july/`).

You do not need a separate HTML page each time.

The public URL uses only the post `slug` from frontmatter — never the month folder:

`https://iknowainhoa.com/blog/your-slug`

## The simple model

1. Create a new draft from the template.
2. Write a short note in markdown (one idea, ~150–400 words).
3. Link words inline as you write. Uncomment optional blocks only when you need them.
4. Finish with a **Notes** list (building / reading / looking at).
5. Preview locally.
6. Run `npm run post:publish -- path/to/post.md` (sets draft false, commits, pushes).
7. Vercel auto-deploys production from `main`.

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
- body content
- `## Notes` links

Keep `draft: true` while writing. Change it to `draft: false` when ready to publish.
Keep `slug` short and stable — that is what appears in the URL.

The page already renders the title from frontmatter — do **not** add a duplicate `# Title` in the body.

### Style

- One idea. Stop when the point lands.
- Direct, warm, a little playful. Short sentences.
- Hyperlink words as you go (`[patience](https://…)`). External links open in a new tab automatically.
- End every post with **Notes**: what you’re building, reading, and who/what you’re pointing to.

### Optional blocks (commented out in the template)

The template includes HTML comments for:

- **Definition / quote** (`.blog-pull`) — stylish term + definition + source
- **Image** (`.blog-figure`) — photo + optional caption
- **Instagram** (`.blog-embed`) — paste the embed iframe + author credit
- **Video** (`.blog-embed`) — YouTube or similar iframe

To use one: delete the surrounding `<!-- … -->` comment markers so the HTML is live. Leave the rest commented.

Uncomment `coverImage` in frontmatter only when you have a real image under `/public`.

### Tags

Use one or two: `daily`, `solution`, `ideas`, `life-in-uk`. One blog, unified index.

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
