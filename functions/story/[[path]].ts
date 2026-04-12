interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

interface Story {
  id: string;
  title: string;
  body: string;
  prompt: string;
  synopsis?: string;
  image_url?: string;
  created_at: string;
  cuentito_uid?: number;
  final_image_url?: string;
  tags?: string;
}

function isBotRequest(userAgent: string): boolean {
  const botUserAgents = [
    'googlebot',
    'bingbot',
    'slurp',
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'facebookexternalhit',
    'twitterbot',
    'rogerbot',
    'linkedinbot',
    'embedly',
    'quora link preview',
    'showyoubot',
    'outbrain',
    'pinterest/0.',
    'developers.google.com/+/web/snippet',
    'slackbot',
    'vkshare',
    'w3c_validator',
    'redditbot',
    'applebot',
    'whatsapp',
    'flipboard',
    'tumblr',
    'bitlybot',
    'skypeuripreview',
    'nuzzel',
    'discordbot',
    'google page speed',
    'qwantify',
  ];
  
  const lowerUserAgent = userAgent.toLowerCase();
  return botUserAgents.some(bot => lowerUserAgent.includes(bot));
}

function extractStoryInfo(pathname: string): { slug?: string; id?: string } {
  const match = pathname.match(/^\/story\/([^\/]+)\/([a-f0-9-]+)$/i);
  if (match) {
    return { slug: match[1], id: match[2] };
  }
  return {};
}

async function fetchStoryFromSupabase(id: string): Promise<Story | null> {
  const SUPABASE_URL = "https://YOUR_SUPABASE_PROJECT_ID.supabase.co";
  const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE";

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/stories?id=eq.${id}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching story from Supabase:', error);
    return null;
  }
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

function generateStoryHTML(story: Story): string {
  const canonicalUrl = `https://cuenti.to/story/${createSlug(story.title)}/${story.id}`;
  const featuredImageUrl = story.cuentito_uid 
    ? `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/storage/v1/object/public/cuentito/images/${story.cuentito_uid}-0.jpg`
    : story.image_url || 'https://YOUR_SUPABASE_PROJECT_ID.supabase.co/storage/v1/object/public/cuentito/images/logo-back.jpg';

  const description = story.synopsis || `Lee "${story.title}" en Cuenti.to - Cuentos escritos por vos junto a una IA`;
  const publishDate = new Date(story.created_at).toISOString();

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${story.title} | Cuenti.to</title>
    <meta name="description" content="${description}">
    <link rel="canonical" href="${canonicalUrl}">
    
    <!-- Open Graph tags -->
    <meta property="og:title" content="${story.title} | Cuenti.to">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="${featuredImageUrl}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Cuenti.to">
    <meta property="article:published_time" content="${publishDate}">
    
    <!-- Twitter Card tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:site" content="@Cuenti_to">
    <meta name="twitter:title" content="${story.title} | Cuenti.to">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${featuredImageUrl}">
    
    <!-- Schema.org structured data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "${story.title}",
      "description": "${description}",
      "image": "${featuredImageUrl}",
      "author": {
        "@type": "Organization",
        "name": "Cuenti.to"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Cuenti.to",
        "logo": {
          "@type": "ImageObject",
          "url": "https://YOUR_SUPABASE_PROJECT_ID.supabase.co/storage/v1/object/public/cuentito/images/logo-back.jpg"
        }
      },
      "datePublished": "${publishDate}",
      "url": "${canonicalUrl}"
    }
    </script>
</head>
<body>
    <article>
        <header>
            <h1>${story.title}</h1>
            ${story.synopsis ? `<p><em>${story.synopsis}</em></p>` : ''}
            <p><strong>Basado en:</strong> ${story.prompt}</p>
            ${featuredImageUrl ? `<img src="${featuredImageUrl}" alt="${story.title}" style="max-width: 100%; height: auto;">` : ''}
        </header>
        <main>
            <div>${story.body.split('\n').map(paragraph => `<p>${paragraph}</p>`).join('')}</div>
        </main>
        ${story.tags ? `<footer><p><strong>Etiquetas:</strong> ${story.tags}</p></footer>` : ''}
    </article>
    
    <noscript>
        <p>Para la experiencia completa, visita <a href="${canonicalUrl}">cuenti.to</a></p>
    </noscript>
</body>
</html>`;
}

export async function onRequest(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;
  const url = new URL(request.url);
  const userAgent = request.headers.get('User-Agent') || '';

  // Check if it's a bot request
  if (isBotRequest(userAgent)) {
    const { id } = extractStoryInfo(url.pathname);
    
    if (id) {
      const story = await fetchStoryFromSupabase(id);
      
      if (story) {
        const html = generateStoryHTML(story);
        return new Response(html, {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
          },
        });
      }
    }
  }

  // For non-bot requests or when story is not found, serve the SPA
  return env.ASSETS.fetch(request);
}