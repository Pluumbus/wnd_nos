import { createClient } from "@supabase/supabase-js";

export interface OrderData {
  id: number;
  customer_name: string | null;
  phone_number: string | null;
  price: number | null;
  status: string | null;
  creator: string;
  created_at: string;
}

export interface NotificationQueueItem {
  id: number;
  order_data: { order: OrderData };
  created_at: string;
  processed: boolean;
  processed_at: string | null;
}

export interface PushToken {
  id: number;
  user_id: string;
  push_token: string;
  device_type: string | null;
  created_at: string;
  updated_at: string;
}

export class SupabaseService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Получение Supabase клиента для realtime
  getSupabaseClient() {
    return this.supabase;
  }

  // Получение всех push токенов
  async getAllPushTokens(): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from("user_push_tokens")
        .select("push_token");

      if (error) {
        console.error("Error fetching push tokens:", error);
        throw error;
      }

      return data?.map((item) => item.push_token).filter(Boolean) || [];
    } catch (error) {
      console.error("Error in getAllPushTokens:", error);
      throw error;
    }
  }

  // Получение необработанных уведомлений из очереди
  async getPendingNotifications(): Promise<NotificationQueueItem[]> {
    try {
      const { data, error } = await this.supabase
        .from("notification_queue")
        .select("*")
        .eq("processed", false)
        .order("created_at", { ascending: true })
        .limit(10);

      if (error) {
        console.error("Error fetching pending notifications:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getPendingNotifications:", error);
      throw error;
    }
  }

  // Пометить уведомление как обработанное
  async markNotificationAsProcessed(id: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("notification_queue")
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("Error marking notification as processed:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in markNotificationAsProcessed:", error);
      throw error;
    }
  }

  // Получение статистики
  async getNotificationStats(): Promise<any> {
    try {
      // Общее количество токенов
      const { count: totalTokens } = await this.supabase
        .from("user_push_tokens")
        .select("*", { count: "exact", head: true });

      // Количество необработанных уведомлений
      const { count: pendingNotifications } = await this.supabase
        .from("notification_queue")
        .select("*", { count: "exact", head: true })
        .eq("processed", false);

      // Количество обработанных уведомлений за последние 24 часа
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const { count: processedToday } = await this.supabase
        .from("notification_queue")
        .select("*", { count: "exact", head: true })
        .eq("processed", true)
        .gte("processed_at", yesterday.toISOString());

      return {
        totalTokens,
        pendingNotifications,
        processedToday,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error getting notification stats:", error);
      throw error;
    }
  }

  // Сохранение push токена
  async savePushToken(
    userId: string,
    pushToken: string,
    deviceType?: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from("user_push_tokens").upsert({
        user_id: userId,
        push_token: pushToken,
        device_type: deviceType,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving push token:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in savePushToken:", error);
      throw error;
    }
  }

  // Удаление push токена
  async removePushToken(pushToken: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("user_push_tokens")
        .delete()
        .eq("push_token", pushToken);

      if (error) {
        console.error("Error removing push token:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in removePushToken:", error);
      throw error;
    }
  }
}
