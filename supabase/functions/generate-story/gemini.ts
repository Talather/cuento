
import { MAX_RETRIES, INITIAL_RETRY_DELAY, REPLICATE_API_URL } from './config.ts';

const POLL_INTERVAL = 3000;
const MAX_POLL_TIME = 120000;

interface StoryResponse {
  title: string;
  content: string;
  synopsis: string;
  tags: string[];
  image_prompts: {
    featured: string;
    middle1: string;
    middle2: string;
  };
}

const getSystemPrompt = () => {
  return `You are a children's story writer who writes engaging stories in Spanish. 
You must return responses ONLY as valid JSON objects with no additional text or formatting.
The JSON must have this exact structure:
{
  "title": "The story's title in Spanish",
  "content": "The full story content in Spanish",
  "synopsis": "A brief 2-3 sentence summary of the story in Spanish",
  "image_prompts": {
    "featured": "A detailed prompt to generate a featured illustration for this story",
    "middle1": "A detailed prompt to generate the first middle illustration for this story",
    "middle2": "A detailed prompt to generate the second middle illustration for this story"
  },
  "tags": ["tag1", "tag2", "tag3"]
}`;
};

const formatUserPrompt = (prompt: string) => {
  return `Write a children's story based on this prompt: ${prompt}.

Requirements:
- Make the title creative and engaging in Spanish
- Make the story engaging and appropriate for children
- Keep the story content EXACTLY around 1000 words
- Write a concise synopsis that captures the main plot points in Spanish
- For image_prompts, write detailed descriptions in English that would work well as children's book illustrations
- Each image prompt should be unique and represent a different scene from the story
- Include 3-5 relevant tags/keywords from the story in Spanish

IMPORTANT: Return ONLY the JSON object, no additional text, markdown, or formatting.
IMPORTANT: Make sure to escape any special characters in the JSON strings.`;
};

const extractJsonFromText = (text: string): string => {
  let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('No JSON object found in response');
  }
  return cleaned.slice(start, end + 1);
};

const validateStoryResponse = (data: any): data is StoryResponse => {
  return (
    typeof data === 'object' &&
    typeof data.title === 'string' &&
    typeof data.content === 'string' &&
    typeof data.synopsis === 'string' &&
    Array.isArray(data.tags) &&
    typeof data.image_prompts === 'object' &&
    typeof data.image_prompts.featured === 'string' &&
    typeof data.image_prompts.middle1 === 'string' &&
    typeof data.image_prompts.middle2 === 'string'
  );
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function waitForPrediction(predictionUrl: string, apiKey: string): Promise<any> {
  let elapsed = 0;
  while (elapsed < MAX_POLL_TIME) {
    await sleep(POLL_INTERVAL);
    elapsed += POLL_INTERVAL;
    const resp = await fetch(predictionUrl, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!resp.ok) throw new Error(`Poll failed: ${resp.status}`);
    const data = await resp.json();
    console.log(`Waiting... ${data.status} (${(elapsed / 1000).toFixed(0)}s)`);
    if (data.status === 'succeeded') return data;
    if (data.status === 'failed' || data.status === 'canceled') {
      throw new Error(`Prediction ${data.status}: ${data.error || 'Unknown error'}`);
    }
  }
  throw new Error(`Prediction timed out after ${MAX_POLL_TIME / 1000}s`);
}

export const callGeminiAPI = async (prompt: string, apiKey: string): Promise<StoryResponse> => {
  let currentDelay = INITIAL_RETRY_DELAY;
  const combinedPrompt = `${getSystemPrompt()}\n\n---\n\n${formatUserPrompt(prompt)}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt}: creating Replicate prediction...`);

      const response = await fetch(REPLICATE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Prefer': 'wait',
        },
        body: JSON.stringify({
          input: {
            prompt: combinedPrompt,
            temperature: 0.8,
            top_p: 0.95,
            max_output_tokens: 65535,
            // thinking_level: 'high',
            thinking_level: 'medium',
          }
        }),
      });

      if (!response.ok && response.status !== 202) {
        const errorText = await response.text();
        if (response.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
        if (response.status === 401 || response.status === 402) throw new Error('Auth failed. Check REPLICATE_API_TOKEN.');
        throw new Error(`Replicate API error: ${response.status} - ${errorText}`);
      }

      let data = await response.json();
      console.log('Prediction status:', data.status);

      if (data.status !== 'succeeded') {
        const pollUrl = data.urls?.get;
        if (!pollUrl) throw new Error('No poll URL in response');
        console.log('Model still loading, waiting for completion...');
        data = await waitForPrediction(pollUrl, apiKey);
      }

      const rawText = Array.isArray(data.output) ? data.output.join('') : data.output;
      if (!rawText) throw new Error('Empty response from Replicate');

      console.log('Output length:', rawText.length, 'chars');
      const jsonText = extractJsonFromText(rawText);
      const parsedData = JSON.parse(jsonText);

      if (!validateStoryResponse(parsedData)) {
        throw new Error('Invalid story response format');
      }

      return parsedData;
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === MAX_RETRIES) throw error;
      await sleep(currentDelay);
      currentDelay *= 2;
    }
  }

  throw new Error('Failed to generate story after all retries');
};
