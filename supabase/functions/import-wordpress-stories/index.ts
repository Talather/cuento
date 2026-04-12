import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

interface WordPressStory {
  ID: number
  title: string
  content: string
  status: string
  date: string
  author: string
  tags: string[]
  custom_fields: {
    prompt?: string[]
    cuentito_uid?: string[]
    sinopsis?: string[]
    image_prompt0?: string[]
    image_prompt1?: string[]
    image_prompt2?: string[]
    image_prompt3?: string[]
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (authHeader !== `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { stories } = await req.json() as { stories: WordPressStory[] }
    
    const results = {
      success: 0,
      errors: [] as { id: number; error: string }[]
    }

    // Get Cuentito user ID using the database function
    const { data: cuentitoIdResult, error: cuentitoIdError } = await supabaseAdmin
      .rpc('get_cuentito_user_id')

    if (cuentitoIdError) {
      console.error('Error getting Cuentito user ID:', cuentitoIdError)
      throw cuentitoIdError
    }

    const cuentitoUserId = cuentitoIdResult

    if (!cuentitoUserId) {
      return new Response(
        JSON.stringify({ error: 'Cuentito user configuration is missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    for (const story of stories) {
      try {
        console.log(`Processing story ID ${story.ID}...`)

        // Skip non-published stories
        if (story.status !== 'publish') {
          console.log(`Skipping story ${story.ID} - not published`)
          continue
        }

        // Get the author's profile if it exists (based on WordPress ID)
        const { data: authorProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('wordpress_user_id', story.author)
          .single()

        const storyData = {
          title: story.title,
          content: story.content,
          body: story.content, // Using content as body since it's the cleaned version
          prompt: story.custom_fields.prompt?.[0] || '',
          synopsis: story.custom_fields.sinopsis?.[0] || '',
          image_prompt: story.custom_fields.image_prompt0?.[0] || '',
          image_prompt1: story.custom_fields.image_prompt1?.[0] || null,
          image_prompt2: story.custom_fields.image_prompt2?.[0] || null,
          image_prompt3: story.custom_fields.image_prompt3?.[0] || null,
          tags: story.tags.join(', '),
          user_id: authorProfile?.id || cuentitoUserId,
          wordpress_user_id: parseInt(story.author) || null,
          cuentito_uid: story.custom_fields.cuentito_uid?.[0] ? 
            parseInt(story.custom_fields.cuentito_uid[0]) : null,
          created_at: story.date,
          updated_at: story.date
        }

        const { data: insertedStory, error: insertError } = await supabaseAdmin
          .from('stories')
          .insert(storyData)
          .select()
          .single()

        if (insertError) {
          throw insertError
        }

        results.success++
        console.log(`Successfully imported story ${story.ID}`)
      } catch (error) {
        console.error(`Error importing story ${story.ID}:`, error)
        results.errors.push({
          id: story.ID,
          error: error.message
        })
      }
    }

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('General error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})