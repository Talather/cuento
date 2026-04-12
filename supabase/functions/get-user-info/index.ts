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
    const authHeader = req.headers.get('Authorization')
    if (authHeader !== `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { email } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    // Get auth user information with exact email match
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      filter: {
        email: email.toLowerCase()
      }
    })

    if (authError) {
      throw authError
    }

    const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      return new Response(
        JSON.stringify({ message: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get profile information
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      throw profileError
    }

    // Get user's stories
    const { data: stories, error: storiesError } = await supabaseAdmin
      .from('stories')
      .select('*')
      .eq('user_id', user.id)

    if (storiesError) {
      throw storiesError
    }

    // Get user's subscriptions
    const { data: subscriptions, error: subscriptionsError } = await supabaseAdmin
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans (*)
      `)
      .eq('user_id', user.id)

    if (subscriptionsError) {
      throw subscriptionsError
    }

    // Get processed payments
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('processed_payments')
      .select('*')
      .eq('user_id', user.id)

    if (paymentsError) {
      throw paymentsError
    }

    const userInfo = {
      auth: {
        id: user.id,
        email: user.email,
        emailConfirmed: user.email_confirmed_at,
        lastSignIn: user.last_sign_in_at,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        userMetadata: user.raw_user_meta_data,
        appMetadata: user.raw_app_meta_data,
      },
      profile,
      stories,
      subscriptions,
      payments,
    }

    return new Response(
      JSON.stringify(userInfo),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})