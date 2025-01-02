export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          created_at: string
          updated_at: string
          avatar_url: string | null
          birth_date: string | null
          bio: string | null
        }
        Insert: {
          id: string
          username: string
          created_at?: string
          updated_at?: string
          avatar_url?: string | null
          birth_date?: string | null
          bio?: string | null
        }
        Update: {
          id?: string
          username?: string
          created_at?: string
          updated_at?: string
          avatar_url?: string | null
          birth_date?: string | null
          bio?: string | null
        }
      }
      couples: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          status: 'en_attente' | 'accepte'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          status?: 'en_attente' | 'accepte'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          status?: 'en_attente' | 'accepte'
          created_at?: string
          updated_at?: string
        }
      }
      children: {
        Row: {
          id: string
          first_name: string
          birth_date: string
          couple_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          birth_date: string
          couple_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          birth_date?: string
          couple_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}