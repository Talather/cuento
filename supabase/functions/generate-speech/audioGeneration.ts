
import { corsHeaders } from './cors.ts';

const SPEECH_REGION = 'eastus';

export async function generateSpeech(text: string, subscriptionKey: string, voice: string = 'es-AR-ElenaNeural'): Promise<ArrayBuffer> {
  // Get access token for Speech Services
  const tokenResponse = await fetch(
    `https://${SPEECH_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
    {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
      },
    }
  );

  if (!tokenResponse.ok) {
    throw new Error('Failed to get access token for speech generation');
  }

  const accessToken = await tokenResponse.text();

  // Generate clean audio without SSML markers
  const ssml = `
    <speak version='1.0' xml:lang='es-AR'>
      <voice name='${voice}'>
        <prosody rate="0.95">
          ${text}
        </prosody>
      </voice>
    </speak>
  `;

  const response = await fetch(
    `https://${SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
        'User-Agent': 'Cuentito'
      },
      body: ssml,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('TTS API error:', errorText);
    throw new Error('Failed to generate speech');
  }

  return response.arrayBuffer();
}
