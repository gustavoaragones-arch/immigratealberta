export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      cities: {
        Row: {
          slug: string;
          name: string;
          province: string;
          lat: string | null;
          lng: string | null;
          is_active: boolean | null;
          seo_title: string | null;
          seo_description: string | null;
          intro_md: string | null;
        };
        Insert: {
          slug: string;
          name: string;
          province?: string;
          lat?: string | null;
          lng?: string | null;
          is_active?: boolean | null;
          seo_title?: string | null;
          seo_description?: string | null;
          intro_md?: string | null;
        };
        Update: {
          slug?: string;
          name?: string;
          province?: string;
          lat?: string | null;
          lng?: string | null;
          is_active?: boolean | null;
          seo_title?: string | null;
          seo_description?: string | null;
          intro_md?: string | null;
        };
        Relationships: [];
      };
      services: {
        Row: {
          slug: string;
          name: string;
          short_label: string | null;
          seo_title: string | null;
          seo_description: string | null;
          intro_md: string | null;
        };
        Insert: {
          slug: string;
          name: string;
          short_label?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          intro_md?: string | null;
        };
        Update: {
          slug?: string;
          name?: string;
          short_label?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          intro_md?: string | null;
        };
        Relationships: [];
      };
      languages: {
        Row: {
          code: string;
          name_en: string;
          name_native: string | null;
        };
        Insert: {
          code: string;
          name_en: string;
          name_native?: string | null;
        };
        Update: {
          code?: string;
          name_en?: string;
          name_native?: string | null;
        };
        Relationships: [];
      };
      businesses: {
        Row: {
          id: string;
          slug: string;
          legal_name: string;
          display_name: string | null;
          city_slug: string;
          address: string | null;
          lat: string | null;
          lng: string | null;
          phone: string | null;
          website: string | null;
          email: string | null;
          has_physical_office: boolean | null;
          google_place_id: string | null;
          notes_internal: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          legal_name: string;
          display_name?: string | null;
          city_slug: string;
          address?: string | null;
          lat?: string | null;
          lng?: string | null;
          phone?: string | null;
          website?: string | null;
          email?: string | null;
          has_physical_office?: boolean | null;
          google_place_id?: string | null;
          notes_internal?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          legal_name?: string;
          display_name?: string | null;
          city_slug?: string;
          address?: string | null;
          lat?: string | null;
          lng?: string | null;
          phone?: string | null;
          website?: string | null;
          email?: string | null;
          has_physical_office?: boolean | null;
          google_place_id?: string | null;
          notes_internal?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "businesses_city_slug_fkey";
            columns: ["city_slug"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["slug"];
          },
        ];
      };
      consultants: {
        Row: {
          id: string;
          rcic_number: string;
          slug: string;
          full_name: string;
          given_name: string | null;
          family_name: string | null;
          licence_type: string;
          cicc_status: string;
          cicc_verified_on: string;
          primary_city_slug: string | null;
          bio_md: string | null;
          photo_url: string | null;
          free_consultation: boolean | null;
          service_slugs: string[] | null;
          language_codes: string[] | null;
          trust_score: string | null;
          status: string | null;
          featured_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rcic_number: string;
          slug: string;
          full_name: string;
          given_name?: string | null;
          family_name?: string | null;
          licence_type: string;
          cicc_status?: string;
          cicc_verified_on: string;
          primary_city_slug?: string | null;
          bio_md?: string | null;
          photo_url?: string | null;
          free_consultation?: boolean | null;
          service_slugs?: string[] | null;
          language_codes?: string[] | null;
          trust_score?: string;
          status?: string | null;
          featured_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          rcic_number?: string;
          slug?: string;
          full_name?: string;
          given_name?: string | null;
          family_name?: string | null;
          licence_type?: string;
          cicc_status?: string;
          cicc_verified_on?: string;
          primary_city_slug?: string | null;
          bio_md?: string | null;
          photo_url?: string | null;
          free_consultation?: boolean | null;
          service_slugs?: string[] | null;
          language_codes?: string[] | null;
          trust_score?: string;
          status?: string | null;
          featured_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "consultants_primary_city_slug_fkey";
            columns: ["primary_city_slug"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["slug"];
          },
        ];
      };
      consultant_businesses: {
        Row: {
          consultant_id: string;
          business_id: string;
          is_primary: boolean | null;
          role_label: string | null;
          created_at: string;
        };
        Insert: {
          consultant_id: string;
          business_id: string;
          is_primary?: boolean | null;
          role_label?: string | null;
          created_at?: string;
        };
        Update: {
          consultant_id?: string;
          business_id?: string;
          is_primary?: boolean | null;
          role_label?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "consultant_businesses_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "consultant_businesses_consultant_id_fkey";
            columns: ["consultant_id"];
            isOneToOne: false;
            referencedRelation: "consultants";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          id: string;
          consultant_id: string | null;
          business_id: string | null;
          service_slug: string | null;
          city_slug: string | null;
          user_email: string;
          user_phone: string | null;
          user_name: string | null;
          message: string | null;
          language_pref: string | null;
          source: string | null;
          utm: Json | null;
          ip_hash: string | null;
          status: string | null;
          delivered_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          consultant_id?: string | null;
          business_id?: string | null;
          service_slug?: string | null;
          city_slug?: string | null;
          user_email: string;
          user_phone?: string | null;
          user_name?: string | null;
          message?: string | null;
          language_pref?: string | null;
          source?: string | null;
          utm?: Json | null;
          ip_hash?: string | null;
          status?: string | null;
          delivered_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          consultant_id?: string | null;
          business_id?: string | null;
          service_slug?: string | null;
          city_slug?: string | null;
          user_email?: string;
          user_phone?: string | null;
          user_name?: string | null;
          message?: string | null;
          language_pref?: string | null;
          source?: string | null;
          utm?: Json | null;
          ip_hash?: string | null;
          status?: string | null;
          delivered_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "leads_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_city_slug_fkey";
            columns: ["city_slug"];
            isOneToOne: false;
            referencedRelation: "cities";
            referencedColumns: ["slug"];
          },
          {
            foreignKeyName: "leads_consultant_id_fkey";
            columns: ["consultant_id"];
            isOneToOne: false;
            referencedRelation: "consultants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "leads_service_slug_fkey";
            columns: ["service_slug"];
            isOneToOne: false;
            referencedRelation: "services";
            referencedColumns: ["slug"];
          },
        ];
      };
      decision_sessions: {
        Row: {
          id: string;
          answers: Json;
          recommended_consultant_ids: string[] | null;
          converted_lead_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          answers: Json;
          recommended_consultant_ids?: string[] | null;
          converted_lead_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          answers?: Json;
          recommended_consultant_ids?: string[] | null;
          converted_lead_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "decision_sessions_converted_lead_id_fkey";
            columns: ["converted_lead_id"];
            isOneToOne: false;
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      import_batches: {
        Row: {
          id: string;
          source_label: string;
          imported_count: number | null;
          imported_by: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_label: string;
          imported_count?: number | null;
          imported_by?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          source_label?: string;
          imported_by?: string | null;
          imported_count?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
