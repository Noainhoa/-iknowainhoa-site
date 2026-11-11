import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseAdminFocus } from "./seo";

/** Mirrors the admin URL cleanup: drop focus/ref once, keep unrelated params. */
function consumeAdminFocusSearch(search: string): { target: ReturnType<typeof parseAdminFocus>; nextSearch: string } {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const target = parseAdminFocus(params.get("focus"), params.get("ref"));
  if (!target) return { target: null, nextSearch: params.toString() };
  params.delete("focus");
  params.delete("ref");
  return { target, nextSearch: params.toString() };
}

describe("admin deep link one-shot cleanup", () => {
  it("keeps lang and preview params after consuming focus", () => {
    const { target, nextSearch } = consumeAdminFocusSearch("?lang=en&focus=booking&ref=ABCD2345&ui=preview");
    assert.deepEqual(target, { focus: "booking", ref: "ABCD2345" });
    const kept = new URLSearchParams(nextSearch);
    assert.equal(kept.get("lang"), "en");
    assert.equal(kept.get("ui"), "preview");
    assert.equal(kept.get("focus"), null);
    assert.equal(kept.get("ref"), null);
  });

  it("leaves the query alone when focus is absent", () => {
    const { target, nextSearch } = consumeAdminFocusSearch("?lang=en");
    assert.equal(target, null);
    assert.equal(new URLSearchParams(nextSearch).get("lang"), "en");
  });

  it("rejects invalid references without stripping unrelated params prematurely in the parser", () => {
    assert.equal(parseAdminFocus("booking", "bad"), null);
    assert.deepEqual(parseAdminFocus("request", "EFGH6789"), { focus: "request", ref: "EFGH6789" });
  });
});
