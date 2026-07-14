const db = require("./db");

async function migrate() {
  try {
    console.log("🚀 Starting database migration...");

    const runSql = async (sql, label) => {
        try {
            await db.query(sql);
            console.log(`✅ ${label}`);
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_DUP_COLUMN_NAME') {
                console.log(`ℹ️ ${label} (вже існує)`);
            } else {
                throw err;
            }
        }
    };

    
    await runSql(`ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255) AFTER customer_name`, "customer_email в orders");

    
    await runSql(`ALTER TABLE order_items ADD COLUMN price_buy DECIMAL(10, 2) AFTER price_per_day`, "price_buy в order_items");

    
    await runSql(`ALTER TABLE order_items ADD COLUMN type VARCHAR(50) DEFAULT 'rent' AFTER subtotal`, "type в order_items");

    console.log("✨ Migration finished successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();
