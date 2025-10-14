import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import { SupabaseService } from "./services/SupabaseService";
import { NotificationService } from "./services/NotificationService";

// Загружаем переменные окружения
dotenv.config();

// Проверяем наличие необходимых переменных окружения
const requiredEnvVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingVars.join(", ")}`
  );
  console.log("⚠️  Please check your .env file");
} else {
  console.log("✅ Environment variables loaded successfully");
}

// Функция для настройки системы уведомлений
function setupNotificationSystem(
  supabaseService: SupabaseService,
  notificationService: NotificationService
) {
  try {
    console.log("🔄 Setting up notification system...");
    console.log("📋 Using trigger-based system with notification queue");
    console.log("⏰ Queue will be processed every 30 seconds");
  } catch (error) {
    console.error("❌ Error setting up notification system:", error);
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Инициализируем сервисы (с обработкой ошибок)
let supabaseService: SupabaseService | null = null;
let notificationService: NotificationService | null = null;

try {
  supabaseService = new SupabaseService();
  notificationService = new NotificationService();
  console.log("✅ Services initialized successfully");

  // Настраиваем систему уведомлений
  if (supabaseService && notificationService) {
    setupNotificationSystem(supabaseService, notificationService);
  }
} catch (error) {
  console.error("❌ Error initializing services:", error);
  console.log(
    "⚠️  Server will run in limited mode (without Supabase integration)"
  );
}

// Маршруты
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Ручная отправка уведомления
app.post("/send-notification", async (req, res) => {
  try {
    if (!notificationService) {
      return res
        .status(503)
        .json({ error: "Notification service not available" });
    }

    const { title, body, data, pushTokens } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: "Title and body are required" });
    }

    if (!pushTokens || !Array.isArray(pushTokens) || pushTokens.length === 0) {
      return res.status(400).json({ error: "Push tokens array is required" });
    }

    const result = await notificationService.sendPushNotifications(pushTokens, {
      title,
      body,
      data,
    });

    res.json({
      success: true,
      message: "Notifications sent successfully",
      result,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({
      error: "Failed to send notifications",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Отправка уведомления о новом заказе
app.post("/send-order-notification", async (req, res) => {
  try {
    if (!notificationService) {
      return res
        .status(503)
        .json({ error: "Notification service not available" });
    }

    const { order } = req.body;

    if (!order) {
      return res.status(400).json({ error: "Order data is required" });
    }

    const result = await notificationService.sendNewOrderNotification(order);

    res.json({
      success: true,
      message: "Order notification sent successfully",
      result,
    });
  } catch (error) {
    console.error("Error sending order notification:", error);
    res.status(500).json({
      error: "Failed to send order notification",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Обработка очереди уведомлений
app.post("/process-queue", async (req, res) => {
  try {
    if (!notificationService) {
      return res
        .status(503)
        .json({ error: "Notification service not available" });
    }

    const result = await notificationService.processNotificationQueue();

    res.json({
      success: true,
      message: "Queue processed successfully",
      result,
    });
  } catch (error) {
    console.error("Error processing queue:", error);
    res.status(500).json({
      error: "Failed to process queue",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Получение статистики
app.get("/stats", async (req, res) => {
  try {
    if (!supabaseService) {
      return res.status(503).json({ error: "Supabase service not available" });
    }

    const stats = await supabaseService.getNotificationStats();
    res.json(stats);
  } catch (error) {
    console.error("Error getting stats:", error);
    res.status(500).json({
      error: "Failed to get stats",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Автоматическая обработка очереди каждые 30 секунд
cron.schedule("*/30 * * * * *", async () => {
  try {
    if (notificationService) {
      console.log("Processing notification queue...");
      await notificationService.processNotificationQueue();
    } else {
      console.log(
        "⚠️  Notification service not available, skipping queue processing"
      );
    }
  } catch (error) {
    console.error("Error in scheduled queue processing:", error);
  }
});

// Обработка ошибок
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Notification server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`⏰ Queue processing scheduled every 30 seconds`);
});

export default app;
