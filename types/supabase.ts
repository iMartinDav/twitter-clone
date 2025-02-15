import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

export interface StorageError {
  message: string
  statusCode: number
}

export interface UploadResponse {
  path: string
  publicUrl: string
}

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      likes: {
        Row: {
          id: string
          tweet_id: string
          user_id: string
          created_at?: string
        }
        Insert: {
          id?: string
          tweet_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          tweet_id?: string
          user_id?: string
          created_at?: string
        }
      }
      tweets: {
        Row: {
          id: string
          content: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          content: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          created_at?: string
        }
      }
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

export type DatabaseTweet = Database['public']['Tables']['tweets']['Row']
export type DatabaseLike = Database['public']['Tables']['likes']['Row']

export type RealtimePayloadType<T> = RealtimePostgresChangesPayload<{
  [key: string]: T
}>

export interface RealtimeInsertPayload<T> {
  commit_timestamp: string
  errors: null | any[]
  eventType: 'INSERT'
  new: T
  old: null
  schema: string
  table: string
}

export interface RealtimeUpdatePayload<T> {
  commit_timestamp: string
  errors: null | any[]
  eventType: 'UPDATE'
  new: T
  old: T
  schema: string
  table: string
}

export interface RealtimeDeletePayload<T> {
  commit_timestamp: string
  errors: null | any[]
  eventType: 'DELETE'
  new: null
  old: T
  schema: string
  table: string
}

export type RealtimePayload<T> =
  | RealtimeInsertPayload<T>
  | RealtimeUpdatePayload<T>
  | RealtimeDeletePayload<T>
