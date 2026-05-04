import { supabase } from "../lib/supabase";

export class SupabaseNotificationService {
  /**
   * Сохраняет push-токен за текущим пользователем (JWT → auth.uid() на сервере).
   * Используется RPC с ON CONFLICT(push_token): один токен = одно устройство,
   * при смене аккаунта строка перепривязывается без 23505; через insert/upsert
   * с клиента это ломалось из‑за UNIQUE на push_token и RLS.
   */
  static async savePushToken(_userId: string, pushToken: string): Promise<void> {
    const trimmed = pushToken.trim();
    if (!trimmed) {
      return;
    }

    const { error } = await supabase.rpc("register_push_token", {
      p_push_token: trimmed,
    });

    if (error) {
      console.error("Error saving push token:", error);
      throw error;
    }
  }

  static async checkPushTokensTable(): Promise<boolean> {
    try {
      const { error } = await supabase.from("user_push_tokens").select("id").limit(1);

      if (error) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
}
