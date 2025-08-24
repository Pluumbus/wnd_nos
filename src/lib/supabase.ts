import { createClient } from "@supabase/supabase-js";

// Замените на ваши реальные данные из Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы для базы данных
// export interface Database {
//   public: {
//     Tables: {
//       orders: {
//         Row: {
//           id: string;
//           customer_name: string;
//           //   order_number: string;
//           status: string;
//           price: number;
//           created_at: string;
//           updated_at: string;
//         };
//         Insert: {
//           id?: string;
//           customer_name: string;
//           //   order_number: string;
//           status: string;
//           price: number;
//           created_at?: string;
//           updated_at?: string;
//         };
//         Update: {
//           id?: string;
//           customer_name?: string;
//           //   order_number?: string;
//           status?: string;
//           price?: number;
//           created_at?: string;
//           updated_at?: string;
//         };
//       };
//     };
//   };
// }
