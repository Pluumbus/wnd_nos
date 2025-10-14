-- Создание функции для отправки уведомлений о новых заказах
-- Эта функция будет вызывать Edge Function через pg_cron или внешний сервис
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
DECLARE
  payload JSON;
BEGIN
  -- Формируем payload с данными нового заказа
  payload = json_build_object(
    'order', json_build_object(
      'id', NEW.id,
      'customer_name', NEW.customer_name,
      'phone_number', NEW.phone_number,
      'price', NEW.price,
      'status', NEW.status,
      'creator', NEW.creator,
      'created_at', NEW.created_at
    )
  );

  -- Вставляем задачу в таблицу уведомлений для обработки
  INSERT INTO notification_queue (order_data, created_at, processed)
  VALUES (payload, NOW(), false);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создание таблицы для очереди уведомлений
CREATE TABLE IF NOT EXISTS notification_queue (
  id SERIAL PRIMARY KEY,
  order_data JSON NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Создание индекса для быстрого поиска необработанных уведомлений
CREATE INDEX IF NOT EXISTS idx_notification_queue_processed ON notification_queue(processed) WHERE processed = FALSE;

-- Создание триггера для автоматической отправки уведомлений
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();
