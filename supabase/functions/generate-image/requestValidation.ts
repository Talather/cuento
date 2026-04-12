// Input validation constants
const MAX_PROMPT_LENGTH = 2000;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Validate prompt format and length
export function validatePrompt(prompt: unknown): string {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Missing or invalid prompt');
  }
  
  const trimmed = prompt.trim();
  if (trimmed.length === 0) {
    throw new Error('Prompt cannot be empty');
  }
  
  if (trimmed.length > MAX_PROMPT_LENGTH) {
    throw new Error(`Prompt must be less than ${MAX_PROMPT_LENGTH} characters`);
  }
  
  // Basic sanitization - remove control characters
  return trimmed.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

// Validate requestId is a valid UUID
export function validateRequestId(requestId: unknown): string {
  if (!requestId || typeof requestId !== 'string') {
    throw new Error('Missing or invalid requestId');
  }
  
  if (!UUID_REGEX.test(requestId)) {
    throw new Error('requestId must be a valid UUID');
  }
  
  return requestId;
}

// Validate timestamp is a reasonable value
export function validateTimestamp(timestamp: unknown): number {
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp)) {
    throw new Error('Missing or invalid timestamp');
  }
  
  // Timestamp should be within the last hour and not in the future
  const now = Date.now();
  const oneHourAgo = now - (60 * 60 * 1000);
  const fiveMinutesFromNow = now + (5 * 60 * 1000);
  
  if (timestamp < oneHourAgo || timestamp > fiveMinutesFromNow) {
    throw new Error('Invalid timestamp - request too old or in the future');
  }
  
  return timestamp;
}

export const validateRequest = async (supabaseClient: any, userId: string | null, requestId: string, timestamp: number) => {
  try {
    // Check if this request has already been processed
    const { data: existingRequest } = await supabaseClient
      .from('image_generation_logs')
      .select('id')
      .eq('id', requestId)
      .single();

    if (existingRequest) {
      throw new Error('DUPLICATE_REQUEST');
    }

    // TEMPORARILY DISABLED: No rate limiting for now
    // This will allow unlimited requests for testing purposes
  } catch (error: any) {
    // Sanitize error messages
    if (error.message === 'DUPLICATE_REQUEST') {
      throw new Error('This request has already been processed');
    }
    
    // Generic error for any other cases
    throw new Error('Failed to validate request');
  }
};

export const logRequest = async (supabaseClient: any, requestId: string, userId: string | null, timestamp: number) => {
  await supabaseClient
    .from('image_generation_logs')
    .insert({
      id: requestId,
      user_id: userId,
      timestamp: timestamp,
      status: 'processing'
    });
};
