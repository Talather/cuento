
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  planId: string;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get request body
    const { planId, userId } = await req.json() as RequestBody

    // Fetch subscription plan details
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError || !plan) {
      console.error('Error fetching plan:', planError)
      return new Response(
        JSON.stringify({ error: 'Plan not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if this is a recurring subscription
    if (plan.is_recurring) {
      console.log('Creating recurring subscription with MercadoPago')
      
      // Format the start and end dates for the subscription
      const now = new Date()
      const startDate = now.toISOString().split('T')[0] // YYYY-MM-DD
      
      // Create MercadoPago recurring subscription using preapproval API
      const preapprovalData = {
        preapproval_plan_id: `plan_${planId}_${Date.now()}`, // Generate unique plan ID
        reason: plan.name,
        external_reference: `${userId}:${planId}`,
        auto_recurring: {
          frequency: 1,
          frequency_type: "months",
          transaction_amount: Number(plan.price),
          currency_id: "ARS"
        },
        back_url: `${req.headers.get('origin')}/payment/success`,
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`,
      }

      // Create MercadoPago subscription using production credentials
      const mpResponse = await fetch("https://api.mercadopago.com/preapproval", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')}`,
        },
        body: JSON.stringify(preapprovalData),
      })

      const mpData = await mpResponse.json()

      if (!mpResponse.ok) {
        console.error('MercadoPago Subscription API error:', mpData)
        return new Response(
          JSON.stringify({ error: 'Failed to create subscription', details: mpData }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('MercadoPago subscription created:', mpData)

      // Create subscription record
      const { data: subscription, error: subscriptionError } = await supabaseClient
        .from('user_subscriptions')
        .insert([
          {
            user_id: userId,
            plan_id: planId,
            status: 'pending',
            mercadopago_subscription_id: mpData.id,
          }
        ])
        .select()
        .single()

      if (subscriptionError) {
        console.error('Error creating subscription record:', subscriptionError)
        return new Response(
          JSON.stringify({ error: 'Failed to create subscription record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Return the init point URL for the frontend to redirect to
      return new Response(
        JSON.stringify({
          checkoutUrl: mpData.init_point,
          subscriptionId: subscription.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Handle one-time payment (existing implementation)
      const preference = {
        items: [
          {
            title: plan.name,
            unit_price: Number(plan.price),
            quantity: 1,
          },
        ],
        back_urls: {
          success: `${req.headers.get('origin')}/payment/success`,
          failure: `${req.headers.get('origin')}/payment/failure`,
        },
        auto_return: "approved",
        external_reference: `${userId}:${planId}`,
        notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/payment-webhook`,
      }

      // Create MercadoPago payment using production credentials
      const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')}`,
        },
        body: JSON.stringify(preference),
      })

      const mpData = await mpResponse.json()

      if (!mpResponse.ok) {
        console.error('MercadoPago API error:', mpData)
        return new Response(
          JSON.stringify({ error: 'Failed to create payment' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create subscription record
      const { data: subscription, error: subscriptionError } = await supabaseClient
        .from('user_subscriptions')
        .insert([
          {
            user_id: userId,
            plan_id: planId,
            status: 'pending',
            mercadopago_payment_id: mpData.id,
          }
        ])
        .select()
        .single()

      if (subscriptionError) {
        console.error('Error creating subscription:', subscriptionError)
        return new Response(
          JSON.stringify({ error: 'Failed to create subscription' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Return the init point URL for the frontend to redirect to
      return new Response(
        JSON.stringify({
          checkoutUrl: mpData.init_point,
          subscriptionId: subscription.id
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
