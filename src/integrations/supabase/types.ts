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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      academy_settings: {
        Row: {
          key: string
          published: boolean
          value: string
        }
        Insert: {
          key: string
          published?: boolean
          value?: string
        }
        Update: {
          key?: string
          published?: boolean
          value?: string
        }
        Relationships: []
      }
      admin_emails: {
        Row: {
          email: string
        }
        Insert: {
          email: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }
      audit_events: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bunny_security_checks: {
        Row: {
          direct_media_denied: boolean
          embed_tokens: boolean
          id: boolean
          library_id: string | null
          method: string
          preview_referrer: boolean
          signed_allowed: boolean
          unsigned_denied: boolean
          verified_at: string
        }
        Insert: {
          direct_media_denied?: boolean
          embed_tokens?: boolean
          id?: boolean
          library_id?: string | null
          method?: string
          preview_referrer?: boolean
          signed_allowed?: boolean
          unsigned_denied?: boolean
          verified_at?: string
        }
        Update: {
          direct_media_denied?: boolean
          embed_tokens?: boolean
          id?: boolean
          library_id?: string | null
          method?: string
          preview_referrer?: boolean
          signed_allowed?: boolean
          unsigned_denied?: boolean
          verified_at?: string
        }
        Relationships: []
      }
      cms_sections: {
        Row: {
          body: string
          image: string
          key: string
          position: number
          published: boolean
          title: string
        }
        Insert: {
          body?: string
          image?: string
          key: string
          position?: number
          published?: boolean
          title?: string
        }
        Update: {
          body?: string
          image?: string
          key?: string
          position?: number
          published?: boolean
          title?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          access_days: number | null
          category: string
          created_at: string
          description: string
          id: string
          price_approved: boolean
          price_mmk: number | null
          slug: string
          status: string
          thumbnail: string
          title: string
        }
        Insert: {
          access_days?: number | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          price_approved?: boolean
          price_mmk?: number | null
          slug: string
          status?: string
          thumbnail?: string
          title: string
        }
        Update: {
          access_days?: number | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          price_approved?: boolean
          price_mmk?: number | null
          slug?: string
          status?: string
          thumbnail?: string
          title?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          course_id: string
          expires_at: string
          id: string
          revoked_at: string | null
          source_code: string | null
          starts_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          expires_at: string
          id?: string
          revoked_at?: string | null
          source_code?: string | null
          starts_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          expires_at?: string
          id?: string
          revoked_at?: string | null
          source_code?: string | null
          starts_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_source_code_fkey"
            columns: ["source_code"]
            isOneToOne: true
            referencedRelation: "redeem_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_users: {
        Row: {
          claimed_by: string | null
          display_name: string
          email: string
          legacy_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          claimed_by?: string | null
          display_name?: string
          email: string
          legacy_id: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          claimed_by?: string | null
          display_name?: string
          email?: string
          legacy_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      lesson_bunny_videos: {
        Row: {
          encrypted_video: string
          lesson_id: string
          library_id: string
          updated_at: string
          upload_expires_at: string | null
          video_fingerprint: string
        }
        Insert: {
          encrypted_video: string
          lesson_id: string
          library_id: string
          updated_at?: string
          upload_expires_at?: string | null
          video_fingerprint: string
        }
        Update: {
          encrypted_video?: string
          lesson_id?: string
          library_id?: string
          updated_at?: string
          upload_expires_at?: string | null
          video_fingerprint?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_bunny_videos_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: true
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean
          lesson_id: string
          position_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          lesson_id: string
          position_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          lesson_id?: string
          position_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          auto_publish: boolean
          description: string
          duration_seconds: number
          id: string
          module_id: string
          position: number
          status: string
          title: string
          upload_request: string | null
          video_status: string
        }
        Insert: {
          auto_publish?: boolean
          description?: string
          duration_seconds?: number
          id?: string
          module_id: string
          position?: number
          status?: string
          title: string
          upload_request?: string | null
          video_status?: string
        }
        Update: {
          auto_publish?: boolean
          description?: string
          duration_seconds?: number
          id?: string
          module_id?: string
          position?: number
          status?: string
          title?: string
          upload_request?: string | null
          video_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          id: string
          position: number
          title: string
        }
        Insert: {
          course_id: string
          id?: string
          position?: number
          title: string
        }
        Update: {
          course_id?: string
          id?: string
          position?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_mmk: number
          course_id: string
          created_at: string
          id: string
          receipt_path: string
          reference: string
          rejection_reason: string | null
          reviewed_at: string | null
          status: string
          user_id: string
          verified_by: string | null
        }
        Insert: {
          amount_mmk: number
          course_id: string
          created_at?: string
          id?: string
          receipt_path: string
          reference?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string
          user_id: string
          verified_by?: string | null
        }
        Update: {
          amount_mmk?: number
          course_id?: string
          created_at?: string
          id?: string
          receipt_path?: string
          reference?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          status?: string
          user_id?: string
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string
          id: string
          legacy_user_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string
          email: string
          id: string
          legacy_user_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          legacy_user_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      redeem_codes: {
        Row: {
          assigned_to: string | null
          code_hash: string
          course_id: string
          created_at: string
          expires_at: string
          id: string
          order_id: string | null
          redeemed_at: string | null
          redeemed_by: string | null
          revoked_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          code_hash: string
          course_id: string
          created_at?: string
          expires_at: string
          id?: string
          order_id?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          revoked_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          code_hash?: string
          course_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string | null
          redeemed_at?: string | null
          redeemed_by?: string | null
          revoked_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "redeem_codes_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redeem_codes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redeem_codes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redeem_codes_redeemed_by_fkey"
            columns: ["redeemed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      redemption_limits: {
        Row: {
          attempts: string[]
          user_id: string
        }
        Insert: {
          attempts?: string[]
          user_id: string
        }
        Update: {
          attempts?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "redemption_limits_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      registered_devices: {
        Row: {
          created_at: string
          id: string
          last_seen: string
          name: string
          revoked_at: string | null
          session_id: string
          token_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_seen?: string
          name: string
          revoked_at?: string | null
          session_id: string
          token_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_seen?: string
          name?: string
          revoked_at?: string | null
          session_id?: string
          token_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registered_devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lms_admin_create_upload_lesson: {
        Args: {
          p_auto_publish: boolean
          p_course: string
          p_description: string
          p_position: number
          p_request: string
          p_title: string
        }
        Returns: {
          created: boolean
          lesson_id: string
        }[]
      }
      lms_admin_delete_lesson: {
        Args: { p_lesson: string }
        Returns: undefined
      }
      lms_bunny_playback_mapping: {
        Args: { p_hash: string; p_lesson: string }
        Returns: {
          encrypted_video: string
          library_id: string
        }[]
      }
      lms_issue_code: {
        Args: {
          p_course: string
          p_expires: string
          p_hash: string
          p_student: string
        }
        Returns: string
      }
      lms_manage_access: {
        Args: { p_expires: string; p_id: string; p_revoke: boolean }
        Returns: undefined
      }
      lms_redeem: { Args: { p_hash: string }; Returns: string }
      lms_register_device: {
        Args: { p_hash: string; p_name: string; p_session: string }
        Returns: string
      }
      lms_reissue_code: {
        Args: { p_expires: string; p_hash: string; p_id: string }
        Returns: undefined
      }
      lms_review_order: {
        Args: {
          p_approve: boolean
          p_expires: string
          p_hash: string
          p_order: string
          p_reason: string
        }
        Returns: string
      }
      lms_revoke_code: { Args: { p_id: string }; Returns: undefined }
      lms_revoke_device: { Args: { p_id: string }; Returns: undefined }
      lms_save_progress: {
        Args: {
          p_completed: boolean
          p_hash: string
          p_lesson: string
          p_position: number
          p_session: string
        }
        Returns: undefined
      }
      lms_submit_order: {
        Args: { p_course: string; p_receipt: string; p_reference: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "student" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["student", "admin"],
    },
  },
} as const
