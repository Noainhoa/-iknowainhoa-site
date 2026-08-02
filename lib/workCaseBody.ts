/**
 * Split case-study HTML into Frank-style blocks:
 * prose stays in a text column; images become full-bleed shot bands
 * with optional captions from the following short paragraph.
 */
export type CaseBlock =
  | { type: "prose"; html: string }
  | { type: "shot"; imgHtml: string; caption?: string };

const IMG_P =
  /<p(?:\s[^>]*)?>\s*(<img\b[^>]*>)\s*<\/p>/gi;
const SHORT_CAPTION = /^[\s\S]{0,160}$/;

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

export function splitCaseBody(html: string): CaseBlock[] {
  if (!html?.trim()) return [];

  const blocks: CaseBlock[] = [];
  let lastIndex = 0;
  const matches = [...html.matchAll(IMG_P)];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const index = match.index ?? 0;
    const before = html.slice(lastIndex, index).trim();
    if (before) blocks.push({ type: "prose", html: before });

    const imgHtml = match[1];
    let caption: string | undefined;
    let end = index + match[0].length;

    const after = html.slice(end);
    const nextP = after.match(/^(\s*<p(?:\s[^>]*)?>[\s\S]*?<\/p>)/i);
    if (nextP) {
      const pHtml = nextP[1].trim();
      const text = stripTags(pHtml);
      const isNextImage = /<img\b/i.test(pHtml);
      const isListOrHeading = /<h[1-6]\b|<ul\b|<ol\b|<li\b/i.test(pHtml);
      if (
        !isNextImage &&
        !isListOrHeading &&
        text &&
        SHORT_CAPTION.test(text)
      ) {
        caption = pHtml.replace(/^<p(?:\s[^>]*)?>/i, "").replace(/<\/p>$/i, "");
        end += nextP[1].length;
      }
    }

    blocks.push({ type: "shot", imgHtml, caption });
    lastIndex = end;
  }

  const rest = html.slice(lastIndex).trim();
  if (rest) blocks.push({ type: "prose", html: rest });

  return blocks.length > 0 ? blocks : [{ type: "prose", html }];
}
