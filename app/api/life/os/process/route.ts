import { NextResponse } from "next/server";
import { isOsAiConfigured, processInboxRawText } from "@/lib/life/os/ai";
import { getLifeAuthedContext } from "@/lib/life/os/auth";
import { updateOsInboxAiOutput } from "@/lib/life/os/db";
import { mapOsInbox, type DbOsInbox } from "@/lib/life/os/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await getLifeAuthedContext(request);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isOsAiConfigured()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured on the server." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as { inboxId?: string } | null;
  const inboxId = typeof body?.inboxId === "string" ? body.inboxId.trim() : "";
  if (!inboxId) {
    return NextResponse.json({ error: "inboxId is required." }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("os_inbox")
    .select("*")
    .eq("id", inboxId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Could not load inbox item." }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "Inbox item not found." }, { status: 404 });
  }

  const inbox = mapOsInbox(data as DbOsInbox);
  if (inbox.decision === "approved" || inbox.decision === "rejected") {
    return NextResponse.json(
      { error: "This inbox item is already decided." },
      { status: 400 }
    );
  }

  try {
    const aiOutput = await processInboxRawText(inbox.rawText);
    const updated = await updateOsInboxAiOutput(auth.supabase, inbox.id, aiOutput);
    return NextResponse.json({ item: updated });
  } catch {
    const message = "Processing failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
