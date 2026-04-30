import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import * as Sentry from "@sentry/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/context/ThemeContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { OrdersRealtimeProvider } from "./src/context/OrdersRealtimeContext";
import { useNotifications } from "./src/hooks/useNotifications";
import { SupabaseNotificationService } from "./src/services/supabaseNotificationService";
import { AppErrorBoundary } from "./src/components/AppErrorBoundary";
import { LoginScreen } from "./src/screens/LoginScreen";

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: sentryDsn,
  enabled: Boolean(sentryDsn),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
  },
});

const AppShell: React.FC = () => {
  const { session, loading } = useAuth();
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return (
    <OrdersRealtimeProvider>
      <AppNavigator />
    </OrdersRealtimeProvider>
  );
};

const App: React.FC = () => {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <AppShell />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
