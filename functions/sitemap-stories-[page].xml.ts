/**
 * Dynamic story sitemap for cuenti.to
 * Each page contains up to 45,000 stories
 * URL pattern: /sitemap-stories-1.xml, /sitemap-stories-2.xml, etc.
 */

const SUPABASE_URL = "https://YOUR_SUPABASE_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE";
const STORIES_PER_SITEMAP = 45000;
const BATCH_SIZE = 1000; // Supabase max per request

interface Story {
  id: string;
  title: string;
  created_at: string;
}

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[áàäâ]/g, 'a')
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function fetchStoriesBatch(offset: number, limit: number): Promise<Story[]> {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/stories?select=id,title,created_at&order=created_at.asc&limit=${limit}&offset=${offset}`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Accept': 'application/json',
      },
    }
  );

  if (!response.ok) return [];
  return response.json();
}

export async function onRequest(context: { request: Request; params: { page: string } }): Promise<Response> {
  const pageStr = context.params.page?.replace('.xml', '');
  const page = parseInt(pageStr, 10);

  if (isNaN(page) || page < 1) {
    return new Response('Not found', { status: 404 });
  }

  const startOffset = (page - 1) * STORIES_PER_SITEMAP;

  // Fetch stories in batches
  let allStories: Story[] = [];
  let offset = startOffset;
  const maxOffset = startOffset + STORIES_PER_SITEMAP;

  while (offset < maxOffset) {
    const batchLimit = Math.min(BATCH_SIZE, maxOffset - offset);
    const batch = await fetchStoriesBatch(offset, batchLimit);

    if (batch.length === 0) break;
    allStories = allStories.concat(batch);
    offset += batch.length;

    if (batch.length < batchLimit) break;
  }

  if (allStories.length === 0) {
    return new Response('Not found', { status: 404 });
  }

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  for (const story of allStories) {
    const slug = createSlug(story.title);
    const lastmod = story.created_at
      ? new Date(story.created_at).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    xml += `
  <url>
    <loc>https://cuenti.to/story/${escapeXml(slug)}/${story.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  }

  xml += `
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // Cache 24h
    },
  });
}
