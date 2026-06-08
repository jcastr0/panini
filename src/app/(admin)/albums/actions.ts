"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

function bump() {
  revalidatePath("/admin/albums");
  revalidatePath("/admin/auditoria");
}

export async function setAlbumActive(input: { album_id: string; active: boolean }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("admin_set_album_active", {
    p_album_id: input.album_id,
    p_active: input.active,
  });
  if (error) return { error: error.message };
  bump();
  return { success: true };
}

const metaSchema = z.object({
  album_id: z.string().uuid(),
  name: z.string().min(1).max(120).optional().nullable(),
  year: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
});

export async function updateAlbumMeta(input: z.infer<typeof metaSchema>) {
  const parsed = metaSchema.safeParse(input);
  if (!parsed.success) return { error: "Datos inválidos" };
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("admin_update_album_meta", {
    p_album_id: parsed.data.album_id,
    p_name: parsed.data.name ?? null,
    p_year: parsed.data.year ?? null,
  });
  if (error) return { error: error.message };
  bump();
  return { success: true };
}
