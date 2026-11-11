import { NextResponse } from "next/server";
import { allowRate, clientAddress, rateBucket } from "@/lib/tech/guard";
import { getTechServiceClient } from "@/lib/tech/server";
import { hashToken } from "@/lib/tech/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = body && typeof body.token === "string" ? body.token : "";
  if (token.length < 20 || token.length > 120) {
    return NextResponse.json({ ok: false, error: "tech_not_found" }, { status: 404 });
  }
  const client = getTechServiceClient();
  if (!client) return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });

  try {
    const allowed = await allowRate(client, rateBucket("cancel", clientAddress(request)), 10);
    if (!allowed) return NextResponse.json({ ok: false, error: "tech_rate" }, { status: 429 });
  } catch {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });
  }

  const { data, error } = await client.rpc("tech_cancel_by_token", {
    p_token_hash: hashToken(token),
  });
  if (error || !data) {
    return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 500 });
  }
  if (data.ok !== true) {
    const status = data.error === "tech_too_late" ? 409 : 404;
    return NextResponse.json({ ok: false, error: data.error }, { status });
  }
  return NextResponse.json({ ok: true, already: data.already === true, reference: data.reference });
}
