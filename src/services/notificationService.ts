import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

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
  data?: unknown;
}

export class NotificationService {
  static async registerForPushNotificationsAsync(): Promise<string | null> {
    /** Expo Go на Android (SDK 53+): удалён remote push — нужен development build. */
    if (
      Platform.OS === "android" &&
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient
    ) {
      return null;
    }

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
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
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
          Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          throw new Error("Project ID not found");
        }

        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      } catch (error) {
        console.error("Error getting push token:", error);
        return null;
      }
    } else {
      console.log("Must use physical device for Push Notifications");
    }

    return token;
  }

  static async sendLocalNotification(notification: NotificationData): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data as Record<string, unknown> | undefined,
      },
      trigger: null,
    });
  }

  static async getAllNotifications(): Promise<Notifications.NotificationRequest[]> {
    return Notifications.getAllScheduledNotificationsAsync();
  }

  static async clearAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}
