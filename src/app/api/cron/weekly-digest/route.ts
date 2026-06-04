import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isCronAuthorized } from "../_auth";
import { sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/email/client";
import { WeeklyDigestEmail, type DigestStats } from "@/lib/email/templates/weekly-digest";

/**
 * Cron de digest semanal. Para cada profile con email_digest=true,
 * calcula stats de la última semana y envía email si hay actividad
 * (anti-spam: no manda "no pasó nada esta semana").
 */
export async function GET(req: NextRequest) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const weekAgo = new Date(Date.now() - 7 * 86400 * 1000).toISOString();

  // Profiles que tienen digest activado
  const { data: profiles } = await sb
    .from("profiles")
    .select("id, username, display_name");

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  // Total de stickers del album activo (se calcula una vez)
  const { data: activeAlbum } = await sb
    .from("albums")
    .select("id")
    .eq("is_active", true)
    .maybeSingle();
  const albumId = activeAlbum?.id;
  if (!albumId) {
    return NextResponse.json({ error: "no-active-album" }, { status: 500 });
  }
  // Total excluyendo legends (son extras, no cuentan en el % del álbum)
  const { count: totalAlbum } = await sb
    .from("stickers")
    .select("*", { count: "exact", head: true })
    .eq("album_id", albumId)
    .neq("type", "legend");

  let sent = 0;
  let skipped = 0;

  for (const p of profiles) {
    const userId = p.id;
    const name =
      (p as { display_name?: string | null }).display_name ||
      ((p as { username?: string | null }).username
        ? `@${(p as { username?: string }).username}`
        : "coleccionista");

    // Stats en paralelo
    const [
      { count: newTrades },
      { count: acceptedTrades },
      { count: newMatches },
      { count: totalOwned },
    ] = await Promise.all([
      sb
        .from("trades")
        .select("*", { count: "exact", head: true })
        .eq("to_user", userId)
        .gte("created_at", weekAgo),
      sb
        .from("trades")
        .select("*", { count: "exact", head: true })
        .or(`from_user.eq.${userId},to_user.eq.${userId}`)
        .eq("status", "accepted")
        .gte("updated_at", weekAgo),
      sb
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("kind", "duplicate_available")
        .gte("created_at", weekAgo),
      // totalOwned: excluye legends (son extras)
      sb
        .from("user_stickers")
        .select("*, stickers!inner(type)", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("quantity", 1)
        .neq("stickers.type", "legend"),
    ]);

    // Nuevos pegados y repetidos: aproximamos con updated_at en user_stickers
    const { data: weekChanges } = await sb
      .from("user_stickers")
      .select("quantity, updated_at")
      .eq("user_id", userId)
      .gte("updated_at", weekAgo);
    const newPasted = (weekChanges ?? []).filter((r) => r.quantity >= 1).length;
    const newDupes = (weekChanges ?? []).filter((r) => r.quantity >= 2).length;

    const stats: DigestStats = {
      newTrades: newTrades ?? 0,
      acceptedTrades: acceptedTrades ?? 0,
      newMatches: newMatches ?? 0,
      newPasted,
      newDupes,
      totalOwned: totalOwned ?? 0,
      totalAlbum: totalAlbum ?? 0,
    };

    // ¿Vale la pena enviar?
    const interesting =
      stats.newTrades > 0 ||
      stats.acceptedTrades > 0 ||
      stats.newPasted > 0 ||
      stats.newMatches > 0;
    if (!interesting) {
      skipped++;
      continue;
    }

    const r = await sendEmail({
      userId,
      prefKey: "digest",
      kind: "weekly_digest",
      subjectId: null,
      subject: `Tu semana en Panini·JD · ${stats.totalOwned}/${stats.totalAlbum} cromos`,
      dedupeHours: 144, // 6 días — anti doble-cron
      render: (unsubscribeUrl) =>
        WeeklyDigestEmail({
          recipientName: name,
          stats,
          albumUrl: `${SITE_URL}/album`,
          unsubscribeUrl,
        }),
    });
    if (r.sent) sent++;
    else skipped++;
  }

  return NextResponse.json({ processed: profiles.length, sent, skipped });
}
