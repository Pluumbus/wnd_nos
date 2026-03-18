-- Обновление таблицы profiles - добавляем поля для полной информации о профиле
-- Все цены в тенге за кв.м. или погонный метр

-- Добавляем новые колонки к существующей таблице profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS code text UNIQUE,
ADD COLUMN IF NOT EXISTS frame_price numeric DEFAULT 0, -- Профиль рамы (за кв.м.)
ADD COLUMN IF NOT EXISTS sash_price numeric DEFAULT 0, -- Профиль створки (за кв.м.)
ADD COLUMN IF NOT EXISTS impost_price numeric DEFAULT 0, -- Профиль импоста (за п.м.)
ADD COLUMN IF NOT EXISTS shtulp_price numeric, -- Профиль штульпа (за п.м.)
ADD COLUMN IF NOT EXISTS door_frame_price numeric, -- Профиль рамы дверной (за кв.м.)
ADD COLUMN IF NOT EXISTS door_sash_price numeric, -- Профиль створки дверной (за кв.м.)
ADD COLUMN IF NOT EXISTS threshold_price numeric, -- Порог (за п.м.)
ADD COLUMN IF NOT EXISTS system_name text; -- Название системы (FUNKE, VEKTOR, EXPROF)

-- Индекс для быстрого поиска по коду
CREATE INDEX IF NOT EXISTS idx_profiles_code ON public.profiles(code);

-- Индекс для поиска по системе
CREATE INDEX IF NOT EXISTS idx_profiles_system ON public.profiles(system_name);

-- Обновляем существующие данные и добавляем новые профили
-- FUNKE профили
INSERT INTO public.profiles (name, code, frame_price, sash_price, impost_price, shtulp_price, door_frame_price, door_sash_price, threshold_price, system_name, price, depth) VALUES
  ('FUNKE 58 мм', 'FUNKE_58', 2400, 2948, 3138, 4256, 2284, 5500, 8000, 'FUNKE', 5348, 58),
  ('FUNKE 70 мм', 'FUNKE_70', 2776, 3368, 3388, 5780, 4818, 6622, 8400, 'FUNKE', 6144, 70)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  frame_price = EXCLUDED.frame_price,
  sash_price = EXCLUDED.sash_price,
  impost_price = EXCLUDED.impost_price,
  shtulp_price = EXCLUDED.shtulp_price,
  door_frame_price = EXCLUDED.door_frame_price,
  door_sash_price = EXCLUDED.door_sash_price,
  threshold_price = EXCLUDED.threshold_price,
  system_name = EXCLUDED.system_name,
  price = EXCLUDED.price,
  depth = EXCLUDED.depth;

-- VEKTOR профили
INSERT INTO public.profiles (name, code, frame_price, sash_price, impost_price, system_name, price, depth) VALUES
  ('VEKTOR 58 мм', 'VEKTOR_58', 2100, 2460, 2672, 'VEKTOR', 4560, 58),
  ('VEKTOR 70 мм', 'VEKTOR_70', 2446, 2842, 3112, 'VEKTOR', 5288, 70)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  frame_price = EXCLUDED.frame_price,
  sash_price = EXCLUDED.sash_price,
  impost_price = EXCLUDED.impost_price,
  system_name = EXCLUDED.system_name,
  price = EXCLUDED.price,
  depth = EXCLUDED.depth;

-- EXPROF профили
INSERT INTO public.profiles (name, code, frame_price, sash_price, impost_price, shtulp_price, door_frame_price, door_sash_price, threshold_price, system_name, price, depth) VALUES
  ('EXPROF 58 мм', 'EXPROF_58', 2100, 2460, 2672, 2902, 3068, 4000, 6000, 'EXPROF', 4560, 58),
  ('EXPROF 70 мм', 'EXPROF_70', 2544, 2976, 3162, 3512, 3280, 4200, 8000, 'EXPROF', 5520, 70),
  ('EXPROF 80 мм', 'EXPROF_80', 2764, 2940, 3042, NULL, NULL, NULL, NULL, 'EXPROF', 5704, 80)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  frame_price = EXCLUDED.frame_price,
  sash_price = EXCLUDED.sash_price,
  impost_price = EXCLUDED.impost_price,
  shtulp_price = EXCLUDED.shtulp_price,
  door_frame_price = EXCLUDED.door_frame_price,
  door_sash_price = EXCLUDED.door_sash_price,
  threshold_price = EXCLUDED.threshold_price,
  system_name = EXCLUDED.system_name,
  price = EXCLUDED.price,
  depth = EXCLUDED.depth;

-- Комментарий
COMMENT ON TABLE public.profiles IS 'Справочник профильных систем с детальными ценами';
