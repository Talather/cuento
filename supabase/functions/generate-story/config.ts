
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const REPLICATE_API_URL = 'https://api.replicate.com/v1/models/google/gemini-3.1-pro/predictions';
export const MAX_RETRIES = 3;
export const INITIAL_RETRY_DELAY = 1000;
