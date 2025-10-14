import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Настройка обработчика уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

export class NotificationService {
  // Регистрация для пуш-уведомлений
  static async registerForPushNotificationsAsync(): Promise<string | null> {
    let token: string | null = null;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Failed to get push token for push notification!");
        return null;
      }

      try {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error("Project ID not found");
        }

        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log("Expo push token:", token);
      } catch (error) {
        console.error("Error getting push token:", error);
        return null;
      }
    } else {
      console.log("Must use physical device for Push Notifications");
    }

    return token;
  }

  // Отправка локального уведомления
  static async sendLocalNotification(
    notification: NotificationData
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
      },
      trigger: null, // Показать немедленно
    });
  }

  // Отправка пуш-уведомления через notification server
  static async sendPushNotification(
    expoPushToken: string,
    notification: NotificationData
  ): Promise<void> {
    try {
      const link = `${process.env.EXPO_PUBLIC_NOTIFICATION_SERVER_URL}/send-notification`;
      console.log("Link:", link);
      const response = await fetch(link, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: notification.title,
          body: notification.body,
          data: notification.data,
          pushTokens: [expoPushToken],
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send notification");
      }

      console.log("Response:", response);
      console.log("Push notification sent:", result);
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  }

  // Получение всех уведомлений
  static async getAllNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  // Отправка пуш-уведомлений нескольким пользователям через notification server
  static async sendPushNotificationsToMultiple(
    expoPushTokens: string[],
    notification: NotificationData
  ): Promise<void> {
    try {
      const link = `${process.env.EXPO_PUBLIC_NOTIFICATION_SERVER_URL}/send-notification`;
      console.log("Link:", link);
      const response = await fetch(link, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: notification.title,
          body: notification.body,
          data: notification.data,
          pushTokens: expoPushTokens,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send notifications");
      }

      console.log(
        `Push notifications sent to ${expoPushTokens.length} users:`,
        result
      );
    } catch (error) {
      console.error("Error sending push notifications:", error);
    }
  }

  // Очистка всех уведомлений
  static async clearAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}
