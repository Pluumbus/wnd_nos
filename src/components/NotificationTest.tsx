import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNotifications } from "../hooks/useNotifications";
import { SupabaseNotificationService } from "../services/supabaseNotificationService";

export const NotificationTest: React.FC = () => {
  const { sendLocalNotification, sendPushNotification, expoPushToken } =
    useNotifications();

  const handleTestLocalNotification = async () => {
    try {
      await sendLocalNotification(
        "Тестовое уведомление",
        "Это локальное уведомление для тестирования",
        { type: "test" }
      );
      // Alert.alert("Успех", "Локальное уведомление отправлено");
    } catch (error) {
      console.error("Error sending local notification:", error);
      Alert.alert("Ошибка", "Не удалось отправить локальное уведомление");
    }
  };

  const handleTestPushNotification = async () => {
    try {
      await sendPushNotification(
        "Тестовое пуш-уведомление",
        "Это пуш-уведомление для тестирования",
        { type: "test" }
      );
      // Alert.alert("Успех", "Пуш-уведомление отправлено");
    } catch (error) {
      console.error("Error sending push notification:", error);
      Alert.alert("Ошибка", "Не удалось отправить пуш-уведомление");
    }
  };

  const handleProcessQueue = async () => {
    try {
      await SupabaseNotificationService.processNotificationQueue();
      // Alert.alert("Успех", "Очередь уведомлений обработана");
    } catch (error) {
      console.error("Error processing queue:", error);
      Alert.alert("Ошибка", "Не удалось обработать очередь уведомлений");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Тестирование уведомлений</Text>

      <View style={styles.tokenContainer}>
        <Text style={styles.tokenLabel}>Push Token:</Text>
        <Text style={styles.tokenText} numberOfLines={3}>
          {expoPushToken || "Токен не получен"}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleTestLocalNotification}
      >
        <Text style={styles.buttonText}>Тест локального уведомления</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, !expoPushToken && styles.buttonDisabled]}
        onPress={handleTestPushNotification}
        disabled={!expoPushToken}
      >
        <Text style={styles.buttonText}>Тест пуш-уведомления</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleProcessQueue}>
        <Text style={styles.buttonText}>Обработать очередь уведомлений</Text>
      </TouchableOpacity>

      {!expoPushToken && (
        <Text style={styles.warningText}>
          Push токен не получен. Убедитесь, что приложение запущено на
          физическом устройстве.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 80,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  tokenContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tokenLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
  },
  tokenText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  warningText: {
    fontSize: 12,
    color: "#ff6b6b",
    textAlign: "center",
    marginTop: 10,
  },
});
