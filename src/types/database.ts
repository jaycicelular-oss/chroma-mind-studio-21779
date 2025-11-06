// Temporary types until Supabase types are synced
export interface Database {
  public: {
    Tables: {
      albums: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      album_items: {
        Row: {
          id: string;
          album_id: string;
          content_id: string;
          content_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          album_id: string;
          content_id: string;
          content_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          album_id?: string;
          content_id?: string;
          content_type?: string;
          created_at?: string;
        };
      };
      characters: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          family_name: string | null;
          gender: 'male' | 'female';
          age: number | null;
          personality: string | null;
          height: number | null;
          voice: string | null;
          hair_type: string | null;
          hair_length: string | null;
          hair_color: string | null;
          eye_color: string | null;
          facial_expression: string | null;
          facial_details: string | null;
          body_type: string | null;
          breast_size: string | null;
          butt_size: string | null;
          musculature: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          family_name?: string | null;
          gender: 'male' | 'female';
          age?: number | null;
          personality?: string | null;
          height?: number | null;
          voice?: string | null;
          hair_type?: string | null;
          hair_length?: string | null;
          hair_color?: string | null;
          eye_color?: string | null;
          facial_expression?: string | null;
          facial_details?: string | null;
          body_type?: string | null;
          breast_size?: string | null;
          butt_size?: string | null;
          musculature?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          family_name?: string | null;
          gender?: 'male' | 'female';
          age?: number | null;
          personality?: string | null;
          height?: number | null;
          voice?: string | null;
          hair_type?: string | null;
          hair_length?: string | null;
          hair_color?: string | null;
          eye_color?: string | null;
          facial_expression?: string | null;
          facial_details?: string | null;
          body_type?: string | null;
          breast_size?: string | null;
          butt_size?: string | null;
          musculature?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      generated_frames: {
        Row: {
          id: string;
          user_id: string;
          character_id: string | null;
          prompt: string;
          frame_urls: string[];
          saved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          character_id?: string | null;
          prompt: string;
          frame_urls: string[];
          saved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          character_id?: string | null;
          prompt?: string;
          frame_urls?: string[];
          saved?: boolean;
          created_at?: string;
        };
      };
      generated_gifs: {
        Row: {
          id: string;
          user_id: string;
          prompt: string;
          style: string;
          aspect_ratio: string;
          quality: string;
          gif_url: string;
          saved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt: string;
          style: string;
          aspect_ratio: string;
          quality: string;
          gif_url: string;
          saved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          prompt?: string;
          style?: string;
          aspect_ratio?: string;
          quality?: string;
          gif_url?: string;
          saved?: boolean;
          created_at?: string;
        };
      };
      generated_images: {
        Row: {
          id: string;
          user_id: string;
          prompt: string;
          style: string;
          aspect_ratio: string;
          quality: string;
          image_url: string;
          saved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt: string;
          style: string;
          aspect_ratio: string;
          quality: string;
          image_url: string;
          saved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          prompt?: string;
          style?: string;
          aspect_ratio?: string;
          quality?: string;
          image_url?: string;
          saved?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
