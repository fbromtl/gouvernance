// Manual types matching our migrations
// Run `npx supabase gen types typescript --linked` to regenerate from live schema

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type SubscriptionPlan = 'observer' | 'member' | 'expert' | 'honorary';
export type BillingPeriod = 'monthly' | 'yearly';
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid' | 'incomplete';

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
      governance_policies: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          description: string | null;
          policy_type: string;
          content: string;
          version: number;
          parent_id: string | null;
          status: string;
          published_at: string | null;
          published_by: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          description?: string | null;
          policy_type: string;
          content?: string;
          version?: number;
          parent_id?: string | null;
          status?: string;
          published_at?: string | null;
          published_by?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          policy_type?: string;
          content?: string;
          version?: number;
          status?: string;
          published_at?: string | null;
          published_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      governance_roles: {
        Row: {
          id: string;
          organization_id: string;
          role_type: string;
          user_id: string | null;
          mandate: string | null;
          nominated_at: string | null;
          scope: string;
          ai_system_id: string | null;
          status: string;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          role_type: string;
          user_id?: string | null;
          mandate?: string | null;
          nominated_at?: string | null;
          scope?: string;
          ai_system_id?: string | null;
          status?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          role_type?: string;
          user_id?: string | null;
          mandate?: string | null;
          nominated_at?: string | null;
          scope?: string;
          ai_system_id?: string | null;
          status?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      compliance_assessments: {
        Row: {
          id: string;
          organization_id: string;
          framework_code: string;
          requirement_code: string;
          status: string;
          responsible_user_id: string | null;
          comments: string | null;
          last_verified_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          framework_code: string;
          requirement_code: string;
          status?: string;
          responsible_user_id?: string | null;
          comments?: string | null;
          last_verified_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          status?: string;
          responsible_user_id?: string | null;
          comments?: string | null;
          last_verified_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      remediation_actions: {
        Row: {
          id: string;
          organization_id: string;
          assessment_id: string;
          title: string;
          description: string | null;
          responsible_user_id: string | null;
          due_date: string | null;
          priority: string;
          status: string;
          notes: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          assessment_id: string;
          title: string;
          description?: string | null;
          responsible_user_id?: string | null;
          due_date?: string | null;
          priority?: string;
          status?: string;
          notes?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          responsible_user_id?: string | null;
          due_date?: string | null;
          priority?: string;
          status?: string;
          notes?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      compliance_snapshots: {
        Row: {
          id: string;
          organization_id: string;
          framework_code: string;
          score: number;
          total_count: number;
          compliant_count: number;
          partially_count: number;
          non_compliant_count: number;
          not_applicable_count: number;
          snapshot_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          framework_code: string;
          score: number;
          total_count: number;
          compliant_count: number;
          partially_count: number;
          non_compliant_count: number;
          not_applicable_count: number;
        };
        Update: {
          id?: never;
        };
        Relationships: [];
      };
      governance_committees: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          mandate: string | null;
          meeting_frequency: string;
          members: Json;
          status: string;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          mandate?: string | null;
          meeting_frequency?: string;
          members?: Json;
          status?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          name?: string;
          mandate?: string | null;
          meeting_frequency?: string;
          members?: Json;
          status?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      governance_diagnostics: {
        Row: {
          id: string;
          user_id: string;
          organization_id: string | null;
          total_score: number;
          maturity_level: string;
          answers: Json;
          completed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          organization_id?: string | null;
          total_score: number;
          maturity_level: string;
          answers?: Json;
          completed_at?: string;
          created_at?: string;
        };
        Update: {
          total_score?: number;
          maturity_level?: string;
          answers?: Json;
          organization_id?: string | null;
        };
        Relationships: [];
      };
      decisions: {
        Row: {
          id: string;
          organization_id: string;
          title: string;
          decision_type: string;
          ai_system_ids: string[];
          context: string | null;
          options_considered: string | null;
          decision_made: string | null;
          justification: string | null;
          residual_risks: string | null;
          conditions: string | null;
          impact: string | null;
          effective_date: string | null;
          review_date: string | null;
          risk_assessment_id: string | null;
          incident_id: string | null;
          requester_id: string | null;
          approver_ids: string[];
          status: string;
          rejection_reason: string | null;
          approved_at: string | null;
          implemented_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          title: string;
          decision_type: string;
          ai_system_ids?: string[];
          context?: string | null;
          options_considered?: string | null;
          decision_made?: string | null;
          justification?: string | null;
          residual_risks?: string | null;
          conditions?: string | null;
          impact?: string | null;
          effective_date?: string | null;
          review_date?: string | null;
          risk_assessment_id?: string | null;
          incident_id?: string | null;
          requester_id?: string | null;
          approver_ids?: string[];
          status?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          title?: string;
          decision_type?: string;
          ai_system_ids?: string[];
          context?: string | null;
          options_considered?: string | null;
          decision_made?: string | null;
          justification?: string | null;
          residual_risks?: string | null;
          conditions?: string | null;
          impact?: string | null;
          effective_date?: string | null;
          review_date?: string | null;
          risk_assessment_id?: string | null;
          incident_id?: string | null;
          requester_id?: string | null;
          approver_ids?: string[];
          status?: string;
          rejection_reason?: string | null;
          approved_at?: string | null;
          implemented_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      bias_findings: {
        Row: {
          id: string;
          organization_id: string;
          ai_system_id: string;
          title: string;
          bias_type: string;
          detection_method: string;
          protected_dimensions: string[];
          affected_groups: string | null;
          severity: string;
          likelihood: string | null;
          estimated_impact: string | null;
          affected_count: number | null;
          fairness_metric: string | null;
          measured_value: number | null;
          acceptable_threshold: number | null;
          remediation_measures: string[];
          remediation_description: string | null;
          remediation_responsible_id: string | null;
          remediation_target_date: string | null;
          remediation_retest_result: string | null;
          remediation_resolved_at: string | null;
          status: string;
          decision_id: string | null;
          detected_by: string | null;
          detected_at: string;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          ai_system_id: string;
          title: string;
          bias_type: string;
          detection_method: string;
          protected_dimensions?: string[];
          affected_groups?: string | null;
          severity: string;
          likelihood?: string | null;
          estimated_impact?: string | null;
          affected_count?: number | null;
          fairness_metric?: string | null;
          measured_value?: number | null;
          acceptable_threshold?: number | null;
          remediation_measures?: string[];
          remediation_description?: string | null;
          remediation_responsible_id?: string | null;
          remediation_target_date?: string | null;
          remediation_retest_result?: string | null;
          remediation_resolved_at?: string | null;
          status?: string;
          decision_id?: string | null;
          detected_by?: string | null;
          detected_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          title?: string;
          bias_type?: string;
          detection_method?: string;
          ai_system_id?: string;
          protected_dimensions?: string[];
          affected_groups?: string | null;
          severity?: string;
          likelihood?: string | null;
          estimated_impact?: string | null;
          affected_count?: number | null;
          fairness_metric?: string | null;
          measured_value?: number | null;
          acceptable_threshold?: number | null;
          remediation_measures?: string[];
          remediation_description?: string | null;
          remediation_responsible_id?: string | null;
          remediation_target_date?: string | null;
          remediation_retest_result?: string | null;
          remediation_resolved_at?: string | null;
          status?: string;
          decision_id?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      automated_decisions: {
        Row: {
          id: string;
          organization_id: string;
          ai_system_id: string;
          decision_type: string;
          automation_level: string;
          affected_persons: string[];
          decision_impact: string;
          information_channel: string | null;
          explanation_enabled: boolean;
          contestation_enabled: boolean;
          legal_basis: string | null;
          status: string;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          ai_system_id: string;
          decision_type: string;
          automation_level: string;
          affected_persons?: string[];
          decision_impact: string;
          information_channel?: string | null;
          explanation_enabled?: boolean;
          contestation_enabled?: boolean;
          legal_basis?: string | null;
          status?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          ai_system_id?: string;
          decision_type?: string;
          automation_level?: string;
          affected_persons?: string[];
          decision_impact?: string;
          information_channel?: string | null;
          explanation_enabled?: boolean;
          contestation_enabled?: boolean;
          legal_basis?: string | null;
          status?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      contestations: {
        Row: {
          id: string;
          organization_id: string;
          case_number: string;
          ai_system_id: string;
          requester_name: string;
          requester_email: string | null;
          requester_phone: string | null;
          received_at: string;
          reception_channel: string;
          contested_decision_description: string;
          contestation_reason: string;
          requester_observations: string | null;
          assigned_to: string | null;
          analysis: string | null;
          review_outcome: string | null;
          justification: string | null;
          revised_decision: string | null;
          decision_date: string | null;
          status: string;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          case_number: string;
          ai_system_id: string;
          requester_name: string;
          requester_email?: string | null;
          requester_phone?: string | null;
          received_at?: string;
          reception_channel: string;
          contested_decision_description: string;
          contestation_reason: string;
          requester_observations?: string | null;
          assigned_to?: string | null;
          status?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          requester_name?: string;
          requester_email?: string | null;
          requester_phone?: string | null;
          reception_channel?: string;
          contested_decision_description?: string;
          contestation_reason?: string;
          requester_observations?: string | null;
          assigned_to?: string | null;
          analysis?: string | null;
          review_outcome?: string | null;
          justification?: string | null;
          revised_decision?: string | null;
          decision_date?: string | null;
          status?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      vendors: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          service_types: string[];
          website: string | null;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          country: string | null;
          region: string | null;
          known_subcontractors: string | null;
          ai_system_ids: string[];
          contract_start_date: string | null;
          contract_end_date: string | null;
          contract_type: string | null;
          contract_amount: number | null;
          contract_clauses: string | null;
          sla_details: string | null;
          risk_level: string | null;
          status: string;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          service_types?: string[];
          website?: string | null;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          country?: string | null;
          region?: string | null;
          known_subcontractors?: string | null;
          ai_system_ids?: string[];
          contract_start_date?: string | null;
          contract_end_date?: string | null;
          contract_type?: string | null;
          contract_amount?: number | null;
          contract_clauses?: string | null;
          sla_details?: string | null;
          risk_level?: string | null;
          status?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          name?: string;
          service_types?: string[];
          website?: string | null;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          country?: string | null;
          region?: string | null;
          known_subcontractors?: string | null;
          ai_system_ids?: string[];
          contract_start_date?: string | null;
          contract_end_date?: string | null;
          contract_type?: string | null;
          contract_amount?: number | null;
          contract_clauses?: string | null;
          sla_details?: string | null;
          risk_level?: string | null;
          status?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      lifecycle_events: {
        Row: {
          id: string;
          organization_id: string;
          ai_system_id: string;
          event_type: string;
          title: string;
          description: string | null;
          components_modified: string[];
          previous_version: string | null;
          new_version: string | null;
          change_date: string;
          impact: string;
          is_substantial: boolean;
          risk_reassessment_required: boolean;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          ai_system_id: string;
          event_type: string;
          title: string;
          description?: string | null;
          components_modified?: string[];
          previous_version?: string | null;
          new_version?: string | null;
          change_date?: string;
          impact?: string;
          is_substantial?: boolean;
          risk_reassessment_required?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          ai_system_id?: string;
          event_type?: string;
          title?: string;
          description?: string | null;
          components_modified?: string[];
          previous_version?: string | null;
          new_version?: string | null;
          change_date?: string;
          impact?: string;
          is_substantial?: boolean;
          risk_reassessment_required?: boolean;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      datasets: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          description: string | null;
          ai_system_ids: string[];
          source: string;
          data_categories: string[];
          classification: string;
          volume: string | null;
          quality: string | null;
          freshness: string | null;
          storage_locations: string[];
          format: string | null;
          representativeness: string | null;
          legal_basis: string | null;
          declared_purpose: string | null;
          consent_obtained: boolean;
          withdrawal_mechanism: string | null;
          retention_duration: number | null;
          retention_unit: string | null;
          retention_justification: string | null;
          destruction_policy: string | null;
          next_review_date: string | null;
          status: string;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          description?: string | null;
          ai_system_ids?: string[];
          source: string;
          data_categories?: string[];
          classification?: string;
          volume?: string | null;
          quality?: string | null;
          freshness?: string | null;
          storage_locations?: string[];
          format?: string | null;
          representativeness?: string | null;
          legal_basis?: string | null;
          declared_purpose?: string | null;
          consent_obtained?: boolean;
          withdrawal_mechanism?: string | null;
          retention_duration?: number | null;
          retention_unit?: string | null;
          retention_justification?: string | null;
          destruction_policy?: string | null;
          next_review_date?: string | null;
          status?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          name?: string;
          description?: string | null;
          ai_system_ids?: string[];
          source?: string;
          data_categories?: string[];
          classification?: string;
          volume?: string | null;
          quality?: string | null;
          freshness?: string | null;
          storage_locations?: string[];
          format?: string | null;
          representativeness?: string | null;
          legal_basis?: string | null;
          declared_purpose?: string | null;
          consent_obtained?: boolean;
          withdrawal_mechanism?: string | null;
          retention_duration?: number | null;
          retention_unit?: string | null;
          retention_justification?: string | null;
          destruction_policy?: string | null;
          next_review_date?: string | null;
          status?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      data_transfers: {
        Row: {
          id: string;
          organization_id: string;
          dataset_id: string;
          destination_country: string;
          destination_entity: string | null;
          transfer_purpose: string;
          contractual_basis: string | null;
          efvp_completed: boolean;
          protection_measures: string | null;
          status: string;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          dataset_id: string;
          destination_country: string;
          destination_entity?: string | null;
          transfer_purpose: string;
          contractual_basis?: string | null;
          efvp_completed?: boolean;
          protection_measures?: string | null;
          status?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          dataset_id?: string;
          destination_country?: string;
          destination_entity?: string | null;
          transfer_purpose?: string;
          contractual_basis?: string | null;
          efvp_completed?: boolean;
          protection_measures?: string | null;
          status?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          organization_id: string;
          ai_system_id: string | null;
          title: string;
          document_type: string;
          description: string | null;
          file_url: string | null;
          file_name: string | null;
          file_size: number | null;
          mime_type: string | null;
          version: number;
          status: string;
          tags: string[];
          category: string | null;
          subcategory: string | null;
          summary: string | null;
          ai_analysis: Record<string, unknown> | null;
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
          ai_system_id?: string | null;
          title: string;
          document_type: string;
          description?: string | null;
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          version?: number;
          status?: string;
          tags?: string[];
          category?: string | null;
          subcategory?: string | null;
          summary?: string | null;
          ai_analysis?: Record<string, unknown> | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          title?: string;
          document_type?: string;
          ai_system_id?: string | null;
          description?: string | null;
          file_url?: string | null;
          file_name?: string | null;
          file_size?: number | null;
          mime_type?: string | null;
          version?: number;
          status?: string;
          tags?: string[];
          category?: string | null;
          subcategory?: string | null;
          summary?: string | null;
          ai_analysis?: Record<string, unknown> | null;
          approved_by?: string | null;
          approved_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      monitoring_metrics: {
        Row: {
          id: string;
          organization_id: string;
          ai_system_id: string;
          name: string;
          category: string;
          unit: string | null;
          direction: string;
          target_value: number | null;
          warning_threshold: number | null;
          critical_threshold: number | null;
          acceptable_min: number | null;
          acceptable_max: number | null;
          collection_frequency: string;
          source: string;
          is_active: boolean;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          ai_system_id: string;
          name: string;
          category: string;
          unit?: string | null;
          direction?: string;
          target_value?: number | null;
          warning_threshold?: number | null;
          critical_threshold?: number | null;
          acceptable_min?: number | null;
          acceptable_max?: number | null;
          collection_frequency?: string;
          source?: string;
          is_active?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          ai_system_id?: string;
          name?: string;
          category?: string;
          unit?: string | null;
          direction?: string;
          target_value?: number | null;
          warning_threshold?: number | null;
          critical_threshold?: number | null;
          acceptable_min?: number | null;
          acceptable_max?: number | null;
          collection_frequency?: string;
          source?: string;
          is_active?: boolean;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      monitoring_data_points: {
        Row: {
          id: string;
          organization_id: string;
          metric_id: string;
          value: number;
          recorded_at: string;
          alert_level: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          metric_id: string;
          value: number;
          recorded_at?: string;
          alert_level?: string | null;
          notes?: string | null;
          created_by?: string | null;
        };
        Update: {
          value?: number;
          recorded_at?: string;
          alert_level?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          organization_id: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          plan: SubscriptionPlan;
          billing_period: BillingPeriod | null;
          status: SubscriptionStatus;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: SubscriptionPlan;
          billing_period?: BillingPeriod | null;
          status?: SubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
        };
        Update: {
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          plan?: SubscriptionPlan;
          billing_period?: BillingPeriod | null;
          status?: SubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
        };
        Relationships: [];
      };
      plan_features: {
        Row: {
          id: string;
          plan: SubscriptionPlan;
          feature_key: string;
          enabled: boolean;
        };
        Insert: {
          id?: string;
          plan: SubscriptionPlan;
          feature_key: string;
          enabled?: boolean;
        };
        Update: {
          enabled?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_org_members: {
        Args: { _org_id: string };
        Returns: {
          user_id: string;
          full_name: string | null;
          avatar_url: string | null;
          email: string;
          role: string;
          joined_at: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// ---- Convenience type aliases ----
export type Organization = Database["public"]["Tables"]["organizations"]["Row"];

export type AiSystem = Database["public"]["Tables"]["ai_systems"]["Row"];
export type AiSystemInsert = Database["public"]["Tables"]["ai_systems"]["Insert"];
export type AiSystemUpdate = Database["public"]["Tables"]["ai_systems"]["Update"];

export type RiskAssessment = Database["public"]["Tables"]["risk_assessments"]["Row"];
export type RiskAssessmentInsert = Database["public"]["Tables"]["risk_assessments"]["Insert"];
export type RiskAssessmentUpdate = Database["public"]["Tables"]["risk_assessments"]["Update"];

export type Incident = Database["public"]["Tables"]["incidents"]["Row"];
export type IncidentInsert = Database["public"]["Tables"]["incidents"]["Insert"];
export type IncidentUpdate = Database["public"]["Tables"]["incidents"]["Update"];

export type GovernancePolicy = Database["public"]["Tables"]["governance_policies"]["Row"];
export type GovernancePolicyInsert = Database["public"]["Tables"]["governance_policies"]["Insert"];
export type GovernancePolicyUpdate = Database["public"]["Tables"]["governance_policies"]["Update"];

export type GovernanceRole = Database["public"]["Tables"]["governance_roles"]["Row"];
export type GovernanceRoleInsert = Database["public"]["Tables"]["governance_roles"]["Insert"];
export type GovernanceRoleUpdate = Database["public"]["Tables"]["governance_roles"]["Update"];

export type GovernanceCommittee = Database["public"]["Tables"]["governance_committees"]["Row"];
export type GovernanceCommitteeInsert = Database["public"]["Tables"]["governance_committees"]["Insert"];
export type GovernanceCommitteeUpdate = Database["public"]["Tables"]["governance_committees"]["Update"];

export type Decision = Database["public"]["Tables"]["decisions"]["Row"];
export type DecisionInsert = Database["public"]["Tables"]["decisions"]["Insert"];
export type DecisionUpdate = Database["public"]["Tables"]["decisions"]["Update"];

export type ComplianceAssessment = Database["public"]["Tables"]["compliance_assessments"]["Row"];
export type ComplianceAssessmentInsert = Database["public"]["Tables"]["compliance_assessments"]["Insert"];
export type ComplianceAssessmentUpdate = Database["public"]["Tables"]["compliance_assessments"]["Update"];

export type RemediationAction = Database["public"]["Tables"]["remediation_actions"]["Row"];
export type RemediationActionInsert = Database["public"]["Tables"]["remediation_actions"]["Insert"];
export type RemediationActionUpdate = Database["public"]["Tables"]["remediation_actions"]["Update"];

export type ComplianceSnapshot = Database["public"]["Tables"]["compliance_snapshots"]["Row"];

export type BiasFinding = Database["public"]["Tables"]["bias_findings"]["Row"];
export type BiasFindingInsert = Database["public"]["Tables"]["bias_findings"]["Insert"];
export type BiasFindingUpdate = Database["public"]["Tables"]["bias_findings"]["Update"];

export type AutomatedDecision = Database["public"]["Tables"]["automated_decisions"]["Row"];
export type AutomatedDecisionInsert = Database["public"]["Tables"]["automated_decisions"]["Insert"];
export type AutomatedDecisionUpdate = Database["public"]["Tables"]["automated_decisions"]["Update"];

export type Contestation = Database["public"]["Tables"]["contestations"]["Row"];
export type ContestationInsert = Database["public"]["Tables"]["contestations"]["Insert"];
export type ContestationUpdate = Database["public"]["Tables"]["contestations"]["Update"];

export type Vendor = Database["public"]["Tables"]["vendors"]["Row"];
export type VendorInsert = Database["public"]["Tables"]["vendors"]["Insert"];
export type VendorUpdate = Database["public"]["Tables"]["vendors"]["Update"];

export type LifecycleEvent = Database["public"]["Tables"]["lifecycle_events"]["Row"];
export type LifecycleEventInsert = Database["public"]["Tables"]["lifecycle_events"]["Insert"];
export type LifecycleEventUpdate = Database["public"]["Tables"]["lifecycle_events"]["Update"];

export type GovDocument = Database["public"]["Tables"]["documents"]["Row"];
export type GovDocumentInsert = Database["public"]["Tables"]["documents"]["Insert"];
export type GovDocumentUpdate = Database["public"]["Tables"]["documents"]["Update"];

export type Dataset = Database["public"]["Tables"]["datasets"]["Row"];
export type DatasetInsert = Database["public"]["Tables"]["datasets"]["Insert"];
export type DatasetUpdate = Database["public"]["Tables"]["datasets"]["Update"];

export type DataTransfer = Database["public"]["Tables"]["data_transfers"]["Row"];
export type DataTransferInsert = Database["public"]["Tables"]["data_transfers"]["Insert"];
export type DataTransferUpdate = Database["public"]["Tables"]["data_transfers"]["Update"];

export type MonitoringMetric = Database["public"]["Tables"]["monitoring_metrics"]["Row"];
export type MonitoringMetricInsert = Database["public"]["Tables"]["monitoring_metrics"]["Insert"];
export type MonitoringMetricUpdate = Database["public"]["Tables"]["monitoring_metrics"]["Update"];

export type MonitoringDataPoint = Database["public"]["Tables"]["monitoring_data_points"]["Row"];
export type MonitoringDataPointInsert = Database["public"]["Tables"]["monitoring_data_points"]["Insert"];

export interface CommitteeMember {
  user_id: string;
  committee_role: "president" | "member" | "secretary";
}
