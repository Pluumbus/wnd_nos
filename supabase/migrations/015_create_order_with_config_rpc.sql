-- Atomic create: wnd_construction + wnd_sections + order (single transaction).
-- Invoker runs with authenticated JWT; created_by set by triggers on orders / wnd_constructions.

CREATE OR REPLACE FUNCTION public.create_order_with_config(p jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  wnd_id integer;
  order_id integer;
  w jsonb := p->'window';
  sec jsonb;
BEGIN
  IF w IS NULL THEN
    RAISE EXCEPTION 'create_order_with_config: missing window';
  END IF;

  INSERT INTO public.wnd_constructions (
    "profileSystem",
    furniture,
    opening_sashes,
    th_glass,
    size,
    sh_template,
    color,
    width_mm,
    height_mm
  )
  VALUES (
    (w->>'profileId')::integer,
    NULLIF(w->>'furnitureId', '')::integer,
    w->>'openingSashes',
    (w->>'glassThickness')::public.glass_thickness,
    jsonb_build_object(
      'width', COALESCE(NULLIF(w->>'width', '')::numeric, 0),
      'height', COALESCE(NULLIF(w->>'height', '')::numeric, 0)
    ),
    COALESCE(w->>'shTemplate', 'single_sash'),
    COALESCE(w->>'color', 'white'),
    NULLIF(w->>'width', '')::integer,
    NULLIF(w->>'height', '')::integer
  )
  RETURNING id INTO wnd_id;

  IF jsonb_typeof(p->'sections') = 'array' THEN
    FOR sec IN SELECT * FROM jsonb_array_elements(p->'sections')
    LOOP
      INSERT INTO public.wnd_sections (
        wnd_construction_id,
        section_id,
        width_mm,
        height_mm,
        opening_side,
        opening_type,
        has_handle
      )
      VALUES (
        wnd_id,
        sec->>'section_id',
        NULLIF(sec->>'width_mm', '')::integer,
        NULLIF(sec->>'height_mm', '')::integer,
        NULLIF(sec->>'opening_side', ''),
        NULLIF(sec->>'opening_type', ''),
        COALESCE((NULLIF(sec->>'has_handle', ''))::boolean, false)
      );
    END LOOP;
  END IF;

  INSERT INTO public.orders (
    customer_name,
    phone_number,
    creator,
    price,
    status,
    config,
    wnd
  )
  VALUES (
    NULLIF(p->>'customer_name', ''),
    NULLIF(p->>'phone_number', ''),
    COALESCE(NULLIF(p->>'creator', ''), 'app'),
    NULLIF(p->>'price', '')::numeric,
    COALESCE(p->>'status', 'Новый'),
    COALESCE(NULLIF(p->>'config', '')::integer, 0),
    wnd_id
  )
  RETURNING id INTO order_id;

  RETURN order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_order_with_config(jsonb) TO authenticated;

COMMENT ON FUNCTION public.create_order_with_config(jsonb) IS 'Creates window construction, sections, and order in one transaction.';
