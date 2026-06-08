"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

function bumpAdminPaths() {
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/auditoria");
  revalidatePath("/admin");
}

const banSchema = z.object({
  user_id: z.string().uuid(),
  banned: z.boolean(),
  reason: z.string().max(500).optional().nullable(),
});

export async function setUserBanned(input: z.infer<typeof banSchema>) {
  const parsed = banSchema.safeParse(input);
  if (!parsed.success) return { error: "Datos inválidos" };
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("admin_set_user_banned", {
    p_target: parsed.data.user_id,
    p_banned: parsed.data.banned,
    p_reason: parsed.data.reason ?? null,
  });
  if (error) return { error: error.message };
  bumpAdminPaths();
  return { success: true };
}

export async function softDeleteUser(input: { user_id: string }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("admin_soft_delete_user", {
    p_target: input.user_id,
  });
  if (error) return { error: error.message };
  bumpAdminPaths();
  return { success: true };
}

export async function restoreUser(input: { user_id: string }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("admin_restore_user", {
    p_target: input.user_id,
  });
  if (error) return { error: error.message };
  bumpAdminPaths();
  return { success: true };
}
