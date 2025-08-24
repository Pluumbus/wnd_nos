import { supabase } from "../lib/supabase";
import { Database } from "../lib/supabase.types";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];
type OrderUpdate = Database["public"]["Tables"]["orders"]["Update"];

export class OrderService {
  // Получить все заказы
  static async getOrders(): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
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

  // Создать новый заказ
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
}
