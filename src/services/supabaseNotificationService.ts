import { supabase } from "../lib/supabase";

export class SupabaseNotificationService {
  static async savePushToken(userId: string, pushToken: string): Promise<void> {
    const { data: existingToken, error: selectError } = await supabase
      .from("user_push_tokens")
      .select("push_token")
      .eq("user_id", userId)
      .eq("push_token", pushToken)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Error checking existing push token:", selectError);
      throw selectError;
    }

    if (existingToken) {
      const { error: updateError } = await supabase
        .from("user_push_tokens")
        .update({ updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("push_token", pushToken);

      if (updateError) {
        console.error("Error updating push token timestamp:", updateError);
        throw updateError;
      }
      return;
    }

    const { error } = await supabase.from("user_push_tokens").upsert({
      user_id: userId,
      push_token: pushToken,
      updated_at: new Date().toISOString(),
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
