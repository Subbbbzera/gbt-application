const db = require("./db");
const bcrypt = require("bcrypt");

const seedData = async () => {
  try {
    // 1. Створення адміністратора за замовчуванням
    const [existingAdmin] = await db.query("SELECT id FROM users WHERE username = ?", ["admin"]);
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await db.query(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
        ["admin", "admin@goldbudtrans.ua", hashedPassword, "admin"]
      );
      console.log("👤 Створено адміністратора за замовчуванням (admin / admin123)");
    }

    // 2. Додавання демонстраційної техніки
    const exampleCards = [
      {
        title: "Самосвал Daewoo Maximus 1728",
        category: "Вантажна техніка",
        characteristics: "Надійний середньотоннажний вантажний автомобіль, призначений для перевезення та швидкого розвантаження сипучих будівельних матеріалів, ґрунту чи промислових вантажів. Має чудову маневреність та витривалість.",
        price_per_day: 7500,
        price_buy: 2800000,
        image: '["/images/3.jpg"]',
        sale_type: "both",
        is_available: 1
      },
      {
        title: "Гусеничний екскаватор CAT 320",
        category: "Екскаватори",
        characteristics: "Потужний гідравлічний екскаватор для земляних та кар'єрних робіт будь-якої складності. Об'єм ковша 1.2 м³, максимальна глибина копання 6.7 м.",
        price_per_day: 9500,
        price_buy: 4500000,
        image: '["/images/Екскаватор.jpg", "/images/1.jpg"]',
        sale_type: "both",
        is_available: 1
      },
      {
        title: "Автокран Liebherr LTM 1050",
        category: "Автокрани",
        characteristics: "Мобільний кран вантажопідйомністю 50 тонн зі стрілою 38 м. Ідеально підходить для монтажних і висотних робіт на будівництві.",
        price_per_day: 12000,
        price_buy: 6200000,
        image: '["/images/Автокран.jpg", "/images/2.jpg"]',
        sale_type: "both",
        is_available: 1
      },
      {
        title: "Фронтальний навантажувач JCB 426",
        category: "Навантажувачі",
        characteristics: "Колісний навантажувач для швидкого навантаження щебеню, піску та інших матеріалів. Об'єм ковша 2.1 м³, вага 14 тонн.",
        price_per_day: 6800,
        price_buy: 2400000,
        image: '["/images/4.jpg"]',
        sale_type: "rent",
        is_available: 1
      }
    ];

    for (const card of exampleCards) {
      const [existing] = await db.query("SELECT id FROM cards WHERE title = ?", [card.title]);
      if (existing.length === 0) {
        await db.query(
          "INSERT INTO cards (title, category, characteristics, price_per_day, price_buy, image, sale_type, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [card.title, card.category, card.characteristics, card.price_per_day, card.price_buy, card.image, card.sale_type, card.is_available]
        );
        console.log(`🚜 Додано приклад техніки: ${card.title}`);
      }
    }

    // 3. Додавання стартового промокоду
    const [existingCoupons] = await db.query("SELECT id FROM coupons WHERE code = ?", ["WELCOME10"]);
    if (existingCoupons.length === 0) {
      await db.query(
        "INSERT INTO coupons (code, discount, usage_limit, used_count) VALUES (?, ?, ?, ?)",
        ["WELCOME10", 10, 100, 0]
      );
      console.log("🏷️ Створено промокод: WELCOME10 (10% знижки)");
    }

    // 4. Додавання слайдера
    const [sliderCount] = await db.query("SELECT COUNT(*) as count FROM slider_images");
    if (sliderCount[0].count === 0) {
      const defaultSliders = ["/images/1.jpg", "/images/2.jpg", "/images/3.jpg"];
      for (const img of defaultSliders) {
        await db.query("INSERT INTO slider_images (image_path) VALUES (?)", [img]);
      }
      console.log("🖼️ Створено базові зображення для слайдера");
    }

    // 5. Додавання тестової новини
    const [newsCount] = await db.query("SELECT COUNT(*) as count FROM news");
    if (newsCount[0].count === 0) {
      await db.query(
        "INSERT INTO news (title, text, date) VALUES (?, ?, CURDATE())",
        [
          "Оновлення автопарку: нові автокрани та екскаватори",
          "Компанія Gold Bud Trans рада повідомити про поповнення нашого автопарку новою сучасною технікою виробництва CAT та Liebherr."
        ]
      );
      console.log("📰 Створено тестову новину");
    }

  } catch (err) {
    console.error("Помилка при сидуванні даних:", err);
  }
};

module.exports = seedData;
