import type { SupabaseClient } from "@supabase/supabase-js";
import type { DbLifeEntryRelation, LifeEntryRelation } from "@/lib/life/types";

function mapRelation(row: DbLifeEntryRelation): LifeEntryRelation {
  return {
    id: row.id,
    userId: row.user_id,
    fromEntryId: row.from_entry_id,
    toEntryId: row.to_entry_id,
    relationType: row.relation_type,
    createdAt: row.created_at,
  };
}

export async function listLifeEntryRelations(
  supabase: SupabaseClient,
  entryId: string
): Promise<LifeEntryRelation[]> {
  const { data, error } = await supabase
    .from("life_entry_relations")
    .select("*")
    .or(`from_entry_id.eq.${entryId},to_entry_id.eq.${entryId}`);

  if (error) throw error;
  return ((data ?? []) as DbLifeEntryRelation[]).map(mapRelation);
}

export async function createLifeEntryRelation(
  supabase: SupabaseClient,
  userId: string,
  input: { fromEntryId: string; toEntryId: string; relationType?: string }
): Promise<LifeEntryRelation> {
  if (input.fromEntryId === input.toEntryId) {
    throw new Error("An entry cannot relate to itself.");
  }

  const { data, error } = await supabase
    .from("life_entry_relations")
    .insert({
      user_id: userId,
      from_entry_id: input.fromEntryId,
      to_entry_id: input.toEntryId,
      relation_type: input.relationType ?? "related",
    })
    .select("*")
    .single();

  if (error) throw error;
  return mapRelation(data as DbLifeEntryRelation);
}

export async function deleteLifeEntryRelation(
  supabase: SupabaseClient,
  relationId: string
): Promise<void> {
  const { error } = await supabase.from("life_entry_relations").delete().eq("id", relationId);
  if (error) throw error;
}
