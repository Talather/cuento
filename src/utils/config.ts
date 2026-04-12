export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string;
export const getStorageUrl = (path: string) => `${SUPABASE_URL}/storage/v1/object/public/cuentito/${path}`;
export const DEFAULT_OG_IMAGE = getStorageUrl('images/logo-back.jpg');
export const getStoryImageUrl = (cuentito_uid: number, index = 0) => getStorageUrl(`images/${cuentito_uid}-${index}.jpg`);

export const getStoryFeaturedImage = (story: { image_url?: string | null; cuentito_uid?: number | null }) => {
  if (story.image_url) return story.image_url;
  if (story.cuentito_uid) return getStoryImageUrl(story.cuentito_uid);
  return DEFAULT_OG_IMAGE;
};

export const getStoryMiddleImages = (story: { middle_images?: string[] | null; cuentito_uid?: number | null }) => {
  if (story.middle_images && story.middle_images.length > 0) return story.middle_images;
  if (story.cuentito_uid) return [2, 3].map(num => getStoryImageUrl(story.cuentito_uid!, num));
  return [];
};
