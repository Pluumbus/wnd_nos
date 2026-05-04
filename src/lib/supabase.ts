import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";

const rawUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const rawKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

/**
 * Если false, в продакшен-бандле не подставились EXPO_PUBLIC_* (EAS env / secrets).
 * Раньше createClient() бросал ошибку при импорте модуля → белый экран до React.
 */
export const isSupabaseConfigured = Boolean(rawUrl && rawKey);

/** Валидные заглушки: только чтобы не падать на импорте; запросы бессмысленны без реального env. */
const supabaseUrl = rawUrl ?? "https://env-missing.invalid";
const supabaseAnonKey = rawKey ?? "env-missing";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
