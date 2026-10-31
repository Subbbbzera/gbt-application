const db = require("../db");

async function migrate() {
  try {
    console.log("РћРЅРѕРІР»РµРЅРЅСЏ С‚Р°Р±Р»РёС†С– РІС–РґРіСѓРєС–РІ (Р”РѕРґР°РІР°РЅРЅСЏ РЅРѕРІРёС… РєРѕР»РѕРЅРѕРє)...");
    
    
    const [columns] = await db.query("SHOW COLUMNS FROM reviews");
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes("rating")) {
      console.log("Р”РѕРґР°РІР°РЅРЅСЏ РєРѕР»РѕРЅРєРё rating...");
      await db.query("ALTER TABLE reviews ADD COLUMN rating INT DEFAULT NULL");
    }

    if (!columnNames.includes("user_id")) {
      console.log("Р”РѕРґР°РІР°РЅРЅСЏ РєРѕР»РѕРЅРєРё user_id...");
      await db.query("ALTER TABLE reviews ADD COLUMN user_id INT DEFAULT NULL");
      await db.query("ALTER TABLE reviews ADD CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL");
    }

    if (!columnNames.includes("parent_id")) {
      console.log("Р”РѕРґР°РІР°РЅРЅСЏ РєРѕР»РѕРЅРєРё parent_id...");
      await db.query("ALTER TABLE reviews ADD COLUMN parent_id INT DEFAULT NULL");
      await db.query("ALTER TABLE reviews ADD CONSTRAINT fk_reviews_parent FOREIGN KEY (parent_id) REFERENCES reviews(id) ON DELETE CASCADE");
    }

    console.log("Р‘Р°Р·Р° РґР°РЅРёС… СѓСЃРїС–С€РЅРѕ РѕРЅРѕРІР»РµРЅР°!");
    process.exit(0);
  } catch (err) {
    console.error("РџРѕРјРёР»РєР° РїСЂРё РѕРЅРѕРІР»РµРЅРЅС– Р±Р°Р·Рё РґР°РЅРёС…:", err);
    process.exit(1);
  }
}

migrate();

