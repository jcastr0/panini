-- Las cartas legendarias son extras, no cuentan en el total del álbum.
-- Actualizamos get_owned_counts para excluir stickers tipo 'legend'
-- y mantenerlo consistente con la nueva lógica del frontend.

CREATE OR REPLACE FUNCTION get_owned_counts(p_user_ids uuid[])
RETURNS TABLE(user_id uuid, owned_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT us.user_id, COUNT(*)::bigint AS owned_count
  FROM user_stickers us
  JOIN stickers s ON s.id = us.sticker_id
  WHERE us.user_id = ANY(p_user_ids)
    AND us.quantity > 0
    AND s.type <> 'legend'
  GROUP BY us.user_id;
$$;
