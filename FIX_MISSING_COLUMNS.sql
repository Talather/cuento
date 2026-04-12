-- Fix 1: Add missing columns to stories table
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS image_prompt0 TEXT;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS image_prompt1 TEXT;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS image_prompt2 TEXT;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS image_prompt3 TEXT;
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS wordpress_user_id INTEGER;

-- Fix 2: Make sure the cuentito storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('cuentito', 'cuentito', TRUE)
ON CONFLICT (id) DO UPDATE SET public = TRUE;

-- Fix 3: Storage policies (drop first to avoid conflicts, then recreate)
DROP POLICY IF EXISTS "Public read cuentito" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload cuentito" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated update cuentito" ON storage.objects;
DROP POLICY IF EXISTS "Service role delete cuentito" ON storage.objects;
DROP POLICY IF EXISTS "Service role upload cuentito" ON storage.objects;

CREATE POLICY "Public read cuentito"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cuentito');

CREATE POLICY "Service role upload cuentito"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cuentito');

CREATE POLICY "Authenticated update cuentito"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'cuentito');

CREATE POLICY "Service role delete cuentito"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'cuentito');

-- Verify: list stories columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'stories' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify: list storage buckets
SELECT id, name, public FROM storage.buckets;
