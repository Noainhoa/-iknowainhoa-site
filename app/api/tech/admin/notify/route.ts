import { NextResponse } from "next/server";
import { sendOwnerMail } from "@/lib/tech/mail";
import { createTechServerClient } from "@/lib/tech/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createTechServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "unavailable" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, error: "tech_forbidden" }, { status: 401 });

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_tech_admin");
  if (adminError || isAdmin !== true) {
    return NextResponse.json({ ok: false, error: "tech_forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const id = body && typeof body.id === "string" ? body.id : "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ ok: false, error: "tech_failed" }, { status: 400 });
  }

  const { data: note, error } = await supabase
    .from("tech_notifications")
    .select("id, subject, body, status, attempts")
    .eq("id", id)
    .maybeSingle();
  if (error || !note) return NextResponse.json({ ok: false, error: "tech_not_found" }, { status: 404 });
  if (note.status === "sent") return NextResponse.json({ ok: true, notification: "sent" });

  try {
    await sendOwnerMail(note.subject, note.body);
    await supabase
      .from("tech_notifications")
      .update({
        status: "sent",
        attempts: (note.attempts ?? 0) + 1,
        sent_at: new Date().toISOString(),
        last_error: null,
      })
      .eq("id", note.id);
    return NextResponse.json({ ok: true, notification: "sent" });
  } catch (sendError) {
    const message = sendError instanceof Error ? sendError.message : "send_failed";
    await supabase
      .from("tech_notifications")
      .update({
        status: "failed",
        attempts: (note.attempts ?? 0) + 1,
        last_error: message.slice(0, 300),
      })
      .eq("id", note.id);
    return NextResponse.json({ ok: true, notification: "failed" });
  }
}
