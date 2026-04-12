
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { planId, userId } = await req.json()

    // Validate input
    if (!planId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Set up Supabase client with admin privileges
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the plan details
    const { data: plan, error: planError } = await supabaseAdmin
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      console.error('Error fetching plan:', planError)
      return new Response(
        JSON.stringify({ error: 'Subscription plan not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    // Get user details from Supabase
    const { data: user, error: userError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.error('Error fetching user:', userError)
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    // Get user email from auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (authError || !authData?.user?.email) {
      console.error('Error fetching user auth data:', authError)
      return new Response(
        JSON.stringify({ error: 'User email not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    const userEmail = authData.user.email

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Create or get Stripe customer
    let customerId
    const { data: existingCustomers } = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    })

    if (existingCustomers && existingCustomers.length > 0) {
      customerId = existingCustomers[0].id
    } else {
      const customer = await stripe.customers.create({
        email: userEmail,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || undefined,
        metadata: {
          userId: userId,
        }
      })
      customerId = customer.id
    }

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: plan.is_recurring ? 'subscription' : 'payment',
      success_url: `${req.headers.get('origin')}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}`,
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
    })

    // Record the pending subscription in our database
    if (plan.is_recurring) {
      const { error: subscriptionError } = await supabaseAdmin
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: 'pending',
          // We'll update this later in the webhook when the subscription is created
          stripe_subscription_id: null
        })

      if (subscriptionError) {
        console.error('Error recording subscription:', subscriptionError)
        // Continue anyway since the user has already been redirected to Stripe
      }
    }

    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error processing payment:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
