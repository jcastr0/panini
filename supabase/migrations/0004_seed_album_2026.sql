-- Crea/actualiza el álbum FIFA World Cup 2026 (idempotente).
-- Originalmente esta migración además creaba ~792 cromos placeholder con
-- equipos "Equipo TBD" y los borraba/recreaba en cada migrate. Era el
-- origen del bug de pérdida de datos vía ON DELETE CASCADE en user_stickers.
--
-- Desde la ley de seguridad (ver 0028_data_safety.sql): los seeds NO borran
-- ni recrean cromos. Los datos reales del álbum vienen de 0006 (intro),
-- 0008-0021 (12 grupos), 0022 (historia), 0023 (Coca-Cola), TODOS con UPSERT.
-- Los placeholders ya no son necesarios.

insert into public.albums (code, name, edition_year, total_stickers, is_active)
values ('FWC2026', 'FIFA World Cup 2026', 2026, 0, true)
on conflict (code) do update
  set name = excluded.name,
      is_active = excluded.is_active;
