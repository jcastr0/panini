-- Ubicación granular: departamento + ciudad anidados, obligatorio en signup.
-- Cuida data: nullable + DEFAULT, backfill solo donde hay confianza.

-- 1. Nueva columna department (solo para Colombia; null para extranjeros)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS department text;

-- 2. Backfill conservador (no destructivo):
--    - Si country = 'Colombia' y department es NULL:
--        → department = 'Magdalena' (asumimos local; el usuario podrá editar después)
--    - Si además city es NULL/empty → city = 'Santa Marta'
--    - NO tocamos profiles que ya tengan otro city seteado (ej. "Bogotá") —
--      ellos van a tener que escoger su departamento manualmente desde /onboarding.

UPDATE profiles
SET department = 'Magdalena'
WHERE country = 'Colombia'
  AND department IS NULL
  AND (city IS NULL OR trim(city) = '' OR lower(city) LIKE '%santa marta%');

UPDATE profiles
SET city = 'Santa Marta'
WHERE country = 'Colombia'
  AND department = 'Magdalena'
  AND (city IS NULL OR trim(city) = '');

-- 3. Normalizar variantes de "Santa Marta" para que matcheen la lista oficial
--    (SANTA MARTA, Santa marta, etc → "Santa Marta")
UPDATE profiles
SET city = 'Santa Marta'
WHERE country = 'Colombia'
  AND lower(city) = 'santa marta'
  AND city <> 'Santa Marta';
