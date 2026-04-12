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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create authenticated Supabase client using service role key
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

    const { jsonUrl, batchSize = 100 } = await req.json()
    
    if (!jsonUrl) {
      throw new Error('JSON URL is required')
    }

    console.log(`Fetching stories from ${jsonUrl}`)
    const response = await fetch(jsonUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON: ${response.statusText}`)
    }

    const stories: WordPressStory[] = await response.json()
    console.log(`Found ${stories.length} stories to import`)

    const results = {
      total: stories.length,
      processed: 0,
      success: 0,
      errors: [] as { id: number; error: string }[]
    }

    // Get Cuentito user ID
    const { data: cuentitoIdResult, error: cuentitoIdError } = await supabaseAdmin
      .rpc('get_cuentito_user_id')

    if (cuentitoIdError) {
      console.error('Error getting Cuentito user ID:', cuentitoIdError)
      throw cuentitoIdError
    }

    const cuentitoUserId = cuentitoIdResult

    // Process stories in batches
    for (let i = 0; i < stories.length; i += batchSize) {
      const batch = stories.slice(i, i + batchSize)
      console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(stories.length / batchSize)}`)

      const batchPromises = batch.map(async (story) => {
        try {
          if (story.status !== 'publish') {
            console.log(`Skipping story ${story.ID} - not published`)
            return
          }

          // Get the author's profile if it exists
          const { data: authorProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('wordpress_user_id', story.author)
            .single()

          const storyData = {
            title: story.title,
            content: story.content,
            body: story.content,
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
              BigInt(story.custom_fields.cuentito_uid[0]) : null,
            created_at: story.date,
            updated_at: story.date
          }

          const { error: insertError } = await supabaseAdmin
            .from('stories')
            .insert(storyData)

          if (insertError) {
            throw insertError
          }

          results.success++
        } catch (error) {
          console.error(`Error importing story ${story.ID}:`, error)
          results.errors.push({
            id: story.ID,
            error: error.message
          })
        }
        results.processed++
      })

      await Promise.all(batchPromises)
      console.log(`Completed batch. Progress: ${results.processed}/${results.total}`)
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