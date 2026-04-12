import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  userId: string | null;
  showTopRated: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { userId, showTopRated } = (await req.json()) as RequestBody;

    let query = supabaseClient
      .from('stories')
      .select('id, title, synopsis, likes, image_url, created_at, cuentito_uid')
      .eq('status', 'published');

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (showTopRated) {
      query = query.order('likes', { ascending: false });
    }

    const { data: stories, error } = await query.limit(100);

    if (error) {
      console.error('Database query error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ stories: stories || [] }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to fetch stories'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
})