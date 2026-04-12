import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, storyId, userId } = await req.json()

    if (!email || !storyId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Email, story ID, and user ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    // Verify the story belongs to the user
    const { data: story, error: storyError } = await supabaseClient
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', userId)
      .single()

    if (storyError || !story) {
      throw new Error('Story not found or does not belong to the user')
    }

    // Use wordpress_slug if available, otherwise create a slug from title
    const urlSlug = story.wordpress_slug || story.id

    // Send email using Brevo
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': Deno.env.get('BREVO_API_KEY') ?? '',
      },
      body: JSON.stringify({
        sender: {
          name: 'Cuenti.to 🤖📖',
          email: 'cuentito@cuentito.app'
        },
        to: [{
          email: email
        }],
        subject: `Tu nuevo Cuentito: ${story.title}`,
        htmlContent: `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Tu nuevo Cuentito</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width:
600px; margin: 0 auto; padding: 20px;">
          <span class="preheader-text" style="color:transparent;height:0;max-height:0;max-width:0;opacity:0;overflow:hidden;visibility:hidden;width:0;display:none;mso-hide:all;">${story.synopsis || ''}</span>
          <div style="display:none;max-height:0px;overflow:hidden;">&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;‌&nbsp;&nbsp;‌&nbsp;‌&nbsp;‌</div>
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://cuenti.to/logo-cuentito.png" alt="Cuentito Logo" style="width: 150px;">
          </div>

          <h1 style="text-align: center; font-size: 28px; color: #333; margin-bottom: 30px;">
            ¡Tu nuevo Cuentito ya está listo!
          </h1>

          <div style="text-align: center; color: #666; margin-bottom: 20px; font-size: 18px;">
            ${email} y Cuentito presentan
          </div>

          ${story.image_url ? `
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${story.image_url}" alt="Story Image" style="max-width: 100%; border-radius: 8px;">
            </div>
          ` : ''}

          <h2 style="text-align: center; font-size: 24px; color: #333; margin-bottom: 20px;">
            ${story.title}
          </h2>

          <p style="text-align: center; color: #666; margin-bottom: 30px;">
            ${story.synopsis || ''}
          </p>

          <div style="text-align: center; margin-bottom: 30px;">
             <a href="https://cuenti.to/story/${urlSlug}/${story.id}"
               style="display: inline-block; background-color: #333; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Leer el Cuentito
            </a>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://wa.me/?text=${encodeURIComponent(`¡Leé mi nuevo Cuentito! ${story.title} https://cuenti.to/story/${urlSlug}/${story.id}`)}"
               style="display: inline-block; margin: 0 10px;">
              <img src="https://cdn2.iconfinder.com/data/icons/social-media-2285/512/1_Whatsapp2_colored_svg-1024.png" alt="WhatsApp" style="width: 32px;">
            </a>
            <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(`¡Leé mi nuevo Cuentito! ${story.title}`)}&url=${encodeURIComponent(`https://cuenti.to/story/${urlSlug}/${story.id}`)}"
               style="display: inline-block; margin: 0 10px;">
              <img src="https://cdn2.iconfinder.com/data/icons/social-media-2285/512/1_Twitter3_colored_svg-512.png" alt="Twitter" style="width: 32px;">
            </a>
            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://cuenti.to/story/${urlSlug}/${story.id}`)}"
               style="display: inline-block; margin: 0 10px;">
              <img src="https://cdn1.iconfinder.com/data/icons/logotypes/32/square-facebook-512.png" alt="Facebook" style="width: 32px;">
            </a>
          </div>
        </body>
      </html>`
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send email: ${errorText}`);
    }

    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})