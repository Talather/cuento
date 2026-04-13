import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  userId: string | null;
  showTopRated: boolean;
  page?: number;
  pageSize?: number;
  sort?: string;
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

    const { userId, showTopRated, page = 1, pageSize = 18, sort = 'likes-desc' } = (await req.json()) as RequestBody;

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Get total count
    let countQuery = supabaseClient
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    if (userId) {
      countQuery = countQuery.eq('user_id', userId);
    }

    const { count: totalCount } = await countQuery;

    // Get paginated data
    let query = supabaseClient
      .from('stories')
      .select('id, title, synopsis, likes, image_url, middle_images, created_at, cuentito_uid')
      .eq('status', 'published');

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const [sortField, sortOrder] = sort.split('-');
    if (sortField === 'likes') {
      query = query.order('likes', { ascending: sortOrder === 'asc' });
    } else {
      query = query.order('created_at', { ascending: sortOrder === 'asc' });
    }

    const { data: stories, error } = await query.range(from, to);

    if (error) {
      console.error('Database query error:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ stories: stories || [], totalCount: totalCount ?? 0, page, pageSize }),
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