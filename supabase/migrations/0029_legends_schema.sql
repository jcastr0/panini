-- Schema for Legends (FWC2026 p100-101).
-- Adds two columns + one index. Pure ADD operations — zero data writes,
-- zero impact on existing rows. See spec
-- docs/superpowers/specs/2026-05-27-legends-design.md sección 1.

-- 1) Self-ref FK on stickers: legends point to the normal player slot
--    they cover. NULL for everything else. ON DELETE RESTRICT mirrors
--    user_stickers.sticker_id (set in 0028) — never cascade silently.
alter table public.stickers
  add column if not exists linked_sticker_id uuid
  references public.stickers(id) on delete restrict;

create index if not exists stickers_linked_idx
  on public.stickers(linked_sticker_id)
  where linked_sticker_id is not null;

-- 2) user_stickers.display_variant: per-user, per-slot override for the
--    team-view rendering. NULL = default (show normal); 'legend' = paste
--    the legend over. Only meaningful on rows where sticker_id is a
--    NORMAL player slot whose row in stickers has a legend linking to it.
alter table public.user_stickers
  add column if not exists display_variant text
  check (display_variant in ('normal', 'legend'));
