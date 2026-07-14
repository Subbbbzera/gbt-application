const db = require("./db");

const seedData = async () => {
  const exampleCards = [
    {
      title: "Самосвал Daewoo Maximus 1728",
      category: "Вантажна техніка",
      characteristics: "Надійний середньотоннажний вантажний автомобіль, призначений для перевезення та швидкого розвантаження сипучих будівельних матеріалів, ґрунту чи промислових вантажів. Має чудову маневреність та витривалість у важких дорожніх умовах.",
      price_per_day: 7500,
      price_buy: 2800000,
      image: '["/images/3.jpg"]',
      sale_type: "both",
      is_available: 1
    }
  ];

  try {
    for (const card of exampleCards) {
      
      const [existing] = await db.query("SELECT id FROM cards WHERE title = ?", [card.title]);
      
      if (existing.length === 0) {
        await db.query(
          "INSERT INTO cards (title, category, characteristics, price_per_day, price_buy, image, sale_type, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [card.title, card.category, card.characteristics, card.price_per_day, card.price_buy, card.image, card.sale_type, card.is_available]
        );
        console.log(`Додано приклад техніки: ${card.title}`);
      }
    }
  } catch (err) {
    console.error("Помилка при сидуванні даних:", err);
  }
};

module.exports = seedData;
