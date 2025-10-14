const { createClient } = require("@supabase/supabase-js");
const path = require("path");

// Загружаем .env из папки notification-server
require("dotenv").config({
  path: path.join(__dirname, "notification-server", ".env"),
});

async function testOrderInsert() {
  try {
    console.log("🧪 Testing order insertion...");

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Создаем тестовый заказ
    const testOrder = {
      customer_name: "Илья",
      phone_number: "+7900123456",
      price: 50000,
      status: "new",
      creator: "test_user",
      created_at: new Date().toISOString(),
    };

    console.log("📝 Inserting test order:", testOrder);

    const { data, error } = await supabase
      .from("orders")
      .insert([testOrder])
      .select();

    if (error) {
      console.error("❌ Error inserting order:", error);
    } else {
      console.log("✅ Order inserted successfully:", data);
      console.log("🔄 Trigger should have added notification to queue");
      console.log("⏰ Notification server will process queue every 30 seconds");
      console.log(
        "📱 Check your notification server logs for queue processing!"
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testOrderInsert();
