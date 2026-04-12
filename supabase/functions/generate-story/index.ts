import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./config.ts";
import { callGeminiAPI } from "./gemini.ts";

const MIN_PROMPT_LENGTH = 3;
const MAX_PROMPT_LENGTH = 2000;

function validatePrompt(prompt: unknown): string {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Invalid or missing prompt');
  }
  
  const trimmedPrompt = prompt.trim();
  
  if (trimmedPrompt.length < MIN_PROMPT_LENGTH) {
    throw new Error(`Prompt must be at least ${MIN_PROMPT_LENGTH} characters`);
  }
  
  if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    throw new Error(`Prompt must be less than ${MAX_PROMPT_LENGTH} characters`);
  }
  
  const sanitizedPrompt = trimmedPrompt.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitizedPrompt;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('REPLICATE_API_TOKEN');
    if (!apiKey) {
      throw new Error('REPLICATE_API_TOKEN environment variable not set');
    }

    const body = await req.json();
    const prompt = validatePrompt(body.prompt);

    console.log('Generating story for prompt:', prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''));
    const storyData = await callGeminiAPI(prompt, apiKey);
    console.log('Story generated successfully');

    return new Response(
      JSON.stringify({ data: storyData }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error in generate-story function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const isValidationError = errorMessage.includes('Prompt must be') || errorMessage.includes('Invalid');
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      { 
        status: isValidationError ? 400 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
