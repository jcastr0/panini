"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function cancelTradeAdmin(input: { trade_id: string; reason: string | null }) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).rpc("admin_cancel_trade", {
    p_trade_id: input.trade_id,
    p_reason: input.reason,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/intercambios");
  revalidatePath("/admin/auditoria");
  revalidatePath("/admin");
  return { success: true };
}
