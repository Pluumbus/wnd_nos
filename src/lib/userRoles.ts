import { supabase } from "./supabase";

export async function fetchUserIsAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (error) {
    console.warn("user_roles:", error.message);
    return false;
  }
  return data != null;
}
