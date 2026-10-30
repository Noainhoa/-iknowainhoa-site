import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import { assertTechUrlIsolated, getTechPublicEnv, isTechSupabaseConfigured } from "./env";

const KEYS = [
  "NEXT_PUBLIC_TECH_SUPABASE_URL",
  "NEXT_PUBLIC_TECH_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_TECH_SUPABASE_ANON_KEY",
  "TECH_SUPABASE_SERVICE_ROLE_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_LIFE_SUPABASE_URL",
] as const;

describe("tech supabase isolation", () => {
  const previous = new Map<string, string | undefined>();

  beforeEach(() => {
    for (const key of KEYS) {
      previous.set(key, process.env[key]);
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of KEYS) {
      const value = previous.get(key);
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });

  it("refuses when Tech credentials are missing", () => {
    assert.equal(getTechPublicEnv(), null);
    assert.equal(isTechSupabaseConfigured(), false);
  });

  it("refuses when Tech URL matches the parking project URL", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://parking.supabase.co";
    process.env.NEXT_PUBLIC_TECH_SUPABASE_URL = "https://parking.supabase.co";
    process.env.NEXT_PUBLIC_TECH_SUPABASE_PUBLISHABLE_KEY = "pub";
    assert.equal(assertTechUrlIsolated("https://parking.supabase.co"), false);
    assert.equal(getTechPublicEnv(), null);
  });

  it("refuses when Tech URL matches the Life project URL", () => {
    process.env.NEXT_PUBLIC_LIFE_SUPABASE_URL = "https://life.supabase.co";
    assert.equal(assertTechUrlIsolated("https://life.supabase.co"), false);
  });

  it("accepts an isolated Tech URL with a publishable key", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://parking.supabase.co";
    process.env.NEXT_PUBLIC_LIFE_SUPABASE_URL = "https://life.supabase.co";
    process.env.NEXT_PUBLIC_TECH_SUPABASE_URL = "https://tech-dev.supabase.co";
    process.env.NEXT_PUBLIC_TECH_SUPABASE_PUBLISHABLE_KEY = "pub-tech";
    assert.equal(assertTechUrlIsolated("https://tech-dev.supabase.co"), true);
    assert.deepEqual(getTechPublicEnv(), {
      url: "https://tech-dev.supabase.co",
      key: "pub-tech",
    });
  });

  it("never documents a NEXT_PUBLIC service-role variable name", () => {
    // Guardrail: service role must stay server-only.
    assert.equal("NEXT_PUBLIC_TECH_SUPABASE_SERVICE_ROLE_KEY" in process.env, false);
    assert.match("TECH_SUPABASE_SERVICE_ROLE_KEY", /^TECH_/);
    assert.doesNotMatch("TECH_SUPABASE_SERVICE_ROLE_KEY", /^NEXT_PUBLIC_/);
  });
});
