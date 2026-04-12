import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import Stripe from 'https://esm.sh/stripe@14.21.0'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')
    const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
      throw new Error('Missing Stripe environment variables')
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })

    // Get the signature from the header
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Get the raw request body
    const body = await req.text()
    
    // Verify and construct the event asynchronously
    let event
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`)
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Processing Stripe webhook event: ${event.type}`)

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object

        console.log('Checkout session completed:', session.id)
        
        // Extract metadata from the session
        const userId = session.metadata?.user_id
        const planId = session.metadata?.plan_id

        if (!userId || !planId) {
          console.error('Missing user_id or plan_id in session metadata')
          break
        }

        try {
          // Get the subscription ID if this checkout created a subscription
          let stripeSubscriptionId = null
          if (session.subscription) {
            stripeSubscriptionId = session.subscription
            console.log('Subscription created:', stripeSubscriptionId)
          }

          // Get the subscription plan to determine if it's recurring
          const { data: plan, error: planError } = await supabaseAdmin
            .from('subscription_plans')
            .select('*')
            .eq('id', planId)
            .single()

          if (planError) {
            console.error('Error fetching plan:', planError)
            break
          }

          console.log('Plan details:', plan)

          // Update the user's subscription status in the database
          if (plan.is_recurring) {
            // For recurring subscriptions, update the subscription record
            const { error: subError } = await supabaseAdmin
              .from('user_subscriptions')
              .update({
                status: 'active',
                stripe_subscription_id: stripeSubscriptionId
              })
              .eq('user_id', userId)
              .eq('plan_id', planId)
              .eq('status', 'pending')

            if (subError) {
              console.error('Error updating subscription:', subError)
            } else {
              console.log(`Subscription activated for user ${userId}`)
            }
          }

          // Add story credits for both one-time purchases AND recurring subscriptions
          console.log(`Adding ${plan.story_credits} credits to user ${userId}`)
          const { error: creditsError } = await supabaseAdmin.rpc(
            'add_story_credits',
            { 
              p_user_id: userId,
              p_credits: plan.story_credits
            }
          )

          if (creditsError) {
            console.error('Error adding story credits:', creditsError)
          } else {
            console.log(`${plan.story_credits} credits added successfully`)
          }

          // Record the processed payment
          const { error: paymentError } = await supabaseAdmin
            .from('processed_payments')
            .insert({
              payment_id: session.id,
              user_id: userId,
              plan_id: planId,
              credits_added: plan.story_credits
            })

          if (paymentError) {
            console.error('Error recording payment:', paymentError)
          } else {
            console.log('Payment recorded successfully')
          }

          // Send confirmation email
          try {
            await supabaseAdmin.functions.invoke('send-subscription-email', {
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
            // Continue anyway, this should not block the subscription
          }
        } catch (error) {
          console.error('Error processing checkout session:', error)
        }
        break
        
      case 'customer.subscription.deleted':
        const subscription = event.data.object
        console.log(`Subscription ${subscription.id} was deleted/canceled`)
        
        try {
          // Find the user subscription by Stripe subscription ID
          const { data: userSubscription, error: findError } = await supabaseAdmin
            .from('user_subscriptions')
            .select('id, user_id, plan_id')
            .eq('stripe_subscription_id', subscription.id)
            .single()
            
          if (findError) {
            console.error('Error finding subscription:', findError)
            break
          }
          
          if (!userSubscription) {
            console.error(`No subscription found with stripe_subscription_id: ${subscription.id}`)
            break
          }
          
          // Update the subscription status to 'cancelled'
          const { error: updateError } = await supabaseAdmin
            .from('user_subscriptions')
            .update({ status: 'cancelled' })
            .eq('id', userSubscription.id)
            
          if (updateError) {
            console.error('Error updating subscription status:', updateError)
            break
          }
          
          console.log(`Subscription cancelled for user ${userSubscription.user_id}`)
          
          // Log the cancellation reason if available
          if (subscription.cancellation_details) {
            const reason = subscription.cancellation_details.reason
            console.log(`Cancellation reason: ${reason || 'Not specified'}`)
            
            // Handle specific cancellation reasons if needed
            if (reason === 'payment_failed') {
              // You could notify the user about the payment failure
              console.log('Subscription cancelled due to payment failure')
            }
          }
        } catch (error) {
          console.error('Error processing subscription cancellation:', error)
        }
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
