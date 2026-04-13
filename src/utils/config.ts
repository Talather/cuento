export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;
export const getStorageUrl = (path: string) => `${SUPABASE_URL}/storage/v1/object/public/cuentito/${path}`;

const OLD_SUPABASE_STORAGE = 'https://hsurewyezgonqioeygur.supabase.co/storage/v1/object/public/cuentito';
export const DEFAULT_OG_IMAGE = `${OLD_SUPABASE_STORAGE}/images/logo-back.jpg`;

// Inline SVG placeholder — never fails, no remote dependency
export const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%237c3aed'/%3E%3Cstop offset='100%25' stop-color='%23a78bfa'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='400' height='300'/%3E%3Ctext x='200' y='150' text-anchor='middle' dominant-baseline='central' fill='white' font-family='system-ui' font-size='48'%3E📖%3C/text%3E%3C/svg%3E";

export const getStoryFeaturedImage = (story: { image_url?: string | null; cuentito_uid?: number | null }) => {
  if (story.image_url) return story.image_url;
  return null;
};

export const getStoryMiddleImages = (story: { middle_images?: string[] | null; cuentito_uid?: number | null }) => {
  if (story.middle_images && story.middle_images.length > 0) return story.middle_images;
  return [];
};
