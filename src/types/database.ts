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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
