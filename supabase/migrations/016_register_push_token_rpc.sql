-- Atomically register or reassign Expo push token to the current user.
-- Needed because push_token is UNIQUE globally: same device logging in as another
-- user must UPDATE the existing row; plain INSERT causes 23505. RLS prevents
-- clients from updating another user's row, so this runs as DEFINER.

CREATE OR REPLACE FUNCTION public.register_push_token(p_push_token text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF p_push_token IS NULL OR length(trim(p_push_token)) = 0 THEN
    RAISE EXCEPTION 'invalid push token';
  END IF;

  INSERT INTO public.user_push_tokens (user_id, push_token, updated_at)
  VALUES (auth.uid()::text, trim(p_push_token), now())
  ON CONFLICT (push_token)
  DO UPDATE SET
    user_id = EXCLUDED.user_id,
    updated_at = EXCLUDED.updated_at;
END;
$$;

REVOKE ALL ON FUNCTION public.register_push_token(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.register_push_token(text) TO authenticated;
