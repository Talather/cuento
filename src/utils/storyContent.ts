import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_URL } from "./config";

export const cleanStoryContent = (content: string): string => {
  const jsonPattern = /^\s*\{[\s\S]*\}\s*$/;
  if (jsonPattern.test(content)) {
    try {
      const parsed = JSON.parse(content);
      return parsed.content || content;
    } catch (e) {
      return content;
    }
  }
  return content;
};

export const sendStoryByEmail = async (storyId: string, userId: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No authenticated session found');
  }

  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/send-email-story`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ storyId, userId })
    }
  );

  if (!response.ok) {
    console.error('Error sending story email:', await response.text());
    throw new Error('Failed to send story email');
  }

  return response.json();
};

export const parseStoryResponse = (storyResponse: any) => {
  try {
    if (typeof storyResponse === 'object' && storyResponse.data) {
      return storyResponse.data;
    }
    
    if (typeof storyResponse === 'string') {
      const jsonMatch = storyResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid story format');
      }
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error parsing story:', error);
    throw new Error('Failed to parse story response');
  }
};
