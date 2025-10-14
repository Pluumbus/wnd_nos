-- Восстанавливаем систему уведомлений с триггером и очередью

-- Создаем таблицу очереди уведомлений (если не существует)
CREATE TABLE IF NOT EXISTS notification_queue (
  id SERIAL PRIMARY KEY,
  order_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Создаем индекс для быстрого поиска необработанных уведомлений
CREATE INDEX IF NOT EXISTS idx_notification_queue_processed 
ON notification_queue(processed) 
WHERE processed = FALSE;

-- Создаем функцию для добавления уведомления в очередь
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Добавляем данные нового заказа в очередь уведомлений
  INSERT INTO notification_queue (order_data)
  VALUES (row_to_json(NEW));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер для автоматического добавления уведомлений в очередь
DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
CREATE TRIGGER trigger_notify_new_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_order();

-- Включаем RLS для таблицы notification_queue
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Создаем политики для notification_queue
CREATE POLICY "Allow service role to manage notification queue" ON notification_queue
  FOR ALL USING (true);

-- Комментарии для документации
COMMENT ON TABLE notification_queue IS 'Очередь уведомлений для обработки сервером';
COMMENT ON FUNCTION notify_new_order() IS 'Функция для добавления нового заказа в очередь уведомлений';
COMMENT ON TRIGGER trigger_notify_new_order ON orders IS 'Триггер для автоматического создания уведомлений при добавлении заказа';
