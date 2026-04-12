
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const storyId = pathParts[pathParts.length - 1]

    if (!storyId) {
      return new Response(
        JSON.stringify({ error: 'Story ID is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { data: story, error } = await supabase
      .from('stories')
      .select(`
        id,
        title,
        prompt,
        body,
        synopsis,
        tags,
        likes,
        image_url,
        created_at,
        status,
        cuentito_uid,
        final_image_url,
        middle_images
      `)
      .eq('id', storyId)
      .single()

    if (error) throw error

    console.log('Story data from DB:', story); // Add logging to check the data

    return new Response(
      JSON.stringify(story),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: story ? 200 : 404
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
