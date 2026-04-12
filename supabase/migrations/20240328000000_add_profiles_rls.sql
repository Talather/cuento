-- Tighten RLS policies (safe re-run with DROP IF EXISTS)

-- Drop any old policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view published stories" ON stories;
DROP POLICY IF EXISTS "Users can view their own stories regardless of status" ON stories;
DROP POLICY IF EXISTS "Users can view their own stories" ON stories;
DROP POLICY IF EXISTS "Users can update their own stories" ON stories;
DROP POLICY IF EXISTS "Users can view story likes" ON story_likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON story_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON story_likes;
DROP POLICY IF EXISTS "Anyone can view likes" ON story_likes;
DROP POLICY IF EXISTS "Authenticated users can like" ON story_likes;
DROP POLICY IF EXISTS "Users can unlike" ON story_likes;
DROP POLICY IF EXISTS "Anyone can read story likes count" ON story_likes;
DROP POLICY IF EXISTS "Authenticated users can like stories" ON story_likes;
DROP POLICY IF EXISTS "Users can remove their own likes" ON story_likes;
DROP POLICY IF EXISTS "Users can only view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read their own unpublished stories" ON stories;
DROP POLICY IF EXISTS "Users can create stories" ON stories;

ALTER TABLE profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_likes ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Stories
CREATE POLICY "Anyone can view published stories"
  ON stories FOR SELECT USING (status = 'published');
CREATE POLICY "Users can view their own stories regardless of status"
  ON stories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create stories"
  ON stories FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR anonymous_user_id IS NOT NULL);
CREATE POLICY "Users can update their own stories"
  ON stories FOR UPDATE USING (auth.uid() = user_id);

-- Story likes
CREATE POLICY "Users can view story likes"
  ON story_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert their own likes"
  ON story_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own likes"
  ON story_likes FOR DELETE USING (auth.uid() = user_id);

-- Revoke direct access
REVOKE ALL ON profiles FROM public;
REVOKE ALL ON stories FROM public;
REVOKE ALL ON story_likes FROM public;

-- Grant through RLS
GRANT SELECT, UPDATE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON stories TO authenticated;
GRANT SELECT, INSERT, DELETE ON story_likes TO authenticated;