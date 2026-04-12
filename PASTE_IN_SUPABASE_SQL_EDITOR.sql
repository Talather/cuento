-- ============================================================
-- CUENTIZO FULL SAFE SCHEMA (RE-RUN SAFE VERSION)
-- ============================================================

-- =========================
-- 1. EXTENSIONS
-- =========================
CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================
-- 2. ENUM TYPE (SAFE)
-- =========================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- =========================
-- 3. SEQUENCE
-- =========================
CREATE SEQUENCE IF NOT EXISTS public.cuentito_uid_seq START 1;

-- =========================
-- 4. TABLES
-- =========================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    username TEXT,
    avatar_url TEXT,
    age INTEGER,
    country TEXT,
    favorite_genres TEXT[],
    is_teacher BOOLEAN DEFAULT FALSE,
    teaching_experience INTEGER,
    teaching_institutions TEXT[],
    teaching_levels TEXT[],
    login_provider TEXT,
    story_credits INTEGER DEFAULT 3,
    wordpress_user_id INTEGER,
    imported_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.anonymous_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    stories_created INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    anonymous_user_id UUID REFERENCES public.anonymous_users(id) ON DELETE SET NULL,
    title TEXT DEFAULT 'Untitled',
    body TEXT NOT NULL,
    content TEXT,
    prompt TEXT NOT NULL,
    synopsis TEXT,
    tags TEXT,
    status TEXT DEFAULT 'draft',
    likes INTEGER DEFAULT 0,
    cuentito_uid INTEGER DEFAULT nextval('public.cuentito_uid_seq'),
    image_url TEXT,
    final_image_url TEXT,
    image_prompt TEXT,
    image_prompt0 TEXT,
    image_prompt1 TEXT,
    image_prompt2 TEXT,
    image_prompt3 TEXT,
    middle_images TEXT[],
    raw_response JSONB,
    wordpress_id INTEGER,
    wordpress_slug TEXT,
    wordpress_user_id INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.story_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (story_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.story_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.story_audio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
    audio_url TEXT NOT NULL,
    voice_name TEXT DEFAULT 'es-MX-DaliaNeural',
    format TEXT DEFAULT 'audio/mp3',
    status TEXT DEFAULT 'processing',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- =========================
-- 5. FUNCTIONS (SAFE RE-RUN)
-- =========================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, login_provider)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_app_meta_data->>'provider'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrease_story_credits()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET story_credits = GREATEST(story_credits - 1, 0)
    WHERE id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_story_flag()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.stories
  SET status = 'flagged'
  WHERE id = NEW.story_id;

  RETURN NEW;
END;
$$;

-- =========================
-- 6. TRIGGERS (FULL SAFE DROP + CREATE)
-- =========================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_stories_updated_at ON public.stories;
CREATE TRIGGER handle_stories_updated_at
BEFORE UPDATE ON public.stories
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS decrease_credits_on_story ON public.stories;
CREATE TRIGGER decrease_credits_on_story
AFTER INSERT ON public.stories
FOR EACH ROW EXECUTE FUNCTION public.decrease_story_credits();

DROP TRIGGER IF EXISTS on_story_flagged ON public.story_flags;
CREATE TRIGGER on_story_flagged
AFTER INSERT ON public.story_flags
FOR EACH ROW EXECUTE FUNCTION public.handle_story_flag();

-- =========================
-- 7. RLS ENABLE
-- =========================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =========================
-- 8. RLS POLICIES (FULL SAFE DROP + CREATE)
-- =========================

-- PROFILES
DROP POLICY IF EXISTS "Users manage own profile" ON public.profiles;

CREATE POLICY "Users manage own profile"
ON public.profiles
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- STORIES
DROP POLICY IF EXISTS "Public published stories" ON public.stories;
CREATE POLICY "Public published stories"
ON public.stories
FOR SELECT
USING (status = 'published');

DROP POLICY IF EXISTS "Users own stories" ON public.stories;
CREATE POLICY "Users own stories"
ON public.stories
FOR ALL
USING (auth.uid() = user_id OR user_id IS NULL)
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- STORY LIKES
DROP POLICY IF EXISTS "Likes read" ON public.story_likes;
CREATE POLICY "Likes read"
ON public.story_likes
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Likes insert" ON public.story_likes;
CREATE POLICY "Likes insert"
ON public.story_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- STORY FLAGS
DROP POLICY IF EXISTS "Flags insert" ON public.story_flags;
CREATE POLICY "Flags insert"
ON public.story_flags
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- USER ROLES
DROP POLICY IF EXISTS "Roles read own" ON public.user_roles;
CREATE POLICY "Roles read own"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- =========================
-- 9. GRANTS
-- =========================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;

-- =========================
-- 10. SEED DATA
-- =========================

INSERT INTO public.subscription_plans (name, price, price_usd, story_credits, is_recurring)
VALUES
('Basic', 500, 5, 10, FALSE),
('Pro', 1500, 15, 50, FALSE),
('Unlimited', 3000, 30, 0, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================
-- DONE ✅ FULL SAFE RE-RUN READY SCHEMA
-- ============================================================