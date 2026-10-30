import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { sendOwnerMail } from "@/lib/tech/mail";
import { notificationOutcome } from "@/lib/tech/validate";

export async function deliverNotification(
  client: SupabaseClient,
  notificationId: string | null,
  currentStatus: string | null,
  subject: string,
  body: string
): Promise<"sent" | "failed"> {
  if (!notificationId) return "failed";
  if (currentStatus === "sent") return "sent";
  try {
    await sendOwnerMail(subject, body);
    const { error } = await client
      .from("tech_notifications")
      .update({
        status: "sent",
        attempts: 1,
        sent_at: new Date().toISOString(),
        last_error: null,
      })
      .eq("id", notificationId);
    if (error) return notificationOutcome(true).notification;
    return "sent";
  } catch (error) {
    const message = error instanceof Error ? error.message : "send_failed";
    await client
      .from("tech_notifications")
      .update({
        status: "failed",
        attempts: 1,
        last_error: message.slice(0, 300),
      })
      .eq("id", notificationId);
    return notificationOutcome(false).notification;
  }
}
