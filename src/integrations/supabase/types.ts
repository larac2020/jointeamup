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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      competition_sources: {
        Row: {
          competition_type: string
          last_error: string | null
          last_scraped_at: string | null
          updated_at: string
          url: string
        }
        Insert: {
          competition_type: string
          last_error?: string | null
          last_scraped_at?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          competition_type?: string
          last_error?: string | null
          last_scraped_at?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      competition_suggestions: {
        Row: {
          competition_type: string
          created_at: string
          id: string
          name: string
          submitted_by: string
        }
        Insert: {
          competition_type: string
          created_at?: string
          id?: string
          name: string
          submitted_by: string
        }
        Update: {
          competition_type?: string
          created_at?: string
          id?: string
          name?: string
          submitted_by?: string
        }
        Relationships: []
      }
      competitions: {
        Row: {
          competition_type: string
          created_at: string
          event_date: string | null
          id: string
          location: string | null
          name: string
          source_url: string | null
          updated_at: string
          year: number
        }
        Insert: {
          competition_type: string
          created_at?: string
          event_date?: string | null
          id?: string
          location?: string | null
          name: string
          source_url?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          competition_type?: string
          created_at?: string
          event_date?: string | null
          id?: string
          location?: string | null
          name?: string
          source_url?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          listing_id: string | null
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          listing_id?: string | null
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          listing_id?: string | null
          user_a?: string
          user_b?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_a_fkey"
            columns: ["user_a"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_b_fkey"
            columns: ["user_b"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          author_id: string
          competition: string
          competition_type: string
          created_at: string
          description: string
          event_date: string
          format: Database["public"]["Enums"]["format_type"]
          gender: Database["public"]["Enums"]["gender_cat"] | null
          id: string
          is_active: boolean
          location: string
          skill_level: string
          spots: number
          type: Database["public"]["Enums"]["listing_type"]
        }
        Insert: {
          author_id: string
          competition: string
          competition_type: string
          created_at?: string
          description: string
          event_date: string
          format: Database["public"]["Enums"]["format_type"]
          gender?: Database["public"]["Enums"]["gender_cat"] | null
          id?: string
          is_active?: boolean
          location: string
          skill_level: string
          spots?: number
          type: Database["public"]["Enums"]["listing_type"]
        }
        Update: {
          author_id?: string
          competition?: string
          competition_type?: string
          created_at?: string
          description?: string
          event_date?: string
          format?: Database["public"]["Enums"]["format_type"]
          gender?: Database["public"]["Enums"]["gender_cat"] | null
          id?: string
          is_active?: boolean
          location?: string
          skill_level?: string
          spots?: number
          type?: Database["public"]["Enums"]["listing_type"]
        }
        Relationships: [
          {
            foreignKeyName: "listings_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
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
          bio: string | null
          competitions: string[]
          created_at: string
          experience: string | null
          first_name: string
          from_location: string | null
          gyms: string[]
          id: string
          kryptonite: string | null
          lives_in: string | null
          looking_for: string | null
          nickname: string | null
          onboarded: boolean
          photos: string[]
          prs: Json
          sports: string[]
          superpower: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          competitions?: string[]
          created_at?: string
          experience?: string | null
          first_name: string
          from_location?: string | null
          gyms?: string[]
          id: string
          kryptonite?: string | null
          lives_in?: string | null
          looking_for?: string | null
          nickname?: string | null
          onboarded?: boolean
          photos?: string[]
          prs?: Json
          sports?: string[]
          superpower?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          bio?: string | null
          competitions?: string[]
          created_at?: string
          experience?: string | null
          first_name?: string
          from_location?: string | null
          gyms?: string[]
          id?: string
          kryptonite?: string | null
          lives_in?: string | null
          looking_for?: string | null
          nickname?: string | null
          onboarded?: boolean
          photos?: string[]
          prs?: Json
          sports?: string[]
          superpower?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_consents: {
        Row: {
          contactable_by_athletes: boolean
          contactable_consent_at: string | null
          data_processing_version: string
          notifications_consent_at: string | null
          notifications_listings: boolean
          notifications_marketing: boolean
          notifications_messages: boolean
          privacy_accepted_at: string | null
          terms_accepted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          contactable_by_athletes?: boolean
          contactable_consent_at?: string | null
          data_processing_version?: string
          notifications_consent_at?: string | null
          notifications_listings?: boolean
          notifications_marketing?: boolean
          notifications_messages?: boolean
          privacy_accepted_at?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          contactable_by_athletes?: boolean
          contactable_consent_at?: string | null
          data_processing_version?: string
          notifications_consent_at?: string | null
          notifications_listings?: boolean
          notifications_marketing?: boolean
          notifications_messages?: boolean
          privacy_accepted_at?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_user_contactable: { Args: { _user_id: string }; Returns: boolean }
      wants_notification: {
        Args: { _kind: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      format_type: "Individual" | "Doubles" | "Team"
      gender_cat: "Men" | "Women" | "Mixed" | "Open"
      listing_type: "selling-ticket" | "need-teammate" | "join-team"
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
      format_type: ["Individual", "Doubles", "Team"],
      gender_cat: ["Men", "Women", "Mixed", "Open"],
      listing_type: ["selling-ticket", "need-teammate", "join-team"],
    },
  },
} as const
