-- Optional explicit dimensions (mm); backfill from legacy size jsonb.

ALTER TABLE public.wnd_constructions
  ADD COLUMN IF NOT EXISTS width_mm integer,
  ADD COLUMN IF NOT EXISTS height_mm integer;

UPDATE public.wnd_constructions w
SET
  width_mm = COALESCE(
    w.width_mm,
    NULLIF(trim(w.size->>'width'), '')::integer
  ),
  height_mm = COALESCE(
    w.height_mm,
    NULLIF(trim(w.size->>'height'), '')::integer
  )
WHERE w.size IS NOT NULL;

COMMENT ON COLUMN public.wnd_constructions.width_mm IS 'Window width in mm (denormalized from size when present).';
COMMENT ON COLUMN public.wnd_constructions.height_mm IS 'Window height in mm (denormalized from size when present).';
