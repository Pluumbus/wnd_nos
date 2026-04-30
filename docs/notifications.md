# Push notifications (Expo, без Edge Functions)

Новые заказы попадают в таблицу `notification_queue` триггером `notify_new_order` (см. миграции). Отправка на устройства делается **из Postgres** через расширение **pg_net** (`net.http_post` на `https://exp.host/--/api/v2/push/send`).

## Включение pg_net

В Supabase: **Database → Extensions** → включить `pg_net`. Затем применить миграцию `013_notification_queue_processor.sql` (функция `process_notification_queue_batch`).

Проверка:

```sql
SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net');
```

## Расписание обработки

Рекомендуется вызывать `SELECT public.process_notification_queue_batch();` каждые 30–60 секунд.

### Вариант A: pg_cron (Dashboard / SQL)

Включить расширение `pg_cron`, затем (подстройте интервал под свой план):

```sql
SELECT cron.schedule(
  'wnd_notification_queue',
  '* * * * *',
  $$SELECT public.process_notification_queue_batch();$$
);
```

### Вариант B: внешний cron

Если `pg_net` или `pg_cron` недоступны: по расписанию (GitHub Actions, системный cron, n8n и т.п.) выполнять **один** запрос к базе с **service role** (обход RLS), например через `psql` или HTTP к PostgREST с заголовком `apikey: service_role_key` и телом `{"query": "select process_notification_queue_batch()"}` — либо вручную в **SQL Editor** в Dashboard под ролью, которая может вызвать функцию.

Клиентское приложение **не** отправляет массовые пуши; оно только сохраняет Expo push token в `user_push_tokens`.

## Токены

Таблица `user_push_tokens`: пользователь видит и меняет только свои строки (RLS). Функция обработки очереди выполняется с правами, обходящими RLS (`SECURITY DEFINER` при необходимости уже учтён в батче для чтения очереди и токенов).
