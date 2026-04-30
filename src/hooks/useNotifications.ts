import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import { NotificationService } from "../services/notificationService";

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | undefined>(
    undefined
  );
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const token = await NotificationService.registerForPushNotificationsAsync();
        setExpoPushToken(token);
      } catch (error) {
        console.error("Error registering for push notifications:", error);
      }
    })();

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (n) => {
        setNotification(n);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("Notification response:", response);
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const sendLocalNotification = async (title: string, body: string, data?: unknown) => {
    await NotificationService.sendLocalNotification({ title, body, data });
  };

  return {
    expoPushToken,
    notification,
    sendLocalNotification,
  };
};
