-- Включение RLS для всех таблиц и создание политик для anon и authenticated

-- ============ PROFILES ============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for anon and authenticated on profiles" 
  ON public.profiles FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow update for anon and authenticated on profiles" 
  ON public.profiles FOR UPDATE 
  TO anon, authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated on profiles" 
  ON public.profiles FOR DELETE 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow insert for anon and authenticated on profiles" 
  ON public.profiles FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- ============ FURNITURES ============
ALTER TABLE public.furnitures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for anon and authenticated on furnitures" 
  ON public.furnitures FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow update for anon and authenticated on furnitures" 
  ON public.furnitures FOR UPDATE 
  TO anon, authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated on furnitures" 
  ON public.furnitures FOR DELETE 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow insert for anon and authenticated on furnitures" 
  ON public.furnitures FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- ============ ORDERS ============
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for anon and authenticated on orders" 
  ON public.orders FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow update for anon and authenticated on orders" 
  ON public.orders FOR UPDATE 
  TO anon, authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated on orders" 
  ON public.orders FOR DELETE 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow insert for anon and authenticated on orders" 
  ON public.orders FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- ============ WND_CONSTRUCTIONS ============
ALTER TABLE public.wnd_constructions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for anon and authenticated on wnd_constructions" 
  ON public.wnd_constructions FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow update for anon and authenticated on wnd_constructions" 
  ON public.wnd_constructions FOR UPDATE 
  TO anon, authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated on wnd_constructions" 
  ON public.wnd_constructions FOR DELETE 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow insert for anon and authenticated on wnd_constructions" 
  ON public.wnd_constructions FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- ============ WND_SECTIONS ============
ALTER TABLE public.wnd_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for anon and authenticated on wnd_sections" 
  ON public.wnd_sections FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow update for anon and authenticated on wnd_sections" 
  ON public.wnd_sections FOR UPDATE 
  TO anon, authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated on wnd_sections" 
  ON public.wnd_sections FOR DELETE 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow insert for anon and authenticated on wnd_sections" 
  ON public.wnd_sections FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- ============ NOTIFICATION_QUEUE ============
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for anon and authenticated on notification_queue" 
  ON public.notification_queue FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow update for anon and authenticated on notification_queue" 
  ON public.notification_queue FOR UPDATE 
  TO anon, authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated on notification_queue" 
  ON public.notification_queue FOR DELETE 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow insert for anon and authenticated on notification_queue" 
  ON public.notification_queue FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- ============ USER_PUSH_TOKENS ============
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for anon and authenticated on user_push_tokens" 
  ON public.user_push_tokens FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow update for anon and authenticated on user_push_tokens" 
  ON public.user_push_tokens FOR UPDATE 
  TO anon, authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated on user_push_tokens" 
  ON public.user_push_tokens FOR DELETE 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow insert for anon and authenticated on user_push_tokens" 
  ON public.user_push_tokens FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- ============ GLASS_PACKAGES ============
ALTER TABLE public.glass_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for anon and authenticated on glass_packages" 
  ON public.glass_packages FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow update for anon and authenticated on glass_packages" 
  ON public.glass_packages FOR UPDATE 
  TO anon, authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated on glass_packages" 
  ON public.glass_packages FOR DELETE 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow insert for anon and authenticated on glass_packages" 
  ON public.glass_packages FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- ============ GLASS_TYPES ============
ALTER TABLE public.glass_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for anon and authenticated on glass_types" 
  ON public.glass_types FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow update for anon and authenticated on glass_types" 
  ON public.glass_types FOR UPDATE 
  TO anon, authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated on glass_types" 
  ON public.glass_types FOR DELETE 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow insert for anon and authenticated on glass_types" 
  ON public.glass_types FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- ============ WINDOWSILLS ============
ALTER TABLE public.windowsills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for anon and authenticated on windowsills" 
  ON public.windowsills FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow update for anon and authenticated on windowsills" 
  ON public.windowsills FOR UPDATE 
  TO anon, authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated on windowsills" 
  ON public.windowsills FOR DELETE 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow insert for anon and authenticated on windowsills" 
  ON public.windowsills FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- ============ WINDOWSILL_ACCESSORIES ============
ALTER TABLE public.windowsill_accessories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for anon and authenticated on windowsill_accessories" 
  ON public.windowsill_accessories FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow update for anon and authenticated on windowsill_accessories" 
  ON public.windowsill_accessories FOR UPDATE 
  TO anon, authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated on windowsill_accessories" 
  ON public.windowsill_accessories FOR DELETE 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow insert for anon and authenticated on windowsill_accessories" 
  ON public.windowsill_accessories FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- ============ MUNTINS ============
ALTER TABLE public.muntins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for anon and authenticated on muntins" 
  ON public.muntins FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow update for anon and authenticated on muntins" 
  ON public.muntins FOR UPDATE 
  TO anon, authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated on muntins" 
  ON public.muntins FOR DELETE 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow insert for anon and authenticated on muntins" 
  ON public.muntins FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- ============ FURNITURE_SYSTEMS ============
ALTER TABLE public.furniture_systems ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for anon and authenticated on furniture_systems" 
  ON public.furniture_systems FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow update for anon and authenticated on furniture_systems" 
  ON public.furniture_systems FOR UPDATE 
  TO anon, authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated on furniture_systems" 
  ON public.furniture_systems FOR DELETE 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow insert for anon and authenticated on furniture_systems" 
  ON public.furniture_systems FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- ============ FURNITURE_ITEMS ============
ALTER TABLE public.furniture_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for anon and authenticated on furniture_items" 
  ON public.furniture_items FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow update for anon and authenticated on furniture_items" 
  ON public.furniture_items FOR UPDATE 
  TO anon, authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated on furniture_items" 
  ON public.furniture_items FOR DELETE 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow insert for anon and authenticated on furniture_items" 
  ON public.furniture_items FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- ============ HANDLES ============
ALTER TABLE public.handles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for anon and authenticated on handles" 
  ON public.handles FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow update for anon and authenticated on handles" 
  ON public.handles FOR UPDATE 
  TO anon, authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated on handles" 
  ON public.handles FOR DELETE 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow insert for anon and authenticated on handles" 
  ON public.handles FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- ============ MOSQUITO_NET_PRICES ============
ALTER TABLE public.mosquito_net_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for anon and authenticated on mosquito_net_prices" 
  ON public.mosquito_net_prices FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow update for anon and authenticated on mosquito_net_prices" 
  ON public.mosquito_net_prices FOR UPDATE 
  TO anon, authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated on mosquito_net_prices" 
  ON public.mosquito_net_prices FOR DELETE 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow insert for anon and authenticated on mosquito_net_prices" 
  ON public.mosquito_net_prices FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- ============ REINFORCEMENT_PRICES ============
ALTER TABLE public.reinforcement_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for anon and authenticated on reinforcement_prices" 
  ON public.reinforcement_prices FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow update for anon and authenticated on reinforcement_prices" 
  ON public.reinforcement_prices FOR UPDATE 
  TO anon, authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated on reinforcement_prices" 
  ON public.reinforcement_prices FOR DELETE 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow insert for anon and authenticated on reinforcement_prices" 
  ON public.reinforcement_prices FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- ============ EXTRAS ============
ALTER TABLE public.extras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for anon and authenticated on extras" 
  ON public.extras FOR SELECT 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow update for anon and authenticated on extras" 
  ON public.extras FOR UPDATE 
  TO anon, authenticated 
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow delete for anon and authenticated on extras" 
  ON public.extras FOR DELETE 
  TO anon, authenticated 
  USING (true);

CREATE POLICY "Allow insert for anon and authenticated on extras" 
  ON public.extras FOR INSERT 
  TO anon, authenticated 
  WITH CHECK (true);

-- Комментарий
COMMENT ON SCHEMA public IS 'RLS enabled for all tables with full access for anon and authenticated roles';
