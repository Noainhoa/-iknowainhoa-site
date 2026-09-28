import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { askNoa, normalizeInboxAiOutput, processInboxRawText } from "./ai";
import { POST as noa } from "@/app/api/life/noa/route";
import { POST as processInbox } from "@/app/api/life/os/process/route";

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const key of ["OPENAI_API_KEY", "NEXT_PUBLIC_LIFE_SUPABASE_URL", "NEXT_PUBLIC_LIFE_SUPABASE_PUBLISHABLE_KEY"]) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});
const candidate = {
  observation: "Observed", possible_type: "pattern", candidate_title: "Candidate",
  hypothesis: "Maybe", unknowns: ["Schedule"], question_to_investigate: "When?", confidence: "low",
};
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
function configure() {
  process.env.OPENAI_API_KEY = "test-secret-never-return";
  process.env.NEXT_PUBLIC_LIFE_SUPABASE_URL = "https://life.test";
  process.env.NEXT_PUBLIC_LIFE_SUPABASE_PUBLISHABLE_KEY = "test-public-key";
}
function request(body: unknown, token = "valid") {
  return new Request("https://local.test/api/life", { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(body) });
}

test("malformed candidates fail closed instead of coercing objects or missing fields", () => {
  for (const value of [null, [], {}, { ...candidate, observation: {} }, { ...candidate, unknowns: [{}] }, { ...candidate, candidate_title: " " }]) {
    assert.throws(() => normalizeInboxAiOutput(value));
  }
  assert.deepEqual(normalizeInboxAiOutput({ ...candidate, summary: "Hidden interpretation" }), candidate);
});

test("AI calls use strict schemas; upstream error bodies never escape", async () => {
  configure();
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(String(init?.body));
    assert.equal(body.response_format.type, "json_schema");
    assert.equal(body.response_format.json_schema.strict, true);
    assert.ok(init?.signal);
    return response({ error: { message: "test-secret-never-return PRIVATE RAW TEXT" } }, 401);
  };
  await assert.rejects(processInboxRawText("private"), { message: "OpenAI request failed (401)." });
});

test("empty, malformed, refused, or incomplete AI responses cannot become answers", async () => {
  configure();
  for (const content of ["{}", "null", "broken JSON", JSON.stringify({ answer: "yes" }), ""]) {
    globalThis.fetch = async () => response({ choices: [{ message: { content } }] });
    await assert.rejects(askNoa({ question: "Now?", entries: [], training: null }));
    await assert.rejects(processInboxRawText("raw"));
  }
});

test("both API endpoints reject missing/expired auth before AI and report a missing key", async () => {
  configure();
  globalThis.fetch = async () => response({ message: "expired", code: "bad_jwt" }, 401);
  for (const route of [noa, processInbox]) {
    assert.equal((await route(new Request("https://local.test", { method: "POST" }))).status, 401);
    assert.equal((await route(request({}))).status, 401);
  }
  globalThis.fetch = async () => response({ id: "user-a", email: "a@test.test" });
  delete process.env.OPENAI_API_KEY;
  for (const route of [noa, processInbox]) assert.equal((await route(request({}))).status, 503);
});

test("API input types are validated and database errors are sanitized", async () => {
  configure();
  globalThis.fetch = async (url) => String(url).includes("/auth/v1/user")
    ? response({ id: "user-a", email: "a@test.test" })
    : response({ message: "PRIVATE DATABASE DETAIL" }, 400);
  assert.equal((await noa(request({ question: 42 }))).status, 400);
  assert.equal((await processInbox(request({ inboxId: {} }))).status, 400);
  for (const [route, body] of [[noa, { question: "Now?" }], [processInbox, { inboxId: "item" }]] as const) {
    const result = await route(request(body));
    assert.ok(result.status >= 400);
    assert.ok(!(await result.text()).includes("PRIVATE DATABASE DETAIL"));
  }
});

test("NOA queries approved non-archived rows with the user's bearer token and never writes", async () => {
  configure();
  let queried = false;
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    if (url.pathname === "/auth/v1/user") return response({ id: "user-a", email: "a@test.test" });
    if (url.pathname === "/rest/v1/os_entries") {
      queried = true;
      assert.equal(url.searchParams.get("review_state"), "eq.approved");
      assert.equal(url.searchParams.get("status"), "neq.archived");
      assert.equal(new Headers(init?.headers).get("authorization"), "Bearer valid");
      assert.equal(init?.method, "GET");
      return response([]);
    }
    assert.equal(url.hostname, "api.openai.com");
    const sent = JSON.parse(String(init?.body));
    const context = JSON.parse(sent.messages[1].content);
    assert.deepEqual(context.approved_os_entries, []);
    return response({ choices: [{ message: { content: JSON.stringify({ answer: "Insufficient evidence", fact: "", interpretation: "", feeling_state: "", relevant_principle: "", suggested_next_step: "Pause", unknowns: [], uncertainty: "No approved entries" }) } }] });
  };
  const result = await noa(request({ question: "Now?" }));
  assert.equal(result.status, 200);
  assert.ok(queried);
});

test("processing only saves an undecided inbox candidate, never canonical entries", async () => {
  configure();
  const row = { id: "item", user_id: "user-a", raw_text: "raw", processed: false, decision: "pending", ai_output: null };
  const writes: string[] = [];
  globalThis.fetch = async (input, init) => {
    const url = new URL(String(input));
    if (url.pathname === "/auth/v1/user") return response({ id: "user-a", email: "a@test.test" });
    if (url.hostname === "api.openai.com") return response({ choices: [{ message: { content: JSON.stringify(candidate) } }] });
    assert.equal(url.pathname, "/rest/v1/os_inbox");
    if (init?.method === "PATCH") {
      writes.push(url.pathname);
      assert.equal(url.searchParams.get("or"), "(decision.is.null,decision.eq.pending)");
      const patch = JSON.parse(String(init.body));
      assert.equal(patch.decision, "pending");
      assert.equal(patch.entry_id, undefined);
      return response({ ...row, ...patch });
    }
    return response(row);
  };
  assert.equal((await processInbox(request({ inboxId: "item" }))).status, 200);
  assert.deepEqual(writes, ["/rest/v1/os_inbox"]);
});
