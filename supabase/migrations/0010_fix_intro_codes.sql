-- Los cromos de la sección INTRO se identifican por el número impreso en el
-- cromo (00, 1, 2, ..., 8), sin prefijo "FWC". El primero es 00 (doble cero).
-- Esta migración:
--   1) Corrige los codes ya guardados (FWC0..FWC8 → 00, 1, ..., 8).
--   2) Hace idempotente el backfill cuando se ejecuten todas las migraciones
--      desde cero (re-aplica el mismo case-when).

update public.stickers
   set code = case when number = 0 then '00' else number::text end
 where group_code is null
   and team is null
   and (code is null or code like 'FWC%');
