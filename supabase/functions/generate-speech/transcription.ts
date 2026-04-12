
import { corsHeaders } from './cors.ts';

const SPEECH_REGION = 'eastus';

export async function transcribeAudio(audioBuffer: ArrayBuffer, subscriptionKey: string): Promise<Record<string, number>> {
  try {
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
      const errorText = await tokenResponse.text();
      console.error('Failed to get access token:', errorText);
      throw new Error('Failed to get access token for transcription');
    }

    const accessToken = await tokenResponse.text();
    console.log('Obtained access token for transcription');

    // Call Speech-to-Text API for transcription with word-level timing
    // Using the generated audio buffer directly
    console.log('Sending audio buffer to Speech-to-Text API, buffer size:', audioBuffer.byteLength);
    const transcriptionResponse = await fetch(
      `https://${SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=es-AR&format=detailed`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'audio/mp3',
          'Accept': 'application/json'
        },
        body: audioBuffer
      }
    );

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error('Failed to transcribe audio:', errorText);
      throw new Error('Failed to transcribe audio');
    }

    const transcriptionResult = await transcriptionResponse.json();
    console.log('Transcription result:', JSON.stringify(transcriptionResult));

    // Process transcription result to get word-level timing
    const markTimings: Record<string, number> = {};
    
    if (transcriptionResult.NBest && transcriptionResult.NBest[0]?.Words) {
      transcriptionResult.NBest[0].Words.forEach((word: any, index: number) => {
        markTimings[`mark_${index}`] = Math.round(word.Offset / 10000); // Convert from 100-nanosecond units to milliseconds
      });
    } else {
      console.log('No detailed word timing information found in transcription result');
      // If no word timing information is available, create fallback timings
      // This will space out the sentences based on the duration of the audio
      const recognition = transcriptionResult.RecognitionStatus === 'Success' ? 
        transcriptionResult.DisplayText : '';
      
      if (recognition) {
        const words = recognition.split(/\s+/);
        const approximateWordLength = 500; // Average word length in milliseconds
        
        words.forEach((word: string, index: number) => {
          markTimings[`mark_${index}`] = index * approximateWordLength;
        });
        
        console.log('Created fallback timing marks based on word count');
      }
    }

    return markTimings;
  } catch (error) {
    console.error('Error in transcription:', error);
    throw error;
  }
}
