
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const REPLICATE_IMAGE_API_URL = 'https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions';

export const generateImageWithGemini = async (prompt: string): Promise<{ imageURL: string; taskUUID: string }> => {
  const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!REPLICATE_API_TOKEN) throw new Error('REPLICATE_API_TOKEN not configured');
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error('Supabase credentials not configured');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  console.log('Step 1: Calling Replicate for image, prompt:', prompt.substring(0, 80));

  const response = await fetch(REPLICATE_IMAGE_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
      'Content-Type': 'application/json',
      'Prefer': 'wait',
    },
    body: JSON.stringify({
      input: {
        prompt: `Colorful children's book illustration, vibrant watercolor style, kid-friendly, detailed: ${prompt}`,
        num_outputs: 1,
        aspect_ratio: '1:1',
        output_format: 'png',
      }
    }),
  });

  console.log('Step 2: Replicate HTTP', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Replicate error:', response.status, errorText);
    if (response.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
    if (response.status === 401 || response.status === 402) throw new Error('Auth failed. Check REPLICATE_API_TOKEN.');
    throw new Error(`Replicate API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('Step 3: Prediction status:', data.status);

  if (data.status !== 'succeeded') {
    throw new Error(`Image prediction ${data.status}. Try again.`);
  }

  const outputUrls = data.output;
  if (!outputUrls || !Array.isArray(outputUrls) || outputUrls.length === 0) {
    throw new Error('No image data in response');
  }

  const replicateImageUrl = outputUrls[0];
  console.log('Step 4: Downloading image from Replicate...');

  const imageResponse = await fetch(replicateImageUrl);
  if (!imageResponse.ok) {
    throw new Error(`Failed to download image: ${imageResponse.status}`);
  }

  const imageData = new Uint8Array(await imageResponse.arrayBuffer());
  console.log('Step 5: Downloaded', imageData.length, 'bytes');

  const taskUUID = crypto.randomUUID();
  const fileName = `images/${taskUUID}.png`;

  console.log('Step 6: Uploading to storage bucket cuentito/', fileName);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('cuentito')
    .upload(fileName, imageData, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) {
    console.error('Step 6 FAILED:', JSON.stringify(uploadError));
    throw new Error(`Storage upload failed: ${uploadError.message}`);
  }

  console.log('Step 7: Upload success:', JSON.stringify(uploadData));

  const { data: publicUrlData } = supabase.storage
    .from('cuentito')
    .getPublicUrl(fileName);

  const generatedImageURL = publicUrlData.publicUrl;
  console.log('Step 8: Public URL:', generatedImageURL);

  return { imageURL: generatedImageURL, taskUUID };
};
