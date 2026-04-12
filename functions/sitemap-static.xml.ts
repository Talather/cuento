/**
 * Static pages sitemap for cuenti.to
 */

export async function onRequest(): Promise<Response> {
  const now = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: 'https://cuenti.to/', priority: '1.0', changefreq: 'daily' },
    { url: 'https://cuenti.to/login', priority: '0.5', changefreq: 'monthly' },
    { url: 'https://cuenti.to/terms-of-service', priority: '0.3', changefreq: 'yearly' },
    { url: 'https://cuenti.to/privacy-policy', priority: '0.3', changefreq: 'yearly' },
    { url: 'https://cuenti.to/contact', priority: '0.4', changefreq: 'monthly' },
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  for (const page of staticPages) {
    xml += `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }

  xml += `
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
