# Blog Workflow

This site already supports blog posts as markdown files in `content/blog/YYYY/Month/`.

You do not need a separate HTML page each time.

## The simple model

1. Create a new draft from the template.
2. Write in markdown.
3. Paste HTML only for special blocks like embeds or image galleries.
4. Preview locally.
5. Commit and push.
6. Your Git-based deployment picks it up automatically.

## Create a new post

```bash
npm run post:new -- "Life in the UK: Hotspot Writing Setup"
```

That creates a draft file in the current year and month folder.

## Write the post

Open the generated file and fill in:

- `title`
- `description`
- `tags`
- `coverImage`
- body content

Keep `draft: true` while writing. Change it to `draft: false` when ready to publish.

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

## Publish

If your deployment is connected to Git, the minimal publish flow is:

```bash
git add content/blog public/images/blog docs/blog-workflow.md scripts/new-blog-post.mjs package.json
git commit -m "Publish new blog post"
git push
```

If you only changed the post and images, you can keep it even smaller:

```bash
git add content/blog/YYYY/Month/your-post.md public/images/blog/YYYY/Month
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
