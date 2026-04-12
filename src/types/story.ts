
export interface Story {
  id: string;
  title: string;
  content?: string;
  body: string;
  prompt?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  anonymous_user_id?: string;
  image_url?: string;
  likes: number;
  synopsis?: string;
  tags?: string;
  cuentito_uid?: number;
  final_image_url?: string;
  middle_images?: string[] | null;
  status?: string;
}

export interface ImageGenerationService {
  generateImage: (prompt: string, userId?: string) => Promise<string | null>;
}
