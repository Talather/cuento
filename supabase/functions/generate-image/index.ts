import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { initSupabaseClient, verifyAuth } from './auth.ts';
import { generateImageWithGemini } from './geminiImageGeneration.ts';
import { 
  validateRequest, 
  logRequest, 
  validatePrompt, 
  validateRequestId, 
   validateTimestamp
} from './requestValidation.ts';

serve(async (req) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: { 
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      } 
    });
  }

  try {
    const supabaseClient = initSupabaseClient();
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    let user = null;
    
    try {
      // Try to get the user, but continue even if unauthorized
      user = await verifyAuth(supabaseClient, authHeader);
      userId = user?.id || null;
    } catch (authError) {
      console.log('User not authenticated, proceeding as anonymous:', authError.message);
      // Continue as anonymous
    }

    const body = await req.json();
    
    // Validate all inputs
    const prompt = validatePrompt(body.prompt);
    const requestId = validateRequestId(body.requestId);
    const timestamp = validateTimestamp(body.timestamp);

     console.log(`Processing request: ${requestId}, User: ${userId || 'anonymous'}`);

    // Validate the request - modified to handle anonymous users properly
    await validateRequest(supabaseClient, userId, requestId, timestamp);
    
    // Log the request
    await logRequest(supabaseClient, requestId, userId, timestamp);

     console.log(`Generating image for prompt: "${prompt.substring(0, 50)}..." using Gemini`);

     // Generate the image using Gemini
    let imageResult;
    try {
       imageResult = await generateImageWithGemini(prompt);
    } catch (generationError) {
      console.error('Error generating image:', generationError);
      throw generationError;
    }

    return new Response(
      JSON.stringify(imageResult),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );

  } catch (error) {
    // Log the error internally but don't expose details to the client
    console.error('Error in generate-image function:', error);
    
    // Determine if it's a validation error
    const errorMessage = error.message || 'An unexpected error occurred';
    const isValidationError = errorMessage.includes('must be') || 
                              errorMessage.includes('Missing') || 
                              errorMessage.includes('Invalid') ||
                              errorMessage.includes('cannot be');
    
    // Return a sanitized error response
    const errorResponse = {
      error: errorMessage,
      status: isValidationError ? 400 : (errorMessage.includes('Rate limit') ? 429 : 500)
    };

    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: errorResponse.status,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    );
  }
});
