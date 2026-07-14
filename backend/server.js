require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require("path");

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
const seedData = require("./seed");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


seedData();


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.use("/cards", cardsRoutes);
app.use("/news", newsRoutes);
app.use("/reviews", reviewsRoutes);
app.use("/auth", authRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", ordersRoutes);
app.use("/favorites", favoritesRoutes);
app.use("/stats", statsRoutes);
app.use("/coupons", couponsRoutes);
app.use("/payments", paymentsRoutes);
app.use("/slider", sliderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
  console.log(`Доступний у локальній мережі за IP: http://192.168.1.111:${PORT}`);
  console.log(`Доступні роути:`);
  console.log(`   - /cards - Управління картками`);
  console.log(`   - /cart - Кошик користувача`);
  console.log(`   - /orders - Замовлення`);
  console.log(`   - /favorites - Улюблені товари`);
  console.log(`   - /news - Новини`);
  console.log(`   - /reviews - Відгуки`);
  console.log(`   - /auth - Авторизація`);
});