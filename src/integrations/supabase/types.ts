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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      actor_accounts: {
        Row: {
          actor_id: string
          discovered_at: string
          follower_count: number | null
          handle: string
          id: string
          platform: string
          profile_url: string | null
          verified: boolean | null
        }
        Insert: {
          actor_id: string
          discovered_at?: string
          follower_count?: number | null
          handle: string
          id?: string
          platform: string
          profile_url?: string | null
          verified?: boolean | null
        }
        Update: {
          actor_id?: string
          discovered_at?: string
          follower_count?: number | null
          handle?: string
          id?: string
          platform?: string
          profile_url?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "actor_accounts_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "threat_actors"
            referencedColumns: ["id"]
          },
        ]
      }
      report_actors: {
        Row: {
          actor_id: string
          id: string
          report_id: string
        }
        Insert: {
          actor_id: string
          id?: string
          report_id: string
        }
        Update: {
          actor_id?: string
          id?: string
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_actors_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "threat_actors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_actors_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "threat_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      threat_actors: {
        Row: {
          created_at: string
          display_name: string
          first_seen: string
          id: string
          last_seen: string
          notes: string | null
          risk_score: number | null
          total_violations: number | null
        }
        Insert: {
          created_at?: string
          display_name: string
          first_seen?: string
          id?: string
          last_seen?: string
          notes?: string | null
          risk_score?: number | null
          total_violations?: number | null
        }
        Update: {
          created_at?: string
          display_name?: string
          first_seen?: string
          id?: string
          last_seen?: string
          notes?: string | null
          risk_score?: number | null
          total_violations?: number | null
        }
        Relationships: []
      }
      threat_reports: {
        Row: {
          ai_analysis: string | null
          author_handle: string | null
          content: string
          country: string | null
          created_at: string
          engagement_score: number | null
          id: string
          original_url: string | null
          platform: string
          sentiment: number | null
          source: string | null
          tags: string[] | null
          threat_level: string
          title: string
          updated_at: string
        }
        Insert: {
          ai_analysis?: string | null
          author_handle?: string | null
          content: string
          country?: string | null
          created_at?: string
          engagement_score?: number | null
          id?: string
          original_url?: string | null
          platform: string
          sentiment?: number | null
          source?: string | null
          tags?: string[] | null
          threat_level?: string
          title: string
          updated_at?: string
        }
        Update: {
          ai_analysis?: string | null
          author_handle?: string | null
          content?: string
          country?: string | null
          created_at?: string
          engagement_score?: number | null
          id?: string
          original_url?: string | null
          platform?: string
          sentiment?: number | null
          source?: string | null
          tags?: string[] | null
          threat_level?: string
          title?: string
          updated_at?: string
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
