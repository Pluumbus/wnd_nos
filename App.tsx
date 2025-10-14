import React, { useEffect } from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/context/ThemeContext";
import { useNotifications } from "./src/hooks/useNotifications";
import { SupabaseNotificationService } from "./src/services/supabaseNotificationService";

const App: React.FC = () => {
  const { expoPushToken } = useNotifications();

  useEffect(() => {
    // Инициализация уведомлений
    const initializeNotifications = async () => {
      try {
        // Проверяем существование таблицы для push токенов
        const tableExists =
          await SupabaseNotificationService.checkPushTokensTable();

        if (!tableExists) {
          console.log(
            "Please create the user_push_tokens table in Supabase first"
          );
          console.log(
            "Run the SQL migration from supabase/migrations/001_create_push_tokens_table.sql"
          );
        }

        // Подписываемся на изменения заказов
        SupabaseNotificationService.subscribeToOrderChanges();

        console.log("Notifications initialized successfully");
      } catch (error) {
        console.error("Error initializing notifications:", error);
      }
    };

    initializeNotifications();
  }, []);

  useEffect(() => {
    // Сохраняем push токен при его получении
    if (expoPushToken) {
      const saveToken = async () => {
        try {
          // Здесь можно использовать ID текущего пользователя
          // Пока используем временный ID
          const userId = "current_user"; // Замените на реальный ID пользователя
          await SupabaseNotificationService.savePushToken(
            userId,
            expoPushToken
          );
          console.log("Push token saved successfully");
        } catch (error) {
          console.error("Error saving push token:", error);
        }
      };

      saveToken();
    }
  }, [expoPushToken]);

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
};

export default App;
