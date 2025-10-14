export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      furnitures: {
        Row: {
          created_at: string;
          id: number;
          name: string | null;
          price: number;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name?: string | null;
          price?: number;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string | null;
          price?: number;
        };
        Relationships: [];
      };
      notification_queue: {
        Row: {
          created_at: string | null;
          id: number;
          order_data: Json;
          processed: boolean | null;
          processed_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: number;
          order_data: Json;
          processed?: boolean | null;
          processed_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: number;
          order_data?: Json;
          processed?: boolean | null;
          processed_at?: string | null;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          config: number;
          created_at: string;
          creator: string;
          customer_name: string | null;
          id: number;
          phone_number: string | null;
          price: number | null;
          status: string | null;
          wnd: number | null;
        };
        Insert: {
          config?: number;
          created_at?: string;
          creator?: string;
          customer_name?: string | null;
          id?: number;
          phone_number?: string | null;
          price?: number | null;
          status?: string | null;
          wnd?: number | null;
        };
        Update: {
          config?: number;
          created_at?: string;
          creator?: string;
          customer_name?: string | null;
          id?: number;
          phone_number?: string | null;
          price?: number | null;
          status?: string | null;
          wnd?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_wnd_fkey";
            columns: ["wnd"];
            isOneToOne: false;
            referencedRelation: "wnd_constructions";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          id: number;
          name: string | null;
          price: number;
        };
        Insert: {
          created_at?: string;
          id?: number;
          name?: string | null;
          price?: number;
        };
        Update: {
          created_at?: string;
          id?: number;
          name?: string | null;
          price?: number;
        };
        Relationships: [];
      };
      user_push_tokens: {
        Row: {
          created_at: string | null;
          device_type: string | null;
          id: number;
          push_token: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          device_type?: string | null;
          id?: number;
          push_token: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          device_type?: string | null;
          id?: number;
          push_token?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      wnd_constructions: {
        Row: {
          color: string;
          created_at: string;
          furniture: number | null;
          id: number;
          opening_sashes: string | null;
          profileSystem: number;
          sh_template: string;
          size: Json;
          th_glass: Database["public"]["Enums"]["glass_thickness"] | null;
        };
        Insert: {
          color?: string;
          created_at?: string;
          furniture?: number | null;
          id?: number;
          opening_sashes?: string | null;
          profileSystem: number;
          sh_template?: string;
          size?: Json;
          th_glass?: Database["public"]["Enums"]["glass_thickness"] | null;
        };
        Update: {
          color?: string;
          created_at?: string;
          furniture?: number | null;
          id?: number;
          opening_sashes?: string | null;
          profileSystem?: number;
          sh_template?: string;
          size?: Json;
          th_glass?: Database["public"]["Enums"]["glass_thickness"] | null;
        };
        Relationships: [
          {
            foreignKeyName: "wnd_constructions_furniture_fkey";
            columns: ["furniture"];
            isOneToOne: false;
            referencedRelation: "furnitures";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wnd_constructions_profileSystem_fkey";
            columns: ["profileSystem"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      bytea_to_text: {
        Args: { data: string };
        Returns: string;
      };
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_delete: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { uri: string };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_get: {
        Args: { data: Json; uri: string } | { uri: string };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_head: {
        Args: { uri: string };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_header: {
        Args: { field: string; value: string };
        Returns: Database["public"]["CompositeTypes"]["http_header"];
      };
      http_list_curlopt: {
        Args: Record<PropertyKey, never>;
        Returns: {
          curlopt: string;
          value: string;
        }[];
      };
      http_patch: {
        Args: { content: string; content_type: string; uri: string };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_post: {
        Args:
          | { content: string; content_type: string; uri: string }
          | { data: Json; uri: string };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_put: {
        Args: { content: string; content_type: string; uri: string };
        Returns: Database["public"]["CompositeTypes"]["http_response"];
      };
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      http_set_curlopt: {
        Args: { curlopt: string; value: string };
        Returns: boolean;
      };
      text_to_bytea: {
        Args: { data: string };
        Returns: string;
      };
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string };
        Returns: string;
      };
    };
    Enums: {
      glass_thickness: "24" | "32" | "40";
    };
    CompositeTypes: {
      http_header: {
        field: string | null;
        value: string | null;
      };
      http_request: {
        method: unknown | null;
        uri: string | null;
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null;
        content_type: string | null;
        content: string | null;
      };
      http_response: {
        status: number | null;
        content_type: string | null;
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null;
        content: string | null;
      };
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      glass_thickness: ["24", "32", "40"],
    },
  },
} as const;
