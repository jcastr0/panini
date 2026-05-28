-- RPC: devuelve owned_count por usuario en una sola query (reemplaza N COUNT paralelos)
CREATE OR REPLACE FUNCTION get_owned_counts(p_user_ids uuid[])
RETURNS TABLE(user_id uuid, owned_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT us.user_id, COUNT(*)::bigint AS owned_count
  FROM user_stickers us
  WHERE us.user_id = ANY(p_user_ids)
    AND us.quantity > 0
  GROUP BY us.user_id;
$$;
