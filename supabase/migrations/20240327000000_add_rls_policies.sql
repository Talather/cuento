-- Additional RLS policies (may overlap with base — uses DROP IF EXISTS to be safe)

-- Stories: anonymous user access
DROP POLICY IF EXISTS "Users can read their own unpublished stories" ON stories;
CREATE POLICY "Users can read their own unpublished stories" 
ON stories FOR SELECT 
USING (
  auth.uid() = user_id 
  OR 
  anonymous_user_id = (
    SELECT session_id 
    FROM anonymous_users 
    WHERE session_id = current_setting('request.cookie.anonymous-session-id', true)
  )
);

-- Story likes: public read
DROP POLICY IF EXISTS "Anyone can read story likes count" ON story_likes;
CREATE POLICY "Anyone can read story likes count"
ON story_likes FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can like stories" ON story_likes;
CREATE POLICY "Authenticated users can like stories"
ON story_likes FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can remove their own likes" ON story_likes;
CREATE POLICY "Users can remove their own likes"
ON story_likes FOR DELETE
USING (auth.uid() = user_id);

-- Profiles: restrictive (owner only)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can only view their own profile" ON profiles;
CREATE POLICY "Users can only view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);