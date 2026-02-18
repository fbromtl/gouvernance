// Manual types matching our migrations
// Run `npx supabase gen types typescript --linked` to regenerate from live schema

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          sector: string | null;
          size: string | null;
          country: string | null;
          province: string | null;
          logo_url: string | null;
          settings: Json | null;
          plan: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          sector?: string | null;
          size?: string | null;
          country?: string | null;
          province?: string | null;
          logo_url?: string | null;
          settings?: Json | null;
          plan?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          sector?: string | null;
          size?: string | null;
          country?: string | null;
          province?: string | null;
          logo_url?: string | null;
          settings?: Json | null;
          plan?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          cgu_accepted: boolean;
          organization_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          cgu_accepted?: boolean;
          organization_id?: string | null;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          cgu_accepted?: boolean;
          organization_id?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id: string;
          role?: string;
        };
        Update: {
          role?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          changes: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          changes?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: never;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          link: string | null;
          read: boolean;
          email_sent: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          type?: string;
          title: string;
          body?: string | null;
          link?: string | null;
          read?: boolean;
          email_sent?: boolean;
        };
        Update: {
          read?: boolean;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          prenom: string;
          email: string;
          organisme: string | null;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          prenom: string;
          email: string;
          organisme?: string | null;
          message: string;
        };
        Update: {
          id?: never;
        };
        Relationships: [];
      };
      newsletter_subscriptions: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
        };
        Update: {
          id?: never;
        };
        Relationships: [];
      };
      ai_systems: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string;
          internal_ref: string | null;
          system_type: string;
          genai_subtype: string | null;
          departments: string[];
          purpose: string | null;
          affected_population: string[];
          estimated_volume: string | null;
          autonomy_level: string | null;
          sensitive_domains: string[];
          data_types: string[];
          system_source: string | null;
          vendor_name: string | null;
          model_version: string | null;
          data_locations: string[];
          business_owner_id: string | null;
          tech_owner_id: string | null;
          privacy_owner_id: string | null;
          risk_owner_id: string | null;
          approver_id: string | null;
          lifecycle_status: string;
          production_date: string | null;
          next_review_date: string | null;
          review_frequency: string;
          notes: string | null;
          risk_score: number;
          risk_level: string;
          status: string;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description: string;
          internal_ref?: string | null;
          system_type: string;
          genai_subtype?: string | null;
          departments?: string[];
          purpose?: string | null;
          affected_population?: string[];
          estimated_volume?: string | null;
          autonomy_level?: string | null;
          sensitive_domains?: string[];
          data_types?: string[];
          system_source?: string | null;
          vendor_name?: string | null;
          model_version?: string | null;
          data_locations?: string[];
          business_owner_id?: string | null;
          tech_owner_id?: string | null;
          privacy_owner_id?: string | null;
          risk_owner_id?: string | null;
          approver_id?: string | null;
          lifecycle_status?: string;
          production_date?: string | null;
          next_review_date?: string | null;
          review_frequency?: string;
          notes?: string | null;
          risk_score?: number;
          risk_level?: string;
          status?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          name?: string;
          description?: string;
          internal_ref?: string | null;
          system_type?: string;
          genai_subtype?: string | null;
          departments?: string[];
          purpose?: string | null;
          affected_population?: string[];
          estimated_volume?: string | null;
          autonomy_level?: string | null;
          sensitive_domains?: string[];
          data_types?: string[];
          system_source?: string | null;
          vendor_name?: string | null;
          model_version?: string | null;
          data_locations?: string[];
          business_owner_id?: string | null;
          tech_owner_id?: string | null;
          privacy_owner_id?: string | null;
          risk_owner_id?: string | null;
          approver_id?: string | null;
          lifecycle_status?: string;
          production_date?: string | null;
          next_review_date?: string | null;
          review_frequency?: string;
          notes?: string | null;
          risk_score?: number;
          risk_level?: string;
          status?: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      risk_assessments: {
        Row: {
          id: string;
          organization_id: string;
          ai_system_id: string;
          total_score: number;
          risk_level: string;
          answers: Json;
          requirements: Json;
          probability: string | null;
          impact: string | null;
          status: string;
          approved_by: string | null;
          approved_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          ai_system_id: string;
          total_score?: number;
          risk_level?: string;
          answers?: Json;
          requirements?: Json;
          probability?: string | null;
          impact?: string | null;
          status?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          total_score?: number;
          risk_level?: string;
          answers?: Json;
          requirements?: Json;
          probability?: string | null;
          impact?: string | null;
          status?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      incidents: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          category: string;
          incident_type: string;
          ai_system_id: string | null;
          description: string;
          detected_at: string;
          started_at: string | null;
          detection_mode: string | null;
          severity: string;
          assigned_to: string | null;
          impact_description: string | null;
          affected_count: number | null;
          priority: string | null;
          serious_harm_risk: boolean;
          root_cause: string | null;
          contributing_factors: string[];
          resolution_date: string | null;
          corrective_actions: Json;
          post_mortem: Json | null;
          lessons_learned: string | null;
          status: string;
          cai_notification_status: string | null;
          cai_notified_at: string | null;
          persons_notified: boolean;
          reported_by: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          category: string;
          incident_type: string;
          ai_system_id?: string | null;
          description: string;
          detected_at?: string;
          started_at?: string | null;
          detection_mode?: string | null;
          severity?: string;
          assigned_to?: string | null;
          impact_description?: string | null;
          affected_count?: number | null;
          priority?: string | null;
          serious_harm_risk?: boolean;
          reported_by?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          title?: string;
          category?: string;
          incident_type?: string;
          ai_system_id?: string | null;
          description?: string;
          severity?: string;
          assigned_to?: string | null;
          impact_description?: string | null;
          affected_count?: number | null;
          priority?: string | null;
          serious_harm_risk?: boolean;
          root_cause?: string | null;
          contributing_factors?: string[];
          resolution_date?: string | null;
          corrective_actions?: Json;
          post_mortem?: Json | null;
          lessons_learned?: string | null;
          status?: string;
          cai_notification_status?: string | null;
          cai_notified_at?: string | null;
          persons_notified?: boolean;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ---- Convenience type aliases ----
export type AiSystem = Database["public"]["Tables"]["ai_systems"]["Row"];
export type AiSystemInsert = Database["public"]["Tables"]["ai_systems"]["Insert"];
export type AiSystemUpdate = Database["public"]["Tables"]["ai_systems"]["Update"];

export type RiskAssessment = Database["public"]["Tables"]["risk_assessments"]["Row"];
export type RiskAssessmentInsert = Database["public"]["Tables"]["risk_assessments"]["Insert"];
export type RiskAssessmentUpdate = Database["public"]["Tables"]["risk_assessments"]["Update"];

export type Incident = Database["public"]["Tables"]["incidents"]["Row"];
export type IncidentInsert = Database["public"]["Tables"]["incidents"]["Insert"];
export type IncidentUpdate = Database["public"]["Tables"]["incidents"]["Update"];
