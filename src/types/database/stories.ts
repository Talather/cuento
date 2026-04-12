import { Json } from './auth';

export interface StoriesTable {
  Row: {
    id: string
    user_id: string | null
    prompt: string
    content: string
    created_at: string
    updated_at: string
    title: string
    raw_response: Json | null
    body: string
    image_url: string | null
    image_prompt: string | null
    tags: string | null
    synopsis: string | null
    likes: number
    anonymous_user_id: string | null
    wordpress_user_id: number | null
    cuentito_uid: number | null
    image_prompt1: string | null
    image_prompt2: string | null
    image_prompt3: string | null
    status: string
    final_image_url: string | null
    wordpress_slug: string | null
    wordpress_id: number | null
  }
  Insert: {
    id?: string
    user_id?: string | null
    prompt: string
    content: string
    created_at?: string
    updated_at?: string
    title?: string
    raw_response?: Json | null
    body: string
    image_url?: string | null
    image_prompt?: string | null
    tags?: string | null
    synopsis?: string | null
    likes?: number
    anonymous_user_id?: string | null
    wordpress_user_id?: number | null
    cuentito_uid?: number | null
    image_prompt1?: string | null
    image_prompt2?: string | null
    image_prompt3?: string | null
    status?: string
    final_image_url?: string | null
    wordpress_slug?: string | null
    wordpress_id?: number | null
  }
  Update: {
    id?: string
    user_id?: string | null
    prompt?: string
    content?: string
    created_at?: string
    updated_at?: string
    title?: string
    raw_response?: Json | null
    body?: string
    image_url?: string | null
    image_prompt?: string | null
    tags?: string | null
    synopsis?: string | null
    likes?: number
    anonymous_user_id?: string | null
    wordpress_user_id?: number | null
    cuentito_uid?: number | null
    image_prompt1?: string | null
    image_prompt2?: string | null
    image_prompt3?: string | null
    status?: string
    final_image_url?: string | null
    wordpress_slug?: string | null
    wordpress_id?: number | null
  }
}