
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse the webhook notification
    const requestBody = await req.json()
    console.log('Received webhook payload:', requestBody)
    
    // Check if this is a subscription notification
    if (requestBody.type === 'subscription') {
      return await handleSubscriptionNotification(requestBody, supabaseClient)
    } else {
      // Handle standard payment notification
      return await handlePaymentNotification(requestBody, supabaseClient)
    }
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function handlePaymentNotification(requestBody: any, supabaseClient: any) {
  // Get the payment data from MercadoPago
  const { data: { id: paymentId } } = requestBody

  console.log('Received webhook for payment:', paymentId)

  // Fetch payment details from MercadoPago using production credentials
  const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')}`,
    },
  })

  if (!mpResponse.ok) {
    console.error('Error fetching payment details from MercadoPago')
    return new Response(null, { status: 500, headers: corsHeaders })
  }

  const payment = await mpResponse.json()
  console.log('Payment details:', payment)

  if (!payment.external_reference) {
    console.error('Payment missing external_reference')
    return new Response(null, { status: 400, headers: corsHeaders })
  }
  
  const [userId, planId] = payment.external_reference.split(':')

  console.log('Payment status:', payment.status)
  console.log('User ID:', userId)
  console.log('Plan ID:', planId)

  // Update subscription status
  const { error: updateError } = await supabaseClient
    .from('user_subscriptions')
    .update({ 
      status: payment.status,
      updated_at: new Date().toISOString()
    })
    .eq('mercadopago_payment_id', payment.id)

  if (updateError) {
    console.error('Error updating subscription:', updateError)
    return new Response(null, { status: 500, headers: corsHeaders })
  }

  // If payment is approved, add story credits to user
  if (payment.status === 'approved') {
    await processSuccessfulPayment(userId, planId, supabaseClient)
  }

  return new Response(null, { status: 200, headers: corsHeaders })
}

async function handleSubscriptionNotification(requestBody: any, supabaseClient: any) {
  // Get subscription ID from request
  const subscriptionId = requestBody.data?.id
  
  if (!subscriptionId) {
    console.error('Missing subscription ID in notification')
    return new Response(null, { status: 400, headers: corsHeaders })
  }
  
  console.log('Received webhook for subscription:', subscriptionId)
  
  // Fetch subscription details from MercadoPago
  const mpResponse = await fetch(`https://api.mercadopago.com/preapproval/${subscriptionId}`, {
    headers: {
      Authorization: `Bearer ${Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')}`,
    },
  })

  if (!mpResponse.ok) {
    console.error('Error fetching subscription details from MercadoPago')
    return new Response(null, { status: 500, headers: corsHeaders })
  }

  const subscription = await mpResponse.json()
  console.log('Subscription details:', subscription)
  
  // Get user and plan IDs from external reference
  if (!subscription.external_reference) {
    console.error('Subscription missing external_reference')
    return new Response(null, { status: 400, headers: corsHeaders })
  }
  
  const [userId, planId] = subscription.external_reference.split(':')
  
  // Update subscription status in our database
  const { error: updateError } = await supabaseClient
    .from('user_subscriptions')
    .update({ 
      status: subscription.status,
      updated_at: new Date().toISOString()
    })
    .eq('mercadopago_subscription_id', subscriptionId)

  if (updateError) {
    console.error('Error updating subscription:', updateError)
    return new Response(null, { status: 500, headers: corsHeaders })
  }

  // If subscription is active and this is a recurring payment, add credits
  if (subscription.status === 'authorized') {
    await processSuccessfulPayment(userId, planId, supabaseClient)
  }

  return new Response(null, { status: 200, headers: corsHeaders })
}

async function processSuccessfulPayment(userId: string, planId: string, supabaseClient: any) {
  try {
    // Get plan details
    const { data: plan, error: planError } = await supabaseClient
      .from('subscription_plans')
      .select('story_credits, name, is_recurring')
      .eq('id', planId)
      .single()

    if (planError) {
      console.error('Error fetching plan details:', planError)
      return
    }

    console.log('Plan details:', plan)

    // Add story credits to user's profile
    const { error: creditsError } = await supabaseClient.rpc(
      'add_story_credits',
      { 
        p_user_id: userId,
        p_credits: plan.story_credits
      }
    )

    if (creditsError) {
      console.error('Error adding story credits:', creditsError)
      return
    }

    console.log(`Successfully added ${plan.story_credits} credits to user ${userId}`)

    // Record the processed payment
    const paymentRecord = {
      payment_id: `mp_${Date.now()}`, // Generate a unique ID for MercadoPago payments
      user_id: userId,
      plan_id: planId,
      credits_added: plan.story_credits
    }

    const { error: paymentError } = await supabaseClient
      .from('processed_payments')
      .insert(paymentRecord)

    if (paymentError) {
      console.error('Error recording payment:', paymentError)
    } else {
      console.log('Payment recorded successfully')
    }

    // Send confirmation email
    try {
      console.log('Sending subscription email...')
      
      await supabaseClient.functions.invoke('send-subscription-email', {
        body: {
          userId,
          planName: plan.name,
          credits: plan.story_credits,
          isRecurring: plan.is_recurring
        }
      })
      
      console.log('Subscription email sent successfully')
    } catch (emailError) {
      console.error('Failed to send subscription email:', emailError)
      // Don't throw here, we don't want to fail the whole webhook if just the email fails
    }
  } catch (error) {
    console.error('Error processing successful payment:', error)
  }
}
