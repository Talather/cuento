import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { createSlug } from '../_shared/slugUtils.ts'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const STORIES_PER_SITEMAP = 10000; // Increased to reduce number of sitemaps

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface Story {
  id: string;
  title: string;
  created_at: string;
}

async function generateSitemapIndex(sitemapCount: number): Promise<string> {
  const sitemaps = Array.from({ length: sitemapCount }, (_, i) => `
  <sitemap>
    <loc>https://cuenti.to/sitemap-stories-${i + 1}.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://cuenti.to/sitemap-static.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>${sitemaps}
</sitemapindex>`;
}

async function generateStorySitemap(stories: Story[], index: number): Promise<string> {
  const storyUrls = stories.map((story: Story) => `
  <url>
    <loc>https://cuenti.to/story/${createSlug(story.title)}/${story.id}</loc>
    <lastmod>${new Date(story.created_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${storyUrls}
</urlset>`;
}

async function generateStaticSitemap(): Promise<string> {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://cuenti.to/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://cuenti.to/story/new</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://cuenti.to/library</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://cuenti.to/search</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://cuenti.to/contact</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://cuenti.to/terms-of-service</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://cuenti.to/privacy-policy</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting sitemap update...');
    
    // Fetch all stories count first
    const { count: totalStories, error: countError } = await supabase
      .from('stories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    if (countError) {
      console.error('Count error:', countError);
      throw countError;
    }

    console.log(`Total published stories: ${totalStories}`);
    const sitemapCount = Math.ceil((totalStories || 0) / STORIES_PER_SITEMAP);

    // Generate and upload static sitemap
    const staticSitemap = await generateStaticSitemap();
    const { error: staticError } = await supabase.storage
      .from('cuentito')
      .upload('sitemap-static.xml', staticSitemap, {
        contentType: 'application/xml',
        upsert: true
      });

    if (staticError) {
      console.error('Static sitemap upload error:', staticError);
      throw staticError;
    }
    console.log('Static sitemap uploaded');

    // Generate and upload story sitemaps
    for (let i = 0; i < sitemapCount; i++) {
      const { data: stories, error } = await supabase
        .from('stories')
        .select('id, title, created_at')
        .eq('status', 'published')
        .range(i * STORIES_PER_SITEMAP, (i + 1) * STORIES_PER_SITEMAP - 1)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Stories fetch error for batch ${i}:`, error);
        throw error;
      }

      const storySitemap = await generateStorySitemap(stories, i + 1);
      const { error: uploadError } = await supabase.storage
        .from('cuentito')
        .upload(`sitemap-stories-${i + 1}.xml`, storySitemap, {
          contentType: 'application/xml',
          upsert: true
        });

      if (uploadError) {
        console.error(`Story sitemap ${i + 1} upload error:`, uploadError);
        throw uploadError;
      }
      console.log(`Story sitemap ${i + 1} uploaded`);
    }

    // Generate and upload sitemap index
    const sitemapIndex = await generateSitemapIndex(sitemapCount);
    const { error: indexError } = await supabase.storage
      .from('cuentito')
      .upload('sitemap.xml', sitemapIndex, {
        contentType: 'application/xml',
        upsert: true
      });

    if (indexError) {
      console.error('Sitemap index upload error:', indexError);
      throw indexError;
    }
    console.log('Sitemap index uploaded');

    return new Response(
      JSON.stringify({ 
        message: 'Sitemaps updated successfully',
        totalSitemaps: sitemapCount + 1 // Including static sitemap
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating sitemaps:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});