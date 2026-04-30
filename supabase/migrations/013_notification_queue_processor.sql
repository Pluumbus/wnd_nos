-- Process notification_queue via Expo HTTP Push API using pg_net.
-- Enable "pg_net" in Supabase Dashboard → Database → Extensions.
-- Schedule in Dashboard → Integrations → Cron (or pg_cron):
--   SELECT public.process_notification_queue_batch();

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION public.process_notification_queue_batch()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  msgs jsonb;
  token_rec RECORD;
  payload jsonb;
BEGIN
  FOR r IN
    SELECT id, order_data
    FROM public.notification_queue
    WHERE processed = false
    ORDER BY id ASC
    LIMIT 25
  LOOP
    msgs := '[]'::jsonb;

    FOR token_rec IN
      SELECT push_token FROM public.user_push_tokens WHERE push_token IS NOT NULL AND push_token <> ''
    LOOP
      msgs := msgs || jsonb_build_array(
        jsonb_build_object(
          'to', token_rec.push_token,
          'title', 'Новый заказ!',
          'body', COALESCE(r.order_data->>'customer_name', 'Клиент') || ', заказ #' || COALESCE(r.order_data->>'id', '?'),
          'data', jsonb_build_object('type', 'new_order', 'orderId', r.order_data->'id')
        )
      );
    END LOOP;

    IF jsonb_array_length(msgs) > 0 THEN
      payload := jsonb_build_object('messages', msgs);
      PERFORM net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        headers := jsonb_build_object('Content-Type', 'application/json'),
        body := payload
      );
    END IF;

    UPDATE public.notification_queue
    SET processed = true, processed_at = now()
    WHERE id = r.id;
  END LOOP;
END;
$$;

COMMENT ON FUNCTION public.process_notification_queue_batch() IS
  'Sends pending rows to Expo Push API. Requires pg_net. Run on a schedule (e.g. every 30–60s).';
