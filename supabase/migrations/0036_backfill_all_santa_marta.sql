-- Confirmado por el owner: TODOS los usuarios actuales son de Santa Marta.
-- Completamos los 11 perfiles que quedaron con NULL en 0035.
-- Sigue siendo no-destructivo: solo toca filas donde el campo es NULL/vacío.

UPDATE profiles
SET
  country = COALESCE(country, 'Colombia'),
  department = COALESCE(department, 'Magdalena'),
  city = CASE
    WHEN city IS NULL OR trim(city) = '' THEN 'Santa Marta'
    ELSE city
  END
WHERE
  country IS NULL
  OR (country = 'Colombia' AND department IS NULL)
  OR city IS NULL
  OR trim(city) = '';
