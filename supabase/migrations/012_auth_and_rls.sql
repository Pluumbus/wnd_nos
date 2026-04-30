-- Auth model, strict RLS, order/wnd ownership, SECURITY DEFINER notify trigger

-- ============ user_roles (admin / staff) ============
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'staff')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.user_roles IS 'App roles; assign admin via SQL Dashboard (service role).';

CREATE POLICY "user_roles_select_own"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Roles are granted only via service role / SQL (no client inserts)

-- ============ Helper functions (SECURITY DEFINER bypasses RLS for lookup) ============
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'staff')
  );
$$;

-- ============ orders.created_by ============
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users (id);

CREATE OR REPLACE FUNCTION public.set_order_created_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.created_by := auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_orders_set_created_by ON public.orders;
CREATE TRIGGER trg_orders_set_created_by
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_order_created_by();

-- ============ wnd_constructions.created_by ============
ALTER TABLE public.wnd_constructions
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users (id);

CREATE OR REPLACE FUNCTION public.set_wnd_construction_created_by()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.created_by := auth.uid();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_wnd_constructions_set_created_by ON public.wnd_constructions;
CREATE TRIGGER trg_wnd_constructions_set_created_by
  BEFORE INSERT ON public.wnd_constructions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_wnd_construction_created_by();

-- ============ notify_new_order must insert into queue under strict RLS ============
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_queue (order_data, created_at, processed)
  VALUES (to_jsonb(NEW), now(), false);
  RETURN NEW;
END;
$$;

-- ============ Drop permissive policies from 011 ============
DROP POLICY IF EXISTS "Allow select for anon and authenticated on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow update for anon and authenticated on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow delete for anon and authenticated on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow insert for anon and authenticated on profiles" ON public.profiles;

DROP POLICY IF EXISTS "Allow select for anon and authenticated on furnitures" ON public.furnitures;
DROP POLICY IF EXISTS "Allow update for anon and authenticated on furnitures" ON public.furnitures;
DROP POLICY IF EXISTS "Allow delete for anon and authenticated on furnitures" ON public.furnitures;
DROP POLICY IF EXISTS "Allow insert for anon and authenticated on furnitures" ON public.furnitures;

DROP POLICY IF EXISTS "Allow select for anon and authenticated on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow update for anon and authenticated on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow delete for anon and authenticated on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow insert for anon and authenticated on orders" ON public.orders;

DROP POLICY IF EXISTS "Allow select for anon and authenticated on wnd_constructions" ON public.wnd_constructions;
DROP POLICY IF EXISTS "Allow update for anon and authenticated on wnd_constructions" ON public.wnd_constructions;
DROP POLICY IF EXISTS "Allow delete for anon and authenticated on wnd_constructions" ON public.wnd_constructions;
DROP POLICY IF EXISTS "Allow insert for anon and authenticated on wnd_constructions" ON public.wnd_constructions;

DROP POLICY IF EXISTS "Allow select for anon and authenticated on wnd_sections" ON public.wnd_sections;
DROP POLICY IF EXISTS "Allow update for anon and authenticated on wnd_sections" ON public.wnd_sections;
DROP POLICY IF EXISTS "Allow delete for anon and authenticated on wnd_sections" ON public.wnd_sections;
DROP POLICY IF EXISTS "Allow insert for anon and authenticated on wnd_sections" ON public.wnd_sections;

DROP POLICY IF EXISTS "Allow select for anon and authenticated on notification_queue" ON public.notification_queue;
DROP POLICY IF EXISTS "Allow update for anon and authenticated on notification_queue" ON public.notification_queue;
DROP POLICY IF EXISTS "Allow delete for anon and authenticated on notification_queue" ON public.notification_queue;
DROP POLICY IF EXISTS "Allow insert for anon and authenticated on notification_queue" ON public.notification_queue;
DROP POLICY IF EXISTS "Allow service role to manage notification queue" ON public.notification_queue;

DROP POLICY IF EXISTS "Allow select for anon and authenticated on user_push_tokens" ON public.user_push_tokens;
DROP POLICY IF EXISTS "Allow update for anon and authenticated on user_push_tokens" ON public.user_push_tokens;
DROP POLICY IF EXISTS "Allow delete for anon and authenticated on user_push_tokens" ON public.user_push_tokens;
DROP POLICY IF EXISTS "Allow insert for anon and authenticated on user_push_tokens" ON public.user_push_tokens;
DROP POLICY IF EXISTS "Allow read access to push tokens" ON public.user_push_tokens;
DROP POLICY IF EXISTS "Allow insert access to push tokens" ON public.user_push_tokens;
DROP POLICY IF EXISTS "Allow update access to push tokens" ON public.user_push_tokens;
DROP POLICY IF EXISTS "Allow delete access to push tokens" ON public.user_push_tokens;

DROP POLICY IF EXISTS "Allow select for anon and authenticated on glass_packages" ON public.glass_packages;
DROP POLICY IF EXISTS "Allow update for anon and authenticated on glass_packages" ON public.glass_packages;
DROP POLICY IF EXISTS "Allow delete for anon and authenticated on glass_packages" ON public.glass_packages;
DROP POLICY IF EXISTS "Allow insert for anon and authenticated on glass_packages" ON public.glass_packages;

DROP POLICY IF EXISTS "Allow select for anon and authenticated on glass_types" ON public.glass_types;
DROP POLICY IF EXISTS "Allow update for anon and authenticated on glass_types" ON public.glass_types;
DROP POLICY IF EXISTS "Allow delete for anon and authenticated on glass_types" ON public.glass_types;
DROP POLICY IF EXISTS "Allow insert for anon and authenticated on glass_types" ON public.glass_types;

DROP POLICY IF EXISTS "Allow select for anon and authenticated on windowsills" ON public.windowsills;
DROP POLICY IF EXISTS "Allow update for anon and authenticated on windowsills" ON public.windowsills;
DROP POLICY IF EXISTS "Allow delete for anon and authenticated on windowsills" ON public.windowsills;
DROP POLICY IF EXISTS "Allow insert for anon and authenticated on windowsills" ON public.windowsills;

DROP POLICY IF EXISTS "Allow select for anon and authenticated on windowsill_accessories" ON public.windowsill_accessories;
DROP POLICY IF EXISTS "Allow update for anon and authenticated on windowsill_accessories" ON public.windowsill_accessories;
DROP POLICY IF EXISTS "Allow delete for anon and authenticated on windowsill_accessories" ON public.windowsill_accessories;
DROP POLICY IF EXISTS "Allow insert for anon and authenticated on windowsill_accessories" ON public.windowsill_accessories;

DROP POLICY IF EXISTS "Allow select for anon and authenticated on muntins" ON public.muntins;
DROP POLICY IF EXISTS "Allow update for anon and authenticated on muntins" ON public.muntins;
DROP POLICY IF EXISTS "Allow delete for anon and authenticated on muntins" ON public.muntins;
DROP POLICY IF EXISTS "Allow insert for anon and authenticated on muntins" ON public.muntins;

DROP POLICY IF EXISTS "Allow select for anon and authenticated on furniture_systems" ON public.furniture_systems;
DROP POLICY IF EXISTS "Allow update for anon and authenticated on furniture_systems" ON public.furniture_systems;
DROP POLICY IF EXISTS "Allow delete for anon and authenticated on furniture_systems" ON public.furniture_systems;
DROP POLICY IF EXISTS "Allow insert for anon and authenticated on furniture_systems" ON public.furniture_systems;

DROP POLICY IF EXISTS "Allow select for anon and authenticated on furniture_items" ON public.furniture_items;
DROP POLICY IF EXISTS "Allow update for anon and authenticated on furniture_items" ON public.furniture_items;
DROP POLICY IF EXISTS "Allow delete for anon and authenticated on furniture_items" ON public.furniture_items;
DROP POLICY IF EXISTS "Allow insert for anon and authenticated on furniture_items" ON public.furniture_items;

DROP POLICY IF EXISTS "Allow select for anon and authenticated on handles" ON public.handles;
DROP POLICY IF EXISTS "Allow update for anon and authenticated on handles" ON public.handles;
DROP POLICY IF EXISTS "Allow delete for anon and authenticated on handles" ON public.handles;
DROP POLICY IF EXISTS "Allow insert for anon and authenticated on handles" ON public.handles;

DROP POLICY IF EXISTS "Allow select for anon and authenticated on mosquito_net_prices" ON public.mosquito_net_prices;
DROP POLICY IF EXISTS "Allow update for anon and authenticated on mosquito_net_prices" ON public.mosquito_net_prices;
DROP POLICY IF EXISTS "Allow delete for anon and authenticated on mosquito_net_prices" ON public.mosquito_net_prices;
DROP POLICY IF EXISTS "Allow insert for anon and authenticated on mosquito_net_prices" ON public.mosquito_net_prices;

DROP POLICY IF EXISTS "Allow select for anon and authenticated on reinforcement_prices" ON public.reinforcement_prices;
DROP POLICY IF EXISTS "Allow update for anon and authenticated on reinforcement_prices" ON public.reinforcement_prices;
DROP POLICY IF EXISTS "Allow delete for anon and authenticated on reinforcement_prices" ON public.reinforcement_prices;
DROP POLICY IF EXISTS "Allow insert for anon and authenticated on reinforcement_prices" ON public.reinforcement_prices;

DROP POLICY IF EXISTS "Allow select for anon and authenticated on extras" ON public.extras;
DROP POLICY IF EXISTS "Allow update for anon and authenticated on extras" ON public.extras;
DROP POLICY IF EXISTS "Allow delete for anon and authenticated on extras" ON public.extras;
DROP POLICY IF EXISTS "Allow insert for anon and authenticated on extras" ON public.extras;

-- ============ Catalog tables: read authenticated, write admin ============
DO $catalog$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles','furnitures','glass_packages','glass_types','windowsills',
    'windowsill_accessories','muntins','furniture_systems','furniture_items',
    'handles','mosquito_net_prices','reinforcement_prices','extras'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated USING (true)',
      'catalog_select_' || t, t
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_admin())',
      'catalog_insert_' || t, t
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())',
      'catalog_update_' || t, t
    );
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (public.is_admin())',
      'catalog_delete_' || t, t
    );
  END LOOP;
END;
$catalog$;

-- ============ orders ============
CREATE POLICY "orders_select"
  ON public.orders FOR SELECT TO authenticated
  USING (public.is_staff_or_admin() OR created_by = auth.uid());

CREATE POLICY "orders_insert"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "orders_update"
  ON public.orders FOR UPDATE TO authenticated
  USING (public.is_staff_or_admin() OR created_by = auth.uid())
  WITH CHECK (public.is_staff_or_admin() OR created_by = auth.uid());

CREATE POLICY "orders_delete"
  ON public.orders FOR DELETE TO authenticated
  USING (public.is_staff_or_admin() OR created_by = auth.uid());

-- ============ wnd_constructions ============
CREATE POLICY "wnd_constructions_select"
  ON public.wnd_constructions FOR SELECT TO authenticated
  USING (
    public.is_staff_or_admin()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.wnd = public.wnd_constructions.id
        AND (o.created_by = auth.uid() OR public.is_staff_or_admin())
    )
  );

CREATE POLICY "wnd_constructions_insert"
  ON public.wnd_constructions FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "wnd_constructions_update"
  ON public.wnd_constructions FOR UPDATE TO authenticated
  USING (
    public.is_staff_or_admin()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.wnd = public.wnd_constructions.id AND o.created_by = auth.uid()
    )
  )
  WITH CHECK (
    public.is_staff_or_admin()
    OR created_by = auth.uid()
  );

CREATE POLICY "wnd_constructions_delete"
  ON public.wnd_constructions FOR DELETE TO authenticated
  USING (
    public.is_staff_or_admin()
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.wnd = public.wnd_constructions.id AND o.created_by = auth.uid()
    )
  );

-- ============ wnd_sections ============
CREATE POLICY "wnd_sections_select"
  ON public.wnd_sections FOR SELECT TO authenticated
  USING (
    public.is_staff_or_admin()
    OR EXISTS (
      SELECT 1 FROM public.wnd_constructions w
      JOIN public.orders o ON o.wnd = w.id
      WHERE w.id = public.wnd_sections.wnd_construction_id
        AND (w.created_by = auth.uid() OR o.created_by = auth.uid() OR public.is_staff_or_admin())
    )
    OR EXISTS (
      SELECT 1 FROM public.wnd_constructions w
      WHERE w.id = public.wnd_sections.wnd_construction_id
        AND w.created_by = auth.uid()
    )
  );

CREATE POLICY "wnd_sections_insert"
  ON public.wnd_sections FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wnd_constructions w
      WHERE w.id = public.wnd_sections.wnd_construction_id
        AND (
          public.is_staff_or_admin()
          OR w.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.wnd = w.id AND o.created_by = auth.uid()
          )
        )
    )
  );

CREATE POLICY "wnd_sections_update"
  ON public.wnd_sections FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.wnd_constructions w
      WHERE w.id = public.wnd_sections.wnd_construction_id
        AND (
          public.is_staff_or_admin()
          OR w.created_by = auth.uid()
          OR EXISTS (SELECT 1 FROM public.orders o WHERE o.wnd = w.id AND o.created_by = auth.uid())
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wnd_constructions w
      WHERE w.id = public.wnd_sections.wnd_construction_id
        AND (
          public.is_staff_or_admin()
          OR w.created_by = auth.uid()
          OR EXISTS (SELECT 1 FROM public.orders o WHERE o.wnd = w.id AND o.created_by = auth.uid())
        )
    )
  );

CREATE POLICY "wnd_sections_delete"
  ON public.wnd_sections FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.wnd_constructions w
      WHERE w.id = public.wnd_sections.wnd_construction_id
        AND (
          public.is_staff_or_admin()
          OR w.created_by = auth.uid()
          OR EXISTS (SELECT 1 FROM public.orders o WHERE o.wnd = w.id AND o.created_by = auth.uid())
        )
    )
  );

-- ============ notification_queue: no client access (service_role bypasses RLS) ============
-- intentionally no policies for authenticated/anon

-- ============ user_push_tokens ============
CREATE POLICY "push_tokens_select_own"
  ON public.user_push_tokens FOR SELECT TO authenticated
  USING (user_id = auth.uid()::text);

CREATE POLICY "push_tokens_insert_own"
  ON public.user_push_tokens FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "push_tokens_update_own"
  ON public.user_push_tokens FOR UPDATE TO authenticated
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY "push_tokens_delete_own"
  ON public.user_push_tokens FOR DELETE TO authenticated
  USING (user_id = auth.uid()::text);
