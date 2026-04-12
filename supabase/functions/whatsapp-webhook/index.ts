import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { sendWhatsAppMessage, sendWhatsAppImage } from './messageHandlers.ts';
import { generateStory } from './storyGenerator.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

// Verify webhook signature from Meta
async function verifyWebhookSignature(body: string, signature: string | null): Promise<boolean> {
  const appSecret = Deno.env.get('WHATSAPP_APP_SECRET');
  
  if (!appSecret) {
    console.error('WHATSAPP_APP_SECRET not configured');
    return false;
  }
  
  if (!signature) {
    console.error('No signature provided in request');
    return false;
  }
  
  // Meta sends signature as "sha256=<hash>"
  const expectedPrefix = 'sha256=';
  if (!signature.startsWith(expectedPrefix)) {
    console.error('Invalid signature format');
    return false;
  }
  
  const providedHash = signature.slice(expectedPrefix.length);
  
  // Calculate HMAC-SHA256 of the body using the app secret
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(body)
  );
  
  // Convert to hex string
  const calculatedHash = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return calculatedHash === providedHash;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Handle webhook verification from WhatsApp - no auth required for GET requests
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      console.log('Received verification request:', {
        mode,
        token,
        challenge
      });

      if (mode && token) {
        if (mode === 'subscribe' && token === 'cuentito-whatsapp-verify') {
          console.log('Webhook verified successfully');
          if (!challenge) {
            console.error('Challenge missing from verification request');
            return new Response('Challenge parameter missing', {
              status: 400,
              headers: corsHeaders
            });
          }
          return new Response(challenge, {
            headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
            status: 200
          });
        } else {
          console.error('Verification failed:', { mode, token });
          return new Response('Forbidden', {
            headers: corsHeaders,
            status: 403
          });
        }
      }
    }

    // For POST requests, verify the signature from Meta
    const rawBody = await req.text();
    const signature = req.headers.get('x-hub-signature-256');
    
    const isValidSignature = await verifyWebhookSignature(rawBody, signature);
    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return new Response('Unauthorized', {
        headers: corsHeaders,
        status: 401
      });
    }

    const body = JSON.parse(rawBody);
    console.log('Received webhook:', JSON.stringify(body, null, 2));

    // Verify this is a WhatsApp Business Account message
    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          const value = change.value;

          if (value.messages) {
            for (const message of value.messages) {
              const from = message.from;
              const messageText = message.text?.body;

              if (!messageText) continue;
              
              // Validate message length to prevent DoS
              const MAX_MESSAGE_LENGTH = 2000;
              const sanitizedMessage = messageText.trim().substring(0, MAX_MESSAGE_LENGTH);
              
              if (sanitizedMessage.length < 3) {
                console.log('Message too short, skipping');
                continue;
              }

              // Log the incoming message
              const { data: messageLog, error: logError } = await supabase
                .from('whatsapp_messages')
                .insert({
                  phone_number: from,
                  message_content: sanitizedMessage,
                  status: 'received'
                })
                .select()
                .single();

              if (logError) {
                console.error('Error logging message:', logError);
                continue;
              }

              try {
                // Send acknowledgment
                await sendWhatsAppMessage(
                  from,
                  "¡Gracias por tu mensaje! Estoy generando tu cuento personalizado..."
                );

                // Generate story with sanitized message
                const story = await generateStory(supabase, sanitizedMessage);

                // Send story title and synopsis
                await sendWhatsAppMessage(
                  from,
                  `*${story.title}*\n\n${story.synopsis || ''}`
                );

                // Send story content in chunks to avoid message length limits
                const paragraphs = story.body.split('\n\n');
                for (const paragraph of paragraphs) {
                  if (paragraph.trim()) {
                    await sendWhatsAppMessage(from, paragraph.trim());
                    // Add a small delay between messages
                    await new Promise(resolve => setTimeout(resolve, 1000));
                  }
                }

                // Send image if available
                if (story.image_url) {
                  await sendWhatsAppImage(from, story.image_url);
                }

                // Update message status
                await supabase
                  .from('whatsapp_messages')
                  .update({
                    status: 'completed',
                    story_id: story.id
                  })
                  .eq('id', messageLog.id);

              } catch (error) {
                console.error('Error processing message:', error);
                await sendWhatsAppMessage(
                  from,
                  "Lo siento, hubo un error generando tu cuento. Por favor, intenta nuevamente más tarde."
                );

                await supabase
                  .from('whatsapp_messages')
                  .update({
                    status: 'error'
                  })
                  .eq('id', messageLog.id);
              }
            }
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});