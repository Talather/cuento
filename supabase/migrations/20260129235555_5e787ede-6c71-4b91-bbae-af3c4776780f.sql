-- Create role enum and user_roles table (IF NOT EXISTS for safety)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- ⚠️  IMPORTANT: Replace the email below with YOUR admin email before running migrations.
-- This will only work AFTER you have signed up with this email.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'YOUR_REAL_EMAIL@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- All functions below use CREATE OR REPLACE for idempotency

CREATE OR REPLACE FUNCTION public.handle_sitemap_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  PERFORM
    net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/update-sitemap',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('supabase.anon_key', true),
        'Content-Type', 'application/json'
      ),
      body := '{}'
    );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to update sitemap: %', SQLERRM;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrease_story_credits()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    UPDATE profiles 
    SET story_credits = GREATEST(story_credits - 1, 0)
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_wordpress_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.wordpress_slug := regexp_replace(
    unaccent(lower(NEW.title)),
    '[^a-z0-9]+',
    '-',
    'g'
  );
  NEW.wordpress_slug := regexp_replace(NEW.wordpress_slug, '(^-+|-+$)', '', 'g');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_story_flag()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    UPDATE stories
    SET status = 'flagged'
    WHERE id = NEW.story_id;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.increment_likes(row_id UUID)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
    new_likes integer;
BEGIN
    UPDATE stories
    SET likes = likes + 1
    WHERE id = row_id
    RETURNING likes INTO new_likes;
    RETURN new_likes;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_likes(row_id UUID)
RETURNS integer
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
    new_likes integer;
BEGIN
    UPDATE stories
    SET likes = GREATEST(likes - 1, 0)
    WHERE id = row_id
    RETURNING likes INTO new_likes;
    RETURN new_likes;
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_story_credits(p_user_id UUID, p_credits INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE profiles 
  SET 
    story_credits = COALESCE(story_credits, 0) + p_credits,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.migrate_story_to_cuentito()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NEW.user_id IS NULL AND NEW.anonymous_user_id IS NULL THEN
    NEW.user_id = get_cuentito_user_id();
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_top_countries(limit_count integer)
RETURNS TABLE(country text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(p.country, 'Unknown') as country,
        COUNT(*) as count
    FROM profiles p
    WHERE p.country IS NOT NULL
    GROUP BY p.country
    ORDER BY count DESC
    LIMIT limit_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_top_countries_last_week(limit_count integer)
RETURNS TABLE(country text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(p.country, 'Unknown') as country,
        COUNT(*) as count
    FROM profiles p
    WHERE p.created_at >= (CURRENT_DATE - INTERVAL '7 days')
    AND p.country IS NOT NULL
    GROUP BY p.country
    ORDER BY count DESC
    LIMIT limit_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_monthly_story_count(user_id UUID)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    RETURN (
        SELECT COUNT(*)::integer
        FROM stories s
        WHERE s.user_id = $1
        AND s.created_at >= date_trunc('month', current_timestamp)
        AND s.created_at < date_trunc('month', current_timestamp) + interval '1 month'
    );
END;
$function$;

-- Re-create sitemap trigger (safe with OR REPLACE on function; drop+create for trigger)
DROP TRIGGER IF EXISTS update_sitemap_trigger ON stories;
CREATE TRIGGER update_sitemap_trigger
  AFTER INSERT OR UPDATE OR DELETE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION handle_sitemap_update();