import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { data: stories, error } = await supabaseClient
      .from('stories')
      .select('id, title, synopsis, likes, image_url, created_at')
      .eq('status', 'published')
      .order('likes', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Database query error:', error)
      throw error
    }

    if (!stories) {
      console.error('No stories found')
      throw new Error('No stories found')
    }

    const response = {
      stories: stories.map(story => ({
        id: story.id,
        title: story.title,
        synopsis: story.synopsis,
        likes: story.likes,
        image_url: story.image_url,
        created_at: story.created_at
      }))
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
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
    )
  }
})