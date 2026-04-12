-- ============================================================
-- RUN THIS AFTER YOU SIGN UP
-- ============================================================
-- 1. First, sign up on your app (http://localhost:5173)
-- 2. Come back here to SQL Editor
-- 3. Replace YOUR_EMAIL below with the email you signed up with
-- 4. Run this query
-- ============================================================

-- Step 1: See all registered users
SELECT id, email, created_at FROM auth.users ORDER BY created_at;

-- Step 2: Make yourself admin (CHANGE THE EMAIL!)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'PUT_YOUR_EMAIL_HERE'
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Verify it worked
SELECT u.email, ur.role 
FROM public.user_roles ur 
JOIN auth.users u ON u.id = ur.user_id;
