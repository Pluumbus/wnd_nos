import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { SupabaseService, OrderData } from "./SupabaseService";

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

export interface NotificationResult {
  success: boolean;
  sent: number;
  failed: number;
  errors: string[];
  tickets: any[];
}

export class NotificationService {
  private expo: Expo;
  private supabaseService: SupabaseService;

  constructor() {
    // Создаем экземпляр Expo SDK без access token для разработки
    this.expo = new Expo({
      // accessToken: process.env.EXPO_ACCESS_TOKEN, // Убираем для разработки
      useFcmV1: true, // Используем FCM v1 (рекомендуется)
    });

    this.supabaseService = new SupabaseService();
  }

  // Отправка уведомлений нескольким пользователям
  async sendPushNotifications(
    pushTokens: string[],
    notification: NotificationData
  ): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false,
      sent: 0,
      failed: 0,
      errors: [],
      tickets: [],
    };

    try {
      // Фильтруем валидные токены
      const validTokens = pushTokens.filter((token) =>
        Expo.isExpoPushToken(token)
      );

      if (validTokens.length === 0) {
        result.errors.push("No valid Expo push tokens found");
        return result;
      }

      // Создаем сообщения
      const messages: ExpoPushMessage[] = validTokens.map((token) => ({
        to: token,
        sound: "default",
        title: notification.title,
        body: notification.body,
        data: notification.data,
      }));

      // Отправляем уведомления с chunking
      const chunks = this.expo.chunkPushNotifications(messages);

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          result.tickets.push(...ticketChunk);

          // Подсчитываем успешные и неудачные отправки
          for (const ticket of ticketChunk) {
            if (ticket.status === "ok") {
              result.sent++;
            } else {
              result.failed++;
              const errorMsg = ticket.message || "Unknown error";
              const token = ticket.details?.expoPushToken || "unknown token";

              // Специальная обработка для невалидных токенов
              if (
                errorMsg.includes("invalid_token") ||
                errorMsg.includes("401")
              ) {
                result.errors.push(
                  `Invalid Expo token (${token}): ${errorMsg}. Check EXPO_ACCESS_TOKEN or remove it for development.`
                );
              } else {
                result.errors.push(`Failed to send to ${token}: ${errorMsg}`);
              }
            }
          }
        } catch (error) {
          result.failed += chunk.length;
          result.errors.push(
            `Chunk error: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }
      }

      result.success = result.sent > 0;
      console.log(
        `Push notifications sent: ${result.sent} success, ${result.failed} failed`
      );
    } catch (error) {
      result.errors.push(
        `Service error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      console.error("Error sending push notifications:", error);
    }

    return result;
  }

  // Отправка уведомления о новом заказе
  async sendNewOrderNotification(
    order: OrderData
  ): Promise<NotificationResult> {
    try {
      // Получаем все push токены
      const pushTokens = await this.supabaseService.getAllPushTokens();

      if (pushTokens.length === 0) {
        return {
          success: false,
          sent: 0,
          failed: 0,
          errors: ["No push tokens found"],
          tickets: [],
        };
      }

      // Создаем уведомление
      const notification: NotificationData = {
        title: "Новый заказ!",
        body: `Создан заказ #${order.id} от ${
          order.customer_name || "Неизвестный клиент"
        }`,
        data: {
          orderId: order.id,
          type: "new_order",
          customerName: order.customer_name,
          price: order.price,
        },
      };

      // Отправляем уведомления
      return await this.sendPushNotifications(pushTokens, notification);
    } catch (error) {
      console.error("Error sending new order notification:", error);
      return {
        success: false,
        sent: 0,
        failed: 0,
        errors: [
          `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        ],
        tickets: [],
      };
    }
  }

  // Обработка очереди уведомлений
  async processNotificationQueue(): Promise<NotificationResult> {
    const result: NotificationResult = {
      success: false,
      sent: 0,
      failed: 0,
      errors: [],
      tickets: [],
    };

    try {
      // Получаем необработанные уведомления
      const pendingNotifications =
        await this.supabaseService.getPendingNotifications();

      if (pendingNotifications.length === 0) {
        console.log("No pending notifications to process");
        return result;
      }

      console.log(
        `Processing ${pendingNotifications.length} pending notifications`
      );

      // Получаем все push токены
      const pushTokens = await this.supabaseService.getAllPushTokens();

      if (pushTokens.length === 0) {
        // Помечаем уведомления как обработанные даже если нет токенов
        for (const notification of pendingNotifications) {
          await this.supabaseService.markNotificationAsProcessed(
            notification.id
          );
        }

        result.errors.push("No push tokens found");
        return result;
      }

      // Обрабатываем каждое уведомление
      for (const notification of pendingNotifications) {
        try {
          const orderData: OrderData = notification.order_data.order;

          // Создаем уведомление
          const notificationData: NotificationData = {
            title: "Новый заказ!",
            body: `Создан заказ #${orderData.id} от ${
              orderData.customer_name || "Неизвестный клиент"
            }`,
            data: {
              orderId: orderData.id,
              type: "new_order",
              customerName: orderData.customer_name,
              price: orderData.price,
            },
          };

          // Отправляем уведомления
          const sendResult = await this.sendPushNotifications(
            pushTokens,
            notificationData
          );

          // Обновляем счетчики
          result.sent += sendResult.sent;
          result.failed += sendResult.failed;
          result.errors.push(...sendResult.errors);
          result.tickets.push(...sendResult.tickets);

          // Помечаем уведомление как обработанное
          await this.supabaseService.markNotificationAsProcessed(
            notification.id
          );
        } catch (error) {
          result.failed++;
          result.errors.push(
            `Error processing notification ${notification.id}: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
          console.error(
            `Error processing notification ${notification.id}:`,
            error
          );
        }
      }

      result.success = result.sent > 0;
      console.log(
        `Queue processing completed: ${result.sent} sent, ${result.failed} failed`
      );
    } catch (error) {
      result.errors.push(
        `Queue processing error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      console.error("Error processing notification queue:", error);
    }

    return result;
  }

  // Получение статуса доставки (receipts)
  async getDeliveryReceipts(ticketIds: string[]): Promise<any> {
    try {
      if (ticketIds.length === 0) {
        return {};
      }

      const receiptIdChunks =
        this.expo.chunkPushNotificationReceiptIds(ticketIds);
      const receipts: any = {};

      for (const chunk of receiptIdChunks) {
        try {
          const chunkReceipts =
            await this.expo.getPushNotificationReceiptsAsync(chunk);
          Object.assign(receipts, chunkReceipts);
        } catch (error) {
          console.error("Error getting receipts for chunk:", error);
        }
      }

      return receipts;
    } catch (error) {
      console.error("Error getting delivery receipts:", error);
      throw error;
    }
  }
}
