import { supabase } from "../lib/supabase";
import { NotificationService } from "./notificationService";
import { Order } from "./orderService";

export class SupabaseNotificationService {
  // Сохранение push токена пользователя в Supabase
  static async savePushToken(userId: string, pushToken: string): Promise<void> {
    try {
      // Сначала проверяем, существует ли уже такой токен для пользователя
      const { data: existingToken, error: selectError } = await supabase
        .from("user_push_tokens")
        .select("push_token")
        .eq("user_id", userId)
        .eq("push_token", pushToken)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        // PGRST116 означает "no rows returned", что нормально
        console.error("Error checking existing push token:", selectError);
        throw selectError;
      }

      // Если токен уже существует, просто обновляем время
      if (existingToken) {
        console.log("Push token already exists for user, updating timestamp");
        const { error: updateError } = await supabase
          .from("user_push_tokens")
          .update({ updated_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("push_token", pushToken);

        if (updateError) {
          console.error("Error updating push token timestamp:", updateError);
          throw updateError;
        }
        return;
      }

      // Если токена нет, создаем новый
      const { error } = await supabase.from("user_push_tokens").upsert({
        user_id: userId,
        push_token: pushToken,
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

  // Получение всех push токенов пользователей
  static async getAllPushTokens(): Promise<string[]> {
    try {
      const { data, error } = await supabase
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

  // Отправка уведомления всем пользователям о новом заказе
  static async notifyNewOrder(order: Order): Promise<void> {
    try {
      const pushTokens = await this.getAllPushTokens();

      if (pushTokens.length === 0) {
        console.log("No push tokens found");
        return;
      }

      const notification = {
        title: "Новый заказ!",
        body: `Создан заказ #${order.id} от ${
          order.customer_name || "Неизвестный клиент"
        }`,
        data: {
          orderId: order.id,
          type: "new_order",
        },
      };

      // Отправляем уведомления всем пользователям через новый метод
      await NotificationService.sendPushNotificationsToMultiple(
        pushTokens,
        notification
      );
      console.log(`Notifications sent to ${pushTokens.length} users`);
    } catch (error) {
      console.error("Error in notifyNewOrder:", error);
      throw error;
    }
  }

  // Ручная обработка очереди уведомлений (для тестирования)
  static async processNotificationQueue(): Promise<void> {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_NOTIFICATION_SERVER_URL}/process-queue`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      console.log("Queue processing result:", result);
    } catch (error) {
      console.error("Error processing notification queue:", error);
      throw error;
    }
  }

  // Подписка на изменения в таблице orders
  static subscribeToOrderChanges(): void {
    supabase
      .channel("order_notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
        },
        async (payload) => {
          console.log("New order detected:", payload);

          try {
            // Получаем полную информацию о заказе
            const { data: order, error } = await supabase
              .from("orders")
              .select("*")
              .eq("id", payload.new.id)
              .single();

            if (error) {
              console.error("Error fetching order details:", error);
              return;
            }

            // Отправляем уведомления
            await this.notifyNewOrder(order);
          } catch (error) {
            console.error("Error processing new order notification:", error);
          }
        }
      )
      .subscribe();
  }

  // Проверка существования таблицы push токенов
  static async checkPushTokensTable(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("user_push_tokens")
        .select("id")
        .limit(1);

      if (error) {
        console.log("Push tokens table does not exist yet");
        return false;
      }

      console.log("Push tokens table exists");
      return true;
    } catch (error) {
      console.error("Error checking push tokens table:", error);
      return false;
    }
  }
}
