-- Security tightening: remove overly permissive policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Allow status updates on stories" ON public.stories;
DROP POLICY IF EXISTS "Edge functions can manage whatsapp messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Service role only for whatsapp" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "Service role only access" ON public.whatsapp_messages;

CREATE POLICY "Service role only access" 
ON public.whatsapp_messages 
FOR ALL 
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');