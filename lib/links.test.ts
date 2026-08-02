import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  externalAnchorProps,
  isExternalHref,
  openExternalLinksInNewTab,
} from "./links";

describe("link behavior", () => {
  it("treats relative and same-origin URLs as internal", () => {
    assert.equal(isExternalHref("/blog"), false);
    assert.equal(isExternalHref("/parking-guardamar-centro"), false);
    assert.equal(isExternalHref("https://iknowainhoa.com/blog"), false);
    assert.equal(isExternalHref("https://www.iknowainhoa.com/work"), false);
    assert.equal(isExternalHref("mailto:hola@iknowainhoa.com"), false);
    assert.equal(isExternalHref("tel:+34123456789"), false);
    assert.equal(isExternalHref("#section"), false);
  });

  it("treats other hosts as external", () => {
    assert.equal(isExternalHref("https://mueblesbegui.es/"), true);
    assert.equal(isExternalHref("https://instagram.com/ainhoaferrandisperea"), true);
    assert.equal(isExternalHref("//maps.google.com/?q=test"), true);
  });

  it("only adds new-tab props for external hrefs", () => {
    assert.deepEqual(externalAnchorProps("/blog"), {});
    assert.deepEqual(externalAnchorProps("https://iknowainhoa.com/blog"), {});
    assert.deepEqual(externalAnchorProps("https://mueblesbegui.es/"), {
      target: "_blank",
      rel: "noopener noreferrer",
    });
  });

  it("rewrites markdown HTML anchors for off-site links only", () => {
    const html = [
      '<a href="/blog">Blog</a>',
      '<a href="https://iknowainhoa.com/work">Work</a>',
      '<a href="https://mueblesbegui.es/">Begui</a>',
    ].join("");

    const next = openExternalLinksInNewTab(html);
    assert.match(next, /<a href="\/blog">Blog<\/a>/);
    assert.match(next, /<a href="https:\/\/iknowainhoa.com\/work">Work<\/a>/);
    assert.match(next, /href="https:\/\/mueblesbegui.es\/"/);
    assert.match(next, /target="_blank"/);
    assert.match(next, /rel="noopener noreferrer"/);
  });
});
