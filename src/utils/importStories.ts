import { supabase } from "@/integrations/supabase/client";

type ImportResult = {
  imported_count: number;
  skipped_count: number;
}

export const testImportStories = async (): Promise<ImportResult> => {
  try {
    // console.log('Starting import process...');
    
    // Call our edge function to handle the fetch
    const { data, error } = await supabase.functions.invoke('fetch-stories', {
      body: { url: 'https://cuenti.to/wp-content/uploads/all-posts-export.json' }
    });

    if (error) {
      console.error('Import error:', error);
      throw error;
    }

    // The function returns the import result directly
    return data as ImportResult;
  } catch (err) {
    console.error('Failed to import stories:', err);
    throw err;
  }
};
