import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isCronAuthorized } from "../_auth";
import { sendEmail } from "@/lib/email";
import { SITE_URL } from "@/lib/email/client";
import { DuplicateAvailableEmail } from "@/lib/email/templates/duplicate-available";

/**
 * Procesa notifications 'duplicate_available' de los últimos 10 min
 * (margen por si el cron se atrasa). Envía email a quienes tienen pref ON.
 * Dedupe 24h por (user_id, owner, sticker).
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

  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: notifs } = await sb
    .from("notifications")
    .select("id, user_id, from_user, sticker_id, created_at")
    .eq("kind", "duplicate_available")
    .gte("created_at", since);

  if (!notifs || notifs.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  // Pre-cargar info de stickers y owners para evitar N+1
  const stickerIds = [
    ...new Set(notifs.map((n) => n.sticker_id).filter((v): v is string => !!v)),
  ];
  const ownerIds = [
    ...new Set(notifs.map((n) => n.from_user).filter((v): v is string => !!v)),
  ];

  const [{ data: stickers }, { data: owners }] = await Promise.all([
    sb.from("stickers").select("id, code, name").in("id", stickerIds),
    sb
      .from("profiles")
      .select("id, username, display_name")
      .in("id", ownerIds),
  ]);

  const stMap = new Map(
    (stickers ?? []).map((s) => [s.id, s as { id: string; code: string | null; name: string }]),
  );
  const ownerMap = new Map(
    (owners ?? []).map((o) => [
      o.id,
      o as { id: string; username: string | null; display_name: string | null },
    ]),
  );

  // Recipient display names en una sola query
  const recipientIds = [...new Set(notifs.map((n) => n.user_id))];
  const { data: recipients } = await sb
    .from("profiles")
    .select("id, username, display_name")
    .in("id", recipientIds);
  const recipientMap = new Map(
    (recipients ?? []).map((r) => [
      r.id,
      r as { id: string; username: string | null; display_name: string | null },
    ]),
  );

  let sent = 0;
  let skipped = 0;

  for (const n of notifs) {
    if (!n.from_user || !n.sticker_id) {
      skipped++;
      continue;
    }
    const sticker = stMap.get(n.sticker_id);
    const owner = ownerMap.get(n.from_user);
    const recipient = recipientMap.get(n.user_id);
    if (!sticker || !owner || !recipient) {
      skipped++;
      continue;
    }

    // Calcular matchCount real: cuántos cromos del recipient tiene repetidos
    // que al owner le faltan
    const { data: myDupes } = await sb
      .from("user_stickers")
      .select("sticker_id")
      .eq("user_id", n.user_id)
      .gte("quantity", 2);
    const { data: ownerHas } = await sb
      .from("user_stickers")
      .select("sticker_id")
      .eq("user_id", n.from_user)
      .gte("quantity", 1);
    const ownerHasSet = new Set((ownerHas ?? []).map((r) => r.sticker_id));
    const matchCount = (myDupes ?? []).filter(
      (r) => !ownerHasSet.has(r.sticker_id),
    ).length;

    const ownerName =
      owner.display_name ||
      (owner.username ? `@${owner.username}` : "un coleccionista");
    const recipientName =
      recipient.display_name ||
      (recipient.username ? `@${recipient.username}` : "");

    const proposeUrl = `${SITE_URL}/trades/new/${n.from_user}`;

    const result = await sendEmail({
      userId: n.user_id,
      prefKey: "matches",
      kind: "duplicate_available",
      // subjectId compuesto: from_user + sticker (no usamos UUID, lo guardamos como string)
      // pero email_log.subject_id es uuid, así que usamos sticker_id como subject
      // (efectivamente dedupea por sticker, suficiente para nuestro caso)
      subjectId: n.sticker_id,
      subject: `${ownerName} tiene ${sticker.code ?? "un cromo"} repetido — match doble`,
      dedupeHours: 24,
      render: (unsubscribeUrl) =>
        DuplicateAvailableEmail({
          recipientName,
          ownerName,
          stickerCode: sticker.code ?? `#${sticker.name}`,
          stickerName: sticker.name,
          matchCount: Math.max(1, matchCount),
          proposeUrl,
          unsubscribeUrl,
        }),
    });
    if (result.sent) sent++;
    else skipped++;
  }

  return NextResponse.json({ processed: notifs.length, sent, skipped });
}
