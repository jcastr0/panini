-- Teléfono para abrir WhatsApp desde la propuesta de intercambio.
-- Almacenado como E.164 sin '+' (ej. '573001234567') para que wa.me lo acepte directo.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone text;
