-- Создание таблицы для хранения push токенов пользователей
CREATE TABLE IF NOT EXISTS user_push_tokens (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  push_token TEXT NOT NULL UNIQUE,
  device_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индекса для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON user_push_tokens(user_id);

-- Создание индекса для быстрого поиска по push_token
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_push_token ON user_push_tokens(push_token);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at
CREATE TRIGGER update_user_push_tokens_updated_at 
    BEFORE UPDATE ON user_push_tokens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Включение RLS (Row Level Security)
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

-- Политика для чтения (все пользователи могут читать токены)
CREATE POLICY "Allow read access to push tokens" ON user_push_tokens
    FOR SELECT USING (true);

-- Политика для вставки (пользователи могут добавлять свои токены)
CREATE POLICY "Allow insert access to push tokens" ON user_push_tokens
    FOR INSERT WITH CHECK (true);

-- Политика для обновления (пользователи могут обновлять свои токены)
CREATE POLICY "Allow update access to push tokens" ON user_push_tokens
    FOR UPDATE USING (true);

-- Политика для удаления (пользователи могут удалять свои токены)
CREATE POLICY "Allow delete access to push tokens" ON user_push_tokens
    FOR DELETE USING (true);
