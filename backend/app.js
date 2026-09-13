require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const cardsRoutes = require("./routes/cards");
const newsRoutes = require("./routes/news");
const reviewsRoutes = require("./routes/reviews");
const { router: authRoutes } = require("./routes/auth");
const cartRoutes = require("./routes/cart");
const ordersRoutes = require("./routes/orders");
const favoritesRoutes = require("./routes/favorites");
const statsRoutes = require("./routes/stats");
const couponsRoutes = require("./routes/coupons");
const paymentsRoutes = require("./routes/payments");
const sliderRoutes = require("./routes/slider");
const { swaggerServe, swaggerSetup } = require("./swagger");

const app = express();

// Безпека та заголовки Helmet
app.use(helmet({
  crossOriginResourcePolicy: false, // дозволяє завантажувати статичні зображення на фронтенд
}));

// CORS
app.use(cors());

// Парсинг тіла запитів
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Обмеження запитів (Rate Limiting) на чутливі роути авторизації
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  max: 30, // макс 30 спроб
  message: { error: "Забагато спроб. Будь ласка, зачекайте 15 хвилин." }
});

// Статичні файли (завантаження документів та зображень)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Інтерактивна документація Swagger / OpenAPI
app.use("/api-docs", swaggerServe, swaggerSetup);

// Роути API
app.use("/auth", authLimiter, authRoutes);
app.use("/cards", cardsRoutes);
app.use("/news", newsRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", ordersRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/stats", statsRoutes);
app.use("/coupons", couponsRoutes);
app.use("/payments", paymentsRoutes);
app.use("/slider", sliderRoutes);

// Health check для моніторингу та Docker
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Централізований обробник помилок
app.use((err, req, res, next) => {
  console.error("❌ Неперехоплена помилка сервера:", err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === "production" ? "Внутрішня помилка сервера" : err.message
  });
});

module.exports = app;
