import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider, useTheme } from "./src/context/ThemeContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { OrdersRealtimeProvider } from "./src/context/OrdersRealtimeContext";
import { useNotifications } from "./src/hooks/useNotifications";
import { SupabaseNotificationService } from "./src/services/supabaseNotificationService";
import { AppErrorBoundary } from "./src/components/AppErrorBoundary";
import { AuthNavigator } from "./src/navigation/AuthNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { isSupabaseConfigured } from "./src/lib/supabase";

const MissingSupabaseConfig: React.FC = () => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      padding: 24,
      backgroundColor: "#1a1a2e",
    }}
  >
    <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff", marginBottom: 12 }}>
      Нет настроек Supabase
    </Text>
    <Text style={{ fontSize: 15, color: "#ccc", lineHeight: 22 }}>
      В JavaScript-бандл не попали EXPO_PUBLIC_SUPABASE_URL и EXPO_PUBLIC_SUPABASE_ANON_KEY. Для EAS:
      задайте их в переменных окружения проекта на expo.dev или через{" "}
      <Text style={{ fontWeight: "600", color: "#fff" }}>eas env:create</Text>, затем пересоберите
      приложение.
    </Text>
  </View>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
  },
});

const AppShell: React.FC = () => {
  const { session, loading } = useAuth();
  const { theme } = useTheme();
  const { expoPushToken } = useNotifications();

  useEffect(() => {
    void (async () => {
      const ok = await SupabaseNotificationService.checkPushTokensTable();
      if (!ok) {
        console.log("user_push_tokens table missing — run Supabase migrations");
      }
    })();
  }, []);

  useEffect(() => {
    if (expoPushToken && session?.user?.id) {
      void SupabaseNotificationService.savePushToken(session.user.id, expoPushToken).catch(
        (e) => console.error("Error saving push token:", e)
      );
    }
  }, [expoPushToken, session?.user?.id]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!session) {
    return <AuthNavigator />;
  }

  return (
    <OrdersRealtimeProvider>
      <AppNavigator />
    </OrdersRealtimeProvider>
  );
};

const App: React.FC = () => {
  if (!isSupabaseConfigured) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <MissingSupabaseConfig />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider>
              <SafeAreaProvider>
                <AppShell />
              </SafeAreaProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </AppErrorBoundary>
    </GestureHandlerRootView>
  );
};

export default App;
