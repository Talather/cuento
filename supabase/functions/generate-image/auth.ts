
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export const initSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

export const verifyAuth = async (supabaseClient: any, authHeader: string | null) => {
  console.log('Auth verification started');
  
  // If no auth header or it's marked as anonymous, we'll proceed as anonymous
  if (!authHeader || authHeader === 'Bearer anonymous') {
    console.log('Proceeding as anonymous user');
    return null;
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    console.log('Invalid auth header format');
    return null;
  }
  
  const token = authHeader.replace('Bearer ', '');
  
  try {
    console.log('Verifying authenticated user token');
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    
    if (error || !user) {
      console.log('Token verification failed or no user found, falling back to anonymous');
      return null;
    }
    
    console.log('User authenticated successfully:', user.id);
    return user;
  } catch (error) {
    console.log('Error during authentication:', error.message);
    return null;
  }
};
