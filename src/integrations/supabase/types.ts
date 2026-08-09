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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      equipment: {
        Row: {
          brand: string | null
          category: string
          condition: string
          created_at: string
          delivery_available: boolean
          delivery_fee: number
          description: string | null
          district: string
          fuel_included: boolean
          half_day_price: number
          id: string
          latitude: number
          longitude: number
          maintenance_included: boolean
          manufacturing_year: number | null
          model: string | null
          name: string
          operator_available: boolean
          operator_fee: number
          owner_id: string
          pickup_available: boolean
          pin_code: string | null
          price_per_day: number
          price_per_hour: number
          security_deposit: number
          state: string
          status: string
          taluk: string | null
          updated_at: string
          village: string | null
        }
        Insert: {
          brand?: string | null
          category: string
          condition?: string
          created_at?: string
          delivery_available?: boolean
          delivery_fee?: number
          description?: string | null
          district?: string
          fuel_included?: boolean
          half_day_price?: number
          id?: string
          latitude: number
          longitude: number
          maintenance_included?: boolean
          manufacturing_year?: number | null
          model?: string | null
          name: string
          operator_available?: boolean
          operator_fee?: number
          owner_id: string
          pickup_available?: boolean
          pin_code?: string | null
          price_per_day?: number
          price_per_hour?: number
          security_deposit?: number
          state?: string
          status?: string
          taluk?: string | null
          updated_at?: string
          village?: string | null
        }
        Update: {
          brand?: string | null
          category?: string
          condition?: string
          created_at?: string
          delivery_available?: boolean
          delivery_fee?: number
          description?: string | null
          district?: string
          fuel_included?: boolean
          half_day_price?: number
          id?: string
          latitude?: number
          longitude?: number
          maintenance_included?: boolean
          manufacturing_year?: number | null
          model?: string | null
          name?: string
          operator_available?: boolean
          operator_fee?: number
          owner_id?: string
          pickup_available?: boolean
          pin_code?: string | null
          price_per_day?: number
          price_per_hour?: number
          security_deposit?: number
          state?: string
          status?: string
          taluk?: string | null
          updated_at?: string
          village?: string | null
        }
        Relationships: []
      }
      equipment_availability: {
        Row: {
          booking_id: string | null
          created_at: string
          date: string
          end_time: string
          equipment_id: string
          id: string
          start_time: string
          status: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          date: string
          end_time: string
          equipment_id: string
          id?: string
          start_time: string
          status?: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          date?: string
          end_time?: string
          equipment_id?: string
          id?: string
          start_time?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_availability_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_bookings: {
        Row: {
          booking_date: string
          created_at: string
          delivery_fee: number
          duration_hours: number
          end_time: string
          equipment_id: string
          farmer_id: string
          hourly_rate: number
          id: string
          need_delivery: boolean
          need_operator: boolean
          notes: string | null
          operator_fee: number
          owner_id: string
          rental_amount: number
          security_deposit: number
          start_time: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          booking_date: string
          created_at?: string
          delivery_fee?: number
          duration_hours: number
          end_time: string
          equipment_id: string
          farmer_id: string
          hourly_rate?: number
          id?: string
          need_delivery?: boolean
          need_operator?: boolean
          notes?: string | null
          operator_fee?: number
          owner_id: string
          rental_amount?: number
          security_deposit?: number
          start_time: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          booking_date?: string
          created_at?: string
          delivery_fee?: number
          duration_hours?: number
          end_time?: string
          equipment_id?: string
          farmer_id?: string
          hourly_rate?: number
          id?: string
          need_delivery?: boolean
          need_operator?: boolean
          notes?: string | null
          operator_fee?: number
          owner_id?: string
          rental_amount?: number
          security_deposit?: number
          start_time?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_bookings_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_images: {
        Row: {
          created_at: string
          equipment_id: string
          id: string
          label: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          equipment_id: string
          id?: string
          label?: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          equipment_id?: string
          id?: string
          label?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_images_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          equipment_id: string
          equipment_rating: number | null
          id: string
          owner_rating: number | null
          reviewer_id: string
          reviewer_role: string
          service_rating: number | null
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          equipment_id: string
          equipment_rating?: number | null
          id?: string
          owner_rating?: number | null
          reviewer_id: string
          reviewer_role?: string
          service_rating?: number | null
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          equipment_id?: string
          equipment_rating?: number | null
          id?: string
          owner_rating?: number | null
          reviewer_id?: string
          reviewer_role?: string
          service_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "equipment_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_reviews_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body_en: string
          body_kn: string
          booking_id: string | null
          created_at: string
          id: string
          read: boolean
          title_en: string
          title_kn: string
          type: string
          user_id: string
        }
        Insert: {
          body_en?: string
          body_kn?: string
          booking_id?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title_en: string
          title_kn: string
          type: string
          user_id: string
        }
        Update: {
          body_en?: string
          body_kn?: string
          booking_id?: string | null
          created_at?: string
          id?: string
          read?: boolean
          title_en?: string
          title_kn?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          district: string | null
          email: string | null
          full_name: string
          id: string
          phone: string
          pin_code: string | null
          rating: number
          taluk: string | null
          updated_at: string
          village: string | null
        }
        Insert: {
          created_at?: string
          district?: string | null
          email?: string | null
          full_name?: string
          id: string
          phone?: string
          pin_code?: string | null
          rating?: number
          taluk?: string | null
          updated_at?: string
          village?: string | null
        }
        Update: {
          created_at?: string
          district?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string
          pin_code?: string | null
          rating?: number
          taluk?: string | null
          updated_at?: string
          village?: string | null
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
