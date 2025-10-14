import { supabase } from "../lib/supabase";
import { Database } from "../lib/supabase.types";
import { SupabaseNotificationService } from "./supabaseNotificationService";
import { WindowConfig } from "../components/WindowVisualizer";

export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type WndConstruction =
  Database["public"]["Tables"]["wnd_constructions"]["Row"];
export type WndConstructionInsert =
  Database["public"]["Tables"]["wnd_constructions"]["Insert"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Furniture = Database["public"]["Tables"]["furnitures"]["Row"];

// Исправленный тип для единичного заказа с джойнами
export type OrderWithJoins = Order & {
  wnd_constructions: WndConstruction & {
    profiles: Profile;
    furnitures: Furniture;
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
            furnitures (*)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getOrders:", error);
      throw error;
    }
  }

  // Получить заказ по ID
  static async getOrderById(id: string): Promise<Order | null> {
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

      // Отправляем уведомления о новом заказе
      try {
        await SupabaseNotificationService.notifyNewOrder(data);
      } catch (notificationError) {
        console.error("Error sending notifications:", notificationError);
        // Не прерываем выполнение, если уведомления не отправились
      }

      return data;
    } catch (error) {
      console.error("Error in createOrder:", error);
      throw error;
    }
  }

  // Создать новый заказ с конфигурацией окна
  static async createOrderWithConfig(
    orderData: OrderWithConfig
  ): Promise<OrderWithJoins> {
    try {
      // Начинаем транзакцию - сначала создаем конфигурацию окна
      const wndConstructionData: WndConstructionInsert = {
        profileSystem: orderData.windowConfig.profileId,
        furniture: orderData.windowConfig.furnitureId,
        opening_sashes: orderData.windowConfig.openingSashType.toString(),
        th_glass:
          orderData.windowConfig.glassThickness.toString() as Database["public"]["Enums"]["glass_thickness"],
        size: {
          width: orderData.windowConfig.width,
          height: orderData.windowConfig.height,
        },
        sh_template: orderData.windowConfig.shTemplate,
        color: orderData.windowConfig.color || "white",
      };

      // Создаем конфигурацию окна
      const { data: wndConstruction, error: wndError } = await supabase
        .from("wnd_constructions")
        .insert(wndConstructionData)
        .select()
        .single();

      if (wndError) {
        console.error("Error creating window construction:", wndError);
        throw wndError;
      }

      // Создаем заказ со ссылкой на конфигурацию окна
      const orderInsertData: OrderInsert = {
        customer_name: orderData.customer_name,
        phone_number: orderData.phone_number,
        creator: "Приложение",
        price: orderData.price || null,
        status: orderData.status || "Новый",
        config: orderData.config || 0,
        wnd: wndConstruction.id,
      };

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderInsertData)
        .select()
        .single();

      if (orderError) {
        // Если заказ не создался, удаляем созданную конфигурацию окна
        await supabase
          .from("wnd_constructions")
          .delete()
          .eq("id", wndConstruction.id);

        console.error("Error creating order:", orderError);
        throw orderError;
      }

      // Получаем полный заказ с джойнами
      const { data: fullOrder, error: fetchError } = await supabase
        .from("orders")
        .select(
          `
          *,
          wnd_constructions (
            *,
            profiles (*),
            furnitures (*)
          )
        `
        )
        .eq("id", order.id)
        .single();

      if (fetchError) {
        console.error("Error fetching created order:", fetchError);
        throw fetchError;
      }

      // Отправляем уведомления о новом заказе
      try {
        await SupabaseNotificationService.notifyNewOrder(order);
      } catch (notificationError) {
        console.error("Error sending notifications:", notificationError);
        // Не прерываем выполнение, если уведомления не отправились
      }

      return fullOrder as OrderWithJoins;
    } catch (error) {
      console.error("Error in createOrderWithConfig:", error);
      throw error;
    }
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

  // Подписаться на изменения заказов в реальном времени
  static subscribeToOrders(callback: (payload: any) => void) {
    return supabase
      .channel("orders_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        callback
      )
      .subscribe();
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
            furnitures (*)
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
