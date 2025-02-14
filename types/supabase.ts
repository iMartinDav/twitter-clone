export interface StorageError {
  message: string
  statusCode: number
}

export interface UploadResponse {
  path: string
  publicUrl: string
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          username: string
          full_name: string
          avatar_url?: string
          bio?: string
          website?: string
          location?: string
          created_at: string
          cover_url?: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username: string
          full_name: string
          avatar_url?: string
          bio?: string
          website?: string
          location?: string
          created_at?: string
          cover_url?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string
          full_name?: string
          avatar_url?: string
          bio?: string
          website?: string
          location?: string
          created_at?: string
          cover_url?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
