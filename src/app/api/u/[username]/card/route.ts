import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("collector_card_base64, is_public_profile")
    .eq("username", username)
    .maybeSingle();

  if (!data?.is_public_profile || !data.collector_card_base64) {
    return new Response(null, { status: 404 });
  }

  const buf = Buffer.from(data.collector_card_base64, "base64");
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control":
        "public, max-age=300, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
