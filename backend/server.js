require('dotenv').config();
const app = require("./app");
const seedData = require("./seed");

// Автоматичне сидування стартових даних (адміністратор, зразки техніки, купони)
seedData();

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🚀 Сервер Gold Bud Trans запущено на порту ${PORT}`);
  console.log(`📡 Локальна адреса: http://localhost:${PORT}`);
  console.log(`📑 Документація Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`🩺 Health check: http://localhost:${PORT}/health`);
  console.log(`====================================================`);
});