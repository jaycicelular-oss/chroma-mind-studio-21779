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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      album_items: {
        Row: {
          album_id: string
          content_id: string
          content_type: string
          created_at: string
          id: string
        }
        Insert: {
          album_id: string
          content_id: string
          content_type: string
          created_at?: string
          id?: string
        }
        Update: {
          album_id?: string
          content_id?: string
          content_type?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "album_items_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "albums"
            referencedColumns: ["id"]
          },
        ]
      }
      albums: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      characters: {
        Row: {
          age: number | null
          body_type: string | null
          breast_size: string | null
          butt_size: string | null
          created_at: string | null
          eye_color: string | null
          facial_details: string | null
          facial_expression: string | null
          family_name: string | null
          gender: Database["public"]["Enums"]["character_gender"]
          hair_color: string | null
          hair_length: string | null
          hair_type: string | null
          height: number | null
          id: string
          musculature: string | null
          name: string
          personality: string | null
          updated_at: string | null
          user_id: string
          voice: string | null
        }
        Insert: {
          age?: number | null
          body_type?: string | null
          breast_size?: string | null
          butt_size?: string | null
          created_at?: string | null
          eye_color?: string | null
          facial_details?: string | null
          facial_expression?: string | null
          family_name?: string | null
          gender: Database["public"]["Enums"]["character_gender"]
          hair_color?: string | null
          hair_length?: string | null
          hair_type?: string | null
          height?: number | null
          id?: string
          musculature?: string | null
          name: string
          personality?: string | null
          updated_at?: string | null
          user_id: string
          voice?: string | null
        }
        Update: {
          age?: number | null
          body_type?: string | null
          breast_size?: string | null
          butt_size?: string | null
          created_at?: string | null
          eye_color?: string | null
          facial_details?: string | null
          facial_expression?: string | null
          family_name?: string | null
          gender?: Database["public"]["Enums"]["character_gender"]
          hair_color?: string | null
          hair_length?: string | null
          hair_type?: string | null
          height?: number | null
          id?: string
          musculature?: string | null
          name?: string
          personality?: string | null
          updated_at?: string | null
          user_id?: string
          voice?: string | null
        }
        Relationships: []
      }
      generated_frames: {
        Row: {
          character_id: string | null
          created_at: string
          frame_urls: string[]
          id: string
          prompt: string
          saved: boolean | null
          user_id: string
        }
        Insert: {
          character_id?: string | null
          created_at?: string
          frame_urls: string[]
          id?: string
          prompt: string
          saved?: boolean | null
          user_id: string
        }
        Update: {
          character_id?: string | null
          created_at?: string
          frame_urls?: string[]
          id?: string
          prompt?: string
          saved?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_frames_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      generated_gifs: {
        Row: {
          aspect_ratio: string
          created_at: string
          gif_url: string
          id: string
          prompt: string
          quality: string
          saved: boolean | null
          style: string
          user_id: string
        }
        Insert: {
          aspect_ratio: string
          created_at?: string
          gif_url: string
          id?: string
          prompt: string
          quality: string
          saved?: boolean | null
          style: string
          user_id: string
        }
        Update: {
          aspect_ratio?: string
          created_at?: string
          gif_url?: string
          id?: string
          prompt?: string
          quality?: string
          saved?: boolean | null
          style?: string
          user_id?: string
        }
        Relationships: []
      }
      generated_images: {
        Row: {
          aspect_ratio: string
          created_at: string
          id: string
          image_url: string
          prompt: string
          quality: string
          saved: boolean | null
          style: string
          user_id: string | null
        }
        Insert: {
          aspect_ratio: string
          created_at?: string
          id?: string
          image_url: string
          prompt: string
          quality: string
          saved?: boolean | null
          style: string
          user_id?: string | null
        }
        Update: {
          aspect_ratio?: string
          created_at?: string
          id?: string
          image_url?: string
          prompt?: string
          quality?: string
          saved?: boolean | null
          style?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      character_gender: "male" | "female"
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
      character_gender: ["male", "female"],
    },
  },
} as const
