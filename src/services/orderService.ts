import { supabase } from "../lib/supabase";
import { Database, Json } from "../lib/supabase.types";
import { WindowSection } from "../components/WindowVisualizer";

export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type WndConstruction =
  Database["public"]["Tables"]["wnd_constructions"]["Row"];
export type WndConstructionInsert =
  Database["public"]["Tables"]["wnd_constructions"]["Insert"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Furniture = Database["public"]["Tables"]["furnitures"]["Row"];
export type WndSection = Database["public"]["Tables"]["wnd_sections"]["Row"];
export type WndSectionInsert = Database["public"]["Tables"]["wnd_sections"]["Insert"];

// Исправленный тип для единичного заказа с джойнами
export type OrderWithJoins = Order & {
  wnd_constructions: WndConstruction & {
    profiles: Profile;
    furnitures: Furniture;
    wnd_sections?: WndSection[];
  };
};

// Массив заказов с джойнами
export type OrderJoin = OrderWithJoins[];

type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];

// Новый тип для создания заказа с конфигурацией окна
export interface OrderWithConfig {
  // Данные заказа
  customer_name: string;
  phone_number: string;
  creator?: string;
  price?: number;
  status?: string;
  config?: number;

  // Конфигурация окна из WindowConfig
  windowConfig: {
    width: number;
    height: number;
    glassThickness: number;
    openingSashType: string;
    shTemplate: string;
    profileId: number;
    furnitureId: number;
    color?: string;
    sections?: WindowSection[];
  };
}

export class OrderService {
  // Получить все заказы
  static async getOrders(): Promise<OrderJoin> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          wnd_constructions (
            *,
            profiles (*),
            furnitures (*),
            wnd_sections (*)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }

      return (data || []) as OrderJoin;
    } catch (error) {
      console.error("Error in getOrders:", error);
      throw error;
    }
  }

  // Получить заказ по ID с джойнами (как в списке заказов)
  static async getOrderWithJoinsById(id: number): Promise<OrderWithJoins | null> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          wnd_constructions (
            *,
            profiles (*),
            furnitures (*),
            wnd_sections (*)
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching order with joins:", error);
        return null;
      }

      return data as OrderWithJoins;
    } catch (error) {
      console.error("Error in getOrderWithJoinsById:", error);
      return null;
    }
  }

  // Получить заказ по ID
  static async getOrderById(id: number): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching order:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in getOrderById:", error);
      throw error;
    }
  }

  // Создать новый заказ (старый метод для совместимости)
  static async createOrder(order: OrderInsert): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert(order)
        .select()
        .single();

      if (error) {
        console.error("Error creating order:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in createOrder:", error);
      throw error;
    }
  }

  // Создать новый заказ с конфигурацией окна (транзакция на стороне БД)
  static async createOrderWithConfig(
    orderData: OrderWithConfig
  ): Promise<OrderWithJoins> {
    const { data: sessionData } = await supabase.auth.getSession();
    const creator =
      sessionData.session?.user.email ??
      sessionData.session?.user.id ??
      "app";

    const sections =
      orderData.windowConfig.sections?.map((section) => ({
        section_id: section.id,
        width_mm: section.widthMM ?? null,
        height_mm: section.heightMM ?? null,
        opening_side: section.openingSide ?? null,
        opening_type: section.openingType ?? null,
        has_handle: section.hasHandle ?? false,
      })) ?? [];

    const payload = {
      customer_name: orderData.customer_name,
      phone_number: orderData.phone_number,
      creator,
      price: orderData.price ?? null,
      status: orderData.status ?? "Новый",
      config: orderData.config ?? 0,
      window: {
        profileId: orderData.windowConfig.profileId,
        furnitureId: orderData.windowConfig.furnitureId,
        openingSashes: String(orderData.windowConfig.openingSashType),
        glassThickness: String(orderData.windowConfig.glassThickness),
        width: orderData.windowConfig.width,
        height: orderData.windowConfig.height,
        shTemplate: orderData.windowConfig.shTemplate,
        color: orderData.windowConfig.color ?? "white",
      },
      sections,
    };

    const { data: orderId, error } = await supabase.rpc(
      "create_order_with_config",
      { p: payload as Json }
    );

    if (error) {
      console.error("Error in create_order_with_config RPC:", error);
      throw error;
    }

    const id = Number(orderId);
    if (!Number.isFinite(id)) {
      throw new Error("create_order_with_config returned no id");
    }

    const full = await this.getOrderWithJoinsById(id);
    if (!full) {
      throw new Error("Order not found after create");
    }
    return full;
  }

  // Обновить заказ
  static async updateOrder(id: number, updates: OrderUpdate): Promise<Order> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating order:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in updateOrder:", error);
      throw error;
    }
  }

  // Удалить заказ
  static async deleteOrder(id: number): Promise<void> {
    try {
      const { error } = await supabase.from("orders").delete().eq("id", id);

      if (error) {
        console.error("Error deleting order:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in deleteOrder:", error);
      throw error;
    }
  }

  // Получить заказы по статусу
  static async getOrdersByStatus(status: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders by status:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getOrdersByStatus:", error);
      throw error;
    }
  }

  // Получить все профили
  static async getProfiles(): Promise<Profile[]> {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getProfiles:", error);
      throw error;
    }
  }

  // Получить всю фурнитуру
  static async getFurnitures(): Promise<Furniture[]> {
    try {
      const { data, error } = await supabase
        .from("furnitures")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching furnitures:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getFurnitures:", error);
      throw error;
    }
  }

  // Обновить конфигурацию заказа
  static async updateOrderConfig(
    orderId: number,
    configData: {
      width: number;
      height: number;
      glassThickness: number;
      openingSashType: string;
      shTemplate: string;
      profileId: number;
      furnitureId: number;
      price?: number;
      config?: number;
      color?: string;
      sections?: WindowSection[];
    }
  ): Promise<OrderWithJoins> {
    try {
      // Сначала получаем заказ, чтобы найти ID конфигурации окна
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("wnd")
        .eq("id", orderId)
        .single();

      if (orderError || !order) {
        console.error("Error fetching order:", orderError);
        throw new Error("Заказ не найден");
      }

      if (!order.wnd) {
        throw new Error("У заказа нет конфигурации окна");
      }

      // Обновляем конфигурацию окна
      const wndConstructionUpdate: Partial<WndConstructionInsert> = {
        profileSystem: configData.profileId,
        furniture: configData.furnitureId,
        opening_sashes: configData.openingSashType.toString(),
        th_glass:
          configData.glassThickness.toString() as Database["public"]["Enums"]["glass_thickness"],
        size: {
          width: configData.width,
          height: configData.height,
        },
        width_mm: configData.width,
        height_mm: configData.height,
        sh_template: configData.shTemplate,
        color: configData.color || "white",
      };

      const { error: wndError } = await supabase
        .from("wnd_constructions")
        .update(wndConstructionUpdate)
        .eq("id", order.wnd);

      if (wndError) {
        console.error("Error updating window construction:", wndError);
        throw wndError;
      }

      // Обновляем секции окна: удаляем старые и вставляем новые
      if (configData.sections !== undefined) {
        // Удаляем старые секции
        const { error: deleteError } = await supabase
          .from("wnd_sections")
          .delete()
          .eq("wnd_construction_id", order.wnd);

        if (deleteError) {
          console.error("Error deleting old sections:", deleteError);
          throw deleteError;
        }

        // Вставляем новые секции
        if (configData.sections.length > 0) {
          const sectionsData: WndSectionInsert[] = configData.sections.map(
            (section) => ({
              wnd_construction_id: order.wnd!,
              section_id: section.id,
              width_mm: section.widthMM || null,
              height_mm: section.heightMM || null,
              opening_side: section.openingSide || null,
              opening_type: section.openingType || null,
              has_handle: section.hasHandle || false,
            })
          );

          const { error: sectionsError } = await supabase
            .from("wnd_sections")
            .insert(sectionsData);

          if (sectionsError) {
            console.error("Error inserting new sections:", sectionsError);
            throw sectionsError;
          }
        }
      }

      // Обновляем цену и конфигурацию заказа, если они переданы
      const orderUpdates: any = {};
      if (configData.price !== undefined) {
        orderUpdates.price = configData.price;
      }
      if (configData.config !== undefined) {
        orderUpdates.config = configData.config;
      }

      if (Object.keys(orderUpdates).length > 0) {
        const { error: orderUpdateError } = await supabase
          .from("orders")
          .update(orderUpdates)
          .eq("id", orderId);

        if (orderUpdateError) {
          console.error("Error updating order:", orderUpdateError);
          throw orderUpdateError;
        }
      }

      // Получаем обновленный заказ с джойнами
      const { data: updatedOrder, error: fetchError } = await supabase
        .from("orders")
        .select(
          `
          *,
          wnd_constructions (
            *,
            profiles (*),
            furnitures (*),
            wnd_sections (*)
          )
        `
        )
        .eq("id", orderId)
        .single();

      if (fetchError) {
        console.error("Error fetching updated order:", fetchError);
        throw fetchError;
      }

      return updatedOrder as OrderWithJoins;
    } catch (error) {
      console.error("Error in updateOrderConfig:", error);
      throw error;
    }
  }
}
