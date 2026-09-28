import type { SupabaseClient } from "@supabase/supabase-js";
import {
  mapOsEntry,
  mapOsInbox,
  type DbOsEntry,
  type DbOsInbox,
  type OsEntry,
  type OsInboxAiOutput,
  type OsInboxItem,
} from "@/lib/life/os/types";

function fail(op: string, error: { message: string } | null): never {
  throw new Error(`[life/os] ${op}: ${error?.message ?? "unknown error"}`);
}

export async function fetchOsEntries(supabase: SupabaseClient): Promise<OsEntry[]> {
  const { data, error } = await supabase
    .from("os_entries")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) fail("fetchOsEntries", error);
  return ((data ?? []) as DbOsEntry[]).map(mapOsEntry);
}

export async function fetchApprovedOsEntries(
  supabase: SupabaseClient
): Promise<OsEntry[]> {
  const { data, error } = await supabase
    .from("os_entries")
    .select("*")
    .eq("review_state", "approved")
    .neq("status", "archived")
    .order("created_at", { ascending: true });
  if (error) fail("fetchApprovedOsEntries", error);
  return ((data ?? []) as DbOsEntry[]).map(mapOsEntry);
}

export async function fetchOsInbox(supabase: SupabaseClient): Promise<OsInboxItem[]> {
  const { data, error } = await supabase
    .from("os_inbox")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) fail("fetchOsInbox", error);
  return ((data ?? []) as DbOsInbox[]).map(mapOsInbox);
}

export async function createOsInboxItem(
  supabase: SupabaseClient,
  userId: string,
  rawText: string
): Promise<OsInboxItem> {
  const { data, error } = await supabase
    .from("os_inbox")
    .insert({
      user_id: userId,
      raw_text: rawText,
      processed: false,
      decision: "pending",
    })
    .select("*")
    .single();
  if (error) fail("createOsInboxItem", error);
  return mapOsInbox(data as DbOsInbox);
}

export async function updateOsInboxAiOutput(
  supabase: SupabaseClient,
  inboxId: string,
  aiOutput: OsInboxAiOutput
): Promise<OsInboxItem> {
  const { data, error } = await supabase
    .from("os_inbox")
    .update({
      processed: true,
      ai_output: aiOutput,
      decision: "pending",
    })
    .eq("id", inboxId)
    .or("decision.is.null,decision.eq.pending")
    .select("*")
    .single();
  if (error) fail("updateOsInboxAiOutput", error);
  return mapOsInbox(data as DbOsInbox);
}

export async function rejectOsInboxItem(
  supabase: SupabaseClient,
  inboxId: string
): Promise<OsInboxItem> {
  const { data, error } = await supabase
    .from("os_inbox")
    .update({ decision: "rejected" })
    .eq("id", inboxId)
    .or("decision.is.null,decision.eq.pending")
    .select("*")
    .single();
  if (error) fail("rejectOsInboxItem", error);
  return mapOsInbox(data as DbOsInbox);
}

export async function approveOsInboxItem(
  supabase: SupabaseClient,
  userId: string,
  inbox: OsInboxItem,
  edits: OsInboxAiOutput
): Promise<{ entry: OsEntry; inbox: OsInboxItem }> {
  if (inbox.userId !== userId) throw new Error("Inbox owner mismatch.");
  const { data, error } = await supabase.rpc("approve_os_inbox", {
    p_inbox_id: inbox.id,
    p_edits: edits,
  });
  if (error) fail("approveOsInboxItem", error);
  return { entry: mapOsEntry(data.entry as DbOsEntry), inbox: mapOsInbox(data.inbox as DbOsInbox) };
}

export function getActiveTraining(entries: OsEntry[]): OsEntry | null {
  return (
    entries.find(
      (entry) =>
        entry.type === "training" &&
        entry.reviewState === "approved" &&
        entry.status !== "archived" &&
        entry.status !== "integrated"
    ) ?? null
  );
}

export function partitionOsEntries(entries: OsEntry[]) {
  const approved = entries.filter((entry) => entry.reviewState === "approved");
  return {
    active: approved.filter(
      (entry) => entry.status !== "integrated" && entry.status !== "archived"
    ),
    integrated: approved.filter((entry) => entry.status === "integrated"),
    archive: entries.filter((entry) => entry.status === "archived"),
    training: getActiveTraining(entries),
  };
}

export function openInboxItems(items: OsInboxItem[]): OsInboxItem[] {
  return items.filter((item) => item.decision !== "approved" && item.decision !== "rejected");
}
