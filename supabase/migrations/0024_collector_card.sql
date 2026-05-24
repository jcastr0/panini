-- "Lámina del coleccionista": una imagen JPEG comprimida (≤300 KB) en base64
-- que identifica al dueño del álbum. Aparece en la portada y en el header de
-- cada sección. Solo una imagen por usuario.

alter table public.profiles
  add column if not exists collector_card_base64 text,
  add column if not exists collector_card_updated_at timestamptz;
