import { useEffect, useRef, useState } from "react";
import * as Notifications from "expo-notifications";
import { NotificationService } from "../services/notificationService";

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    // Регистрация для пуш-уведомлений
    registerForPushNotifications();

    // Слушатель для получения уведомлений
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    // Слушатель для взаимодействий с уведомлениями
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        // Здесь можно добавить логику навигации
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const registerForPushNotifications = async () => {
    try {
      const token =
        await NotificationService.registerForPushNotificationsAsync();
      setExpoPushToken(token);

      if (token) {
        // Здесь можно сохранить токен в Supabase для отправки уведомлений
        console.log("Push token registered:", token);
      }
    } catch (error) {
      console.error("Error registering for push notifications:", error);
    }
  };

  const sendLocalNotification = async (
    title: string,
    body: string,
    data?: any
  ) => {
    await NotificationService.sendLocalNotification({
      title,
      body,
      data,
    });
  };

  const sendPushNotification = async (
    title: string,
    body: string,
    data?: any
  ) => {
    if (expoPushToken) {
      await NotificationService.sendPushNotification(expoPushToken, {
        title,
        body,
        data,
      });
    } else {
      console.log("No push token available");
    }
  };

  return {
    expoPushToken,
    notification,
    sendLocalNotification,
    sendPushNotification,
  };
};
