
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from './cors.ts';
import { generateSpeech } from './audioGeneration.ts';
import { transcribeAudio } from './transcription.ts';
import { createNetflixStyleSRT } from './srtGenerator.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { storyId, text, voice = 'es-AR-ElenaNeural' } = await req.json();

    if (!storyId || !text) {
      throw new Error('Story ID and text are required');
    }

    const SUBSCRIPTION_KEY = Deno.env.get('MICROSOFT_SPEECH_SUBSCRIPTION_KEY');
    if (!SUBSCRIPTION_KEY) {
      throw new Error('Microsoft Speech subscription key is not configured');
    }

    // Step 1: Generate the audio with selected voice
    console.log('Generating speech audio with voice:', voice);
    const audioData = await generateSpeech(text, SUBSCRIPTION_KEY, voice);
    console.log('Audio generation complete. Audio size:', audioData.byteLength);

    // Step 2: Generate transcription and timing information using the generated audio
    console.log('Starting transcription process on the generated audio...');
    const markTimings = await transcribeAudio(audioData, SUBSCRIPTION_KEY);
    console.log('Transcription completed with timings:', JSON.stringify(markTimings));

    // Split text into sentences and clean them
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Generate SRT content using transcription timings
    const srtContent = createNetflixStyleSRT(sentences, markTimings);
    console.log('Generated SRT content:', srtContent);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Upload audio file
    const fileName = `${storyId}.mp3`;
    const { error: uploadError } = await supabaseClient
      .storage
      .from('cuentito')
      .upload(`audio/${fileName}`, audioData, {
        contentType: 'audio/mpeg',
        cacheControl: '31536000',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Failed to upload audio: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('cuentito')
      .getPublicUrl(`audio/${fileName}`);

    // Update story_audio record
    const { data: existingAudio } = await supabaseClient
      .from('story_audio')
      .select('id')
      .eq('story_id', storyId)
      .maybeSingle();

    if (existingAudio) {
      const { error: updateError } = await supabaseClient
        .from('story_audio')
        .update({
          audio_url: publicUrl,
          srt_content: srtContent,
          updated_at: new Date().toISOString()
        })
        .eq('story_id', storyId);

      if (updateError) {
        throw new Error(`Failed to update database: ${updateError.message}`);
      }
    } else {
      const { error: insertError } = await supabaseClient
        .from('story_audio')
        .insert({
          story_id: storyId,
          audio_url: publicUrl,
          srt_content: srtContent,
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        throw new Error(`Failed to insert into database: ${insertError.message}`);
      }
    }

    return new Response(
      JSON.stringify({ 
        url: publicUrl,
        srtContent: srtContent
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
