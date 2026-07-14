const db = require("./db");

async function migrate() {
  try {
    console.log("Оновлення таблиці відгуків (Додавання нових колонок)...");
    
    
    const [columns] = await db.query("SHOW COLUMNS FROM reviews");
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes("rating")) {
      console.log("Додавання колонки rating...");
      await db.query("ALTER TABLE reviews ADD COLUMN rating INT DEFAULT NULL");
    }

    if (!columnNames.includes("user_id")) {
      console.log("Додавання колонки user_id...");
      await db.query("ALTER TABLE reviews ADD COLUMN user_id INT DEFAULT NULL");
      await db.query("ALTER TABLE reviews ADD CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL");
    }

    if (!columnNames.includes("parent_id")) {
      console.log("Додавання колонки parent_id...");
      await db.query("ALTER TABLE reviews ADD COLUMN parent_id INT DEFAULT NULL");
      await db.query("ALTER TABLE reviews ADD CONSTRAINT fk_reviews_parent FOREIGN KEY (parent_id) REFERENCES reviews(id) ON DELETE CASCADE");
    }

    console.log("База даних успішно оновлена!");
    process.exit(0);
  } catch (err) {
    console.error("Помилка при оновленні бази даних:", err);
    process.exit(1);
  }
}

migrate();
