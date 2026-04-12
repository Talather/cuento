-- ============================================================
-- BASE SCHEMA: Creates all tables, sequences, triggers,
-- functions, storage bucket, and extensions for Cuentizo.
-- This must run BEFORE all other migrations.
-- ============================================================

-- =========================
-- 1. EXTENSIONS
-- =========================
CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pg_net"   WITH SCHEMA extensions;

-- =========================
-- 2. SEQUENCES
-- =========================
CREATE SEQUENCE IF NOT EXISTS public.cuentito_uid_seq START WITH 1 INCREMENT BY 1;

-- =========================
-- 3. TABLES (in dependency order)
-- =========================

-- 3a. profiles — linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name      TEXT,
    last_name       TEXT,
    username        TEXT,
    avatar_url      TEXT,
    age             INTEGER,
    country         TEXT,
    favorite_genres TEXT[],
    is_teacher      BOOLEAN DEFAULT FALSE,
    teaching_experience   INTEGER,
    teaching_institutions TEXT[],
    teaching_levels       TEXT[],
    login_provider  TEXT,
    story_credits   INTEGER DEFAULT 3,
    wordpress_user_id INTEGER,
    imported_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3b. anonymous_users
CREATE TABLE IF NOT EXISTS public.anonymous_users (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id       TEXT NOT NULL UNIQUE,
    stories_created  INTEGER DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3c. stories
CREATE TABLE IF NOT EXISTS public.stories (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    anonymous_user_id UUID REFERENCES public.anonymous_users(id) ON DELETE SET NULL,
    title             TEXT NOT NULL DEFAULT 'Untitled',
    body              TEXT NOT NULL,
    content           TEXT,
    prompt            TEXT NOT NULL,
    synopsis          TEXT,
    tags              TEXT,
    status            TEXT NOT NULL DEFAULT 'draft',
    likes             INTEGER NOT NULL DEFAULT 0,
    cuentito_uid      INTEGER DEFAULT nextval('public.cuentito_uid_seq'),
    image_url         TEXT,
    final_image_url   TEXT,
    image_prompt      TEXT,
    image_prompt0     TEXT,
    image_prompt1     TEXT,
    image_prompt2     TEXT,
    image_prompt3     TEXT,
    middle_images     TEXT[],
    raw_response      JSONB,
    wordpress_id      INTEGER,
    wordpress_slug    TEXT,
    wordpress_user_id INTEGER,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3d. story_likes
CREATE TABLE IF NOT EXISTS public.story_likes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id   UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (story_id, user_id)
);

-- 3e. story_audio
CREATE TABLE IF NOT EXISTS public.story_audio (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id     UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    audio_url    TEXT NOT NULL,
    voice_name   TEXT NOT NULL DEFAULT 'es-MX-DaliaNeural',
    format       TEXT NOT NULL DEFAULT 'audio/mp3',
    status       TEXT NOT NULL DEFAULT 'processing',
    srt_content  TEXT,
    word_timings JSONB,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3f. story_flags
CREATE TABLE IF NOT EXISTS public.story_flags (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id   UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason     TEXT NOT NULL,
    status     TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3g. story_translations
CREATE TABLE IF NOT EXISTS public.story_translations (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id   UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    language   TEXT NOT NULL,
    title      TEXT NOT NULL,
    content    TEXT NOT NULL,
    synopsis   TEXT,
    tags       TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (story_id, language)
);

-- 3h. feedback
CREATE TABLE IF NOT EXISTS public.feedback (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    story_id             UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
    name                 TEXT NOT NULL,
    email                TEXT NOT NULL,
    whatsapp             TEXT,
    story_rating         INTEGER NOT NULL,
    illustration_rating  INTEGER NOT NULL,
    comments             TEXT,
    source               TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3i. newsletter_subscriptions
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email      TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name  TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3j. subscription_plans
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    price           NUMERIC NOT NULL,
    price_usd       NUMERIC NOT NULL DEFAULT 0,
    story_credits   INTEGER NOT NULL,
    is_recurring    BOOLEAN NOT NULL DEFAULT FALSE,
    payment_link    TEXT,
    stripe_price_id TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3k. processed_payments
CREATE TABLE IF NOT EXISTS public.processed_payments (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id       UUID NOT NULL REFERENCES public.subscription_plans(id),
    payment_id    TEXT NOT NULL UNIQUE,
    credits_added INTEGER NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3l. user_subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id                  UUID NOT NULL REFERENCES public.subscription_plans(id),
    status                   TEXT NOT NULL DEFAULT 'active',
    stripe_subscription_id   TEXT,
    mercadopago_payment_id   TEXT,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3m. whatsapp_messages
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number     TEXT NOT NULL,
    message_content  TEXT NOT NULL,
    story_id         UUID REFERENCES public.stories(id) ON DELETE SET NULL,
    status           TEXT NOT NULL DEFAULT 'received',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================
-- 4. ENABLE RLS ON ALL TABLES
-- =========================
ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_users         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_likes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_audio             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_flags             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_translations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages       ENABLE ROW LEVEL SECURITY;

-- =========================
-- 5. BASE RLS POLICIES
-- =========================

-- profiles
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- anonymous_users
CREATE POLICY "Anyone can create anonymous session"
  ON public.anonymous_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read anonymous sessions"
  ON public.anonymous_users FOR SELECT USING (true);

-- stories
CREATE POLICY "Anyone can view published stories"
  ON public.stories FOR SELECT USING (status = 'published');
CREATE POLICY "Users can view their own stories"
  ON public.stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create stories"
  ON public.stories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR anonymous_user_id IS NOT NULL);
CREATE POLICY "Users can update their own stories"
  ON public.stories FOR UPDATE USING (auth.uid() = user_id);

-- story_likes
CREATE POLICY "Anyone can view likes"
  ON public.story_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like"
  ON public.story_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike"
  ON public.story_likes FOR DELETE USING (auth.uid() = user_id);

-- story_audio
CREATE POLICY "Anyone can view audio"
  ON public.story_audio FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert audio"
  ON public.story_audio FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Owner can update audio"
  ON public.story_audio FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.stories s WHERE s.id = story_id AND s.user_id = auth.uid())
  );

-- story_flags
CREATE POLICY "Users can flag stories"
  ON public.story_flags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own flags"
  ON public.story_flags FOR SELECT USING (auth.uid() = user_id);

-- story_translations
CREATE POLICY "Anyone can view translations"
  ON public.story_translations FOR SELECT USING (true);
CREATE POLICY "Service role manages translations"
  ON public.story_translations FOR ALL USING (auth.role() = 'service_role');

-- feedback
CREATE POLICY "Anyone can submit feedback"
  ON public.feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role reads feedback"
  ON public.feedback FOR SELECT USING (auth.role() = 'service_role');

-- newsletter_subscriptions
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role reads subscriptions"
  ON public.newsletter_subscriptions FOR SELECT USING (auth.role() = 'service_role');

-- subscription_plans (public read)
CREATE POLICY "Anyone can view plans"
  ON public.subscription_plans FOR SELECT USING (true);

-- processed_payments
CREATE POLICY "Users can view own payments"
  ON public.processed_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages payments"
  ON public.processed_payments FOR ALL USING (auth.role() = 'service_role');

-- user_subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages subscriptions"
  ON public.user_subscriptions FOR ALL USING (auth.role() = 'service_role');

-- whatsapp_messages
CREATE POLICY "Service role only for whatsapp"
  ON public.whatsapp_messages FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =========================
-- 6. GRANTS
-- =========================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- =========================
-- 7. FUNCTIONS
-- =========================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, avatar_url, login_provider)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.raw_user_meta_data ->> 'avatar_url',
    NEW.raw_app_meta_data  ->> 'provider'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- check_is_admin
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- check_is_admin_internal (takes explicit user_id)
CREATE OR REPLACE FUNCTION public.check_is_admin_internal(user_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = $1 AND role = 'admin'
  );
END;
$$;

-- get_cuentito_user_id (returns a default system user)
CREATE OR REPLACE FUNCTION public.get_cuentito_user_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID;
BEGIN
  SELECT id INTO uid FROM auth.users ORDER BY created_at ASC LIMIT 1;
  RETURN uid;
END;
$$;

-- sync_missing_profiles
CREATE OR REPLACE FUNCTION public.sync_missing_profiles()
RETURNS TABLE(profiles_created INTEGER, errors TEXT[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  created INT := 0;
  err_list TEXT[] := '{}';
BEGIN
  INSERT INTO public.profiles (id, login_provider, created_at, updated_at)
  SELECT u.id, u.raw_app_meta_data ->> 'provider', u.created_at, NOW()
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  WHERE p.id IS NULL
  ON CONFLICT (id) DO NOTHING;

  GET DIAGNOSTICS created = ROW_COUNT;
  RETURN QUERY SELECT created, err_list;
END;
$$;

-- import_stories_from_json
CREATE OR REPLACE FUNCTION public.import_stories_from_json(stories_json JSONB)
RETURNS TABLE(imported_count INTEGER, skipped_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  imported INT := 0;
  skipped  INT := 0;
  story    JSONB;
BEGIN
  FOR story IN SELECT * FROM jsonb_array_elements(stories_json)
  LOOP
    BEGIN
      INSERT INTO public.stories (title, body, prompt, content, synopsis, tags, status, user_id)
      VALUES (
        story ->> 'title',
        story ->> 'body',
        COALESCE(story ->> 'prompt', ''),
        story ->> 'content',
        story ->> 'synopsis',
        story ->> 'tags',
        COALESCE(story ->> 'status', 'published'),
        (story ->> 'user_id')::UUID
      );
      imported := imported + 1;
    EXCEPTION WHEN OTHERS THEN
      skipped := skipped + 1;
    END;
  END LOOP;
  RETURN QUERY SELECT imported, skipped;
END;
$$;

-- =========================
-- 8. TRIGGERS
-- =========================

-- Auto-create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at on profiles
CREATE OR REPLACE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-update updated_at on stories
CREATE OR REPLACE TRIGGER handle_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-generate slug on story insert/update
CREATE OR REPLACE TRIGGER generate_story_slug
  BEFORE INSERT OR UPDATE OF title ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_wordpress_slug();

-- Auto-flag story on flag insert
CREATE OR REPLACE TRIGGER on_story_flagged
  AFTER INSERT ON public.story_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_story_flag();

-- Decrease credits when story is created
CREATE OR REPLACE TRIGGER decrease_credits_on_story
  AFTER INSERT ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.decrease_story_credits();

-- =========================
-- 9. STORAGE BUCKET
-- =========================
INSERT INTO storage.buckets (id, name, public)
VALUES ('cuentito', 'cuentito', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public read cuentito"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'cuentito');

CREATE POLICY "Authenticated upload cuentito"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'cuentito' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated update cuentito"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'cuentito' AND auth.role() = 'authenticated');

CREATE POLICY "Service role delete cuentito"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'cuentito' AND auth.role() = 'service_role');

-- =========================
-- 10. SEED: Default subscription plans
-- =========================
INSERT INTO public.subscription_plans (name, price, price_usd, story_credits, is_recurring)
VALUES
  ('Básico',       500,   5, 10, FALSE),
  ('Creativo',    1500,  15, 50, FALSE),
  ('Ilimitado',   3000,  30,  0,  TRUE)
ON CONFLICT DO NOTHING;
