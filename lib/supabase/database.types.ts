export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; display_name: string | null; avatar_url: string | null; created_at: string; updated_at: string };
        Insert: { id: string; display_name?: string | null; avatar_url?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; display_name?: string | null; avatar_url?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      organizations: {
        Row: { id: string; name: string; created_by: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; name: string; created_by?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; name?: string; created_by?: string | null; created_at?: string; updated_at?: string };
        Relationships: [];
      };
      organization_members: {
        Row: { id: string; organization_id: string; user_id: string; role: "owner" | "admin" | "member"; created_at: string; updated_at: string };
        Insert: { id?: string; organization_id: string; user_id: string; role?: "owner" | "admin" | "member"; created_at?: string; updated_at?: string };
        Update: { id?: string; organization_id?: string; user_id?: string; role?: "owner" | "admin" | "member"; created_at?: string; updated_at?: string };
        Relationships: [{ foreignKeyName: "organization_members_organization_id_fkey"; columns: ["organization_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] }];
      };
      stores: {
        Row: { id: string; organization_id: string; name: string; platform: string; external_store_id: string | null; created_at: string; updated_at: string };
        Insert: { id?: string; organization_id: string; name: string; platform?: string; external_store_id?: string | null; created_at?: string; updated_at?: string };
        Update: { id?: string; organization_id?: string; name?: string; platform?: string; external_store_id?: string | null; created_at?: string; updated_at?: string };
        Relationships: [{ foreignKeyName: "stores_organization_id_fkey"; columns: ["organization_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] }];
      };
      store_connections: {
        Row: { id: string; organization_id: string; store_id: string; provider: string; secret_ref: string | null; scopes: string[]; status: string; metadata: Json; created_at: string; updated_at: string };
        Insert: { id?: string; organization_id: string; store_id: string; provider: string; secret_ref?: string | null; scopes?: string[]; status?: string; metadata?: Json; created_at?: string; updated_at?: string };
        Update: { id?: string; organization_id?: string; store_id?: string; provider?: string; secret_ref?: string | null; scopes?: string[]; status?: string; metadata?: Json; created_at?: string; updated_at?: string };
        Relationships: [
          { foreignKeyName: "store_connections_organization_id_fkey"; columns: ["organization_id"]; isOneToOne: false; referencedRelation: "organizations"; referencedColumns: ["id"] },
          { foreignKeyName: "store_connections_store_id_fkey"; columns: ["store_id"]; isOneToOne: false; referencedRelation: "stores"; referencedColumns: ["id"] },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_id: { Args: Record<string, never>; Returns: string };
      get_current_organization_id: { Args: { p_organization_id: string }; Returns: string | null };
      is_organization_admin: { Args: { p_organization_id: string }; Returns: boolean };
      is_organization_member: { Args: { p_organization_id: string }; Returns: boolean };
      is_organization_owner: { Args: { p_organization_id: string }; Returns: boolean };
      require_organization_admin: { Args: { p_organization_id: string }; Returns: string };
      require_organization_member: { Args: { p_organization_id: string }; Returns: string };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationMembership = Database["public"]["Tables"]["organization_members"]["Row"];
