import { createClient } from "@/lib/supabase/server";

/**
 * Verifica si el usuario actual es admin. Llama al RPC is_admin de DB
 * para que la lógica de qué cuenta como admin viva en un solo sitio.
 */
export async function currentUserIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc("is_admin", {
    uid: user.id,
  });
  if (error) return false;
  return data === true;
}
