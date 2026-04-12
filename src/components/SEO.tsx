import { DEFAULT_OG_IMAGE } from "@/utils/config";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export const SEO = ({ 
  title = "Cuenti.to | Cuentos escritos por vos junto a una IA",
  description = "Crea cuentos únicos y personalizados con la ayuda de inteligencia artificial",
  image = DEFAULT_OG_IMAGE,
  url = "https://cuenti.to"
}: SEOProps) => {
  const currentUrl = window.location.href;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url || currentUrl} />
      
      {/* Open Graph tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url || currentUrl} />
      <meta property="og:type" content="website" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </>
  );
};
