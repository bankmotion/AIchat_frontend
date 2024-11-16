export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      character_tags: {
        Row: {
          character_id: string
          created_at: string | null
          tag_id: number
          join_name:string | null
        }
        Insert: {
          character_id: string
          created_at?: string | null
          tag_id: number
          join_name:string | null
        }
        Update: {
          character_id?: string
          created_at?: string | null
          tag_id?: number
          join_name:string | null
        }
      }
      characters: {
        Row: {
          avatar: string
          created_at: string
          creator_id: string
          description: string
          example_dialogs: string
          first_message: string
          fts: unknown | null
          id: string
          is_force_remove: boolean
          is_nsfw: boolean
          is_public: boolean
          name: string
          personality: string
          scenario: string
          updated_at: string
        }
        Insert: {
          avatar: string
          created_at?: string
          creator_id: string
          description: string
          example_dialogs: string
          first_message: string
          fts?: unknown | null
          id?: string
          is_force_remove?: boolean
          is_nsfw?: boolean
          is_public?: boolean
          name: string
          personality: string
          scenario: string
          updated_at?: string
        }
        Update: {
          avatar?: string
          created_at?: string
          creator_id?: string
          description?: string
          example_dialogs?: string
          first_message?: string
          fts?: unknown | null
          id?: string
          is_force_remove?: boolean
          is_nsfw?: boolean
          is_public?: boolean
          name?: string
          personality?: string
          scenario?: string
          updated_at?: string
        }
      }
      chat_messages: {
        Row: {
          chat_id: number
          created_at: string
          id: number
          is_bot: boolean
          is_main: boolean
          message: string
        }
        Insert: {
          chat_id: number
          created_at?: string
          id?: number
          is_bot?: boolean
          is_main?: boolean
          message: string
        }
        Update: {
          chat_id?: number
          created_at?: string
          id?: number
          is_bot?: boolean
          is_main?: boolean
          message?: string
        }
      }
      chats: {
        Row: {
          character_id: string
          created_at: string
          id: number
          is_public: boolean
          summary: string
          summary_chat_id: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          character_id: string
          created_at?: string
          id?: number
          is_public?: boolean
          summary?: string
          summary_chat_id?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          character_id?: string
          created_at?: string
          id?: number
          is_public?: boolean
          summary?: string
          summary_chat_id?: number | null
          updated_at?: string
          user_id?: string
        }
      }
      reviews: {
        Row: {
          character_id: string
          content: string | null
          created_at: string
          is_like: boolean
          user_id: string
        }
        Insert: {
          character_id: string
          content?: string | null
          created_at?: string
          is_like?: boolean
          user_id: string
        }
        Update: {
          character_id?: string
          content?: string | null
          created_at?: string
          is_like?: boolean
          user_id?: string
        }
      }
      tags: {
        Row: {
          created_at: string
          description: string
          id: number
          name: string
          slug: string
          join_name:string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: number
          name: string
          slug: string
          join_name:string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: number
          name?: string
          slug?: string
          join_name:string | null
        }
      }
      user_profiles: {
        Row: {
          about_me: string
          avatar: string
          block_list: Json | null
          config: Json
          id: string
          is_verified: boolean
          name: string
          profile: string
          user_name: string | null
          is_nsfw:boolean
          is_blur:boolean
          user_type:number
          admin_api_usage_count:number
        }
        Insert: {
          about_me?: string
          avatar?: string
          block_list?: Json | null
          config?: Json
          id: string
          is_verified?: boolean
          name?: string
          profile?: string
          user_name?: string | null
          is_nsfw?:boolean
          is_blur?:boolean
          user_type?:number
          admin_api_usage_count?:number
        }
        Update: {
          about_me?: string
          avatar?: string
          block_list?: Json | null
          config?: Json
          id?: string
          is_verified?: boolean
          name?: string
          profile?: string
          user_name?: string | null
          is_nsfw?:boolean
          is_blur?:boolean
          user_type?:number
          admin_api_usage_count?:number
        }
      }
      user_reports: {
        Row: {
          character_id: string | null
          created_at: string
          id: number
          other: string
          profile_id: string | null
          reason: string
          url: string
        }
        Insert: {
          character_id?: string | null
          created_at?: string
          id?: number
          other?: string
          profile_id?: string | null
          reason?: string
          url?: string
        }
        Update: {
          character_id?: string | null
          created_at?: string
          id?: number
          other?: string
          profile_id?: string | null
          reason?: string
          url?: string
        }
      }
    }
    Views: {
      character_search: {
        Row: {
          avatar: string | null
          created_at: string | null
          creator_id: string | null
          creator_name: string | null
          creator_verified: boolean | null
          description: string | null
          example_dialogs: string | null
          first_message: string | null
          fts: unknown | null
          id: string | null
          is_force_remove: boolean | null
          is_nsfw: boolean | null
          is_public: boolean | null
          name: string | null
          personality: string | null
          scenario: string | null
          tag_ids: number[] | null
          total_chat: number | null
          total_message: number | null
          updated_at: string | null
        }
      }
      character_stats: {
        Row: {
          char_id: string | null
          total_chat: number | null
          total_message: number | null
        }
      }
      chat_message_count: {
        Row: {
          character_id: string | null
          chat_id: number | null
          message_count: number | null
        }
      }
    }
    Functions: {
      pgrst_watch: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_materialized_view: {
        Args: {
          view_name: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
