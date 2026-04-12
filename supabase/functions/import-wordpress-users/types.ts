export interface GoogleToken {
  access_token: string
  expires_in: number
  scope: string
  token_type: string
  id_token: string
  created: number
}

export interface WordPressUser {
  id: number
  email: string
  username: string
  first_name: string | null
  last_name: string | null
  remaining_stories: number | null
  google_access_token: string | null
  fb_user_access_token: string | null
}

export interface ImportResults {
  success: number
  errors: { email: string; error: string; index: number }[]
  duplicates: { email: string; index: number; existingIn: 'input' | 'supabase' }[]
}