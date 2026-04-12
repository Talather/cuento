export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      anonymous_users: {
        Row: {
          created_at: string
          id: string
          session_id: string
          stories_created: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          session_id: string
          stories_created?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          session_id?: string
          stories_created?: number | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          comments: string | null
          created_at: string
          email: string
          id: string
          illustration_rating: number
          name: string
          source: string | null
          story_id: string
          story_rating: number
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string
          email: string
          id?: string
          illustration_rating: number
          name: string
          source?: string | null
          story_id: string
          story_rating: number
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string
          email?: string
          id?: string
          illustration_rating?: number
          name?: string
          source?: string | null
          story_id?: string
          story_rating?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      image_generation_logs: {
        Row: {
          created_at: string
          id: string
          status: string
          timestamp: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id: string
          status: string
          timestamp: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          timestamp?: number
          user_id?: string | null
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
        }
        Relationships: []
      }
      processed_payments: {
        Row: {
          created_at: string
          credits_added: number
          id: string
          payment_id: string
          plan_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_added: number
          id?: string
          payment_id: string
          plan_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_added?: number
          id?: string
          payment_id?: string
          plan_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "processed_payments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processed_payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          country: string | null
          created_at: string
          favorite_genres: string[] | null
          first_name: string | null
          id: string
          imported_at: string | null
          is_teacher: boolean | null
          last_name: string | null
          login_provider: string | null
          story_credits: number | null
          teaching_experience: number | null
          teaching_institutions: string[] | null
          teaching_levels: string[] | null
          updated_at: string
          username: string | null
          wordpress_user_id: number | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          favorite_genres?: string[] | null
          first_name?: string | null
          id: string
          imported_at?: string | null
          is_teacher?: boolean | null
          last_name?: string | null
          login_provider?: string | null
          story_credits?: number | null
          teaching_experience?: number | null
          teaching_institutions?: string[] | null
          teaching_levels?: string[] | null
          updated_at?: string
          username?: string | null
          wordpress_user_id?: number | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          favorite_genres?: string[] | null
          first_name?: string | null
          id?: string
          imported_at?: string | null
          is_teacher?: boolean | null
          last_name?: string | null
          login_provider?: string | null
          story_credits?: number | null
          teaching_experience?: number | null
          teaching_institutions?: string[] | null
          teaching_levels?: string[] | null
          updated_at?: string
          username?: string | null
          wordpress_user_id?: number | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          anonymous_user_id: string | null
          body: string
          content: string | null
          created_at: string
          cuentito_uid: number | null
          final_image_url: string | null
          id: string
          image_prompt: string | null
          image_prompt0: string | null
          image_prompt1: string | null
          image_prompt2: string | null
          image_prompt3: string | null
          image_url: string | null
          likes: number
          middle_images: string[] | null
          prompt: string
          raw_response: Json | null
          status: string
          synopsis: string | null
          tags: string | null
          title: string
          updated_at: string
          user_id: string | null
          wordpress_id: number | null
          wordpress_slug: string | null
          wordpress_user_id: number | null
        }
        Insert: {
          anonymous_user_id?: string | null
          body: string
          content?: string | null
          created_at?: string
          cuentito_uid?: number | null
          final_image_url?: string | null
          id?: string
          image_prompt?: string | null
          image_prompt0?: string | null
          image_prompt1?: string | null
          image_prompt2?: string | null
          image_prompt3?: string | null
          image_url?: string | null
          likes?: number
          middle_images?: string[] | null
          prompt: string
          raw_response?: Json | null
          status?: string
          synopsis?: string | null
          tags?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
          wordpress_id?: number | null
          wordpress_slug?: string | null
          wordpress_user_id?: number | null
        }
        Update: {
          anonymous_user_id?: string | null
          body?: string
          content?: string | null
          created_at?: string
          cuentito_uid?: number | null
          final_image_url?: string | null
          id?: string
          image_prompt?: string | null
          image_prompt0?: string | null
          image_prompt1?: string | null
          image_prompt2?: string | null
          image_prompt3?: string | null
          image_url?: string | null
          likes?: number
          middle_images?: string[] | null
          prompt?: string
          raw_response?: Json | null
          status?: string
          synopsis?: string | null
          tags?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
          wordpress_id?: number | null
          wordpress_slug?: string | null
          wordpress_user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_anonymous_user_id_fkey"
            columns: ["anonymous_user_id"]
            isOneToOne: false
            referencedRelation: "anonymous_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_audio: {
        Row: {
          audio_url: string
          created_at: string
          format: string
          id: string
          srt_content: string | null
          status: string
          story_id: string
          updated_at: string
          voice_name: string
          word_timings: Json | null
        }
        Insert: {
          audio_url: string
          created_at?: string
          format?: string
          id?: string
          srt_content?: string | null
          status?: string
          story_id: string
          updated_at?: string
          voice_name?: string
          word_timings?: Json | null
        }
        Update: {
          audio_url?: string
          created_at?: string
          format?: string
          id?: string
          srt_content?: string | null
          status?: string
          story_id?: string
          updated_at?: string
          voice_name?: string
          word_timings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "story_audio_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_flags: {
        Row: {
          created_at: string
          id: string
          reason: string
          status: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          status?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          status?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_flags_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_flags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_likes: {
        Row: {
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_likes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_translations: {
        Row: {
          content: string
          created_at: string | null
          id: string
          language: string
          story_id: string
          synopsis: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          language: string
          story_id: string
          synopsis?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          language?: string
          story_id?: string
          synopsis?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_translations_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          id: string
          is_recurring: boolean
          name: string
          payment_link: string | null
          price: number
          price_usd: number
          story_credits: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_recurring?: boolean
          name: string
          payment_link?: string | null
          price: number
          price_usd?: number
          story_credits: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_recurring?: boolean
          name?: string
          payment_link?: string | null
          price?: number
          price_usd?: number
          story_credits?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          id: string
          mercadopago_payment_id: string | null
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mercadopago_payment_id?: string | null
          plan_id: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mercadopago_payment_id?: string | null
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          created_at: string
          id: string
          message_content: string
          phone_number: string
          status: string
          story_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_content: string
          phone_number: string
          status?: string
          story_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          message_content?: string
          phone_number?: string
          status?: string
          story_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_story_credits: {
        Args: { p_credits: number; p_user_id: string }
        Returns: undefined
      }
      check_is_admin: { Args: never; Returns: boolean }
      check_is_admin_internal: { Args: { user_id: string }; Returns: boolean }
      decrement_likes: { Args: { row_id: string }; Returns: number }
      get_cuentito_user_id: { Args: never; Returns: string }
      get_top_countries: {
        Args: { limit_count: number }
        Returns: {
          count: number
          country: string
        }[]
      }
      get_top_countries_last_week: {
        Args: { limit_count: number }
        Returns: {
          count: number
          country: string
        }[]
      }
      get_user_monthly_story_count: {
        Args: { user_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      import_stories_from_json: {
        Args: { stories_json: Json }
        Returns: {
          imported_count: number
          skipped_count: number
        }[]
      }
      increment_likes: { Args: { row_id: string }; Returns: number }
      sync_missing_profiles: {
        Args: never
        Returns: {
          errors: string[]
          profiles_created: number
        }[]
      }
      unaccent: { Args: { "": string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
