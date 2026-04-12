
export interface ProfilesTable {
  Row: {
    id: string
    username: string | null
    avatar_url: string | null
    story_credits: number | null
    created_at: string
    updated_at: string
    wordpress_user_id: number | null
    login_provider: string | null
    imported_at: string | null
    first_name: string | null
    last_name: string | null
    country: string | null
    age: number | null
    is_teacher: boolean | null
    teaching_experience: number | null
    teaching_institutions: string[] | null
    teaching_levels: string[] | null
    favorite_genres: string[] | null
  }
  Insert: {
    id: string
    username?: string | null
    avatar_url?: string | null
    story_credits?: number | null
    created_at?: string
    updated_at?: string
    wordpress_user_id?: number | null
    login_provider?: string | null
    imported_at?: string | null
    first_name?: string | null
    last_name?: string | null
    country?: string | null
    age?: number | null
    is_teacher?: boolean | null
    teaching_experience?: number | null
    teaching_institutions?: string[] | null
    teaching_levels?: string[] | null
    favorite_genres?: string[] | null
  }
  Update: {
    id?: string
    username?: string | null
    avatar_url?: string | null
    story_credits?: number | null
    created_at?: string
    updated_at?: string
    wordpress_user_id?: number | null
    login_provider?: string | null
    imported_at?: string | null
    first_name?: string | null
    last_name?: string | null
    country?: string | null
    age?: number | null
    is_teacher?: boolean | null
    teaching_experience?: number | null
    teaching_institutions?: string[] | null
    teaching_levels?: string[] | null
    favorite_genres?: string[] | null
  }
}
