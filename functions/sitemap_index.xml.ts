/**
 * Dynamic Sitemap Index for cuenti.to
 * Lists all sitemap files for 135k+ stories
 * Google limit: 50,000 URLs per sitemap file
 */

const SUPABASE_URL = "https://YOUR_SUPABASE_PROJECT_ID.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE";
const STORIES_PER_SITEMAP = 45000; // Stay under 50k limit

async function getStoryCount(): Promise<number> {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/stories?select=id&limit=1`,
    {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Prefer': 'count=exact',
        'Range': '0-0',
      },
    }
  );

  const contentRange = response.headers.get('content-range');
  if (contentRange) {
    const match = contentRange.match(/\/(\d+)$/);
    if (match) return parseInt(match[1], 10);
  }
  return 0;
}

export async function onRequest(context: { request: Request }): Promise<Response> {
  const totalStories = await getStoryCount();
  const sitemapCount = Math.ceil(totalStories / STORIES_PER_SITEMAP);
  const now = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://cuenti.to/sitemap-static.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`;

  for (let i = 1; i <= sitemapCount; i++) {
    xml += `
  <sitemap>
    <loc>https://cuenti.to/sitemap-stories-${i}.xml</loc>
    <lastmod>${now}</lastmod>
  </sitemap>`;
  }

  xml += `
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
